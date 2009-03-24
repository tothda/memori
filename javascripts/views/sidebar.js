var sideBar = {};

Y.mix(sideBar, {
    init: function(){
        me = this;
        // a konténer és a menüpontok megkeresése
        me.items = [
            navNode.query('#nav-lessons'),
            navNode.query('#nav-new-lesson'),
            navNode.query('#nav-friends'),
            navNode.query('#nav-help')
        ];
        // kezdetben a leckéim az aktív
        me.actualItem = 0;
        // menüpontra kattintáskor a megfelelő esemény keletkezzen
        navNode.on('click', function(e){
            var t = e.target;
            var event = t.getAttribute('rel');
            controller.fire(event);
            e.preventDefault();            
        });

        var subscribeEvent = function(eventName, itemNo) {
            controller.subscribe(eventName, function() {
                navNode.setAttribute('class', 'position-'+itemNo);
                me.items[me.actualItem].removeClass('active');
                me.actualItem = itemNo;
                me.items[me.actualItem].addClass('active');
            });
        };
        // megfelelő eseményre a megfelelő menü legyen aktív
        subscribeEvent('allSets', 0);
        subscribeEvent('newSet', 1);
        subscribeEvent('friends', 2);
        subscribeEvent('help', 3);
    }
});

sideBar.init();
