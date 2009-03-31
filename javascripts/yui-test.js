
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
            var globalView = 'canvas';

            if (iwiw) {
                gadgets.window.adjustHeight(542);
                globalView = gadgets.views.getCurrentView().getName();
            }

            console.log(globalView);

            //= require "utils/transport"
            //= require "utils/dom_helpers"

            var memoriContent = Y.get('#memori-content');

            if (globalView == 'canvas') {
                memoriContent.show();
            }

            memoriContent.app(
                div().id('board-wrapper').app(
                    div().id('navigation-wrapper').app(
                        this.navNode = ul().id('navigation').cls('position-0').app(
                            li(a('leckéim').attr('href','#').attr('rel','allSets')).id('nav-lessons').cls('active'),
                            li(a('új lekce').attr('href','#').attr('rel','newSet')).id('nav-new-lesson'),
                            li(a('ismerőseim').attr('href','#').attr('rel','friends')).id('nav-friends'),
                            li(a('tudnivalók').attr('href','#').attr('rel','about')).id('nav-help')
                        )
                    ),
                    div().id('board').app(
                        this.menuBar = div().id('menu-bar').html('&nbsp;'),
                        div().id('board-scroll').app(
                            this.ibNode = div().id('info-bar'),
                            this.board = div().id('board-content')
                        ),
                        this.sbNode = div().id('status-bar').html('&nbsp;')
                        ),
                    this.helpNode = div().id('help-wrapper')
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
            //= require "views/friends"
            //= require "views/help"
            //= require "views/sidebar"
            //= require "views/set"
            //= require "views/profile"
            
            //= require "controller"

            

            User.login(function(){
                if (globalView == 'canvas') {
                    controller.fire('allSets', User.owner.id);
                } else if (globalView == 'profile'){
                    controller.fire('profile');
                }
            });
        });
    }
};

