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
            getShoppingList : getShoppingList,
            updateShoppingListRecipe: updateShoppingListRecipe,
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
        
        function getIngredients(){
            //var deferred = $q.defer();
            //deferred.resolve(['marar','drojdie','apa','fasole']);
            //return deferred.promise;
            return $http.get($rootScope.service+'/ingredients')
        }
        
        function getShoppingList(id){
            return $http.get($rootScope.service+'/shopping-list/'+id);
        }
        
        function updateShoppingListRecipe(recipe) {
            
            return $http({
                    method: 'POST',
                    url: '/setShoppingListItem.php',
                    data: {id: recipe.id, category: 1, amount: recipe.serves, add: recipe.inShoppingList},
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                .then(updateComplete,updateFailed)
                
            function updateComplete(response){
                $log.info(response);
                return response;
            }
            
            function updateFailed(error){
                $log.error('XHR Failed updateShoppingListRecipe.');
                return $q.reject(error);
            }
            //id: this.id(),
            //category: 1, // recipe
            //amount: this.serves(),
            //add: newValue}),
            
            //url: "/setShoppingListItem.php",
        }
        
        function addShoppingListRecipe(id){
            return $http.post($rootScope.service+'/shopping-list/_/recipe/'+id, ShoppingListCommand('add'));
        }
        
        function removeShoppingListRecipe(id){
             return $http.post($rootScope.service+'/shopping-list/_/recipe/'+id, ShoppingListCommand('remove'));
        }
        
    }
})();