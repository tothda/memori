// StatusBarWidget

var statusBar = {};

Y.mix(statusBar, {
    working: function(msg) {
        sbNode.html(msg||' ').addClass('working');
    },
    finished: function() {
        sbNode.removeClass('working').html('');
    }
});
