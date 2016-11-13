(function() {
    'use strict';
    
    angular.module('app').controller('OrganizeController', OrganizeController);
    
    ShoppingListController.$inject = ['DataService', 'AlertService', '$log', '$state', '$stateParams'];

    function ShoppingListController(DataService, AlertService, $log, $state, $stateParams){
        var vm = this;
        
        vm.localId = 0;

        vm.ingredients = [];
        vm.shops = [];
        vm.selectedShop = 'Lidl';
        
        vm.setShop = setShop;
        vm.save = save;
        vm.cancel = cancel;        
        
        vm.loading = false;
        vm.saving = false;
        vm.creating = false;

        loadData($stateParams.ingredients)
       
        function loadData(ingredients){
            
            //TODO: load only if needed (not present in the local cache)
            //TODO: load selected shop (similar)
            
            //$log.info('loading shopping list ('+ id + ',' + shoppingList + ')');     
            vm.loading = true;
            
            DataService.getShoppingList(shoppingList,id)
            .then(function(response){
                vm.shoppingList = response.data;
                vm.oldShoppingList = JSON.parse(JSON.stringify(vm.shoppingList));
                getItems(vm.shoppingList.items);
                return DataService.getUserIngredients();
            })
            .then(function(ingredients){
                vm.ingredients = ingredients.data.map(function(item){return item.name});               
            })            
            //TODO: get the list of shops
            //TODO: get current shop
            //TODO: set the used shoop to be the current shop                   
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not load shopping llist (code  ' + error.status + ').');
            })
            .finally(function(){
                 vm.loading = false;
            });
        }
        
        function getItems(items){
            vm.items = {};
            vm.itemList = [];
            //-- group ingredients
            _.forEach(items, function(item) {
              if (item.ingredient != null){
                  processItem(item, 1);
              } else if (item.recipe != null){
                  _.forEach(item.recipe.recipe_ingredients, function(ingredient) {
                      processItem(ingredient, item.quantity*1.0/ item.recipe.serves);
                  });
              }
            });
            //-- aggregate quantities
            var quantity;
            _.forEach(_.keys(vm.items), function(ingredient) {
                quantity = '';
                _.forEach(_.keys(vm.items[ingredient]), function(unit) {
                    vm.items[ingredient][unit] = vm.items[ingredient][unit].reduce((a, b) => a + b, 0);                    
                    quantity = quantity + vm.items[ingredient][unit] + ' ' + unit + ' + ';
                 }); 
                 quantity = quantity.substring(0, quantity.length - 3);
                 vm.itemList.push({'ingredient':ingredient, 'quantity':quantity});
            });  
            //$log.info(vm.items);
        }
        
        function processItem(item, factor){
            var ingredient = item.ingredient;
            var unit = item.unit;
            var quantity = item.quantity * factor;
            
            if (!_.has(vm.items,ingredient)){
              vm.items[ingredient] = {}                      
            }
            if (!_.has(vm.items[ingredient],unit)){
              vm.items[ingredient][unit] = []
            }
            vm.items[ingredient][unit].push(quantity);
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
        
      
        function setShop(){
            $log.info(vm.selectedShop);
            //TODO: get ingredient location for the shop
            //TODO: group ingredients on location
        }
    };
})();