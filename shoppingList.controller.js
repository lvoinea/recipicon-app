(function() {
    'use strict';
    
    angular.module('app').controller('ShoppingListController', ShoppingListController);
    
    ShoppingListController.$inject = ['DataService', '$log'];

    function ShoppingListController(DataService,$log){
        var vm = this;
        vm.recipes =[];
        vm.selectRecipe = selectRecipe;
        
        //activate();

        function activate() {
            return getRecipes().then(function() {
                $log.info('Activated Recipes View');
            });
        }

        function getRecipes() {
            return DataService.getRecipes()
                .then(function(data) {
                    vm.recipes = data;
                    console.log(data);
                    return vm.recipes;
                });
        }
        
        function selectRecipe(recipe){
            return DataService.updateShoppingListRecipe(recipe);
        }
        
    };
})();