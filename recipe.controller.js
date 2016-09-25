(function() {
    'use strict';
    
    angular.module('app').controller('RecipeController', RecipeController);
    
    RecipeController.$inject = ['DataService', '$log', '$state', '$stateParams','$q','AlertService'];

    function RecipeController(DataService, $log, $state, $stateParams, $q, AlertService){
        var vm = this;
        
        vm.localId = 0;
        vm.regex = '(\\d+[\\.,]?\\d*)\\s*([A-Za-z]\\w*)';        
        
        vm.recipe = {};
        vm.oldRecipe = {};
        vm.recipeDescription = {};
        vm.recipeInList = false;        
        vm.ingredients = [];
        vm.alerts = [];
        
        vm.deleteIngredient = deleteIngredient;
        vm.addIngredient = addIngredient;
        vm.save = save;
        vm.edit = edit;
        vm.cancel = cancel;
        vm.remove = remove;        
        
        vm.loading = false;
        vm.saving = false;
        vm.deleting = false;     

        //todo: add receipe to current shopping list (create one if not available, and register it in user profile)
        //todo: get wheter recipe is in shopping list
        //todo: uppon save update the recipe description
        //todo: get ingredient list upon loading
        
        loadRecipe($stateParams.recipe, $stateParams.id);            
        
        function loadRecipe(recipe,id) {            
            $log.info('load recipe ('+ id + ',' + recipe + ')');            
            vm.loading = true;
            
            DataService.getRecipe(recipe,id)
            .then(function(response){
                vm.recipe = response.data;                
                vm.recipeDescription = vm.recipe.description.split('\n');
                vm.oldRecipe = JSON.parse(JSON.stringify(vm.recipe));
                return DataService.getIngredients();
            })
            .then(function(ingredients){
                vm.ingredients = ingredients.data.map(function(item){return item.name});               
            })
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not load recipe (code  ' + error.status + ').');
            })
            .finally(function(){
                 vm.loading = false;
            });            
        }        
   
        function deleteIngredient(id){
            for( var i = 0; i< vm.recipe.recipe_ingredients.length; i++){
                var ingredient = vm.recipe.recipe_ingredients[i];
                if (ingredient.id == id){
                    vm.recipe.recipe_ingredients.splice(i,1);
                    break;
                }
            }
        }
        
        function addIngredient(focusField){
            if ((vm.ingredient != null) && (vm.quantity != null)) {
                var matches = vm.quantity.match(vm.regex);
                var amount = matches[1].replace(",", ".");
                var unit = matches[2];
                vm.recipe.recipe_ingredients.splice(0,0,
                // new recipe ingredient 
                {
                    'id': '_'+ vm.localId,
                    'ingredient' : vm.ingredient,
                    'quantity' : amount,
                    'unit' : unit        
                })
                vm.localId++;
                vm.ingredient = null;
                vm.quantity = null;
                angular.element('#'+focusField).focus();
            }
        }
        
        function save(){
            
            //todo: validate the fields
            
            vm.saving = true;
            DataService.setRecipe(vm.recipe)
                .then(function(response){
                    $state.go('recipe',{'recipe' : response.data, 'id' : vm.recipe.id}); 
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not save recipe (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.saving = false;
                });
        }
        
        function cancel(){
            if (($stateParams.recipe != null) || ($stateParams.id != '')){
                $state.go('recipe',{'recipe' : vm.oldRecipe, 'id' : vm.oldRecipe.id});
            } else {
                $state.go('recipes');
            }
            
        }
        
        function edit(){
            $state.go('recipe-edit',{'recipe' : vm.recipe, 'id' : vm.recipe.id});
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

             
    };
})();