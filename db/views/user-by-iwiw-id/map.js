function(doc) {
    if (doc.type == "user" && doc.iwiw_id) {
        emit(doc.iwiw_id, doc);
    }
}