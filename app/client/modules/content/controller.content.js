angular.module("contentModule").controller("contentController", ['$scope', '$http', '$sce', '$rootScope', '$attrs', 'contentService',
    function ($scope, $http, $sce, $rootScope, $attrs, contentService) {
        console.log("content controller constructor called");
        $rootScope.firstModelChangeHappened = false;

        // get current model once angular is set up for the first time, then sync model to url from then on
        contentService.getContent($attrs.contentSequenceNumber, $attrs.contentCategory)
            .then(function(content) {
                // put new content data in scope
                $rootScope.content = content;
                $rootScope.content.text = $sce.trustAsHtml(content.text);

                $rootScope.$on("$locationChangeSuccess", function() {
                    contentService.syncModelToUrl($attrs.contentCategory);
                });
            })
            .catch(function(err) {
                console.log("error getting content: ",err);
            });

        // expose function allowing users to create a new comment
        $rootScope.createComment = function(comicSequenceNumber, comment) {
            contentService.createComment(comicSequenceNumber, comment, $scope);
        };
    }]);
