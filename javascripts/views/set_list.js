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
        if (l == 0){
            return me.renderWelcomePage();
        }
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
            this.renderFriendFunc(set),
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
            controller.fire('takeSet', set.id());
        });
        return node;
    },
    renderFriendStat: function(set){
        var link;
        var node = div().cls('stat').app(
            div().cls('word-count-wrapper').app(
                link = div().cls('word-count round5 button small-button').app(
                    set.cardCount() + ' szó'
                )
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
        var tr1,tr2;
        elem.app(
            table(
                tbody(
                    tr1 = tr().cls('bars'),
                    tr2 = tr().cls('counts')
                )
            )
        );

        var maxBucketCount = stat.maxBucketCount();
        for (var i = 0; i < 5; i++){
            var height = Math.round(barHeight * (stat.count(i) - stat.expired(i)) / maxBucketCount);
            var expiredHeight = Math.round(barHeight * stat.expired(i) / maxBucketCount);
            var bar, expiredBar;
            tr1.app(
                expiredHeight == 0 ?
                    td(
                        bar = div().cls('bar bucket_'+i).html('&nbsp;')
                    ) :
                    td(
                        bar = div().cls('bar bucket_'+i).html('&nbsp;'),
                        expiredBar = div().cls('bar expired').html('&nbsp;')
                    )
            );

            bar.setStyles({
                height: height+'px',
                marginTop: (barHeight-height-expiredHeight) +'px'
            });
            if (expiredHeight != 0) {
                expiredBar.setStyles({
                    height: expiredHeight+'px'
                });
            }

        }
        for (var i = 0; i < 5; i++){
            tr2.app(
                td(''+stat.count(i))
            );
        }
        return elem;
    },
    renderInfo: function(){
        return div().cls('info').app(
            h3(this.user.name + ' leckéi')
        );
    },
    renderMenuBar: function(){
        var me = this,
            node,backLink;

        node = div(
            backLink = a('« vissza az ismerősökhöz').attr('href','#').cls('top-pad')
        );
        backLink.on('click', function(){
            controller.fire('friends');
        });
        return node;
        
    },
    renderWelcomePage: function(){
        var firstSet, about;
        var node = div().id('welcome-page').cls('round10 shadow').app(
            div(
                h1('Kedves ', strong(User.owner.name), ', a Memori üdvözöl téged!'),
                div().id('welcome-list-wrapper').app(
                    ul().id('welcome-list').app(
                        li('vidd fel leckéidet'),
                        li('oszd meg másokkal tudásod'),
                        li('fejleszd szókincsedet')
                    )
                ),
                div().cls('clear'),
                p(
                    'Csapj bele a közepébe és ',
                    firstSet = a('vidd fel').attr('href','#'),
                    ' első leckédet, vagy ',
                    about = a('tudj meg többet').attr('href', '#'),
                    ' arról, hogy működik a Memori!')
            )
        );
        firstSet.on('click', function(){ controller.fire('newSet');});
        about.on('click', function(){ controller.fire('about');});
        return node;
    },
    cleanUp: function(){
        board.clear();
        menuBar.clear();
        ibNode.clear();
    }
});
