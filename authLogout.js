(function () {
    'use strict';

    angular
        .module('app')
        .controller('LogoutController', LogoutController);

    LogoutController.$inject = ['$rootScope','$location', 'AuthenticationService', 'AlertService', 'DataService'];
    function LogoutController($rootScope, $location, AuthenticationService, AlertService, DataService) {
        var vm = this;
        
        vm.dataLoading = false;
        vm.loggedOut = false;
        
        vm.logout = logout;
        vm.clearAlert = AlertService.clearAlert;

        vm.loggingOut = false;
        
        logout();

        function logout() {

            vm.loggingOut = true;

            DataService.initialize();
            
            // reset login status
            AuthenticationService.clearCredentials();
            AuthenticationService.logout(success, failure);
            
            function success(response) {
                vm.loggedOut = true;
                vm.loggingOut = false;
            }
            
            function failure(response) {
                AlertService.setAlert('ERROR: Could not logout.');
                vm.loggingOut = false;
            }
        };        
    }

})();
