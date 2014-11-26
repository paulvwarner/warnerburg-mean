angular.module("adminModule").directive("toggleAuthorPicOptions", ['adminService', function(adminService) {
    return {
        link: function (scope, element, attrs) {
            element.on("click", function(event) {
                event.preventDefault();
                console.log("change auth pic");
                adminService.toggleAuthorPicOptions();
            });
        }
    };
}]);

angular.module("adminModule").directive("categoryDynamicStateHref", ['$state', function($state) {
    return {
        link: function (scope, element, attrs) {
            console.log("post ", scope.category);

            element.on("click", function(event) {
                event.preventDefault();
                console.log("going");
                $state.go("category", {categoryId: scope.category});
            });
        }
    };
}]);

angular.module("adminModule").directive("connectedSortableRepeater", ['$timeout', '$state', function($timeout, $state) {
    return {
        link: function (scope, element, attrs) {
            if (scope.$last) {

                // prevent text selection on rearrange-able grid
                angular.element(".admin-content-grid").disableSelection();

                // config for rearrange-able grid
                angular.element(".admin-content-grid").sortable({
                    delay: 100,
                    placeholder: "content-grid-item",
                    distance: 10,
                    revert: false,
                    tolerance: "pointer",
                    connectWith: ".admin-content-grid",
                    start: function(e, ui) {

                    },
                    sort: function(e, ui) {

                    },
                    stop: function(e, ui) {
                        // update form for items that had a sequence number change
                        angular.forEach(angular.element(".content-grid-item"), function(value, key) {
                            var currentListElement = angular.element(value);
                            var rearrangeSequenceNumber = ""+$.trim("" + (key + 1));
                            var previousSequenceNumber = ""+$.trim(currentListElement.find(".content-previous-sequence-number-field").val());

                            var rearrangeSection = currentListElement.parents(".admin-content-grid").data("section");
                            var previousSection = ""+$.trim(currentListElement.find(".content-previous-section-field").val());

                            console.log(rearrangeSequenceNumber+" vs "+previousSequenceNumber);
                            console.log(rearrangeSection+" vs "+previousSection);

                            if (rearrangeSequenceNumber != previousSequenceNumber || rearrangeSection != previousSection) {
                                // update sequence number
                                currentListElement.find(".content-sequence-number-field").val(rearrangeSequenceNumber);
                                currentListElement.find(".content-sequence-number-field").trigger('input');
                                currentListElement.find(".content-previous-sequence-number-field").val(rearrangeSequenceNumber);
                                currentListElement.find(".content-previous-sequence-number-field").trigger('input');

                                // update section
                                currentListElement.find(".content-section-field").val(rearrangeSection);
                                currentListElement.find(".content-section-field").trigger('input');
                                currentListElement.find(".content-previous-section-field").val(rearrangeSection);
                                currentListElement.find(".content-previous-section-field").trigger('input');

                                currentListElement.find(".content-thumbnail-image-overlay-sequence-number-text").text(rearrangeSequenceNumber);
                                currentListElement.find(".content-thumbnail-image-change-indicator-overlay").addClass('content-thumbnail-image-overlay-changed');
                                angular.element(".admin-reorder-button").removeAttr("disabled");
                            }
                        });
                    }
                });

                $( ".admin-content-grid").each(function() {
                    $(this).sortable( "option", "connectWith", ".admin-content-grid" );
                });
            }
        }
    };
}]);