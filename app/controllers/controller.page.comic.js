angular.module("comicPageModule", ['ngSanitize','ngResource']);
angular.module("comicPageModule")
    .controller("comicPageController", ['$scope', '$http', '$sce', function ($scope, $http, $sce) {
        console.log("comic controller called here  ");
/*
        $http.get('/data/comic/' + $stateParams.comicId)
            .success(function (comic) {
                $scope.comic = comic;
                $scope.comic.text = $sce.trustAsHtml(comic.text);
            })
            .error(function (data) {
                console.log('error: ' + data);
            });
            */
    }]);