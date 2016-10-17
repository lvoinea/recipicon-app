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
        vm.items = {};
        vm.itemList = [];
        
        vm.deleteItem = deleteItem;
        vm.addItem = addItem;
        vm.save = save;
        vm.edit = edit;
        vm.create = create;
        vm.cancel = cancel;
        
        vm.loading = false;
        vm.saving = false;
        vm.creating = false;

        loadShoppingList($stateParams.shoppingList, $stateParams.id)
       
        function loadShoppingList(shoppingList,id){
            //$log.info('loading shopping list ('+ id + ',' + shoppingList + ')');     
            vm.loading = true;
            
            DataService.getShoppingList(shoppingList,id)
            .then(function(response){
                vm.shoppingList = response.data;
                vm.oldShoppingList = JSON.parse(JSON.stringify(vm.shoppingList));
                getItems(vm.shoppingList.items);
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
                vm.shoppingList.items.push(
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
        
        function create(){
            vm.creating = true;
            var shoppingList = {'id':'_','items':[]}
            DataService.setShoppingList(shoppingList)
                .then(function(response){
                    $state.go('shopping-list',{'shoppingList' : response.data, 'id' : '_'}); 
                })
                .catch(function(error){
                    AlertService.setAlert('ERROR: Could not create new shopping list (code ' + error.status + ').');
                })
                .finally(function(){
                    vm.creating = false;
                });            
        }
    };
})();