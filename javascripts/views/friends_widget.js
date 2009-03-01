function FriendsWidget() {
    FriendsWidget.superclass.constructor.apply(this, arguments);
}

Y.mix(FriendsWidget, {
    NAME: 'friends',
    ATTRS: {
        friends: {}
    },
    FRIEND_TEMPLATE: '<li id="{id}"><a class="friend-name" href="javascript:void(0)">{name}</a></li>'
});

Y.extend(FriendsWidget, Y.Widget, {
    renderUI: function(){
        var cb = this.get('contentBox');
        this.ul = N.create('<ul></ul>');
        Y.each(this.get('friends'), function(f){
            this.ul.appendChild(N.create(Y.substitute(FriendsWidget.FRIEND_TEMPLATE, {id: f.get('id'), name: f.get('name')})));
        }, this);
        cb.appendChild(this.ul);
    },
    bindUI: function(){
        var boundingBox = this.get("boundingBox");
        boundingBox.on('click', function(e){
            var t = e.target;
            var key = t.ancestor("li").get('id');
            if (t.test(".friend-name")) {
                controller.fire('allSets', key);
            }
        });
    }
});
