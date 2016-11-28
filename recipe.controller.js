(function() {
    'use strict';
    
    angular.module('app').controller('RecipeController', RecipeController);
    
    RecipeController.$inject = ['DataService', '$log', '$state', '$stateParams','$q','AlertService'];

    function RecipeController(DataService, $log, $state, $stateParams, $q, AlertService){
        var vm = this;
        
        vm.localId = 0;
        vm.regex = '(\\d+[\\.,]?\\d*)\\s*([A-Za-z]\\w*)';        
        
        vm.recipe = null;
        vm.recipeDescription = null;
        vm.ingredients = {};
        
        vm.deleteRecipeIngredient = deleteRecipeIngredient;
        vm.addRecipeIngredient = addRecipeIngredient;
        vm.getIngredients = getIngredients;
        vm.save = save;
        vm.edit = edit;
        vm.cancel = cancel;
        vm.remove = remove;   
        vm.addToBasket = addToBasket;
        vm.removeFromBasket = removeFromBasket;
        
        vm.loading = {};
        vm.loading.recipe = false;
        vm.loading.ingredients = false;
        vm.isLoading = isLoading;
        
        vm.saving = false;
        vm.deleting = false; 
        vm.selecting = false;
        vm.adding = false;
        
        function _getLocalId(){
            vm.localId++;
            return '_'+vm.localId;
        }
        //---------------------------------------------- Loading
        _loadData($stateParams.id);       
        
        function _loadData(id) {            
            $log.info('loading recipe: '+ id);            
            _resetLoading();
            
            //-------------------------- load recipe
            DataService.getRecipe(id)
            .then(function(recipe){
                vm.recipe = JSON.parse(JSON.stringify(recipe));               
                vm.recipeDescription = vm.recipe.description.split('\n');
            })
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not load recipe (code  ' + error.status + ').');
            })            
            .finally(function(){
                 vm.loading.recipe = false;   
            }); 
            
            //--------------------------- load ingredients
            DataService.getIngredients()
            .then(function(ingredients){
                vm.ingredients = ingredients;                              
            })
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not load ingredients (code  ' + error.status + ').');
            })            
            .finally(function(){
                 vm.loading.ingredients = false;   
            });            
        }
        
        function _resetLoading(){
            _.forEach(_.keys(vm.loading), function(key){
                vm.loading[key] = true;
            });
        }

        function isLoading(){
            return _.reduce(_.values(vm.loading), 
                    function(aggregated, n) { return aggregated || n;},
                    false);
        }
        
        //---------------------------------------------- Recipe 
        function save(){
            vm.saving = true;
            DataService.setRecipe(vm.recipe)
                .then(function(newRecipe){
                    $state.go('recipe',{'id' : newRecipe.id}); 
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not save recipe (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.saving = false;
                });
        }
        
        function cancel(){
            if ($stateParams.id != ''){
                $state.go('recipe',{'id' : vm.recipe.id});
            } else {
                $state.go('recipes');
            }            
        }
        
        function edit(){
            $state.go('recipe-edit',{'id' : vm.recipe.id});
        }
        
        function remove(){
            vm.deleting = true
            DataService.deleteRecipe(vm.recipe.id)
                .then(function(response){
                    $state.go('recipes');
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not delete recipe  (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.deleting = false;
                });        
        }
   
        //---------------------------------------------- Ingredients
        function getIngredients(){
            return _.map(_.values(vm.ingredients),'name');
        }
        
        function deleteRecipeIngredient(itemId){
            var iItem = vm.recipe.recipe_ingredients.findIndex(
                function(item){ return item.id == itemId}
                );
            if (iItem >= 0) {
                 vm.recipe.recipe_ingredients.splice(iItem,1);
            } 
        }
        
        function addRecipeIngredient(focusField){
            if ((vm.ingredient != null) && (vm.quantity != null)) {                
                var matches = vm.quantity.match(vm.regex);
                var amount = matches[1].replace(",", ".");
                var unit = matches[2];
                
                var ingredientId = _.find(_.values(vm.ingredients),
                    function(ingredient) { return (ingredient.name == vm.ingredient); }
                );
                if (!ingredientId) {
                    vm.adding = true;
                    ingredientId = _getLocalId();
                    var ingredient = {
                        'id' : ingredientId,
                        'name' : vm.ingredient
                    }
                    vm.ingredients[ingredientId] = ingredient;
                    DataService.setIngredient(ingredient)
                    .then(function(newIngredient){
                        _updateRecipeIngredient(newIngredient, ingredient);
                        _updateIngredient(newIngredient, ingredient);                        
                    })
                    .catch(function(error){
                        AlertService.setAlert('ERROR: Could not add ingredient  (code ' + error.status + ').');
                        _deleteRecipeIngredient(ingredientId);
                        delete  vm.ingredients[ingredientId];
                    })
                    .finally(function(){
                        vm.adding = false;
                    });  
                } 
                else {
                    ingredientId = ingredientId.id;
                }                
              
                vm.recipe.recipe_ingredients.push(
                {
                    'id': _getLocalId(),
                    'ingredient' : ingredientId,
                    'quantity' : amount,
                    'unit' : unit        
                })

                vm.ingredient = null;
                vm.quantity = null;
                angular.element('#'+focusField).focus();
            }
        }
        
        function _updateIngredient(newIngredient, oldIngredient){
            vm.ingredients[newIngredient.id] = newIngredient;
            delete  vm.ingredients[oldIngredient.id];           
        }
        
        function _updateRecipeIngredient(newIngredient, oldIngredient){
            var recipeIngredient = _.find(vm.recipe.recipe_ingredients,
                function(ingredient) { return (ingredient.ingredient == oldIngredient.id); }
            );
            if(recipeIngredient){
                recipeIngredient.ingredient = newIngredient.id;
            }     
        }
        
        function _deleteRecipeIngredient(ingredientId){
            var iItem = vm.recipe.recipe_ingredients.findIndex(
                function(item){ return item.ingredient == ingredientId}
                );
            if (iItem >= 0) {
                 vm.recipe.recipe_ingredients.splice(iItem,1);
            } 
        }
        
        //---------------------------------------------- Shopping list
        function addToBasket(){
            vm.selecting = true;
            DataService.addShoppingListRecipe(vm.recipe.id)
                .then(function(response){
                    vm.recipe.in_shopping_list = true;
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not add receipe to shoopping list  (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.selecting = false;
                });
            
        }
        
        function removeFromBasket(){
            vm.selecting = true;
            DataService.removeShoppingListRecipe(vm.recipe.id)
                .then(function(response){
                    vm.recipe.in_shopping_list = false;
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not remove recipe from shoopping list  (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.selecting = false;
                });
        }             
    };
})();