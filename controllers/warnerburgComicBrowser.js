angular.module("warnerburgComicBrowser",[]);
angular.module("warnerburgComicBrowser")
    .controller("warnerburgComicBrowserCtrl", function($scope, $http) {
        $http.get('http://localhost:3001/content/')
            .success(function(data) {
                console.log('got me some content:',data);
                $scope.data = { comics: data };
            })
            .error(function(data) {
                console.log('error: '+data);
            });
    });