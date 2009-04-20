function(doc) {
    if (doc.type === "user" && !doc.deleted_at) {
        if (doc.created_at.constructor.toString().indexOf("Array") === -1) {
            emit([2009,4,20,0,0,0], 1);
        } else {
            emit(doc.created_at, 1);
        }
    }
}
