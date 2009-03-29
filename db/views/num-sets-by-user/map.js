function(doc) {
    if (doc.type == "set") {
        emit(doc.user_id, 1);
    }  
}