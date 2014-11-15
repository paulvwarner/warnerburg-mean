angular.module("comicPageModule")
    .controller("userComicCommentsController", ['$scope', '$attrs', '$http', '$resource', '$document', function ($scope, $attrs, $http, $resource, $document) {

        $scope.comments = [];

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
            $http.post('/data/comics/' + comicSequenceNumber + '/comments', {comment: comment, comicSequenceNumber:comicSequenceNumber})
                .success(function(newComment) {
                    $scope.comments.push(newComment);
                    $scope.newComment = null;
                }).error(function(data) {
                    console.log('error: ' + data);
                });
        }

    }]);
angular.module("comicPageModule").directive("showWhenDocumentIsReady", ['$document', function($document) {
    // show comments link when page is done loading
    return {
        restrict: 'A',
        link : function (scope, element, attrs) {
            console.log("setting directive");
            $document.ready(function () {
                console.log("dom ready");
                element.css({opacity: 0, visibility:'visible'}).animate({opacity: 1});
            });
        }
    };
}]);