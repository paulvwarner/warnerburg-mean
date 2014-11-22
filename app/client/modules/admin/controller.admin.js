angular.module("comicAdminModule", ['ngSanitize','ngResource','ui.sortable']);
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

        $("#comic-grid").disableSelection();

        $scope.sortableOptions = {
            delay: 100,
            placeholder: "comic-grid-item",
            distance: 10,
            revert: false,
            tolerance: "pointer",
            start: function(e, ui) {

            },
            sort: function(e, ui) {

            },
            stop: function(e, ui){
                // update form for items that had a sequence number change
                $(".comic-grid-item").each(function(index) {
                    var rearrangeSequenceNumber = ""+$.trim("" + (index + 1));
                    var persistedSequenceNumber = ""+$.trim($(this).find(".comic-thumbnail-image-overlay-text").text());
                    if (rearrangeSequenceNumber != persistedSequenceNumber) {
                        $(this).find(".comic-sequence-number-field").val(rearrangeSequenceNumber);
                        $(this).find(".comic-sequence-number-field").trigger('input');
                        $(this).find(".comic-thumbnail-image-overlay-text").text(rearrangeSequenceNumber);
                        markForUpdate($(this).find(".comic-thumbnail-image-overlay-text"));
                    }
                });
            }
        };

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