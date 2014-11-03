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

$(document).ready(function() {

    $("#comic-grid").sortable({
        delay: 100,
        distance: 10,
        start: function(e, ui)
        {

        },
        sort: function(e, ui)
        {

        },
        stop: function(e, ui){

        }
    });

    $("#comic-grid").disableSelection();

    bindEnterOverlay();
    bindLeaveOverlay();
/*
    $("#comic-grid").on("mousedown", ".comic-grid-item", function() {
        unbindEnterOverlay();
        unbindLeaveOverlay();
        highlightItem($(".comic-thumbnail-image-overlay"));
    });

    $("#comic-grid").on("mouseup", ".comic-grid-item", function() {
        window.setTimeout(removeOverlays,1000);
    });
    */
});