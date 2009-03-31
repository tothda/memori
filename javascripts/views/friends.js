var friendsView = {};

Y.mix(friendsView, {
    render: function(){
        var node = div().id('friends-list-wrapper').cls('round10 shadow').app(            
            this.renderFriends()
        );
        board.app(node);
        ibNode.app(this.renderInfo());
    },
    renderFriends: function(){
        var me = this;
        var node = ul();
        var friendsWithSet = [];
        Y.each(me.friends, function(friend){
            if (friend.num_sets > 0) {
                friendsWithSet.push(friend);
            }            
        });
        Y.each(friendsWithSet, function(friend, i){
            var last = i == friendsWithSet.length-1;
            node.app(
                li().cls(last ? 'last' : '').app(
                    me.renderFriend(friend, last)
                )
            );
        });
        return node;
    },
    renderFriend: function(friend){
        var node, link, button;
        node = div(
            div().cls('name').app(
                link = a(friend.name).attr('href','#')
            ),
            div().cls('set-count button round5 small-button').app(
                button = span(friend.num_sets + ' lecke')
            )
        );
        link.on('click', function(){
            controller.fire('allSets', friend.id);
        });
        button.on('click', function(){
            controller.fire('allSets', friend.id);
        });
        return node;
    },
    renderInfo: function(){
        return div().cls('info').app(
            'Az alábbi lista azon ismerőseidet mutatja, akiknél fel van telepítva a memori, és már legalább egy leckével rendelkeznek.'
        );
    },
    cleanUp: function(){
        board.clear();
        ibNode.clear();
    }
});