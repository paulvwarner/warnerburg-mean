// clicking this element should toggle the display of of the comments section
angular.module("contentModule").directive("commentsLink", ['$document', '$rootScope', 'contentService', function($document, $rootScope, contentService) {
    return {
        restrict: 'A',
        link : function (scope, element, attrs) {
            $document.ready(function () {
                element.on("click", function (event) {
                    event.preventDefault();
                    contentService.toggleCommentsDisplay();
                });
            });
        }
    };
}]);