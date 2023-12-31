angular.module("adminModule", ['ngSanitize','ngResource','ui.router','commonModule']);

angular.module("adminModule").controller("mainAdminController", ['$scope', '$http', '$resource', 'commonService', function ($scope, $http, $resource, commonService) {
    $scope.common = commonService.getCommonData();
    $scope.adminHeaderLabel = "Category List";

    // get all categories
    $http.get('/data/content/categories')
        .success(function (categories) {
            $scope.categories = [];
            angular.forEach(categories, function(value, key) {
                $scope.categories.push({
                    categoryName: value,
                    categoryDisplayText : $scope.common[value].displayText+'s'
                });
            });
        })
        .error(function (data) {
            log.error('error getting categories: ' + data);
        });
}]);

angular.module("adminModule").controller("categoryAdminController",
['$stateParams', '$state', '$scope', '$http', '$resource', 'commonService', 'adminService', '$window',
function ($stateParams, $state, $scope, $http, $resource, commonService, adminService, $window) {

    $window.scrollTo(0, 0);

    if ($stateParams.categoryId == '') {
        $state.go("main");
    } else {
        $scope.common = commonService.getCommonData();
        $scope.category = $stateParams.categoryId;
        $scope.adminHeaderLabel = 'Managing ' + $scope.common[$scope.category].displayText + 's';

        // get all content of the given category
        $http.get('/data/admin/content/' + $scope.category + '/all')
            .success(function (sections) {
                $scope.sections = sections;

                angular.forEach($scope.sections, function (value, key) {
                    value.contents.forEach(function (content) {
                        content.originalSequenceNumber = content.sequenceNumber;
                        content.previousSequenceNumber = content.sequenceNumber;
                        content.originalSection = content.section;
                        content.previousSection = content.section;
                    });
                });
                $scope.dataLoaded = true;
            })
            .error(function (data) {
                log.error('error: ' + data);
            });

        // expose function allowing users to save reordering changes
        $scope.commitReorderingChanges = function () {
            if (window.localStorage['loglevel'] == 'DEBUG') {
                angular.forEach($scope.sections, function (value, key) {
                    value.contents.forEach(function (content) {
                        log.debug("id:" + content._id + " oldseq:" + content.originalSequenceNumber + " newseq:" + content.sequenceNumber
                            + " oldsec:" + content.originalSection + " newsec:" + content.section);
                    });
                });
            }

            $http.post('/data/content/' + $scope.category + '/reorder', {sections: $scope.sections})
                .success(function () {
                    log.debug("updated content order");
                    angular.element(".content-thumbnail-image-change-indicator-overlay").removeClass('content-thumbnail-image-overlay-changed');
                    angular.element(".admin-reorder-button").attr("disabled", "disabled");

                    adminService.showSaveSuccessMessage();
                }).error(function (data) {
                    log.error('error: ' + data);
                });
        };

        // expose function to route to edit page for a piece of content
        $scope.editContentItem = function (category, sequenceNumber) {
            log.debug("opening content page for " + category + " #" + sequenceNumber);
            $state.go("content", {categoryId: category, sequenceNumber: sequenceNumber});
        };

        $scope.addNewSection = function () {
            $state.go("section", {categoryId: $scope.category, sequenceNumber: 'new'});
        };

        $scope.addNewContentItem = function () {
            $state.go("content", {categoryId: $scope.category, sequenceNumber: 'new'});
        };
    }
}]);

angular.module("adminModule").controller("contentAdminController",
['$stateParams', '$state', '$scope', 'adminService', 'commonService', '$sce', '$filter', '$timeout', '$window',
    function ($stateParams, $state, $scope, adminService, commonService, $sce, $filter, $timeout, $window) {

    function getEditContentAdminHeaderLabel() {
        return 'Managing ' + $scope.common[$scope.category].displayText + ' #' + $scope.sequenceNumber;
    }

    function updateContentForDisplay() {
        $scope.content.publishDate = new Date($scope.content.publishDate);
        $scope.content.publishDateForDisplay = $filter('date')($scope.content.publishDate, $scope.common.publishDateTimeAdminFormat.angular);
    }

    $window.scrollTo(0, 0);

    if ($stateParams.sequenceNumber == '') {
        $state.go("category", {categoryId: $stateParams.categoryId});
    } else {

        $scope.category = $stateParams.categoryId;
        $scope.sequenceNumber = $stateParams.sequenceNumber;
        $scope.common = commonService.getCommonData();

        if ($scope.sequenceNumber == 'new') {
            $scope.adminHeaderLabel = 'Adding New ' + $scope.common[$scope.category].displayText;
        } else {
            $scope.adminHeaderLabel = getEditContentAdminHeaderLabel();
        }

        // populate scope from service on controller construction
        adminService.getContentToEdit($scope.category, $scope.sequenceNumber)
            .then(function (contentAdminData) {
                $scope.content = contentAdminData.content;
                $scope.content.text = $sce.trustAsHtml(contentAdminData.content.text);

                if ($scope.content.publishDate == undefined) {
                    $scope.content.publishDate = new Date();
                }

                updateContentForDisplay();
                $scope.authorPics = contentAdminData.authorPics;
                $scope.images = contentAdminData.images;
                $scope.sections = contentAdminData.sections;
                $scope.imageUploadUrl = '/data/upload/' + $scope.content.category;
                $scope.authorPicUploadUrl = '/data/upload/author-pic';
                $scope.content.sequenceNumber = $scope.sequenceNumber;
                $scope.content.category = $scope.category;
            })
            .catch(function (err) {
                log.error("error getting content data for " + $scope.content.category + ": ", err);
            });

        $scope.saveContent = function () {
            log.debug("saving:",$scope.content);
            adminService.saveContent($scope.content)
                .then(function (updatedContent) {
                    $scope.content = updatedContent;
                    updateContentForDisplay();
                    $scope.sequenceNumber = $scope.content.sequenceNumber;
                    $scope.adminHeaderLabel = getEditContentAdminHeaderLabel();
                    adminService.showSaveSuccessMessage();
                })
                .catch(function (err) {
                    log.error("error saving content data for " + $scope.content.category + ": ", err);
                });
        };

        $scope.updateAuthorPic = function (image, pickerBaseElementId) {
            log.debug("using: " + image + " at " + pickerBaseElementId);

            // show selected image, add image to list of available pics if it isn't there already
            adminService.handleImagePickerSelectionUpdate($scope.authorPics, image, pickerBaseElementId);

            // update author image stored in scope
            $scope.content.authorPicture = image;
            $scope.$apply();
        };

        $scope.updateContentImage = function (image, pickerBaseElementId) {
            log.debug("using: " + image + " at " + pickerBaseElementId);

            // show selected image, add image to list of available pics if it isn't there already
            adminService.handleImagePickerSelectionUpdate($scope.images, image, pickerBaseElementId);

            // update author image stored in scope
            $scope.content.image = image;
            $scope.$apply();
        };

        $scope.addNewSection = function (section) {
            if ($scope.sections.indexOf(section) == -1) {
                $scope.sections.push(section);
            }

            $scope.content.section = section;

            $scope.$apply();
        };
    }
}]);

