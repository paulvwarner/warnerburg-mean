angular.module("comicAdmin", ['ngSanitize','ngResource']);
angular.module("comicAdmin")
    .controller("comicAdminCtrl", function ($scope, $attrs, $http, $resource) {

        // initial logic to execute when the controller gets defined - get all comics
        $http.get('/data/admin/comics')
            .success(function (comics) {
                $scope.comics = comics;
            })
            .error(function (data) {
                console.log('error: ' + data);
            });
/*
        // create a new comment
        $scope.createComment = function(comicSequenceNumber, comment) {
            console.log("saving comment ",comment);
            $http.post('/data/comics/' + comicSequenceNumber + '/comments', {comment: comment, comicSequenceNumber:comicSequenceNumber})
                .success(function(newComment) {
                    $scope.comments.push(newComment);
                    $scope.newComment = null;
                }).error(function(data) {
                    console.log('error: ' + data);
                });
        }
*/
    });