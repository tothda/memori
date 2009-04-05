function Paginator(o){
    if (o.url){
        this.url = o.url;
    } else {
        throw new Error('url is null');
    }
    this.params = o.params;
    this.msg = o.msg || 'adatok lekérése';
    this.limit = o.limit || 10;
    this.last_startkey = o.startkey;
    this.endkey = o.endkey;
    this.descending = o.descending;
    this.last_docid = null;
    this.hasMore = true;
}

Y.mix(Paginator.prototype, {
    nextPage: function(callback, context){
        var me = this;
        if (!me.hasMore){
            return;
        }
        var p = {};
        p.startkey = me.last_startkey;
        p.endkey = me.endkey;
        p.descending = me.descending;
        p.limit = me.limit + 1;
        transport.GET(me.url, function(resp){            
            if (!me.total_rows) {me.total_rows = resp.data.total_rows;}
            if (resp.data.rows.length == p.limit) {
                var last = resp.data.rows.pop();
                me.last_startkey = last.key;
                me.last_doc_id = last.id;
            } else {
                me.hasMore = false;
            }
            callback.call(context, resp);
        },p,me.msg);
    }
});