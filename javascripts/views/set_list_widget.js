// SetList widget
function SetListWidget() {
    SetListWidget.superclass.constructor.apply(this, arguments);
}

Y.mix(SetListWidget, {
    ATTRS: {
        owner: {},
        sets: {}
    },
    NAME: "setlist"
});

Y.extend(SetListWidget, Y.Widget, {
    renderUI: function() {
        var contentBox = this.get('contentBox');
        this.listNode = N.create('<ul></ul>');
        Y.each(this.get('sets'), function(s) {
            this.renderSet(s);
        }, this);
        contentBox.set('innerHTML', '');
        contentBox.appendChild(this.listNode);
    },
    renderSet: function(set){
        var li = N.create('<li id="'+set.id()+'" class="'+this.getClassName('set')+'"></li>');
        var head = N.create('<div class="'+this.getClassName('head')+'"></div>');
        var title = N.create('<h3><a class="set-title" href="javascript:void(0)">'+set.get('title')+'</a></h3>');
        var descr = N.create('<p>'+set.get('description')+'</p>');
        head.appendChild(title);
        head.appendChild(descr);
        var func = N.create('<div class="'+this.getClassName('func')+'"></div>');
        var practice = N.create('<a class="set-practice" href="javascript:void(0)">gyakorlás</a>');
        func.appendChild(practice);
        var stat = N.create('<div class="'+this.getClassName('stat')+'"></div>');
        this.renderStat(stat, set);
        li.appendChild(head);
        li.appendChild(stat);
        li.appendChild(func);
        this.listNode.appendChild(li);
    },
    renderStat: function(div, set) {
        var barHeight = 30;
        var s = set.bucket_stat;
        var sum = s[0]+s[1]+s[2]+s[3]+s[4];
        for (var i=0; i<5; i++) {
            var h = Math.round(barHeight * s[i] / sum);
            var bucket = N.create('<div class="bucket"></div');
            var bar = N.create('<div class="bar bucket_'+i+'"></div>');
            bar.setStyles({
                height: h+'px',
                marginTop: (barHeight-h) +'px'
            });
            var count = N.create('<div class="count">'+set.bucket_stat[i]+'</div>');
            bucket.appendChild(bar);
            bucket.appendChild(count);
            div.appendChild(bucket);
        }
    },
    bindUI: function() {
        var boundingBox = this.get("boundingBox");
        boundingBox.on('click', function(e){
            var t = e.target;
            var key = t.ancestor("li").get('id');
            if (t.test(".set-title")) {
                controller.fire('showSet', key);
            }
            if (t.test('.set-practice')) {
                controller.fire('practice', key);
            }
        });
    },
    syncUI: function() {

    }
});
