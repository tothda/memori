// bucket stat

function BucketStat(set){
    this.set = set;
    this.card_count = [0,0,0,0,0];
    this.card_expired = [0,0,0,0,0];
    this.sum = 0;
}

Y.mix(BucketStat.prototype, {
    calc: function(){
        var me = this;
        Y.each(me.set.cards, function(c){
            var  b = c.get('bucket');
            me.card_count[b]++;
            me.sum++;
            if (c.expired()) {
                me.card_expired[b]++;
            }
        });
    },
    count: function(bucket){
        return this.card_count[bucket];
    },
    expired: function(bucket){
        if (bucket == 0) {
            return 0; // a nullás bucket-ben lévőket ne lejártnak mutassuk
        } else {
            return this.card_expired[bucket];
        }
    },
    practice: function(card, result){
        var oldBucket = card.get('bucket');
        var newBucket = result ? Math.min(oldBucket + 1, 4) : 0;
        this.card_count[oldBucket]--;
        this.card_count[newBucket]++;
        if (card.expired()){
            this.card_expired[oldBucket]--;
        }
        return newBucket;
    }
});