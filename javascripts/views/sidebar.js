var sideBar = {};

Y.mix(sideBar, {
    init: function(){
        me = this;
        // a konténer és a menüpontok megkeresése
        me.box = Y.get('#navigation');
        me.items = [
            me.box.query('#nav-lessons'),
            me.box.query('#nav-new-lesson'),
            me.box.query('#nav-friends'),
            me.box.query('#nav-help')
        ];
        // kezdetben a leckéim az aktív
        me.actualItem = 0;
        // menüpontra kattintáskor a megfelelő esemény keletkezzen
        me.box.on('click', function(e){
            var t = e.target;
            var event = t.getAttribute('rel');
            controller.fire(event);
            e.preventDefault();            
        });

        var subscribeEvent = function(eventName, itemNo) {
            controller.subscribe(eventName, function() {
                me.box.setAttribute('class', 'position-'+itemNo);
                me.items[me.actualItem].removeClass('active');
                me.actualItem = itemNo;
                me.items[me.actualItem].addClass('active');
            });
        }
        // megfelelő eseményre a megfelelő menü legyen aktív
        subscribeEvent('allSets', 0);
        subscribeEvent('newSet', 1);
        subscribeEvent('friends', 2);
        subscribeEvent('help', 3);
    }
});

sideBar.init();
