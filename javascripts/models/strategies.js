function LinearPracticeStrategy(sets){
    var me = this;
    me.cards = Y.Array([]);
    Y.each(sets, function(s){
        Y.each(s.cards, function(c){
            me.cards.push(c);
        });
    });
    if (me.length < 1) {
        throw 'no cards!';
    }
    me.idx = -1;
    me.sort();
    me.length = me.cards.length;
}

Y.mix(LinearPracticeStrategy.prototype, {
    sort: function(){},
    next: function(){
        return this.idx + 1 < this.length ? this.cards[++this.idx] : false;
    },
    prev: function(){
        return 0 <= this.idx - 1 ? this.cards[--this.idx] : false;
    },
    pos: function(){
        return this.idx == -1 ? 1 : this.idx + 1;
    },
    first: function(){
        return this.idx == -1 || this.idx == 0;
    },
    last: function(){
        return this.idx == this.length - 1;
    },
    expiredCount: function() {
        var n = 0;
        for (var i=0,l=this.cards.length; i<l; i++){
            if (this.cards[i].expired()){
                n++;
            }
        }
        return n;
    }
});

function ShuffledPracticeStrategy(sets){
    ShuffledPracticeStrategy.superclass.constructor.apply(this, arguments);
}

Y.extend(ShuffledPracticeStrategy, LinearPracticeStrategy, {
    sort: function(){
        shuffle(this.cards);
    }
});

function ExpiredPracticeStrategy(sets){
    ExpiredPracticeStrategy.superclass.constructor.apply(this, arguments);
}

Y.extend(ExpiredPracticeStrategy, LinearPracticeStrategy, {
    sort: function(){
        var expiredCards = [];
        Y.each(this.cards, function(c){
            if (c.expired()) {
                expiredCards.push(c);
            }
        });
        this.cards = expiredCards;
        shuffle(this.cards);
    }
});

shuffle = function(o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

var DEFAULT_STRATEGY = ExpiredPracticeStrategy;
