(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', 'AuthenticationService', 'AlertService'];
    function LoginController($location, AuthenticationService, AlertService) {
        var vm = this;

        vm.login = login;
        vm.clearAlert = clearAlert;        

        (function initController() {
            AuthenticationService.clearCredentials();
        })();

        function login() {
            vm.dataLoading = true;
            AuthenticationService.login(vm.username, vm.password, success, failure);
            
            function success(response) {                
                vm.dataLoading = false;
                $location.path('/recipes');
                AuthenticationService.setCredentials(response.data)
            }
            
             function failure(response) {                
                vm.dataLoading = false;                
                AlertService.setAlert('ERROR: Could not login (' + response.data + ')');
                
            }
        };
        
        function clearAlert(index){
            AlertService.clearAlert(index);
        }
    }

})();
