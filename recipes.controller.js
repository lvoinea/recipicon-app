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
            //TODO
            return DataService.updateShoppingListRecipe(recipe);
        }
        
        function clearNameFilter() {
            vm.nameFilter = '';
        }  
        
        function clearCategoryFilter() {
            vm.categoryFilter = '';
        } 
        
    };
})();