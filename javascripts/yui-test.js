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

var console = {
    log: function(){}
};

var DateHelper = {
    // Takes the format of "Jan 15, 2007 15:45:00 GMT" and converts it to a relative time
    // Ruby strftime: %b %d, %Y %H:%M:%S GMT
    time_ago_in_words_with_parsing: function(from) {
        var date = new Date;
        date.setTime(Date.parse(from));
        return this.time_ago_in_words(date);
    },

    time_ago_in_words: function(from) {
        return this.distance_of_time_in_words(new Date, from);
    },

    distance_of_time_in_words: function(to, from) {
        var distance_in_seconds = ((to - from) / 1000);
        var distance_in_minutes = Math.floor((distance_in_seconds / 60));

        if (distance_in_minutes == 0) { return 'kevesebb, mint egy perce'; }
        if (distance_in_minutes == 1) { return 'egy perce'; }
        if (distance_in_minutes < 45) { return distance_in_minutes + ' perce'; }
        if (distance_in_minutes < 90) { return ' kb. 1 órája'; }
        if (distance_in_minutes < 1440) { return 'kb. ' + Math.floor(distance_in_minutes / 60) + ' órája'; }
        if (distance_in_minutes < 2880) { return '1 napja'; }
        if (distance_in_minutes < 43200) { return Math.floor(distance_in_minutes / 1440) + ' napja'; }
        if (distance_in_minutes < 86400) { return 'kb. 1 hónapja'; }
        if (distance_in_minutes < 525960) { return Math.floor(distance_in_minutes / 43200) + ' hónapja'; }
        if (distance_in_minutes < 1051199) { return 'kb. 1 éve'; }

        return 'több, mint ' + Math.floor(distance_in_minutes / 525960) + ' 1 éve';
    }
};

var memori = {
    start: function(){
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
            //= require "utils/dom_helpers"

            var memoriContent = Y.get('#memori-content');
            memoriContent.app(
                div().id('board-wrapper').app(
                    div().id('navigation-wrapper').app(
                        this.navNode = ul().id('navigation').cls('position-0').app(
                            li(a('leckéim').attr('href','#').attr('rel','allSets')).id('nav-lessons').cls('active'),
                            li(a('új lekce').attr('href','#').attr('rel','newSet')).id('nav-new-lesson'),
                            li(a('ismerőseim').attr('href','#').attr('rel','friends')).id('nav-friends'),
                            li(a('segítség').attr('href','#').attr('rel','help')).id('nav-help')
                        )
                    ),
                    div().id('board').app(
                        this.menuBar = div().id('menu-bar').html('&nbsp;'),
                        div().id('board-scroll').app(
                            this.ibNode = div().id('info-bar'),
                            this.board = div().id('board-content')
                        ),
                        this.sbNode = div().id('status-bar').html('&nbsp;')
                    )
                )
            );


            var controller = {};
            Y.augment(controller, Y.Event.Target);

            //= require "models/datastore"
            //= require "models/user"
            //= require "models/card"
            //= require "models/set"
            //= require "models/strategies"

            //= require "views/set_widget"
            //= require "views/set_list"
            //= require "views/practice"
            //= require "views/statusbar_widget.js"
            //= require "views/friends.js"

            //= require "views/sidebar"
            //= require "views/set"
            //= require "controller"

            var onOwnerLoaded = function(owner) {
                User.owner = owner;
                controller.fire('allSets', User.owner.get('id'));
            };

            User.login(function(){
                controller.fire('allSets', User.owner.id);
            });
        });
    }
};

