angular.module("userComicComments", ['ngSanitize','ngResource']);
angular.module("userComicComments")
    .controller("userComicCommentsCtrl", function ($scope, $attrs, $http, $resource) {

        //$scope.commentsResource = $resource('/data/comics/' + comicSequenceNumber + '/comments');

        // $attrs contains the ng-controller html element's attributes.
        // comic-sequence-number's value gets put into the "comicSequenceNumber" attribute.
        $http.get('/data/comics/' + $attrs.comicSequenceNumber + '/comments')
            .success(function (comments) {
                $scope.comments = comments;
            })
            .error(function (data) {
                console.log('error: ' + data);
            });

        // create a new comment
        $scope.createComment = function(comicSequenceNumber, comment) {
            console.log("saving comment ",comment);
            $http.post('/data/comics/' + comicSequenceNumber + '/comments', comment)
                .success(function(newComment) {

                    $scope.comments.push(newComment);
                }).error(function(data) {
                    console.log('error: ' + data);
                });
        }

    });