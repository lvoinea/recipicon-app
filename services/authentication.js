(function () {
    'use strict';

    angular
        .module('app')
        .factory('AuthenticationService', AuthenticationService);

    AuthenticationService.$inject = ['$http', '$cookieStore', '$rootScope', '$timeout'];
    function AuthenticationService($http, $cookieStore, $rootScope, $timeout) {
        var service = {};

        service.login = login;
        service.logout = logout;
        service.signup = signup;
        service.closeUp = closeUp;
        service.resetPassword = resetPassword;
        service.requestPasswordReset = requestPasswordReset;
        service.setCredentials = setCredentials;
        service.clearCredentials = clearCredentials;

        return service;

        function login(username, password) {
            var defered;
            $http.defaults.useXDomain = true;           
            defered = $http.post($rootScope.service+'/auth/login', { username: username, password: password });
            return defered;
        }

        function signup(username, email, password, confirmPassword) {
            var defered;
            $http.defaults.useXDomain = true;
            defered = $http.post($rootScope.service+'/auth/signup', { username: username, email: email, password: password, confirmPassword: confirmPassword });
            return defered;
        }
        
        function logout() {
            var defered;
            $http.defaults.useXDomain = true;
            defered = $http.get($rootScope.service+'/auth/logout');
            return defered;
        }

        function closeUp(username) {
            var defered;
            $http.defaults.useXDomain = true;
            defered = $http.get($rootScope.service+'/auth/closeup');
            return defered;
        }

        function resetPassword(username, token, password,confirmPassword) {
            var defered;
            $http.defaults.useXDomain = true;
            defered = $http.post($rootScope.service+'/auth/password-reset', { username: username, token: token, password: password, confirmPassword: confirmPassword });
            return defered;
        }

        function requestPasswordReset(username) {
            var defered;
            $http.defaults.useXDomain = true;
            defered = $http.post($rootScope.service+'/auth/request-password-reset', {  username: username});
            return defered;
        }

        function setCredentials(user, token) {
            $rootScope.auth = {
                user: user,
                token: token
            };

            $http.defaults.headers.common['Authorization'] = 'Token ' + token; // jshint ignore:line
            $cookieStore.put('auth', $rootScope.auth);
        }

        function clearCredentials() {
            $rootScope.auth = {};
            $cookieStore.remove('auth');
            $cookieStore.remove('csrftoken');
            delete $http.defaults.headers.common['Authorization'];
        }
    }

})();