// SideBarWidget
function SideBarWidget() {
    SideBarWidget.superclass.constructor.apply(this, arguments);
}

Y.mix(SideBarWidget, {
    ATTRS: {},
    NAME: "sidebar",
    MENU_ITEMS: [['Leckéim', 'allSets'], ["Új lecke", 'newSet'], ['Ismerőseim','friends']],
    MENU_ITEM_TEMPLATE: '<li><a rel="{rel}", href="javascript:void(0)">{item}</a></li>'
});

Y.extend(SideBarWidget, Y.Widget, {
    renderUI: function() {
        var cb = this.get('contentBox');
        this.ul = N.create('<ul></ul>');
        Y.each(SideBarWidget.MENU_ITEMS, function(i){
            this.addItem(i);
        }, this);
        cb.appendChild(this.ul);
    },
    bindUI: function(){
        var bb = this.get('boundingBox');
        bb.on('click', function(e){
            var t = e.target;
            var event = t.getAttribute('rel');
            controller.fire(event);
            e.preventDefault();
        }, this);
    },
    addItem: function(i){
        this.ul.appendChild(N.create(Y.substitute(SideBarWidget.MENU_ITEM_TEMPLATE, {item: i[0], rel: i[1]})));
    },
    removeItem: function(i){
        var li =this.ul.query('a[rel="'+i+'"]').ancestor('li');
        this.ul.removeChild(li);
    }
});
