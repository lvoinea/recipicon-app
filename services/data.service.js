(function() {
    'use strict';
    
    angular
        .module('app')
        .factory('DataService', DataService);

    DataService.$inject = ['$http', '$log', '$q','$rootScope'];

    function DataService($http, $log, $q, $rootScope) {
        return {
            getRecipes: getRecipes,
            getRecipe: getRecipe,            
            setRecipe: setRecipe,
            deleteRecipe: deleteRecipe,
            getIngredients : getIngredients,
            setIngredient : setIngredient,
            getShops : getShops,
            getLocations : getLocations,
            getIngredientLocations : getIngredientLocations,
            getShoppingList : getShoppingList,
            setShoppingList : setShoppingList,
            addShoppingListRecipe : addShoppingListRecipe,
            removeShoppingListRecipe : removeShoppingListRecipe            
        };
        
        //---------------------------------------------- Recipe
        function Recipe(){
            return {
                'id' : '_',
                'name' : '',
                'category' : '',
                'description' : '',
                'serves' : 2,
                'duration' : 30,
                'recipe_ingredients' : [],
                'in_shopping_list' : false
            }
        }
        
        function getRecipes() {
            var deferred;
            
            if ($rootScope.recipes == null) {
                deferred = $http.get($rootScope.service+'/recipes')
                .then(function(response) {
                    $rootScope.recipes = {};
                    _.forEach(response.data, function(recipe){
                        $rootScope.recipes[recipe.id] = recipe
                    });
                    return $rootScope.recipes;
                });             
            } else {                
                deferred = $q.when($rootScope.recipes);                              
            }            
            return deferred;              
        }        
       
        function getRecipe(id) {           
            var deferred;
           
            if (!id) {
                $rootScope.recipe = Recipe();
                deferred = $q.when($rootScope.recipe);
            }
            else if (($rootScope.recipe == null) || ($rootScope.recipe.id != id)) {
                deferred= $http
                    .get($rootScope.service+'/recipe/'+id)
                    .then(function(response){
                        $rootScope.recipe = response.data;
                        return $rootScope.recipe;
                    });                
            }
            else {               
                deferred = $q.when($rootScope.recipe);       
            }            
          
            return deferred;
        }
        
        function setRecipe(recipe) {                            
            return $http.post($rootScope.service+'/recipe/'+recipe.id, recipe)
            .then(function(response){
                $rootScope.recipe = response.data;
                if (recipe.id == "_"){
                    $rootScope.recipes[$rootScope.recipe.id] = $rootScope.recipe;
                }                
                return $rootScope.recipe;
            });                            
        }
        
        function deleteRecipe(id){
            return $http.delete($rootScope.service+'/recipe/'+id)
            .then(function(response) {
                if (_.has($rootScope.recipes, id)){
                    delete $rootScope.recipes[id];
                }                
            });            
        }
        
        //----------------------------------------------  Ingredient
        function getIngredients(){
            var deferred;
            
            if ($rootScope.ingredients == null) {
                deferred = $http.get($rootScope.service+'/ingredients')
                .then(function(response) {
                    $rootScope.ingredients = {};
                    _.forEach(response.data, function(ingredient){
                        $rootScope.ingredients[ingredient.id] = ingredient;
                    });
                    return $rootScope.ingredients;
                });     
            } else {                
                deferred = $q.when($rootScope.ingredients);                              
            }            
            return deferred; 
        }
        
        function setIngredient(ingredient){
            return $http.post($rootScope.service+'/ingredient/'+ingredient.id, ingredient)
            .then(function(response) {
                return response.data;
            });
        }
        
         //---------------------------------------------- Shop
        function getShops(){
            return $http.get($rootScope.service+'/shops')
        }
        
         //---------------------------------------------- Location
        function getLocations(){
            return $http.get($rootScope.service+'/locations')
        }
        
        function getIngredientLocations(ingredientIds){
            return $http.get($rootScope.service+'/ingredients/location/'+ingredientIds.join(','))
        }
        
         //---------------------------------------------- Shoppig list
        function getShoppingList(shoppingList, id){
            
            var deferred;
            
            if (shoppingList == null){
                deferred= $http.get($rootScope.service+'/shopping-list/'+id);                
            } else {               
                deferred = $q.when({data:shoppingList});                              
            }            
            return deferred;
        }
        
        function setShoppingList(shoppingList){
            return $http.post($rootScope.service+'/shopping-list/'+shoppingList.id, shoppingList);
        }
        
        function ShoppingListCommand(cmd){
            return {
                'action' : cmd
            }
        }
        
        function addShoppingListRecipe(id){
            return $http.post($rootScope.service+'/shopping-list/_/recipe/'+id, ShoppingListCommand('add'))
            .then(function(response) {
                $rootScope.recipes[id].in_shopping_list = true;
                if (($rootScope.recipe) && ($rootScope.recipe.id == id)){
                    $rootScope.recipe.in_shopping_list = true;
                }
            });
        }
        
        function removeShoppingListRecipe(id){
            return $http.post($rootScope.service+'/shopping-list/_/recipe/'+id, ShoppingListCommand('remove'))
            .then(function(response) {
                $rootScope.recipes[id].in_shopping_list = false;
                 if (($rootScope.recipe) && ($rootScope.recipe.id == id)){
                    $rootScope.recipe.in_shopping_list = false;
                }
            });
        }
        
    }
})();