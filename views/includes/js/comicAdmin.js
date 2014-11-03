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

    $("#comic-grid").sortable({
        delay: 100,
        distance: 10,
        revert: 300,
        tolerance: "pointer",
        start: function(e, ui)
        {

        },
        sort: function(e, ui)
        {

        },
        stop: function(e, ui){
            // update form for items that had a sequence number change
            $(".comic-grid-item").each(function(index) {
                var rearrangeSequenceNumber = ""+$.trim("" + (index + 1));
                var persistedSequenceNumber = ""+$.trim($(this).find(".comic-thumbnail-image-overlay-text").text());
                if (rearrangeSequenceNumber != persistedSequenceNumber) {
                    $(this).find(".comic-sequence-number-field").val(rearrangeSequenceNumber);
                    $(this).find(".comic-sequence-number-field").trigger('input');
                    $(this).find(".comic-thumbnail-image-overlay-text").text(rearrangeSequenceNumber);
                    markForUpdate($(this).find(".comic-thumbnail-image-overlay-text"));
                }
            });
        }
    });

    $("#comic-grid").disableSelection();

    bindEnterOverlay();
    bindLeaveOverlay();
});