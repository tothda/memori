// User model
function User() {
    this.sets = Y.Array([]);
}

Y.mix(User.prototype, {
    createSet: function() {
        var s = new Set({});
        s.created_at = new Date();
        s.loaded = true;
        s.dirty = true;
        s.set('user', this);
        this.sets.push(s);
        return s;
    },
    getSets: function(callback, context){
        if (this.loaded) {
            callback.call(context, this.sets);
        } else {
            var that = this;
            transport.GET("/sets/", function(resp){
                Y.each(resp.data.rows, function(s) {
                    var set = Set.fromObj(s);
                    set.set('user', that);
                    that.sets.push(set);
                });
                that.loaded = true;
                callback.call(context, that.sets);
            }, {'user_id': that.id}, 'leckék letöltése');
        }
    },
    save: function(){
        Y.each(this.sets, function(s){
            s.save();
        });
    },
    removeSet: function(set){
        var idx = this.sets.indexOf(set);
        if (idx != -1) {
            this.sets.splice(idx,1);
        }
    }
});

Y.mix(User, {
    CACHE: {},
    fetchIwiwUsers: function(callback, context){
        var req = opensocial.newDataRequest();
        req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.VIEWER), 'viewer');
        req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.OWNER), 'owner');
        req.send(function(resp) {
            var extractUser = function(type, resp) {
                var d = resp.get(type).getData();
                var u = new User();
                u.iwiw_id = d.getId();
                u.name = d.getDisplayName();
                return u;
            };
            User.owner = extractUser('owner',resp);
            User.viewer = extractUser('viewer',resp);
            callback.call(context);
        });
    },
    login: function(callback, context) {
        if (iwiw) {
            User.fetchIwiwUsers(function(){
                transport.PUT("/users", function(resp){
                    User.owner.id = resp.data.id;
                    callback.call(context);
                }, {
                    iwiw_id: User.owner.iwiw_id,
                    name: User.owner.name
                });
            });
        } else {
            User.owner = new User();
            User.owner.name = "Tóth Dávid";
            User.owner.id = "a35541a54b9a2bccf1f53cc0a68bc2de";
            callback.call(context);
        }
    },
    getUser: function(id){
        return User.CACHE[id];
    },
    getFriends: function(callback, context){
        if (User.friends) {
            callback.call(context, User.friends);
        } else {
            var req = opensocial.newDataRequest();
            var friends_params = {};
            //legfeljebb 5 ismerőst kérünk
            friends_params[opensocial.DataRequest.PeopleRequestFields.MAX] = 5;
            //név szerint rendezve
            friends_params[opensocial.DataRequest.PeopleRequestFields.SORT_ORDER] = opensocial.DataRequest.SortOrder.NAME;
            //csak azokat, akiknek telepítve van az alkalmazás
            friends_params[opensocial.DataRequest.PeopleRequestFields.FILTER] =opensocial.DataRequest.FilterType.HAS_APP;
            var ownerFriends = opensocial.newIdSpec({ "userId" : "OWNER", "groupId" : "FRIENDS" });
            //ismerősök, es a hozzájuk tartozó alkalmazás-adatok
            req.add(req.newFetchPeopleRequest(ownerFriends, friends_params), 'friends');
            req.send(function(resp){
                User.friends = [];
                User.friendsById = {};
                var friends = resp.get('friends').getData();
                friends.each(function(f){
                    var u = new User();
                    u.iwiw_id = f.getId();
                    u.name = f.getDisplayName();
                    User.friends.push(u);
                    User.CACHE[u.iwiw_id] = u;
                });
                callback.call(context, User.friends);
            });
        }
    }
});
