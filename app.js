(function () {
    'use strict';

    angular
        .module('app', ['ui.router', 'ngCookies', 'ui.bootstrap','angularModalService','ngFileUpload'])
        .config(config)
        .run(run);

    config.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider'];
    function config($stateProvider, $urlRouterProvider, $httpProvider) {
        $stateProvider
            .state('recipes', {
                url: '/recipes',
                views : {
                    "r-header": {
                        templateUrl: "header.html",
                        params: {
                            selection: 'recipes'
                        },
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    "r-body": {
                        controller: 'RecipesController',
                        templateUrl: 'recipeList.html',
                        controllerAs: 'vm'
                    }
                }
                
            })
            
            .state('recipe', {
                url: '/recipe/:id',
                views : {
                    "r-header": {
                        templateUrl: "header.html",
                        params: {
                            selection: 'recipe'
                        },
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    "r-body": {
                        controller: 'RecipeController',
                        templateUrl: 'recipe.html',
                        controllerAs: 'vm'
                    }
                }
                
            })
            
            .state('recipe-edit', {
                url: '/recipe-edit/:id',
                views : {
                    "r-header": {
                        templateUrl: "header.html",
                        params: {
                            selection: 'recipe-edit'
                        },
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    "r-body": {
                        controller: 'RecipeController',
                        templateUrl: 'recipe.edit.html',
                        controllerAs: 'vm'
                    }
                }
                
            })
            
            .state('shopping-list', {
                url: '/shopping-list/:id',
                views : {
                    "r-header": {
                        templateUrl: "header.html",
                        params: {
                            selection: 'shopping-list'
                        },
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    "r-body": {
                        controller: 'ShoppingListController',
                        templateUrl: 'shoppingList.html',
                        controllerAs: 'vm'
                    }
                }               
            })
            
            .state('shopping-list-edit', {
                url: '/shopping-list-edit/:id',
                views : {
                    "r-header": {
                        templateUrl: "header.html",
                        params: {
                            selection: 'shopping-list'
                        },
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    "r-body": {
                        controller: 'ShoppingListController',
                        templateUrl: 'shoppingList.edit.html',
                        controllerAs: 'vm'
                    }
                }               
            })
            
            .state('shopping-list-organize', {
                url: '/shopping-list-organize/:id',
                views : {
                    "r-header": {
                        templateUrl: "header.html",
                        params: {
                            selection: 'shopping-list'
                        },
                        controller: 'HeaderController',
                        controllerAs: 'vm'
                    },
                    "r-body": {
                        controller: 'ShoppingListController',
                        templateUrl: 'shoppingList.organize.html',
                        controllerAs: 'vm'
                    }
                }               
            })

            .state('login', {
                url: '/login',
                views : {
                    "r-header": {},
                    "r-body": {
                        controller: 'LoginController',
                        templateUrl: 'authLogin.html',
                        controllerAs: 'vm'
                    }
                } 
                
            })
            
            .state('logout', {
                url: '/logout',
                views : {
                    "r-header": {},
                    "r-body": {
                        controller: 'LogoutController',
                        templateUrl: 'authLogout.html',
                        controllerAs: 'vm'
                    }
                } 
                
            })

            .state('register', {
                url: '/register',
                 views : {
                    "r-header": {},
                    "r-body": {
                        controller: 'RegisterController',
                        templateUrl: 'authRegister.html',
                        controllerAs: 'vm'
                    }
                }                
            })

            $urlRouterProvider.otherwise("/login");
            
            //Configure CSRF
            $httpProvider.defaults.xsrfCookieName = 'csrftoken';
            $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';          
            
    }

    run.$inject = ['$rootScope', '$location', '$cookieStore', '$http'];
    function run($rootScope, $location, $cookieStore, $http) {

        //Configure service path
        if (window.location.host == '127.0.0.1'){
            $rootScope.service = '/api';            
        } 
        else {
            $rootScope.service = '/service/api';
        }
        $rootScope.recipes = null;          // The list of known recipes
        $rootScope.recipe = null;           // Currently selected entitites
        $rootScope.ingredients = null;      // List of user known ingredients (id,name, [locationId])
        $rootScope.shoppingList = null;     // Currently selected shopping list
        $rootScope.shops = null;            // List of user known shops (id, name)
        $rootScope.currentShop = null;      // Currently selected shops
        $rootScope.locations = null;        // List of locations (id, name, shopId)
        $rootScope.checkedItems = null;     // List of checked items
        
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in and trying to access a restricted page
            var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
            var loggedIn = $rootScope.globals.currentUser;
            if (restrictedPage && !loggedIn) {
                //$location.path('/login');
            }
        });
    }

})();