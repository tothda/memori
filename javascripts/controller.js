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
                controller[event].apply(controller, arguments);
            });
        });

        controller.subscribe('friends', function(){
            // Y.log('friends', 'info', 'fc-pubsub');
            // User.getFriends(function(friends){
            //     friendsWidget.set('friends', friends);
            //     setWidget.hide();
            //     setListWidget.hide();
            //     setPracticeWidget.hide();
            //     friendsWidget.render();
            //     friendsWidget.show();
            // });
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
    }
});

controller.init();


