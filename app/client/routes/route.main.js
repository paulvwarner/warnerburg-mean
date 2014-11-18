angular.module("warnerburgModule")
    .run(function($rootScope) {

    })
    .config(function($locationProvider, $stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('main', {
                url: '/',
                views: {
                    'content': {
                        templateUrl: '../../views/main.html',
                        controller: 'warnerburgController'
                    }
                }
            })
            .state('comic', {
                url: '/comic/:comicId',
                views: {
                    'header': {
                        templateUrl: '../../views/includes/partials/narrowHeader.html',
                        controller: 'warnerburgController'
                    },
                    'content': {
                        templateUrl: '../../views/comic.html',
                        controller: 'comicPageController'
                    }
                }
            });

        $locationProvider.html5Mode(true);
    });