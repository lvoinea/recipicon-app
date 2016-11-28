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
        vm.ingredients = [];
        vm.mapIngredients = {};
        vm.listIngredients = [];        
        vm.selectedShopId = 1;
        vm.shops = {};
        vm.locations = {};
        vm.ingredentLocations = {};
        
        vm.deleteItem = deleteItem;
        vm.addItem = addItem;
        vm.setShop = setShop;
        vm.getShops = getShops;
        vm.ingredientHasLocation = ingredientHasLocation;
        
        vm.edit = edit;
        vm.organize = organize;
        vm.create = create;
        
        vm.save = save;
        vm.cancel = cancel;        
        
        vm.loading = false;
        vm.saving = false;
        vm.creating = false;

        _loadData($stateParams.shoppingList, $stateParams.id)
       
        function _loadData(shoppingList,id){
            //$log.info('loading shopping list ('+ id + ',' + shoppingList + ')');     
            vm.loading = true;
            
            DataService.getShoppingList(shoppingList,id)
            .then(function(response){
                vm.shoppingList = response.data;
                vm.shoppingListOld = JSON.parse(JSON.stringify(vm.shoppingList));
                
                vm.mapIngredients = _getMapIngredients(vm.shoppingList.items);
                vm.listIngredients = _getListIngredients(vm.mapIngredients);
                
                return DataService.getIngredientLocations(_.keys(vm.mapIngredients));
            })
            .then(function(ingredientLocations){
                vm.ingredentLocations = {}
                _.forEach(ingredientLocations.data, function(ingredient) {                   
                    vm.ingredentLocations[ingredient.id] = ingredient.locations;
                });                
                return DataService.getShops();
            })
            .then(function(shops){
                _.forEach(shops.data, function(shop) {
                     if (!_.has(vm.shops,shop.id)){
                        vm.shops[shop.id] = {};
                        vm.shops[shop.id].id = shop.id;
                        vm.shops[shop.id].name = shop.name;
                        vm.shops[shop.id].locations = [];
                     }
                })                
                return DataService.getLocations();
            })
            .then(function(locations){
                _.forEach(locations.data, function(loc) {
                     if (!_.has(vm.locations,loc.id)){
                        vm.locations[loc.id] = {};  
                        vm.locations[loc.id].name = loc.name ;
                        vm.locations[loc.id].shop = loc.shop ;
                        vm.shops[loc.shop].locations.push(loc.id)                        
                     }
                })
                return DataService.getIngredients();
            })
            .then(function(ingredients){
                vm.ingredients = ingredients.data.map(function(item){return item.name});               
            })            
            //TODO: get current shop
            .catch(function(error){
                AlertService.setAlert('ERROR: Could not load shopping list data (code  ' + error.status + ').');
            })
            .finally(function(){
                 vm.loading = false;
            });
        }
        
        function ingredientHasLocation(ingredientId, shopId){
            var hasLocation = false;
            _.forEach(vm.ingredentLocations[ingredientId], function(locationId) {
                hasLocation = hasLocation || (vm.locations[locationId].shop == shopId);
            })
            return hasLocation;
        }
        
        function getShops(){
            //return _.map(_.values(vm.shops),'name');
            return _.values(vm.shops);
        }
        
        function setShop(){
            $log.info(vm.selectedShopId);
            //TODO: get ingredient location for the shop
            //TODO: group ingredients on location
        }
        
        //Group unique ingredients among the items of a shopping list
        function _getMapIngredients(items){
            var mapIngredients = {};            
            
            function processItem(item, factor){
                var ingredient = item.ingredient;
                var unit = item.unit;
                var quantity = item.quantity * factor;
                
                if (!_.has(mapIngredients,ingredient.id)){
                  mapIngredients[ingredient.id] = {'name':ingredient.name}   
                          
                }
                if (!_.has(mapIngredients[ingredient.id],unit)){
                  mapIngredients[ingredient.id][unit] = []
                }
                mapIngredients[ingredient.id][unit].push(quantity);
            }
            
            _.forEach(items, function(item) {
              if (item.ingredient != null){
                  processItem(item, 1);
              } else if (item.recipe != null){
                  _.forEach(item.recipe.recipe_ingredients, function(recipeItem) {
                      processItem(recipeItem, item.quantity*1.0/ item.recipe.serves);
                  });
              }
            });
            
            return mapIngredients;            
        }       
        
        // Aggregate the ingredients in a shopping list
        function _getListIngredients(mapIngredients){
            var listIngredients = [];          
            var quantity;
            _.forEach(_.keys(mapIngredients), function(ingredientId) {
                quantity = '';
                _.forEach(_.keys(mapIngredients[ingredientId]), function(unit) {
                    if (unit != 'name'){
                        mapIngredients[ingredientId][unit] = mapIngredients[ingredientId][unit].reduce((a, b) => a + b, 0);                    
                        quantity = quantity + mapIngredients[ingredientId][unit] + ' ' + unit + ' + ';
                    }
                 }); 
                 quantity = quantity.substring(0, quantity.length - 3);
                 listIngredients.push({'id':ingredientId, 'name':mapIngredients[ingredientId].name, 'quantity':quantity});
            });
            return listIngredients;
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
        
        
    };
})();