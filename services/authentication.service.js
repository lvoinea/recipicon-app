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
        service.setCredentials = setCredentials;
        service.clearCredentials = clearCredentials;

        return service;

        function login(username, password, successCallback, errorCallback) {
            $http.defaults.useXDomain = true;           
            $http.post('/api/login', { username: username, password: password }).then(successCallback,errorCallback);               
        }
        
        function logout(successCallback, errorCallback) {
            $http.defaults.useXDomain = true;           
            $http.get('/api/logout').then(successCallback,errorCallback);               
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
        }
    }

})();