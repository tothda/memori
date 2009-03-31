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
        'help'
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
    render: function(newView){
        if (this.view && this.view.cleanUp) {
            this.view.cleanUp();
        }
        newView.render();
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
        setView.set = User.owner.createSet();
        controller.render(setView);
    },
    showSet: function(setId){
        Set.getSet(setId, function(set){
            setView.set = set;
            controller.render(setView);
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
    help: function(){
        controller.render(helpView);
    }
});

controller.init();


