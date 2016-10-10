(function() {
    'use strict';
    
    angular.module('app').controller('ShoppingListController', ShoppingListController);
    
    ShoppingListController.$inject = ['DataService', 'AlertService', '$log', '$stateParams'];

    function ShoppingListController(DataService, AlertService, $log, $stateParams){
        var vm = this;
        vm.shoppingList = {};
        vm.ingredients = [];
        
        vm.loading = false;

        loadShoppingList($stateParams.id)
       
        function loadShoppingList(id){
            $log.info('loading shopping list: '+ id);
            vm.loading = true;
            
            DataService.getShoppingList(id)
            .then(function(response){
                vm.shoppingList = response.data;
                return DataService.getIngredients();
            })
            .then(function(ingredients){
                vm.ingredients = ingredients.data.map(function(item){return item.name});               
            })
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not load shopping llist (code  ' + error.status + ').');
            })
            .finally(function(){
                 vm.loading = false;
            });
        }        
    };
})();