angular.module("adminModule", ['ngSanitize','ngResource','ui.sortable','ui.router']);

angular.module("adminModule").controller("mainAdminController", function ($scope, $http, $resource) {
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

angular.module("adminModule").controller("categoryAdminController",
['$stateParams', '$state', '$scope', '$http', '$resource', function ($stateParams, $state, $scope, $http, $resource) {

    $scope.category = $stateParams.categoryId;
    $scope.adminHeaderLabel = 'Managing category "'+$scope.category+'"';

    // get all content of the given category
    $http.get('/data/content/'+$scope.category+'/all')
        .success(function (sections) {
            $scope.sections = sections;

            angular.forEach($scope.sections, function(value, key) {
                console.log("foreach "+key+" val ",value);
                value.forEach(function(content) {
                    content.originalSequenceNumber = content.sequenceNumber;
                    content.previousSequenceNumber = content.sequenceNumber;
                    content.originalSection = content.section;
                    content.previousSection = content.section;
                });
            });
        })
        .error(function (data) {
            console.log('error: ' + data);
        });

    // expose function allowing users to save reordering changes
    $scope.commitReorderingChanges = function() {
        angular.forEach($scope.sections, function(value, key) {
            value.forEach(function (content) {
                console.log("id:" + content._id + " oldseq:" + content.originalSequenceNumber + " newseq:" + content.sequenceNumber
                    + " oldsec:" + content.originalSection+ " newsec:" + content.section);
            });
        });

        $http.post('/data/content/'+$scope.category+'/reorder', {sections: $scope.sections})
            .success(function() {
                console.log("updated content order");
                angular.element(".content-thumbnail-image-change-indicator-overlay").removeClass('content-thumbnail-image-overlay-changed');
                angular.element(".admin-reorder-button").attr("disabled","disabled");
            }).error(function(data) {
                console.log('error: ' + data);
            });
    };

    // expose function to route to edit page for a piece of content
    $scope.openContentPage = function(category, sequenceNumber) {
        console.log("opening content page for "+category +" #"+ sequenceNumber);
        $state.go("content", {categoryId: category, sequenceNumber: sequenceNumber});
    };
}]);

angular.module("adminModule").controller("contentAdminController",
['$stateParams', '$state', '$scope', '$http', '$resource', function ($stateParams, $state, $scope, $http, $resource) {

    $scope.category = $stateParams.categoryId;
    $scope.sequenceNumber = $stateParams.sequenceNumber;
    $scope.adminHeaderLabel = 'Managing '+$scope.category +' #'+$scope.sequenceNumber;

}]);