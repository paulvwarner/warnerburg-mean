angular.module("comicAdminModule", ['ngSanitize','ngResource']);
angular.module("comicAdminModule")
    .controller("comicAdminController", function ($scope, $attrs, $http, $resource) {

        // initial logic to execute when the controller gets defined - get all comics
        $http.get('/data/admin/comics')
            .success(function (comics) {
                $scope.comics = comics;
                $scope.comics.forEach(function(comic) {
                     comic.originalSequenceNumber = comic.sequenceNumber;
                });
            })
            .error(function (data) {
                console.log('error: ' + data);
            });

        // save reordering changes
        $scope.commitChanges = function() {
            $scope.comics.forEach(function (comic) {
                console.log("id:" + comic._id + " oldseq:" + comic.originalSequenceNumber + " newseq:" + comic.sequenceNumber)
            });
            $http.post('/data/admin/comics/reorder', {comics: $scope.comics})
                .success(function() {
                    console.log("updated comic order");
                    unmarkForUpdate($(".comic-thumbnail-image-overlay-text"));
                }).error(function(data) {
                    console.log('error: ' + data);
                });

        }
    });