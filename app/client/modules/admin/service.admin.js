angular.module("adminModule").factory("adminService", ['$timeout', '$http', '$resource', '$sce', 'commonService', '$filter', '$q',
    function ($timeout, $http, $resource, $sce, commonService, $filter, $q) {

    var publishDateTimeAdminFormat = commonService.getCommonData().publishDateTimeAdminFormat.datepicker;

    var getContentToEdit = function(category, sequenceNumber) {
        var deferred = $q.defer();
        $http.get('/data/admin/content/' + category + '/' + sequenceNumber)
            .success(function (contentAdminData) {
                deferred.resolve(contentAdminData);
            })
            .error(function (data) {
                log.error('error: ' + data);
                deferred.reject(data);
            })
        ;
        return deferred.promise;
    };

    var getSectionData = function(category, sequenceNumber) {
        var deferred = $q.defer();
        $http.get('/data/admin/section/' + category + '/' + sequenceNumber)
            .success(function (sectionData) {
                deferred.resolve(sectionData);
            })
            .error(function (data) {
                log.error('error: ' + data);
                deferred.reject(data);
            })
        ;
        return deferred.promise;
    };
        
    var getDataForSectionAdd = function(category) {
        var deferred = $q.defer();
        $http.get('/data/admin/section/' + category + '/' + sequenceNumber)
            .success(function (sectionData) {
                deferred.resolve(sectionData);
            })
            .error(function (data) {
                log.error('error: ' + data);
                deferred.reject(data);
            })
        ;
        return deferred.promise;
    };

    var commitContentChanges = function(content) {
        var deferred = $q.defer();
        log.debug("committing content changes: ",content);
        $http.put('/data/admin/content/'+content.category+'/'+content.sequenceNumber, {content: content})
            .success(function(updatedContent) {
                deferred.resolve(updatedContent);
            }).error(function(data) {
                log.error('error: ' + data);
                deferred.reject(data);
            });
        return deferred.promise;
    };

    var commitSectionChanges = function(section) {
        var deferred = $q.defer();
        log.debug("committing section changes: ",section);
        $http.put('/data/admin/section/'+section.category+'/'+section.sequenceNumber, {section: section})
            .success(function(updatedSection) {
                deferred.resolve(updatedSection);
            }).error(function(data) {
                log.error('error: ' + data);
                deferred.reject(data);
            });
        return deferred.promise;
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
        messageElement.html('<div class="upload-results-message">Uploaded "'+fileName+'" successfully.</div>');
        messageElement.velocity("slideDown");
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

    var toggleTextPickerSelectionOptions = function(pickerBaseElementId) {
        var selectorDisplay = angular.element("#"+pickerBaseElementId).find(".existing-options-selection-display");
        var newOptionDisplay = angular.element("#"+pickerBaseElementId).find(".new-option-entry-display");

        if (selectorDisplay.is(":visible")) {
            selectorDisplay.velocity("slideUp");
            newOptionDisplay.velocity("slideDown");
        } else {
            newOptionDisplay.velocity("slideUp");
            selectorDisplay.velocity("slideDown");
        }
    };

    return {
        toggleImagePickerSelectionOptions: toggleImagePickerSelectionOptions,
        addNewPicToList: addNewPicToList,
        handleImagePickerSelectionUpdate: handleImagePickerSelectionUpdate,
        showUploadSuccessMessage: showUploadSuccessMessage,
        getContentToEdit: getContentToEdit,
        commitContentChanges: commitContentChanges,
        toggleTextPickerSelectionOptions: toggleTextPickerSelectionOptions,
        getSectionData: getSectionData,
        commitSectionChanges: commitSectionChanges
    };
}]);