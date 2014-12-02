angular.module("adminModule").directive("toggleAuthorPicOptions", ['adminService', function(adminService) {
    return {
        link: function (scope, element, attrs) {
            element.on("click", function(event) {
                event.preventDefault();
                log.debug("change auth pic");
                adminService.toggleAuthorPicOptions();
            });
        }
    };
}]);

angular.module("adminModule").directive("useAsAuthorPicOnClick", ['adminService', function(adminService) {
    return {
        link: function (scope, element, attrs) {
            element.on("click", function(event) {
                event.preventDefault();
                log.debug("change auth pic");
                adminService.updateAuthorPic(scope, attrs.imageToUse);
            });
        }
    };
}]);

angular.module("adminModule").directive("categoryDynamicStateHref", ['$state', function($state) {
    return {
        link: function (scope, element, attrs) {
            log.debug("post ", scope.category);

            element.on("click", function(event) {
                event.preventDefault();
                $state.go("category", {categoryId: scope.category});
            });
        }
    };
}]);

angular.module("adminModule").directive("showDatePicker", ['$state', function($state) {
    return {
        link: function (scope, element, attrs) {
            element.on("click", function(event) {
                jQuery('#admin-publish-date').datetimepicker('show');
            });
        }
    };
}]);

angular.module("adminModule").directive("adminDatePicker", ['$filter', function($filter) {
    return {
        link: function (scope, element, attrs) {
            element.datetimepicker({
                onChangeDateTime: function(dp, input) {
                    log.debug("scope pre ",scope.content.publishDate);
                    scope.content.publishDate = new Date(input.val());
                    log.debug("scope post ",scope.content.publishDate);
                    scope.$apply();
                },
                format: 'm/d/Y H:i'
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

                            log.debug(rearrangeSequenceNumber+" vs "+previousSequenceNumber);
                            log.debug(rearrangeSection+" vs "+previousSection);

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

angular.module("adminModule").directive('ckEditor', function() {
    return {
        require: '?ngModel',
        link: function(scope, element, attr, ngModel) {
            var ckEditor = CKEDITOR.replace(element[0]);

            if (!ngModel) return;

            ckEditor.on('instanceReady', function() {
                ckEditor.setData(ngModel.$viewValue);
            });

            function updateModel() {
                scope.$apply(function() {
                    ngModel.$setViewValue(ckEditor.getData());
                });
            }

            ckEditor.on('change', updateModel);
            ckEditor.on('key', updateModel);
            ckEditor.on('dataReady', updateModel);

             /*
            ngModel.$render = function(value) {
                ckEditor.setData(ngModel.$viewValue);
            };
            */
        }
    };
});