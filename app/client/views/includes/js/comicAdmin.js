// javascript functions specific to the admin app page
function removeOverlays() {
    unHighlightItem($(".comic-thumbnail-image-overlay"));

    bindEnterOverlay();
    bindLeaveOverlay();

}

function highlightItem(item) {
    $(item).animate({"background-color": "rgba(255,0,0,0.5)"},200);
}
function unHighlightItem(item) {
    $(item).animate({"background-color": "rgba(0,0,0,0.5)"},200);
}

function bindEnterOverlay() {
    $("#comic-grid").on("mouseenter", ".comic-grid-item", function() {
        highlightItem($(this).find(".comic-thumbnail-image-overlay"));
    });
}

function bindLeaveOverlay() {
    $("#comic-grid").on("mouseleave", ".comic-grid-item", function() {
        unHighlightItem($(this).find(".comic-thumbnail-image-overlay"));
    });
}

function unbindEnterOverlay() {
    $("#comic-grid").off("mouseenter");
}

function unbindLeaveOverlay() {
    $("#comic-grid").off("mouseleave");
}

function markForUpdate(element) {
    $(element).animate({"background-color": "rgba(155,0,0,0.5)"},200);
}

function unmarkForUpdate(element) {
    $(element).animate({"background-color": "rgba(155,0,0,0.0)"},200);
}


$(document).ready(function() {
/*
    $("#comic-grid").sortable({

    });



    bindEnterOverlay();
    bindLeaveOverlay();
    */
});