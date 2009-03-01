// StatusBarWidget

function StatusBarWidget() {
    StatusBarWidget.superclass.constructor.apply(this, arguments);
}

Y.mix(StatusBarWidget, {
    NAME: 'statusbar',
    ATTRS: {
        message: {}
    }
});

Y.extend(StatusBarWidget, Y.Widget, {
    initializer: function(){
        this.publish('status:print');
    },
    renderUI: function(){
        var cb = this.get('contentBox');
        this.saveButton = N.create('<button>Mentés</button>');
        this.messagePanel = N.create('<span></span>');
        cb.appendChild(this.saveButton);
        cb.appendChild(this.messagePanel);
    },
    bindUI: function(){
        var cb = this.messagePanel;
        this.subscribe('status:print', function(e) {
            cb.set('innerHTML', '<span>'+e.details[0]+'</span>');
        });
        this.saveButton.on('click', function(){
            controller.fire('save');
        });
        // Y.later(3000, null, function(){
        //     cb.set('innerHTML','');
        // });
    }
});
