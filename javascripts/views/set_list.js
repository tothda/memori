var setListView = {};

// instance methods
Y.mix(setListView, {
    render: function(){
        var me = this;
        board.app(
            div().id('set-list-wrapper').app(
                me.renderSets()
            )
        );
        if (!me.user.appOwner()){
            ibNode.app(me.renderInfo());
            menuBar.app(me.renderMenuBar());            
        }
    },
    renderSets: function(){
        var me = this,
            l = me.sets.length;
        var node = ul().id('set-list').cls('round10 shadow');
        Y.each(me.sets, function(set, idx){
            var last = idx + 1 == l;
            node.app(
                li().cls(last ? 'last' : '').app(
                    me.renderSet(set)
                )
            );
        });
        return node;
    },
    renderSet: function(set){
        return set.ownerSet() ? this.renderOwnSet(set) : this.renderFriendSet(set);
    },
    renderOwnSet: function(set){
        return div(
            this.renderStar(),
            this.renderDescription(set),
            this.renderStat(set),
            this.renderFunc(set),
            div().cls('clear')
        );
    },
    renderFriendSet: function(set){
        return div(
            div().cls('star').html('&nbsp;'),
            this.renderDescription(set),
            this.renderFriendStat(set),
            this.renderFriendFunc(),
            div().cls('clear')
        );
    },
    renderStar: function() {
        var rnd = Math.floor(Math.random() * 2);
        var cls = (rnd == 0) ? 'star star-empty' : 'star star-full';
        return div().cls(cls).html('&nbsp;');
    },
    renderDescription: function(set){
        var link;
        var node = div().cls('descr').app(
            div().cls('title').app(
                link = a(set.title()).attr('href','#')
            ),
            div(set.get('description')).cls('description')
        );
        link.on('click', function(){
            controller.fire('showSet', set.id());
        });
        return node;
    },
    renderFunc: function(set) {
        if (set.bucket_stat.sum == 0) {
            return div().cls('func').html('&nbsp;');
        }
        var func_button;
        var node = div().cls('func').app(
            func_button = div().cls('func-button button').html('gyakorlás')
        );
        func_button.on('click', function(){
            controller.fire('practice', set.id());
        });
        return node;
    },
    renderFriendFunc: function(set){
        var func_button;
        var node = div().cls('func').app(
            func_button = div().cls('func-button button').html('átveszem')
        );
        func_button.on('click', function(){
            controller.fire('take', set.id());
        });
        return node;
    },
    renderFriendStat: function(set){
        var link;
        var node = div().cls('stat').app(
            div().cls('word-count').app(
                link = span(set.cardCount() + ' szó').cls('round5 button small-button')
            )
        );
        link.on('click', function(){
            controller.fire('showSet', set.id());
        });
        return node;
    },
    renderStat: function(set) {
        var elem = div().cls('stat');
        var barHeight = 30;
        var stat = set.bucket_stat;
        var sum = stat.sum;
        if (sum == 0||!set.ownerSet()) {
            elem.html('&nbsp;');
            return elem;
        }
        var maxBucketCount = stat.maxBucketCount();
        for (var i=0; i<5; i++) {
            var height = Math.round(barHeight * (stat.count(i) - stat.expired(i)) / maxBucketCount);
            var expiredHeight = Math.round(barHeight * stat.expired(i) / maxBucketCount);
            var bucket = N.create('<div class="bucket"></div');
            var expiredBar = N.create('<div class="bar expired">&nbsp;</div>');
            var bar = N.create('<div class="bar bucket_'+i+'">&nbsp;</div>');
            bar.setStyles({
                height: height+'px',
                marginTop: (barHeight-height-expiredHeight) +'px'
            });
            expiredBar.setStyles({
                height: expiredHeight+'px'
            });
            var count = N.create('<div class="count">'+stat.count(i)+'</div>');
            bucket.appendChild(bar);
            bucket.appendChild(expiredBar);
            bucket.appendChild(count);
            elem.appendChild(bucket);
        }
        elem.appendChild(div().cls('clear'));
        return elem;
    },
    renderInfo: function(){
        return div().cls('info').app(
            h3(this.user.name + ' leckéi.')
        );
    },
    renderMenuBar: function(){
        var me = this,
            node,backLink;

        node = div(
            backLink = a('« vissza az ismerősökhöz').attr('href','#')
        );
        backLink.on('click', function(){
            controller.fire('friends');
        });
        return node;
        
    },
    cleanUp: function(){
        board.clear();
        menuBar.clear();
        ibNode.clear();
    }
});
