(function() {
    'use strict';
    
    angular.module('app').controller('ShoppingListController', ShoppingListController);
    
    ShoppingListController.$inject = ['DataService', 'AlertService', '$log', '$state', '$stateParams'];

    function ShoppingListController(DataService, AlertService, $log, $state, $stateParams){
        var vm = this;
        
        vm.localId = 0;
        vm.regex = '(\\d+[\\.,]?\\d*)\\s*([A-Za-z]\\w*)';   
        
        vm.shoppingList = {};
        vm.shoppingListOld = {};
        vm.userIngredients = [];
        vm.listItems = {};
        vm.listIngredients = [];        
        vm.selectedShopId = 1;
        vm.shops = {};
        vm.ingredentLocations = {};
        
        vm.deleteItem = deleteItem;
        vm.addItem = addItem;
        vm.setShop = setShop;
        vm.getShops = getShops;
        
        vm.edit = edit;
        vm.organize = organize;
        vm.create = create;
        
        vm.save = save;
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
                vm.shoppingListOld = JSON.parse(JSON.stringify(vm.shoppingList));
                getListItems(vm.shoppingList.items);
                return DataService.getIngredientLocations(_.keys(vm.listItems));
            })
            .then(function(locations){
                var ingredients = locations.data;
                vm.ingredentLocations = {}
                vm.shops={}
                _.forEach(ingredients, function(ingredient) {
                    if (!_.has(vm.ingredentLocations,ingredient.id)){
                        vm.ingredentLocations[ingredient.id] = {};
                    }
                    _.forEach(ingredient.locations, function(loc){
                        vm.ingredentLocations[ingredient.id][loc.shop.id] = loc.id;
                        if (!_.has(vm.shops,loc.shop.id)){
                            vm.shops[loc.shop.id] = loc.shop;
                            vm.shops[loc.shop.id].locations = [];
                        }
                        vm.shops[loc.shop.id].locations.push({'id':loc.id, 'name':loc.location});
                        
                    });
                });
                //TODO: convert location.data to hasmaps: getLocations()
                // hm<shop,[locations]>
                // hm<id,hm<shop,location>> + isAtLocation (id, shop)
                return DataService.getUserIngredients();
            })
            .then(function(ingredients){
                vm.userIngredients = ingredients.data.map(function(item){return item.name});               
            })            
            //TODO: get current shop
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not load shopping llist (code  ' + error.status + ').');
            })
            .finally(function(){
                 vm.loading = false;
            });
        }
        
        function getShops(){
            //return _.map(_.values(vm.shops),'name');
            return _.values(vm.shops);
        }
        
        function getListItems(items){
            vm.listItems = {};
            vm.listIngredients = [];
            //-- group ingredients
            _.forEach(items, function(item) {
              if (item.ingredient != null){
                  processItem(item, 1);
              } else if (item.recipe != null){
                  _.forEach(item.recipe.recipe_ingredients, function(recipeItem) {
                      processItem(recipeItem, item.quantity*1.0/ item.recipe.serves);
                  });
              }
            });
            //-- aggregate quantities
            var quantity;
            _.forEach(_.keys(vm.listItems), function(ingredientId) {
                quantity = '';
                _.forEach(_.keys(vm.listItems[ingredientId]), function(unit) {
                    if (unit != 'name'){
                        vm.listItems[ingredientId][unit] = vm.listItems[ingredientId][unit].reduce((a, b) => a + b, 0);                    
                        quantity = quantity + vm.listItems[ingredientId][unit] + ' ' + unit + ' + ';
                    }
                 }); 
                 quantity = quantity.substring(0, quantity.length - 3);
                 vm.listIngredients.push({'id':ingredientId, 'name':vm.listItems[ingredientId].name, 'quantity':quantity});
            });  
            //$log.info(vm.listItems);
        }
        
        function processItem(item, factor){
            var ingredient = item.ingredient;
            var unit = item.unit;
            var quantity = item.quantity * factor;
            
            if (!_.has(vm.listItems,ingredient.id)){
              vm.listItems[ingredient.id] = {'name':ingredient.name}   
                      
            }
            if (!_.has(vm.listItems[ingredient.id],unit)){
              vm.listItems[ingredient.id][unit] = []
            }
            vm.listItems[ingredient.id][unit].push(quantity);
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
            $state.go('shopping-list',{'shoppingList' : vm.shoppingListOld,'id' : vm.shoppingListOld.id}); 
        }
        
        function edit(){
            $state.go('shopping-list-edit',{'shoppingList' : vm.shoppingList, 'id' : vm.shoppingList.id});
        }
        
        function organize(){
            $state.go('shopping-list-organize',{'ingredients' : vm.listIngredients}); 
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
        
        function setShop(){
            $log.info(vm.selectedShopId);
            //TODO: get ingredient location for the shop
            //TODO: group ingredients on location
        }
    };
})();