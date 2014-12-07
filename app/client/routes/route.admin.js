angular.module("adminModule")
    .config(function($locationProvider, $stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/admin');

        $stateProvider
            .state('main', {
                url: '/admin',
                templateUrl: '/views/includes/partials/admin.main.html',
                controller: 'mainAdminController'
            })
            .state('category', {
                url: '/admin/{categoryId}',
                templateUrl: '/views/includes/partials/admin.category.html',
                controller: 'categoryAdminController'
            })
            .state('content', {
                url: '/admin/{categoryId}/{sequenceNumber}',
                templateUrl: '/views/includes/partials/admin.content.html',
                controller: 'contentAdminController'
            })
            .state('section', {
                url: '/admin/{categoryId}/section/{sectionName}',
                templateUrl: '/views/includes/partials/admin.section.html',
                controller: 'sectionAdminController'
            })
        ;

        $locationProvider.html5Mode(true);
    });