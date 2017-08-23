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
        service.setCredentials = setCredentials;
        service.clearCredentials = clearCredentials;

        return service;

        function login(username, password) {
            var defered;
            $http.defaults.useXDomain = true;           
            defered = $http.post($rootScope.service+'/login', { username: username, password: password });
            return defered;
        }

        function signup(username, email, password, confirmPassword) {
            var defered;
            $http.defaults.useXDomain = true;
            defered = $http.post($rootScope.service+'/signup', { username: username, email: email, password: password, confirmPassword: confirmPassword });
            return defered;
        }
        
        function logout() {
            var defered;
            $http.defaults.useXDomain = true;
            defered = $http.get($rootScope.service+'/logout');
            return defered;
        }

        function closeUp(username) {
            var defered;
            $http.defaults.useXDomain = true;
            defered = $http.get($rootScope.service+'/closeup');
            return defered;
        }

        function setCredentials(token) {
            $rootScope.auth = {
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