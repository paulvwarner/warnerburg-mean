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
['$stateParams', '$state', '$scope', 'adminService', 'commonService', '$sce', '$filter', '$timeout',
    function ($stateParams, $state, $scope, adminService, commonService, $sce, $filter, $timeout) {

    $scope.category = $stateParams.categoryId;
    $scope.sequenceNumber = $stateParams.sequenceNumber;
    $scope.adminHeaderLabel = 'Managing '+$scope.category +' #'+$scope.sequenceNumber;
    $scope.common = commonService.getCommonData();

    var updateContentForDisplay = function() {
        $scope.content.publishDate = new Date($scope.content.publishDate);
        $scope.content.publishDateForDisplay = $filter('date')($scope.content.publishDate, $scope.common.publishDateTimeAdminFormat.angular);
    };

    // populate scope from service on controller construction
    adminService.getContentToEdit($scope.category, $scope.sequenceNumber)
        .then(function(contentAdminData) {
            $scope.content = contentAdminData.content;
            $scope.content.text = $sce.trustAsHtml(contentAdminData.content.text);
            updateContentForDisplay();
            $scope.authorPics = contentAdminData.authorPics;
            $scope.images = contentAdminData.images;
            $scope.sections = contentAdminData.sections;
            $scope.imageUploadUrl = '/data/upload/' + $scope.content.category;
            $scope.authorPicUploadUrl = '/data/upload/author-pic';
        })
        .catch(function(err) {
            log.error("error getting content data for "+$scope.content.category+": ", err);
        });

    $scope.commitContentChanges = function() {
        adminService.commitContentChanges($scope.content)
            .then(function(updatedContent) {
                $scope.content = updatedContent;
                updateContentForDisplay();

                var saveMessage = angular.element(".content-save-message");
                saveMessage.text("saved successfully");
                saveMessage.velocity("fadeIn");
                $timeout(function() {
                    saveMessage.velocity("fadeOut");
                }, 2000);
            })
            .catch(function(err) {
                log.error("error saving content data for "+$scope.content.category+": ", err);
            });
    };

    $scope.updateAuthorPic = function(image, pickerBaseElementId) {
        log.debug("using: "+image+" at "+pickerBaseElementId);

        // show selected image, add image to list of available pics if it isn't there already
        imageUpdateElements = adminService.handleImagePickerSelectionUpdate(
            $scope.authorPics, image, pickerBaseElementId);

        // update author image stored in scope
        $scope.content.authorPicture = image;
        $scope.$apply();
    };

    $scope.updateContentImage = function(image, pickerBaseElementId) {
        log.debug("using: "+image+" at "+pickerBaseElementId);

        // show selected image, add image to list of available pics if it isn't there already
        imageUpdateElements = adminService.handleImagePickerSelectionUpdate(
            $scope.images, image, pickerBaseElementId);

        // update author image stored in scope
        $scope.content.image = image;
        $scope.$apply();
    };

    $scope.addNewSection = function(section) {
        if ($scope.sections.indexOf(section) == -1) {
            $scope.sections.push(section);
        }

        $scope.content.section = section;

        $scope.$apply();
    };
}]);
