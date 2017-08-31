(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', '$stateParams', '$state', '$rootScope', 'AuthenticationService', 'AlertService'];
    function LoginController($location, $stateParams, $state, $rootScope, AuthenticationService, AlertService) {
        var vm = this;

        vm.login = login;
        vm.signup = signup;
        vm.requestPasswordRequest = requestPasswordRequest;
        vm.resetPassword = resetPassword;
        vm.setMode = setMode;
        vm.minPasswordLength = 3;
        vm.username = $stateParams.username;
        vm.token = $stateParams.token;
        vm.forgot = false;

        vm.mode = 'signin';
        vm.clearAlert = clearAlert;

        (function initController() {
            AuthenticationService.clearCredentials();
            if (vm.token != ''){
                vm.mode = 'reset';
            }
        })();

        function login() {
            clearMessages()
            vm.dataLoading = true;
            AuthenticationService.login(vm.username, vm.password)
            .then(function(response){
                $location.path('/recipes');
                AuthenticationService.setCredentials(vm.username, response.data);
            })
            .catch(function(response) {               
                if (response.status == 401){
                   vm.forgot = true;
                }
                AlertService.setAlert('ERROR: Could not login (' + response.data + ').');
            })
            .finally(function(){
                vm.dataLoading = false;
            });
        };

        function signup() {
            clearMessages()
            vm.dataLoading = true;
            if (vm.password != vm.confirmPassword) {
                AlertService.setAlert('ERROR: The two passwords do not match.');
                vm.dataLoading = false;
            } else {
                AuthenticationService.signup(vm.username, vm.username, vm.password, vm.confirmPassword)
                .then(function(response){
                    $location.path('/recipes');
                    AuthenticationService.setCredentials(response.data)
                })
                .catch(function(response){
                    AlertService.setAlert('ERROR: Could not signup (' + response.data + ').'); 
                })
                .finally(function(){
                    vm.dataLoading = false;
                });
            }
        };

        function requestPasswordRequest() {
            clearMessages();
            vm.dataLoading = true;
             AuthenticationService.requestPasswordReset(vm.username)
                .then(function(response){
                    $location.path('/out');
                })
                .catch(function(response){
                    AlertService.setAlert('ERROR: Could not request password reset.'); 
                })
                .finally(function(){
                    vm.dataLoading = false;
                });
        }

        function resetPassword() {
            clearMessages();
            vm.dataLoading = true;
             if (vm.password != vm.confirmPassword) {
                AlertService.setAlert('ERROR: The two passwords do not match.');
                vm.dataLoading = false;
            } else {
                AuthenticationService.resetPassword( vm.username, vm.token, vm.password, vm.confirmPassword)
                .then(function(response){
                    $state.go('login',{'username': vm.username})
                })
                .catch(function(response){
                    AlertService.setAlert('ERROR: Could not reset password (' + response.data + ').'); 
                })
                .finally(function(){
                    vm.dataLoading = false;
                })
            }
        }

        function setMode(mode) {
            vm.mode = mode;
            vm.forgot = false;
            AlertService.clearAlerts();
        }
        
        function clearAlert(index){
            AlertService.clearAlert(index);
        }

        function clearMessages(){
            AlertService.clearAlerts();
            vm.forgot = false;
        }
    }

})();
