// User model
function User() {
    User.superclass.constructor.apply(this, arguments);
}

Y.mix(User, {
    NAME: "user",
    ATTRS: {
        name: {},
        id: {}
    }
});

Y.extend(User, Y.Base,{
    initializer: function(){
        this.sets = Y.Array([]);
    },
    createSet: function() {
        var s = new Set({});
        s.created_at = new Date();
        s.loaded = true;
        s.dirty = true;
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
            }, {'author_id': that.get('id')});
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
}, {
    CACHE: {},
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
                    var u = new User({
                        id: f.getId(),
                        name: f.getDisplayName()
                    });
                    User.friends.push(u);
                    User.CACHE[u.get('id')] = u;
                });
                callback.call(context, User.friends);
            });
        }
    }
});
