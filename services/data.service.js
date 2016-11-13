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
            getUserIngredients : getUserIngredients,
            getIngredientLocations : getIngredientLocations,
            getShoppingList : getShoppingList,
            setShoppingList : setShoppingList,
            addShoppingListRecipe : addShoppingListRecipe,
            removeShoppingListRecipe : removeShoppingListRecipe            
        };
        
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
        
        function ShoppingListCommand(cmd){
            return {
                'action' : cmd
            }
        }        


        function getRecipes() {
            return $http.get($rootScope.service+'/recipes');               
        }        
       
        function getRecipe(recipe,id) {
           
           var deferred;
            
            if ((recipe == null) & (id != '')){
                deferred= $http.get($rootScope.service+'/recipe/'+id);                
            } else { 
                if ((recipe == null) & (id == '')){
                    recipe = Recipe();
                }
                deferred = $q.when({data:recipe});                              
            }            
            return deferred;
        }
        
        function setRecipe(recipe) {                            
            return $http.post($rootScope.service+'/recipe/'+recipe.id, recipe)                
        }
        
        function deleteRecipe(id){
            return $http.delete($rootScope.service+'/recipe/'+id);            
        }
        
        function getUserIngredients(){
            //var deferred = $q.defer();
            //deferred.resolve(['marar','drojdie','apa','fasole']);
            //return deferred.promise;
            return $http.get($rootScope.service+'/ingredients')
        }
        
        function getIngredientLocations(ingredientIds){
            return $http.get($rootScope.service+'/ingredients/location/'+ingredientIds.join(','))
        }
        
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
        
        function addShoppingListRecipe(id){
            return $http.post($rootScope.service+'/shopping-list/_/recipe/'+id, ShoppingListCommand('add'));
        }
        
        function removeShoppingListRecipe(id){
             return $http.post($rootScope.service+'/shopping-list/_/recipe/'+id, ShoppingListCommand('remove'));
        }
        
    }
})();