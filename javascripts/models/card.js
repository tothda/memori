// Card model
function Card(){
    Card.superclass.constructor.apply(this, arguments);
}

Y.mix(Card, {
    ATTRS: {
        id: {},
        front: {value:""},
        flip: {value:""},
        bucket: {value: 0},
        time: {
            set: function(t){
                switch (typeof t) {
                case "string":
                    return new Date().setISO8601(t);
                default:
                    return t;
                }
            }
        },
        result: {},
        set: {}
    },
    NAME: "card",
    BUCKET: [0,1,3,7,30]
});

Y.extend(Card, Y.Base, {
    initializer: function() {
        if (!this.get('time')) {
            // hozzáadjuk 0-ás bucket-hez
            var s = this.get('set');
        }
        var cf = ['front','flip'];
        Y.each(cf, function(f){
            this.on(f+'Change', function(){
                this.get('set').setDirty();
            }, this);
        }, this);
    },
    newObj: function(){
        return typeof this.get('id') === "undefined";
    },
    id: function(){
        return this.newObj() ? (this.guid ? this.guid : (this.guid = Y.guid(this.NAME))) : this.get('id');
    },
    empty: function(){
        return this.get('front') === "" && this.get('flip') === "";
    },
    shouldSave: function(){
        return (this.newObj() && !this.empty()) || (!this.newObj());
    },
    expired: function() {
        return !this.get('time') || this.expiredSince() > 0;
    },
    expiredSince: function() {
        var time = this.get('time');
        var bucket = this.get('bucket');
        var expireDate = new Date(time.valueOf());
        expireDate.setDate(expireDate.getDate() + Card.BUCKET[bucket]);
        return new Date() - expireDate;
    },
    toObj: function(){
        var c = {};
        c.front = this.get('front');
        c.flip = this.get('flip');
        c.bucket = this.get('bucket');
        c.time = this.get('time');
        c.result = this.get('result');
        return c;
    },
    destroy: function(){
        this.deleted = true;
        this.get('set').setDirty();
    },
    practice: function(result){
        var set = this.get('set');
        var newBucket = set.bucket_stat.practice(this, result);
        this.set('time', new Date());
        this.set('bucket', newBucket);
        this.set('result', result);
        this.get('set').setDirty();
    }
}, {
    fromObj: function(o){
        var c = new Card({
            'front': o.front,
            'flip': o.flip,
            'bucket': o.bucket,
            'time': o.time,
            'id': o.id
        });
        return c;
    }
});
