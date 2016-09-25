(function () {
    'use strict';

    angular
        .module('app')
        .controller('LogoutController', LogoutController);

    LogoutController.$inject = ['$location', 'AuthenticationService', 'AlertService'];
    function LogoutController($location, AuthenticationService, AlertService) {
        var vm = this;
        
        vm.dataLoading = false;
        vm.loggedOut = false;
        
        vm.logout = logout;
        vm.clearAlert = AlertService.clearAlert;
        
        logout();

        function logout() {
            
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
