// Datasotre

var ds = (function() {
    var owner,
        viewer,
        byKey = {},
        setCache = {};

    var fetchPersons = function(callback) {
    };

    var setFromCache = function(key){
        if (!setCache[key]) {
            setCache[key] = [];
        }
        return setCache[key];
    };

    return {
        getOwner: function(callback, context) {
            if (owner) {
                callback.call(context, owner);
            } else if (iwiw) {
                fetchPersons(function() {
                    User.CACHE[owner.get('id')] = owner;
                    callback.call(context, owner);
                });
            } else {
                owner = new User({
                    id: 'sandbox.iwiw.hu:Xm9W017W9Vg',
                    name: 'Tóth Dávid'
                });
                User.CACHE[owner.get('id')] = owner;
                callback.call(context,owner);
            }
        }
    };
})();
