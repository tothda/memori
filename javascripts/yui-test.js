// forrás: http://blog.dansnetwork.com/2008/11/01/javascript-iso8601rfc3339-date-parser/
// kis módosítással
Date.prototype.setISO8601 = function(dString){
    var regexp = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))?/;

    if (dString.toString().match(new RegExp(regexp))) {
        var d = dString.match(new RegExp(regexp));
        var offset = 0;
        this.setUTCDate(1);
        this.setUTCFullYear(parseInt(d[1],10));
        this.setUTCMonth(parseInt(d[3],10) - 1);
        this.setUTCDate(parseInt(d[5],10));
        this.setUTCHours(parseInt(d[7],10));
        this.setUTCMinutes(parseInt(d[9],10));
        this.setUTCSeconds(parseInt(d[11],10));
        if (d[12])
            this.setUTCMilliseconds(parseFloat(d[12]) * 1000);
        else
            this.setUTCMilliseconds(0);
        if (d[13] && d[13] != 'Z') {
            offset = (d[15] * 60) + parseInt(d[17],10);
            offset *= ((d[14] == '-') ? -1 : 1);
            this.setTime(this.getTime() - offset * 60 * 1000);
        }
    }
    else {
        this.setTime(Date.parse(dString));
    }
    return this;
};


function yuiTest() {

    YUI({
        filter: 'raw',
        debug: true,
        logInclude: {
            'fc-pubsub':'',
            'fc-widget':'',
            'fc-model':''
        }
    }).use('widget', 'console', 'substitute', 'io-base', 'json', function(Y) {
        Y.log('yuiTest started');

        var N = Y.Node;
        var iwiw = (typeof gadgets === 'undefined') ? false : true;

        if (iwiw) {
            gadgets.window.adjustHeight(542);
        }

        //= require "utils/transport"
        //= require "models/datastore"
        //= require "models/user"
        //= require "models/card"
        //= require "models/set"
        //= require "models/strategies"

        //= require "views/set_widget"
        //= require "views/set_list_widget"
        //= require "views/set_list"
        //= require "views/set_practice_widget"
        //= require "views/statusbar_widget.js"
        //= require "views/friends_widget.js"

        // bootstrap
        // controller
        var controller = {};
        Y.augment(controller, Y.Event.Target);
        controller.publish('showSet');
        controller.subscribe('showSet', function(id){
            Y.log('showSet '+id, 'info', 'fc-pubsub');
            Set.getSet(id, function(set){
                setWidget.set('set', set);
                setListWidget.hide();
                friendsWidget.hide();
                setPracticeWidget.hide();
                setWidget.render();
                setWidget.show();
            });
        });

        //= require "views/sidebar"

        controller.publish('allSets');
        controller.subscribe('allSets', function(userId){
            Y.log('allSets '+userId, 'info', 'fc-pubsub');
            var u = User.getUser(userId) || User.owner;
            u.getSets(function(sets){
                //setListWidget.set('sets', sets);
                setWidget.hide();
                setPracticeWidget.hide();
                friendsWidget.hide();
                //setListWidget.render();
                //setListWidget.renderUI();
                //setListWidget.show();
                setList.setSets(sets);
                setList.render();
            });
        });

        controller.publish('newSet');
        controller.subscribe('newSet', function(){
            // setListWidget.hide();
            // setPracticeWidget.hide();
            // friendsWidget.hide();
            // var s = User.owner.createSet();
            // setWidget.set('set',s);
            // setWidget.render();
            // setWidget.show();
        });

        controller.publish('save');
        controller.subscribe('save', function(){
            Y.log('save', 'info', 'fc-pubsub');
            User.owner.save();
        });

        controller.publish('practice');
        controller.subscribe('practice', function(id){
            Y.log('practice: '+id, 'info', 'fc-pubsub');
            Set.getSet(id, function(set){
                setPracticeWidget.set('sets', [set]);
                setWidget.hide();
                setListWidget.hide();
                friendsWidget.hide();
                setPracticeWidget.render();
                setPracticeWidget.show();
                setPracticeWidget.renderCard();
            });
        });

        controller.publish('friends');
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

        var onOwnerLoaded = function(owner) {
            status('felhasználók betöltve');
            User.owner = owner;
            controller.fire('allSets', User.owner.get('id'));
        };

        var status = function(msg){
            statusBarWidget.fire('status:print', msg);
        };

        var statusBarWidget = new StatusBarWidget({
            contentBox: '#fc-status'
        });
        //statusBarWidget.render();

        var setListWidget = new SetListWidget({
            contentBox: "#fc-main"
        });

        var setList = new SetListView();

        var setWidget = new SetWidget({
            contentBox: '#fc-set'
        });

        var setPracticeWidget = new SetPracticeWidget({
            contentBox: '#fc-practice'
        });

        var friendsWidget = new FriendsWidget({
            contentBox: '#fc-friends'
        });
        status('felhasználó keresése');

        var div = function(cls) {
            return N.create('<div class="'+cls+'"></div>');
        };

        var board = Y.get('#board-content');

        User.login(function(){
            controller.fire('allSets', User.owner.id);
        });
    });

}