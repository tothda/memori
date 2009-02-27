function(doc) {
    if (doc.type == "set") {
        var obj = {}
        obj.title = doc.title;
        obj.description = doc.description;
        obj.bucket_stat = [0,0,0,0,0];
        if (doc.cards) {
            for (var i = 0; i < doc.cards.length; i++) {
                obj.bucket_stat[doc.cards[i].bucket]++;
            }
        }
        emit(doc.opensocial_owner_id, obj);
    }
}