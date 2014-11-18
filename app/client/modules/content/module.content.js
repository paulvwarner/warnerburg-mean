angular.module("contentModule", ['ngSanitize', 'ngResource', 'commonModule']);

angular.module("contentModule").config(function($locationProvider) {
    $locationProvider.html5Mode(true);
});

angular.module("contentModule").run(['$rootScope', 'contentService', 'commonService', function($rootScope, contentService, commonService) {
    $rootScope.content = {};
    $rootScope.comments = [];
    $rootScope.newComment = null;

    $rootScope.common = commonService.getCommonData();
}]);