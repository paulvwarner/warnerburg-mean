angular.module("warnerburgApp")
    .run(function($rootScope) {
        $rootScope.common = {
            mainCssUrl: '/includes/css/warnerburg.css',
            homeDark: '/images/navigation/homedarks.png',
            homeLight: '/images/navigation/homelights.png',
            galleryDark: '/images/navigation/gallerydarks.png',
            galleryLight: '/images/navigation/gallerylights.png',
            comicDark: '/images/navigation/comicdarks.png',
            comicLight: '/images/navigation/comiclights.png',
            storeDark: '/images/navigation/storedarks.png',
            storeLight: '/images/navigation/storelights.png',
            infoDark: '/images/navigation/infodarks.png',
            infoLight: '/images/navigation/infolights.png',
            linksDark: '/images/navigation/linksdarks.png',
            linksLight: '/images/navigation/linkslights.png',
            homeUrl: '/',
            galleryUrl: '/gallery',
            storeUrl: '/store',
            comicUrl: '/comic',
            archivesUrl: '/comic/archives',
            infoUrl: '/info'
        };
    })
    .config(function($locationProvider, $stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('main', {
                url: '/',
                templateUrl: 'views/main.html',
                controller: 'warnerburgAppCtrl'
            })
            .state('comic', {
                url: '/comic',
                templateUrl: 'views/comicAngular.html',
                controller: 'warnerburgAppCtrl'
            });

        $locationProvider.html5Mode(true);
    });