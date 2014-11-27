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
['$stateParams', '$state', '$scope', 'adminService',
    function ($stateParams, $state, $scope, adminService) {

    $scope.category = $stateParams.categoryId;
    $scope.sequenceNumber = $stateParams.sequenceNumber;
    $scope.adminHeaderLabel = 'Managing '+$scope.category +' #'+$scope.sequenceNumber;

    // populate scope from service on controller construction
    adminService.getContentToEdit($scope);

    $scope.commitContentChanges = function() {
        adminService.commitContentChanges($scope);
    };

    // set up dropzone file upload areas
    angular.element(document).ready(function () {
        var authorDropZone = new Dropzone(
            'div#author-pic-drop-zone',
            {
                createImageThumbnails: false,
                clickable: '.author-pic-upload',
                previewsContainer: '#author-pic-dropzone-template',
                previewTemplate:
                    '<div class="dropzone-preview dz-message">' +
                        '<div class="dz-preview dz-file-preview">' +
                            '<div class="dz-details">'+
                                '<div class="dz-filename">Uploaded <span data-dz-name></span> (<span class="dz-size" data-dz-size></span>)</div>'+
                                '<img data-dz-thumbnail />'+
                            '</div>'+
                            '<div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>'+
                            '<div class="dz-error-message"><span data-dz-errormessage></span></div>'+
                        '</div>' +
                    '</div>',
                url: "/data/upload/authorPic"
            }
        );

        authorDropZone.on("success", function(file, clientPathToUpload) {
            adminService.updateAuthorPic($scope, clientPathToUpload, file.name);
            adminService.showUploadSuccessMessage(file.name);
        }).on("error", function(file, errorMessage) {
            angular.element("#author-pic-upload-results").css("display","block");
            angular.element("#author-pic-upload-results").text("Error uploading '"+file.name+"':",errorMessage);
        });
    });
}]);
