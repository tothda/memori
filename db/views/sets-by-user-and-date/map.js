function(doc) {
    if (doc.type == "set") {
        emit([doc.user_id, doc.created_at], doc);
    }
}