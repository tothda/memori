function SetListView() {}

// static methods
Y.mix(SetListView, {

});

// instance methods
Y.mix(SetListView.prototype, {
    setSets: function(sets){
        this.sets = sets;
        return this;
    },
    render: function(){
        var me = this;
        this.listN = N.create('<ul id="set-list"></ul>');
        board.html('');
        menuBar.html('');
        for (var i=0,l=me.sets.length; i<l; i++){
            var cls = (i == 0) ? 'first' : (i == l-1 ? 'last' : '');
            var set = me.sets[i];
            me.renderSet(set,cls);
        }
        var bc = Y.get('#board-content');
        bc.appendChild(this.listN);
    },
    renderSet: function(set, cls){
        var item = N.create('<li></li>');
        if (cls) {
            item.addClass(cls);
        }
        var star = div('','star');
        var descr = div('','descr');
        var stat = div('','stat');
        var func = div('','func');
        star.set('innerHTML', 'star');
        this.renderStat(stat, set);
        func.set('innerHTML', 'func');
        item.appendChild(this.renderStar());
        item.appendChild(this.renderDescription(set));
        item.appendChild(stat);
        item.appendChild(this.renderFunc(set));
        item.appendChild(div('','clear'));
        this.listN.appendChild(item);
    },
    renderStar: function() {
        var rnd = Math.floor(Math.random() * 2);
        var cls = (rnd == 0) ? 'star star-empty' : 'star star-full';
        var node = div('',cls).set('innerHTML', '&nbsp;');
        return node;
    },
    renderDescription: function(set){
        var title = set.get('title') || 'Cím nélküli lecke';
        var description = set.get('description');
        var node = div('','descr');
        var titleNode = div('','title').set('innerHTML','<a href="#">'+title+'</a>');
        node.appendChild(titleNode);
        node.appendChild(div('','description').set('innerHTML',description));
        titleNode.on('click', function(){
            controller.fire('showSet', set.id());
        });
        return node;
    },
    renderFunc: function(set) {
        var node = div('','func');
        var func_button = div('','func-button');
        var left = div('','func-left');
        var right = div('','func-right');
        left.appendChild(div('','count').set('innerHTML', '66'));
        right.appendChild(div('','count').set('innerHTML', '33'));
        func_button.appendChild(left);
        func_button.appendChild(right);
        func_button.appendChild(div('','clear'));
        node.appendChild(func_button);
        func_button.on('click', function(){
            controller.fire('practice', set.id());
        });
        return node;
    },
    renderStat: function(elem, set) {
        var barHeight = 30;
        var stat = set.bucket_stat;
        var sum = stat.sum;
        for (var i=0; i<5; i++) {
            var height = Math.round(barHeight * (stat.count(i) - stat.expired(i)) / sum);
            var expiredHeight = Math.round(barHeight * stat.expired(i) / sum);
            var bucket = N.create('<div class="bucket"></div');
            var expiredBar = N.create('<div class="bar expired">&nbsp;</div>');
            var bar = N.create('<div class="bar bucket_'+i+'">&nbsp;</div>');
            bar.setStyles({
                height: height+'px'
            });
            expiredBar.setStyles({
                height: expiredHeight+'px',
                marginTop: (barHeight-height-expiredHeight) +'px'
            });
            var count = N.create('<div class="count">'+stat.count(i)+'</div>');
            bucket.appendChild(expiredBar);
            bucket.appendChild(bar);
            bucket.appendChild(count);
            elem.appendChild(bucket);
        }
        elem.appendChild(div('','clear'));
    }
});

