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
            getCurrentShop : getCurrentShop,
            getLocations : getLocations,
            setLocation : setLocation,
            deleteLocation : deleteLocation,
            Location : Location,
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
                        //$rootScope.recipe.id = id;
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
            var deferred;
            
            if ($rootScope.shops == null){
                deferred = $http.get($rootScope.service+'/shops')
                .then(function(response) {
                    $rootScope.shops = {};
                    _.forEach(response.data, function(shop){
                        $rootScope.shops[shop.id] = shop            
                    });
                    return $rootScope.shops;
                });            
            } else {                
                deferred = $q.when($rootScope.shops);                              
            }            
            return deferred;            
        }
        
        function getCurrentShop(){
            var deferred;
            
            if ($rootScope.currentShop == null){
                deferred = $http.get($rootScope.service+'/shop/current')
                .then(function(response) {
                    $rootScope.currentShop = response.data;
                    return $rootScope.currentShop;
                });            
            } else {                
                deferred = $q.when($rootScope.currentShop);                              
            }            
            return deferred;            
        }
        
        function setCurrentShop(id){
            return $http.post($rootScope.service+'/shop/current', {'id':id});
        }
        
        //---------------------------------------------- Location
        
        // Pattern: 
        // Objects are created outside the service and passed to the service
        // Service caches the objects it receives and passes references to it
        
        function Location(name){
            return {
                'id' : '_',
                'name' : name,
                'shop' : $rootScope.currentShop.id
            }
        }        
        
        function getLocations(){
            var deferred;
            
            if ($rootScope.locations == null){
            
                deferred = $http.get($rootScope.service+'/locations')
                .then(function(response){
                    $rootScope.locations = {};
                    _.forEach(response.data, function(loc) {                   
                        $rootScope.locations[loc.id] = loc;                        
                    }); 
                    return $rootScope.locations;
                }); 
            } else {
                 deferred = $q.when($rootScope.locations);  
            }
            
            return deferred; 
        }

        function setLocation(shopLocation) {            
            return $http.post($rootScope.service+'/location/'+shopLocation.id, shopLocation)
            .then(function(response){                
                var newLocation = response.data
                if (shopLocation.id == '_'){
                    // New location added
                    $rootScope.locations[newLocation.id] = newLocation;
                }                
                return $rootScope.locations;
            });           
        }
        
        function deleteLocation(shopLocationId){
            return $http.delete($rootScope.service+'/location/'+shopLocationId)
            .then(function(response){
                if (_.has($rootScope.locations, shopLocationId)){
                    delete $rootScope.locations[shopLocationId];
                } 
                //TODO: delete location from all $rootScope.ingredients[id].locations        
            });
        }
  
        //---------------------------------------------- Shoppig list
        function getShoppingList(id){
            
            var deferred;
            
            if (($rootScope.shoppingList == null) || (($rootScope.shoppingList.id != '_') && ($rootScope.shoppingList.id != id))){
                deferred= $http.get($rootScope.service+'/shopping-list/'+id)
                    .then(function(response){
                        $rootScope.shoppingList = response.data;
                        return $rootScope.shoppingList;
                    });                   
            } else {               
                deferred = $q.when($rootScope.shoppingList);                              
            }            
            return deferred;
        }
        
        function setShoppingList(shoppingList){
            return $http.post($rootScope.service+'/shopping-list/'+shoppingList.id, shoppingList)
                .then(function(response){
                        $rootScope.shoppingList = response.data;
                        return $rootScope.shoppingList;
                });   
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