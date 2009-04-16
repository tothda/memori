var sideBar = {};

Y.mix(sideBar, {
    init: function(){
        controller.subscribe('owner-viewer', this.renderNavMenu, this);
    },
    renderNavMenu: function(){
        me = this;

        var items = [];
        if (User.guest()){
            items.push(['allSets', li(a('leckék').attr('href','#').attr('rel','allSets')).id('nav-lessons').cls('active')]);
            items.push(['about', li(a('tudnivalók').attr('href','#').attr('rel','about')).id('nav-help')]);
        } else {
            items.push(['allSets', li(a('leckéim').attr('href','#').attr('rel','allSets')).id('nav-lessons').cls('active')]);
            items.push(['newSet', li(a('új lecke').attr('href','#').attr('rel','newSet')).id('nav-new-lesson')]);
            items.push(['friends', li(a('ismerőseim').attr('href','#').attr('rel','friends')).id('nav-friends')]);
            items.push(['about', li(a('tudnivalók').attr('href','#').attr('rel','about')).id('nav-help')]);
        }

        var l = items.length;

        // append the items to the DOM
        for (var i = 0; i < l; i++){
            navNode.app(items[i][1]);
        }

        // initially the first item is active
        var actualItem = 0;
        // subscribe events
        for (i = 0; i < l; i++){
            (function(itemNo, eventName){
                controller.subscribe(eventName, function() {
                    navNode.removeClass('position-'+actualItem);
                    navNode.addClass('position-'+itemNo);
                    items[actualItem][1].removeClass('active');
                    actualItem = itemNo;
                    items[actualItem][1].addClass('active');
                });
            })(i, items[i][0]);
        }

        // clicking on an item fires the event according to the item's rel attribute
        navNode.on('click', function(e){
            var t = e.target;
            var event = t.getAttribute('rel');
            if (event){
                controller.fire(event);
                e.preventDefault();
            }
        });
    }
});

sideBar.init();