angular.module("adminModule").controller("sectionAdminController",
['$stateParams', '$state', '$scope', 'adminService', 'commonService', '$timeout', '$window',
function ($stateParams, $state, $scope, adminService, commonService, $timeout, $window) {

    function getEditSectionAdminHeaderLabel() {
        return 'Managing '+$scope.common[$scope.category].displayText+' section "'+$scope.sectionName+'"';
    }

    function getAddSectionAdminHeaderLabel() {
        return "Adding New "+$scope.common[$scope.category].displayText+"s Section"
    }

    $window.scrollTo(0, 0);

    $scope.category = $stateParams.categoryId;
    $scope.sequenceNumber = $stateParams.sequenceNumber;
    $scope.common = commonService.getCommonData();
    $scope.thumbnailUploadUrl = '/data/upload/archives-thumbnail';
    $scope.descriptionImageUploadUrl = '/data/upload/archives-description-image';

    adminService.getSectionData($scope.category, $scope.sequenceNumber)
        .then(function(sectionData) {
            $scope.thumbnailImageUrl = sectionData.thumbnailImageUrl;
            $scope.descriptionImageUrl = sectionData.descriptionImageUrl;
            $scope.thumbnails = sectionData.thumbnails;
            $scope.descriptionImages = sectionData.descriptionImages;
            $scope.sectionName = sectionData.sectionName;

            if ($scope.sequenceNumber == 'new') {
                $scope.adminHeaderLabel = getAddSectionAdminHeaderLabel();
                $scope.submitButtonText = 'Add';
            } else {
                $scope.adminHeaderLabel = getEditSectionAdminHeaderLabel();
                $scope.submitButtonText = 'Save';
            }
        })
        .catch(function(err) {
            log.error("error getting section data for "+$scope.category+", "+$scope.section+": ", err);
        });

    $scope.commitSectionChanges = function() {
        log.debug("save section changes");

        adminService.saveSection({
            sequenceNumber: $scope.sequenceNumber,
            sectionName: $scope.sectionName,
            thumbnailImageUrl: $scope.thumbnailImageUrl,
            descriptionImageUrl : $scope.descriptionImageUrl,
            category: $scope.category
        })
        .then(function(sectionData) {
            log.debug("saved: ",sectionData);
            $scope.thumbnailImageUrl = sectionData.thumbnailImageUrl;
            $scope.descriptionImageUrl = sectionData.descriptionImageUrl;
            $scope.category = sectionData.category;
            $scope.sectionName = sectionData.sectionName;
            $scope.adminHeaderLabel = getEditSectionAdminHeaderLabel();

            adminService.showSaveSuccessMessage();
        })
        .catch(function(err) {
            log.error("error saving section data for "+$scope.sectionName+": ", err);
        });

    };

    $scope.updateThumbnailImage = function(image, pickerBaseElementId) {
        log.debug("using: "+image+" at "+pickerBaseElementId);

        // show selected image, add image to list of available pics if it isn't there already
        adminService.handleImagePickerSelectionUpdate($scope.thumbnails, image, pickerBaseElementId);

        // update author image stored in scope
        $scope.thumbnailImageUrl = image;
        $scope.$apply();
    };

    $scope.updateDescriptionImage = function(image, pickerBaseElementId) {
        log.debug("using: "+image+" at "+pickerBaseElementId);

        // show selected image, add image to list of available pics if it isn't there already
        adminService.handleImagePickerSelectionUpdate($scope.descriptionImages, image, pickerBaseElementId);

        // update author image stored in scope
        $scope.descriptionImageUrl = image;
        $scope.$apply();
    };

}]);
