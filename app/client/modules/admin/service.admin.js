angular.module("adminModule").factory("adminService", ['$timeout', '$http', '$resource', '$sce', function ($timeout, $http, $resource, $sce) {

    var getContentToEdit = function(scope) {
        $http.get('/data/admin/content/' + scope.category + '/' + scope.sequenceNumber)
            .success(function (contentAdminData) {
                scope.content = contentAdminData.content;
                scope.content.text = $sce.trustAsHtml(contentAdminData.content.text);
                scope.authorPics = contentAdminData.authorPics;
            })
            .error(function (data) {
                console.log('error: ' + data);
            })
        ;
    };

    var commitContentChanges = function(scope) {
        console.log("commit");
        $http.put('/data/admin/content/'+scope.content.category+'/'+scope.content.sequenceNumber, {content: scope.content})
            .success(function(updatedContent) {
                scope.content = updatedContent;
                var saveMessage = angular.element(".content-save-message");
                saveMessage.css("display","inline");
                saveMessage.text("saved successfully");
                $timeout(function() {
                    saveMessage.velocity("fadeOut");
                }, 2000);
            }).error(function(data) {
                console.log('error: ' + data);
            });
    };

    var updateAuthorPic = function (scope, clientPathToUpload) {
        // add uploaded pic to list stored in scope.  do it after hiding the list if the list is currently displayed.
        if (!angular.element(".author-pic-preview").is(":visible")) {
            toggleAuthorPicOptions(function() {
                addNewPicToList(scope, clientPathToUpload);
            });
        } else {
            addNewPicToList(scope, clientPathToUpload);
        }

        // update author pic stored in scope
        scope.content.authorPicture = clientPathToUpload;
        scope.$apply();
    };

    var showUploadSuccessMessage = function(fileName) {
        // show an upload success message that disappears after 2 seconds.
        angular.element("#author-pic-upload-results").css("display","block");
        angular.element("#author-pic-upload-results").text("Uploaded '"+fileName+"' successfully.");
        $timeout(function() {
            angular.element("#author-pic-upload-results").velocity("slideUp");
        }, 2000);
    };

    var addNewPicToList = function(scope, clientPathToUpload) {
        if (scope.authorPics.indexOf(clientPathToUpload) == -1) {
            scope.authorPics.push(clientPathToUpload);
        }
        scope.$apply();
    };

    // toggle display of list of author pics
    var toggleAuthorPicOptions = function(hideOptionsCallback) {
        if (angular.element(".author-pic-preview").is(":visible")) {
            angular.element(".author-pic-preview").velocity("slideUp");
            angular.element(".author-pic-option-display").velocity("slideDown");
        } else {
            if (hideOptionsCallback) {
                angular.element(".author-pic-option-display").velocity("slideUp", 400, hideOptionsCallback);
            } else {
                angular.element(".author-pic-option-display").velocity("slideUp");
            }
            angular.element(".author-pic-preview").velocity("slideDown");
        }
    };

    return {
        toggleAuthorPicOptions: toggleAuthorPicOptions,
        addNewPicToList: addNewPicToList,
        updateAuthorPic: updateAuthorPic,
        showUploadSuccessMessage: showUploadSuccessMessage,
        getContentToEdit: getContentToEdit,
        commitContentChanges: commitContentChanges
    };
}]);