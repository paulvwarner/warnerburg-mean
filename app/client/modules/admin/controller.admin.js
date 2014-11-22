angular.module("contentAdminModule", ['ngSanitize','ngResource','ui.sortable','ui.router']);
angular.module("contentAdminModule").controller("contentAdminController", function ($scope, $http, $resource) {

    $scope.adminHeaderLabel = "Category List";

    console.log("contentAdminController");
    // initial logic to execute when the controller gets defined - get all comics
    $http.get('/data/content/categories')
        .success(function (categories) {
            $scope.categories = categories;
        })
        .error(function (data) {
            console.log('error getting categories: ' + data);
        });
});

angular.module("contentAdminModule").controller("contentCategoryAdminController",
    ['$stateParams', '$state', '$scope', '$http', '$resource', function ($stateParams, $state, $scope, $http, $resource) {

    $scope.adminHeaderLabel = 'Managing category "'+$stateParams.categoryId+'"';

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
            angular.forEach(angular.element(".comic-grid-item"), function(value, key) {
                var currentListElement = angular.element(value);
                var rearrangeSequenceNumber = ""+$.trim("" + (key + 1));
                var persistedSequenceNumber = ""+$.trim(currentListElement.find(".comic-thumbnail-image-overlay-sequence-number-text").text());
                console.log(rearrangeSequenceNumber+" vs "+persistedSequenceNumber);
                if (rearrangeSequenceNumber != persistedSequenceNumber) {
                    currentListElement.find(".comic-sequence-number-field").val(rearrangeSequenceNumber);
                    currentListElement.find(".comic-sequence-number-field").trigger('input');
                    currentListElement.find(".comic-thumbnail-image-overlay-sequence-number-text").text(rearrangeSequenceNumber);
                    currentListElement.find(".comic-thumbnail-image-overlay").addClass('comic-thumbnail-image-overlay-changed');
                    angular.element(".admin-reorder-button").removeAttr("disabled");
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
                angular.element(".comic-thumbnail-image-overlay").removeClass('comic-thumbnail-image-overlay-changed');
                angular.element(".admin-reorder-button").attr("disabled","disabled");
            }).error(function(data) {
                console.log('error: ' + data);
            });

    }

}]);