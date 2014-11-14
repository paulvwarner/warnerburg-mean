angular.module("warnerburgApp")
    .controller("comicPageCtrl", ['$scope', '$http', '$stateParams', '$sce', function ($scope, $http, $stateParams, $sce) {
        console.log("controller called here with stp ",$stateParams);

        $http.get('/data/comic/' + $stateParams.comicId)
            .success(function (comic) {
                $scope.comic = comic;
                $scope.comic.text = $sce.trustAsHtml(comic.text);
            })
            .error(function (data) {
                console.log('error: ' + data);
            });
    }]);