angular.module("adminModule", ['ngSanitize','ngResource','ui.router','commonModule']);

angular.module("adminModule").controller("mainAdminController", function ($scope, $http, $resource) {
    $scope.adminHeaderLabel = "Category List";

    // get all categories
    $http.get('/data/content/categories')
        .success(function (categories) {
            $scope.categories = categories;
        })
        .error(function (data) {
            log.error('error getting categories: ' + data);
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
                value.forEach(function(content) {
                    content.originalSequenceNumber = content.sequenceNumber;
                    content.previousSequenceNumber = content.sequenceNumber;
                    content.originalSection = content.section;
                    content.previousSection = content.section;
                });
            });
        })
        .error(function (data) {
            log.error('error: ' + data);
        });

    // expose function allowing users to save reordering changes
    $scope.commitReorderingChanges = function() {
        if (window.localStorage['loglevel'] == 'DEBUG') {
            angular.forEach($scope.sections, function(value, key) {
                value.forEach(function (content) {
                    log.debug("id:" + content._id + " oldseq:" + content.originalSequenceNumber + " newseq:" + content.sequenceNumber
                        + " oldsec:" + content.originalSection+ " newsec:" + content.section);
                });
            });
        }

        $http.post('/data/content/'+$scope.category+'/reorder', {sections: $scope.sections})
            .success(function() {
                log.debug("updated content order");
                angular.element(".content-thumbnail-image-change-indicator-overlay").removeClass('content-thumbnail-image-overlay-changed');
                angular.element(".admin-reorder-button").attr("disabled","disabled");
            }).error(function(data) {
                log.error('error: ' + data);
            });
    };

    // expose function to route to edit page for a piece of content
    $scope.openContentPage = function(category, sequenceNumber) {
        log.debug("opening content page for "+category +" #"+ sequenceNumber);
        $state.go("content", {categoryId: category, sequenceNumber: sequenceNumber});
    };
}]);

angular.module("adminModule").controller("contentAdminController",
['$stateParams', '$state', '$scope', 'adminService', 'commonService',
    function ($stateParams, $state, $scope, adminService, commonService) {

    $scope.category = $stateParams.categoryId;
    $scope.sequenceNumber = $stateParams.sequenceNumber;
    $scope.adminHeaderLabel = 'Managing '+$scope.category +' #'+$scope.sequenceNumber;
    $scope.common = commonService.getCommonData();

    // populate scope from service on controller construction
    adminService.getContentToEdit($scope);

    $scope.commitContentChanges = function() {
        adminService.commitContentChanges($scope);
    };

    $scope.updateAuthorPic = function(pic, pickerBaseElementId) {
        log.debug("using: "+pic+" at "+pickerBaseElementId);

        // show selected pic, add pic to list of available pics if it isn't there already
        imageUpdateElements = adminService.handleImagePickerSelectionUpdate(
            $scope.authorPics, pic, pickerBaseElementId);

        // update author pic stored in scope
        $scope.content.authorPicture = pic;
        $scope.$apply();
    };

}]);
