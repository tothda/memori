        // Datasotre

        var ds = (function() {
            var owner,
                viewer,
                byKey = {},
                setCache = {};

            var fetchPersons = function(callback) {
                var req = opensocial.newDataRequest();
                req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.VIEWER), 'viewer');
                req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.OWNER), 'owner');
                req.send(function(resp) {
                    var extractUser = function(type, resp) {
                        var d = resp.get(type).getData();
                        var u = new User({
                            id: d.getId(),
                            name: d.getDisplayName()
                        });
                        return u;
                    };
                    owner = extractUser('owner',resp);
                    viewer = extractUser('viewer',resp);
                    callback();
                });
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
