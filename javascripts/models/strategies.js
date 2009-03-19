function LinearPracticeStrategy(sets){
    var me = this;
    me.cards = Y.Array([]);
    Y.each(sets, function(s){
        Y.each(s.cards, function(c){
            me.cards.push(c);
        });
    });
    me.length = me.cards.length;
    if (me.length < 1) {
        throw 'no cards!';
    }
    me.idx = -1;
    me.sort();
}

Y.mix(LinearPracticeStrategy.prototype, {
    sort: function(){},
    // cur: function(){ return this.cards[this.idx];},
    // curPos: function() {return this.idx + 1;},
    // next: function() {this.idx < this.cards.length - 1 && this.idx++;},
    // prev: function() {0 < this.idx && this.idx--;},
    // length: function() {return this.cards.length;},
    // isFirst: function() {return this.idx == 0;},
    // isLast: function() {return this.idx == this.cards.length-1;}
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
    }
});

function ShuffledPracticeStrategy(sets){
    ShuffledPracticeStrategy.superclass.constructor.apply(this, arguments);
}

Y.extend(ShuffledPracticeStrategy, LinearPracticeStrategy, {
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

var DEFAULT_STRATEGY = ShuffledPracticeStrategy;
