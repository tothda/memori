// StatusBarWidget

var statusBar = {};

Y.mix(statusBar, {
    box: Y.get('#status-bar'),
    working: function(msg) {
        this.box.html(msg).addClass('working');
    },
    finished: function() {
        this.box.removeClass('working').html('');
    }
});
