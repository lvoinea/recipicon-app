(function() {
    'use strict';
    
    angular.module('app').controller('RecipesController', RecipesController);
    
    RecipesController.$inject = ['DataService', '$log', '$state'];

    function RecipesController(DataService,$log,$state){
        var vm = this;
        
        vm.recipes = [];
        
        vm.selectRecipe = selectRecipe;
        vm.edit = edit;
        
        vm.loading = false;
        vm.selecting = false;
        
        vm.nameFilter = '';
        vm.categoryFilter = '';
        vm.clearNameFilter = clearNameFilter;
        vm.clearCategoryFilter = clearCategoryFilter;
        
        getRecipes();

        function getRecipes() {
            vm.loading = true;
            DataService.getRecipes()
                .then(function(response) {
                    vm.recipes = response.data;
                })
                .catch(function(error){
                    $log.error('Could not load recipes');
                })
                .finally(function(){
                    vm.loading = false;
                });
        }
        
        function edit(){
            $state.go('recipe-edit');
        }
        
        function selectRecipe(recipe){
            vm.selecting = true;
            if (recipe.in_shopping_list){
                DataService.addShoppingListRecipe(recipe.id)
                .then(function(response){
                    recipe.in_shopping_list = true;
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not add receipe to shoopping list  (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.selecting = false;
                });
            }
            else if (!recipe.in_shopping_list){
                vm.selecting = true;
                DataService.removeShoppingListRecipe(recipe.id)
                .then(function(response){
                    recipe.in_shopping_list = false;
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not remove recipe from shoopping list  (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.selecting = false;
                });
            }
        }
        
        function clearNameFilter() {
            vm.nameFilter = '';
        }  
        
        function clearCategoryFilter() {
            vm.categoryFilter = '';
        } 
        
    };
})();