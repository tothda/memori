Y.mix(controller, {
    EVENTS: [
        'showSet',
        'newSet',
        'allSets',
        'save',
        'friends',
        'practice',
        'takeSet',
        'dirty',
        'about',
        'profile',
        'owner-view'
    ],
    init: function(){
        Y.each(controller.EVENTS, function(event){
            controller.publish(event);
        });
        Y.each(controller.EVENTS, function(event){
            controller.subscribe(event, function(){
                //console.log(event, arguments);
                if (controller[event]){
                    controller[event].apply(controller, arguments);
                }
            });
        });
    },
    render: function(newView, model){
        if (this.view && this.view.cleanUp) {
            this.view.cleanUp();
        }
        newView.render(model);
        this.view = newView;
    },
    allSets: function(userId){
        var u = User.getUser(userId) || User.owner;
        u.getSets(function(sets){
            setListView.sets = sets;
            setListView.user = u;
            controller.render(setListView);
        });
    },
    save: function(){
        User.owner.save();
    },
    newSet: function(){
        var set = User.owner.createSet();
        controller.render(setView, {set:set});
    },
    showSet: function(setId){
        Set.getSet(setId, function(set){
            controller.render(setView, {set:set});
        });
    },
    practice: function(setId){
        Set.getSet(setId, function(set){
            practiceView.set = set;
            controller.render(practiceView);
        });
    },
    friends: function(){
        User.getFriends(function(friends){
            friendsView.friends = friends;
            controller.render(friendsView);
        });
    },
    takeSet:function(setId){
        Set.getSet(setId, function(set){
            var newSet = set.take();
            if (newSet) {
                controller.fire('showSet', newSet.id());
            } else {
                controller.fire('allSets');
            }
        });
    },
    about: function(){
        controller.render(helpView);
    },
    profile: function(){
        User.owner.getSets(function(sets){
            profileView.sets = sets;
            controller.render(profileView);
        });
    }
});

controller.init();


