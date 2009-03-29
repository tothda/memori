Y.mix(controller, {
    EVENTS: [
        'showSet',
        'newSet',
        'allSets',
        'save',
        'friends',
        'practice'
    ],
    init: function(){
        Y.each(controller.EVENTS, function(event){
            controller.publish(event);
        });
        Y.each(controller.EVENTS, function(event){
            controller.subscribe(event, function(){
                console.log(event, arguments);
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
        Y.log('save', 'info', 'fc-pubsub');
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
    }
});

controller.init();


