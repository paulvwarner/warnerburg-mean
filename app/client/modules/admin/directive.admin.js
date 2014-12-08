angular.module("adminModule").directive("toggleImagePickerSelectionOptions", ['adminService', function(adminService) {
    return {
        link: function (scope, element, attrs) {
            element.on("click", function(event) {
                event.preventDefault();
                log.debug("toggle opts");
                adminService.toggleImagePickerSelectionOptions(''+element.closest(".content-image-picker").attr("id"));
            });
        }
    };
}]);

angular.module("adminModule").directive("useAsImageOnClick", ['adminService', function(adminService) {
    return {
        link: function (scope, element, attrs) {
            element.on("click", function(event) {
                event.preventDefault();
                log.debug("change auth pic to "+attrs.imageToUse);
                scope.updateFunction({image: attrs.imageToUse, pickerBaseElementId: ''+element.closest(".content-image-picker").attr("id")});
            });
        }
    };
}]);

angular.module("adminModule").directive("categoryDynamicStateHref", ['$state', function($state) {
    return {
        link: function (scope, element, attrs) {
            log.debug("post ", attrs.category);

            element.on("click", function(event) {
                event.preventDefault();
                $state.go("category", {categoryId: attrs.category});
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

angular.module("adminModule").directive("editSectionOnDoubleClick", ['$state', function($state) {
    return {
        link: function (scope, element, attrs) {
            angular.element(document).ready(function () {
                element.disableSelection();
                element.on("dblclick", function(event) {
                    event.preventDefault();

                    log.debug("edit section: at "+scope.category+"/"+scope.section.section.sequenceNumber);
                    $state.go("section", {categoryId: scope.category, sequenceNumber: scope.section.section.sequenceNumber});
                });
            });
        }
    };
}]);

angular.module("adminModule").directive("addSectionOnDoubleClick", ['$state', function($state) {
    return {
        link: function (scope, element, attrs) {
            var dataLoadedInitialValue = scope.dataLoaded;
            var alreadySetUp = false;

            // once data is loaded (initial rest call to get page data returns data), execute this logic only once
            scope.$watch('dataLoaded', function (newValue, oldValue) {
                if (((dataLoadedInitialValue == undefined && newValue != undefined) || dataLoadedInitialValue != undefined) && !alreadySetUp) {
                    alreadySetUp = true;
                    element.removeClass("add-section-label");

                    element.disableSelection();
                    element.on("dblclick", function (event) {
                        event.preventDefault();

                        log.debug("add section to " + scope.category);
                        $state.go("section", {categoryId: scope.category, sequenceNumber: 'new'});
                    });
                }
            });
        }
    };
}]);

angular.module("adminModule").directive('addNewContentItemOnDoubleClick', ['adminService', function(adminService) {
    return {
        link: function(scope, element, attrs) {
            angular.element(document).ready(function () {
                log.debug("sibs:"+element.siblings("li").size());

                if (element.siblings("li").size() == 0) {
                    element.css("float", "right");
                }

                element.on("dblclick", function(event) {
                    event.preventDefault();

                    log.debug("add content");

                });
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
                    items: ".content-grid-item:not(.new-item-placeholder)",
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
                        angular.forEach(angular.element(".content-grid-item:not(.new-item-placeholder)"), function(value, key) {
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

                            var newItemPlaceholder = angular.element(".new-item-placeholder");
                            if (newItemPlaceholder.siblings("li").size() == 0) {
                                newItemPlaceholder.css("float", "right");
                            } else {
                                if (newItemPlaceholder.prev("li").size() == 0) {
                                    var sortableList = newItemPlaceholder.parent();
                                    newItemPlaceholder = angular.element(".new-item-placeholder").detach();
                                    sortableList.append(newItemPlaceholder);
                                    newItemPlaceholder.css("float", "left");
                                }
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
        }
    };
});

angular.module("adminModule").directive('toggleTextEntryDisplay', ['adminService', function(adminService) {
    return {
        link: function(scope, element, attrs) {
            element.on("click", function(event) {
                event.preventDefault();
                log.debug("toggle text entry");
                adminService.toggleTextPickerSelectionOptions(''+element.closest(".content-text-picker").attr("id"));
            });
        }
    };
}]);

angular.module("adminModule").directive('addNewTextOption', ['adminService', function(adminService) {
    return {
        scope: {
            addFunction: '&'
        },
        link: function(scope, element, attrs) {
            element.find(".submit-new-text-option").on("click", function(event) {
                event.preventDefault();
                scope.addFunction({section: ''+element.closest(".content-text-picker").find(".new-text-option").val()});
                adminService.toggleTextPickerSelectionOptions(''+element.closest(".content-text-picker").attr("id"));
            });
            element.find(".new-text-option").on("keydown keypress", function(event) {
                var code = event.keyCode || event.which;
                if (code == 13) {
                    event.preventDefault();
                    scope.addFunction({section: '' + element.closest(".content-text-picker").find(".new-text-option").val()});
                    adminService.toggleTextPickerSelectionOptions('' + element.closest(".content-text-picker").attr("id"));
                }
            });
        }
    };
}]);

angular.module("adminModule").directive('contentImagePicker', ['adminService', function(adminService) {
    return {
        scope: {
            selectedImage: '=',
            images: '=',
            updateFunction: '&',
            selectionOptionsLabel: '=',
            uploadUrl: '=',
            imageClass: '='
        },
        templateUrl: '/views/includes/partials/admin.content.image.picker.html',
        link: function(scope, element, attrs) {
            var uploadUrlInitialValue = scope.uploadUrl;
            var alreadySetUp = false;

            // once uploadUrl is available on scope, execute this logic only once
            scope.$watch('uploadUrl', function (newValue, oldValue) {
                if (((uploadUrlInitialValue == undefined && newValue != undefined) || uploadUrlInitialValue != undefined) && !alreadySetUp) {
                    alreadySetUp = true;
                    log.debug("scope url " + scope.uploadUrl);
                    // set up dropzone file upload areas
                    var imageDropZone = new Dropzone(
                            '#' + element.attr("id"),
                        {
                            createImageThumbnails: false,
                            clickable: element.find('.image-picker-upload-link').get(),
                            previewsContainer: element.find('.image-picker-dropzone-template')[0],
                            previewTemplate: '<div class="dropzone-preview dz-message">' +
                                '<div class="dz-preview dz-file-preview">' +
                                '<div class="dz-details">' +
                                '<div class="dz-filename">Uploaded <span data-dz-name></span> (<span class="dz-size" data-dz-size></span>)</div>' +
                                '<img data-dz-thumbnail />' +
                                '</div>' +
                                '<div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>' +
                                '<div class="dz-error-message"><span data-dz-errormessage></span></div>' +
                                '</div>' +
                                '</div>',
                            url: scope.uploadUrl
                        }
                    );

                    imageDropZone.on("success", function (file, clientPathToUpload) {
                        scope.updateFunction({image: clientPathToUpload, pickerBaseElementId: element.attr("id")});
                        adminService.showUploadSuccessMessage(element.find(".upload-results"), file.name);
                    }).on("error", function (file, errorMessage) {
                        log.error("error uploading file");
                        element.find(".upload-results").css("display", "block");
                        element.find(".upload-results").text("Error uploading '" + file.name + "':", errorMessage);
                    });
                }
            });

        }
    };
}]);


