function(doc) {
    if (doc.type == "set") {
        emit(doc.opensocial_owner_id, {title: doc.title, description: doc.description});
    }
}