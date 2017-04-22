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
        
        logout();

        function logout() {

            DataService.initialize();
            
            // reset login status
            vm.dataLoading = true;
            AuthenticationService.clearCredentials();            
            AuthenticationService.logout(success, failure);
            
            function success(response) {                
                vm.dataLoading = false;      
                vm.loggedOut = true;                
            }
            
            function failure(response) {                
                vm.dataLoading = false;                
                AlertService.setAlert('ERROR: Could not logout.');
            }
        };        
    }

})();
