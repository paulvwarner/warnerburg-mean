angular.module("contentAdminModule", ['ngSanitize','ngResource','ui.sortable','ui.router']);
angular.module("contentAdminModule").controller("contentAdminController", function ($scope, $http, $resource) {
    $scope.adminHeaderLabel = "Category List";

    // get all categories
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

    $scope.category = $stateParams.categoryId;
    $scope.adminHeaderLabel = 'Managing category "'+$scope.category+'"';

    // get all content of the given category
    $http.get('/data/content/'+$scope.category)
        .success(function (contents) {
            $scope.contents = contents;
            $scope.contents.forEach(function(content) {
                content.originalSequenceNumber = content.sequenceNumber;
            });
        })
        .error(function (data) {
            console.log('error: ' + data);
        });

    $("#content-grid").disableSelection();

    $scope.sortableOptions = {
        delay: 100,
        placeholder: "content-grid-item",
        distance: 10,
        revert: false,
        tolerance: "pointer",
        start: function(e, ui) {

        },
        sort: function(e, ui) {

        },
        stop: function(e, ui){
            // update form for items that had a sequence number change
            angular.forEach(angular.element(".content-grid-item"), function(value, key) {
                var currentListElement = angular.element(value);
                var rearrangeSequenceNumber = ""+$.trim("" + (key + 1));
                var persistedSequenceNumber = ""+$.trim(currentListElement.find(".content-thumbnail-image-overlay-sequence-number-text").text());
                console.log(rearrangeSequenceNumber+" vs "+persistedSequenceNumber);
                if (rearrangeSequenceNumber != persistedSequenceNumber) {
                    currentListElement.find(".content-sequence-number-field").val(rearrangeSequenceNumber);
                    currentListElement.find(".content-sequence-number-field").trigger('input');
                    currentListElement.find(".content-thumbnail-image-overlay-sequence-number-text").text(rearrangeSequenceNumber);
                    currentListElement.find(".content-thumbnail-image-overlay").addClass('content-thumbnail-image-overlay-changed');
                    angular.element(".admin-reorder-button").removeAttr("disabled");
                }
            });
        }
    };

    // save reordering changes
    $scope.commitReorderingChanges = function() {
        $scope.contents.forEach(function (content) {
            console.log("id:" + content._id + " oldseq:" + content.originalSequenceNumber + " newseq:" + content.sequenceNumber)
        });
        $http.post('/data/content/'+$scope.category+'/reorder', {contents: $scope.contents})
            .success(function() {
                console.log("updated content order");
                angular.element(".content-thumbnail-image-overlay").removeClass('content-thumbnail-image-overlay-changed');
                angular.element(".admin-reorder-button").attr("disabled","disabled");
            }).error(function(data) {
                console.log('error: ' + data);
            });
    }

}]);