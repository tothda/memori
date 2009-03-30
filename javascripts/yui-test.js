 
if (!window.console) {
    window.console = {
        log: function(){}
    };
}

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

            //= require "utils/date_helpers"
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

