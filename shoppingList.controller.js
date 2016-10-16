(function() {
    'use strict';
    
    angular.module('app').controller('ShoppingListController', ShoppingListController);
    
    ShoppingListController.$inject = ['DataService', 'AlertService', '$log', '$state', '$stateParams'];

    function ShoppingListController(DataService, AlertService, $log, $state, $stateParams){
        var vm = this;
        
        vm.localId = 0;
        vm.regex = '(\\d+[\\.,]?\\d*)\\s*([A-Za-z]\\w*)';   
        
        vm.shoppingList = {};
        vm.oldShoppingList = {};
        vm.ingredients = [];
        
        vm.deleteItem = deleteItem;
        vm.addItem = addItem;
        vm.save = save;
        vm.edit = edit;
        vm.cancel = cancel;
        
        vm.loading = false;
        vm.saving = false;

        loadShoppingList($stateParams.shoppingList, $stateParams.id)
       
        function loadShoppingList(shoppingList,id){
            $log.info('loading shopping list ('+ id + ',' + shoppingList + ')');     
            vm.loading = true;
            
            DataService.getShoppingList(shoppingList,id)
            .then(function(response){
                vm.shoppingList = response.data;
                vm.oldShoppingList = JSON.parse(JSON.stringify(vm.shoppingList));
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

        function deleteItem(id){
            for( var i = 0; i< vm.shoppingList.items.length; i++){
                var item = vm.shoppingList.items[i];
                if (item.id == id){
                    vm.shoppingList.items.splice(i,1);
                    break;
                }
            }
        }
        
        function addItem(focusField){
            if ((vm.ingredient != null) && (vm.quantity != null)) {
                var matches = vm.quantity.match(vm.regex);
                var amount = matches[1].replace(",", ".");
                var unit = matches[2];
                vm.shoppingList.items.splice(0,0,
                // new shopping list ingredient 
                {
                    'id': '_'+ vm.localId,
                    'ingredient' : vm.ingredient,
                    'quantity' : amount,
                    'unit' : unit,
                    'recipe' : null
                })
                vm.localId++;
                vm.ingredient = null;
                vm.quantity = null;
                angular.element('#'+focusField).focus();
            }
        }
        
        function save(){
            vm.saving = true;
            DataService.setShoppingList(vm.shoppingList)
                .then(function(response){
                    $state.go('shopping-list',{'shoppingList' : response.data, 'id' : vm.shoppingList.id}); 
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not save shopping list (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.saving = false;
                });
        }
        
        function cancel(){
            $state.go('shopping-list',{'shoppingList' : vm.oldShoppingList,'id' : vm.oldShoppingList.id}); 
        }
        
        function edit(){
            $state.go('shopping-list-edit',{'shoppingList' : vm.shoppingList, 'id' : vm.shoppingList.id});
        }
    };
})();