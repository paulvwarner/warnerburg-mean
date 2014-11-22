angular.module("contentAdminModule")
    .config(function($locationProvider, $stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/admin');

        $stateProvider
            .state('main', {
                url: '/admin',
                templateUrl: '/views/includes/partials/admin.main.html',
                controller: 'contentAdminController'
            })
            .state('category', {
                url: '/admin/{categoryId}',
                templateUrl: '/views/includes/partials/admin.category.html',
                controller: 'contentCategoryAdminController'
            })
        ;

        $locationProvider.html5Mode(true);
    });