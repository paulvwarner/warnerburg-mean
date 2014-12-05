angular.module("adminModule").factory("adminService", ['$timeout', '$http', '$resource', '$sce', 'commonService', '$filter',
    function ($timeout, $http, $resource, $sce, commonService, $filter) {

    var publishDateTimeAdminFormat = commonService.getCommonData().publishDateTimeAdminFormat.datepicker;

    var updateContentForDisplay = function(scope) {
        scope.content.publishDate = new Date(scope.content.publishDate);
        scope.content.publishDateForDisplay = $filter('date')(scope.content.publishDate, scope.common.publishDateTimeAdminFormat.angular);
    };

    var getContentToEdit = function(scope) {
        $http.get('/data/admin/content/' + scope.category + '/' + scope.sequenceNumber)
            .success(function (contentAdminData) {
                scope.content = contentAdminData.content;
                scope.content.text = $sce.trustAsHtml(contentAdminData.content.text);
                updateContentForDisplay(scope);
                scope.authorPics = contentAdminData.authorPics;
            })
            .error(function (data) {
                log.error('error: ' + data);
            })
        ;
    };

    var commitContentChanges = function(scope) {
        log.debug("committing content changes: ",scope);
        $http.put('/data/admin/content/'+scope.content.category+'/'+scope.content.sequenceNumber, {content: scope.content})
            .success(function(updatedContent) {
                scope.content = updatedContent;
                updateContentForDisplay(scope);

                var saveMessage = angular.element(".content-save-message");
                saveMessage.text("saved successfully");
                saveMessage.velocity("fadeIn");
                $timeout(function() {
                    saveMessage.velocity("fadeOut");
                }, 2000);
            }).error(function(data) {
                log.error('error: ' + data);
            });
    };

    var handleImagePickerSelectionUpdate = function (imageList, clientPathToUpload, pickerBaseElementId) {
        // add uploaded pic to list stored in scope.  do it after hiding the list if the list is currently displayed.
        if (!angular.element("#"+pickerBaseElementId).find(".image-picker-preview").is(":visible")) {
            toggleImagePickerSelectionOptions(pickerBaseElementId, function() {
                addNewPicToList(imageList, clientPathToUpload);
            });
        } else {
            addNewPicToList(imageList, clientPathToUpload);
        }
    };

    var showUploadSuccessMessage = function(messageElement, fileName) {
        // show an upload success message that disappears after 2 seconds.
        messageElement.css("display","block");
        messageElement.text("Uploaded '"+fileName+"' successfully.");
        $timeout(function() {
            messageElement.velocity("slideUp");
        }, 2000);
    };

    var addNewPicToList = function(imageList, clientPathToUpload) {
        if (imageList.indexOf(clientPathToUpload) == -1) {
            imageList.push(clientPathToUpload);
        }
    };

    // toggle display of list of author pics
    var toggleImagePickerSelectionOptions = function(pickerBaseElementId, hideOptionsCallback) {
        var preview = angular.element("#"+pickerBaseElementId).find(".image-picker-preview");
        var optionsDisplay = angular.element("#"+pickerBaseElementId).find(".image-picker-selection-option-display");

        if (preview.is(":visible")) {
            preview.velocity("slideUp");
            optionsDisplay.velocity("slideDown");
        } else {
            if (hideOptionsCallback) {
                optionsDisplay.velocity("slideUp", 400, hideOptionsCallback);
            } else {
                optionsDisplay.velocity("slideUp");
            }
            preview.velocity("slideDown");
        }
    };

    return {
        toggleImagePickerSelectionOptions: toggleImagePickerSelectionOptions,
        addNewPicToList: addNewPicToList,
        handleImagePickerSelectionUpdate: handleImagePickerSelectionUpdate,
        showUploadSuccessMessage: showUploadSuccessMessage,
        getContentToEdit: getContentToEdit,
        commitContentChanges: commitContentChanges
    };
}]);