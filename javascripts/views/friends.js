var friendsView = {};

Y.mix(friendsView, {
    render: function(){
        var node = div().id('friends-list-wrapper').cls('round10 shadow').app(
            this.renderFriends()
        );
        board.app(node);
    },
    renderFriends: function(){
        var me = this;
        var node = ul();
        Y.each(me.friends, function(friend, i){
            var last = i == me.friends.length-1;
            node.app(me.renderFriend(friend, last));
        });
        return node;
    },
    renderFriend: function(friend, last){
        var node, link, button;
        node = li(
            div().cls('name').app(
                link = a(friend.name).attr('href','#')
            ),
            div().cls('set-count').app(
                button = span(friend.num_sets + ' lecke').cls('button round5 small-button')
            ),
            div().cls('clear')
        );
        if (last){
            node.addClass('last');
        }
        link.on('click', function(){
            controller.fire('allSets', friend.id);
        });
        button.on('click', function(){
            controller.fire('allSets', friend.id);
        });
        return node;
    },
    cleanUp: function(){
        board.clear();
    }
});