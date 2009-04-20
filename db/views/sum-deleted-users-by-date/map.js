function(doc) {
    if (doc.type === "user" && doc.deleted_at) {
        emit(doc.deleted_at, 1);
    }
}
