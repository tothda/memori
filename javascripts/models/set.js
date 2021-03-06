// Set model

//= require "bucket_stat"

function Set() {
    Set.superclass.constructor.apply(this, arguments);
}

Y.mix(Set, {
    NAME: "set",
    ATTRS: {
        id: {},
        title: { value: ''},
        description: { value: ''},
        user: {},
        loaded: { value: false }
    },
    CACHE: {}
});

Y.extend(Set, Y.Base, {
    initializer: function(){
        this.cards = [];
        this.bucket_stat = new BucketStat(this);
        var cf = ['description', 'title'];
        Y.each(cf, function(f){
            this.on(f+'Change', function(){        
                this.setDirty();
            }, this);
        }, this);
        Set.CACHE[this.id()] = this;
        this.after('idChange', function(){
            Set.CACHE[this.id()] = this;
        });
    },
    newObj: function(){
        return typeof this.get('id') === "undefined";
    },
    id: function(){
        return this.newObj() ? (this.guid ? this.guid : (this.guid = Y.guid(this.NAME))) : this.get('id');
    },
    getCards: function(){
        var ret = [];
        for (var i=0,l=this.cards.length;i<l;i++){
            if (!this.cards[i].deleted) {
                ret.push(this.cards[i]);
            }
        }
        return ret;
    },
    setDirty: function(){
        if (!this.dirty){
            this.dirty = true;
            controller.fire('dirty', true, this.id());
        }
    },
    createCard: function(){
        var c = new Card({
            set: this
        });
        this.cards.push(c);
        this.bucket_stat.createCard();
        this.setDirty();
        return c;
    },
    toObj: function(){
        var o = {};
        o.title = this.get('title');
        o.description = this.get('description');
        o._rev = this._rev;
        o._id = this.get('id');
        o.user_id = this.get('user').id;
        o.type = "set";
        o.created_at = this.created_at;
        o.cards = [];
        Y.each(this.cards, function(c){
            if (!c.deleted) {
                var cc = c.toObj();
                o.cards.push(cc);
            }
        }, this);
        return o;
    },
    empty: function(){
        return !this.get('title') && !this.get('description') && this.cards.length == 0;
    },
    save: function(){
        if (!this.dirty || this.deleted || !this.ownerSet() || this.empty()) {
            return;
        }
        var key = this.get('id');
        var method = key ? 'PUT' : 'POST';
        var url = "/sets/" + (key ? key : "");
        var o = this.toObj();
        var that = this;
        transport[method](url, function(resp) {
            if (!key) {
                that.set('id', resp.data.id);
            }
            // elmentjük a set új mvcc revision-jét
            that._rev = resp.data.rev;
            that.dirty = false;
            controller.fire('dirty', false, that.id());
        }, o, 'lecke mentése');
    },
    destroy: function(callback, context){
        if (!this.ownerSet()){
            return;
        }
        var that = this;
        var doIt = function(){
            that.deleted = true;
            delete Set.CACHE[that.id()];
            that.get('user').removeSet(that);
            callback.call(context);
        };
        if (this.newObj()) {
            doIt();
        } else {
            transport.DELETE("/sets/"+that.id(), function(){
                doIt();
            }, {_id:that.id(), _rev: that._rev}, 'lecke törlése');
        }
    },
    ownerSet: function(){
        return this.get('user').appOwner();
    },
    title: function(){
        return this.get('title') || 'Cím néküli lecke';
    },
    description: function(){
        return this.get('description');
    },
    cardCount: function(){
        return this.cards.length;
    },
    owner: function(){
        return this.get('user');
    },
    take: function(){
        if (this.ownerSet()){
            return;
        }
        var newSet = User.owner.createSet();
        newSet.set('title', this.get('title'));
        newSet.set('description', this.get('description'));
        Y.each(this.cards, function(c){
            var card = newSet.createCard();
            card.set('front', c.get('front'));
            card.set('flip', c.get('flip'));
        });
        newSet.parent = this.id();
        newSet.save();
        return newSet;
    }
}, { // static methods
    getSet: function(id, callback, context){
        var set = Set.CACHE[id];
        if (set.loaded) {
            callback.call(context, Set.CACHE[id]);
        } else {
            transport.GET("/sets/" + id, function(resp){
                var card;
                Y.each(resp.data.cards, function(c){
                    card = Card.fromObj(c);
                    card.set('set', set);
                    set.cards.push(card);
                });
                set._rev = resp.data._rev;
                set.loaded = true;
                callback.call(context, set);
            });
        }
    },
    fromObj: function(o) {
        var s = new Set({
            title: o.value.title,
            description: o.value.description,
            id: o.id
        });
        Y.each(o.value.cards, function(c){
            card = Card.fromObj(c);
            card.set('set', s);
            s.cards.push(card);
        });
        s._rev = o.value._rev;
        s.loaded = true;
        s.bucket_stat.calc();
        s.created_at = o.value.created_at;
        return s;
    }
});
