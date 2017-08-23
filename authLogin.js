(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', 'AuthenticationService', 'AlertService'];
    function LoginController($location, AuthenticationService, AlertService) {
        var vm = this;

        vm.login = login;
        vm.signup = signup;
        vm.toggle = toggle;
        vm.minPasswordLength = 3;

        vm.toggleLogin = true;
        vm.clearAlert = clearAlert;

        (function initController() {
            AuthenticationService.clearCredentials();
        })();

        function login() {
            AlertService.clearAlerts();
            vm.dataLoading = true;
            AuthenticationService.login(vm.username, vm.password)
            .then(function(response){                
                $location.path('/recipes');
                AuthenticationService.setCredentials(response.data);
            })
            .catch(function(response) {               
                AlertService.setAlert('ERROR: Could not login (' + response.data + ')');
            })
            .finally(function(){
                vm.dataLoading = false;
            });
        };

        function signup() {
            AlertService.clearAlerts();
            vm.dataLoading = true;
            if (vm.password != vm.confirmPassword) {
                AlertService.setAlert('ERROR: The two passwords do not match!');
                vm.dataLoading = false;
            } else {
                AuthenticationService.signup(vm.username, vm.username, vm.password, vm.confirmPassword)
                .then(function(response){
                    $location.path('/recipes');
                    AuthenticationService.setCredentials(response.data)
                })
                .catch(function(response){
                    AlertService.setAlert('ERROR: Could not signup : ' + response.data + ' !'); 
                })
                .finally(function(){
                    vm.dataLoading = false;
                });
            }
        };

        function toggle() {
            vm.toggleLogin = !vm.toggleLogin;
            AlertService.clearAlerts();
        }
        
        function clearAlert(index){
            AlertService.clearAlert(index);
        }
    }

})();
