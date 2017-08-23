(function () {
    'use strict';

    angular
        .module('app')
        .controller('UserController', UserController);

    UserController.$inject = ['$rootScope','$location', 'AuthenticationService', 'AlertService'];
    function UserController($rootScope, $location, AuthenticationService, AlertService) {
        var vm = this;
        
        vm.closeUp = closeUp;
        vm.clearAlert = AlertService.clearAlert;

        vm.closingOut = false;
        
        function closeUp() {

            vm.closingOut = true;

            AuthenticationService.clearCredentials();
            AuthenticationService.closeUp()
            .then(function(response){
                $location.path('/login');
            })
            .catch(function(response){
                 AlertService.setAlert('ERROR: Could not close up account.');
            })
            .finally(function(){
                vm.closingOut = false;
            });
        };
    }

})();
