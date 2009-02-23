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

        // transport
        transport = (function(){
            //var baseUrl = iwiw ? "http://flashcard-test.appspot.com/api" : "/api";
            var baseUrl = iwiw ? window.baseUrl : "";

            var encodeData = function(o) {
                var ret = [],
                    e = encodeURIComponent;
                Y.each(o, function(v,k){
                    ret.push(e(k) + '=' + e(v));
                });

                return ret.join('&');
            };

            var iwiwRequest = function(path, method, callback, params) {
                var transportParams ={};
                transportParams[gadgets.io.RequestParameters.METHOD] = method;

                if (method == 'GET' && params) {
                    path = path + "?" + encodeData(params);
                }
                if (method != 'GET') {
                    params = params || {};
                    if (method != 'POST') {
                        params['_method'] = method;
                    }
                    params['json'] = Y.JSON.stringify(params);
                    var post_data = gadgets.io.encodeValues(params);
                    transportParams[gadgets.io.RequestParameters.POST_DATA] = post_data;
                }
                transportParams[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.SIGNED;
                transportParams[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;

                var url = baseUrl + path;
                gadgets.io.makeRequest(url,callback,transportParams);
            };

            var normalRequest = function(path, method, callback, params){
                params = params || {};
                params['opensocial_owner_id'] = 'sandbox.iwiw.hu:Xm9W017W9Vg';

                if (method != 'GET') {
                    params = {json: Y.JSON.stringify(params)};
                    if (method != 'POST') {
                        params['_method'] = method;
                        method = 'POST';
                    }
                }

                var data = encodeData(params);

                Y.io(baseUrl+path, {
                    method: method,
                    data: data,
                    // headers: {
                    //     'Content-Type': 'application/json'
                    // },
                    on: {
                        complete: function(tId,resp,args){
                            var data = Y.JSON.parse(resp.responseText);
                            callback({data:data});
                        }
                    }
                });
            };

            var makeRequest = iwiw ? iwiwRequest : normalRequest;

            return {
                GET: function(path, callback, params) {
                    makeRequest(path, "GET", callback, params);
                },
                POST: function(path, callback, params) {
                    makeRequest(path, "POST", callback, params);
                },
                PUT: function(path, callback, params) {
                    makeRequest(path, "PUT", callback, params);
                },
                DELETE: function(path, callback, params) {
                    makeRequest(path, "DELETE", callback, params);
                }
            };
        }());

        // Datasotre

        var ds = (function() {
            var owner,
                viewer,
                byKey = {},
                setCache = {};

            var fetchPersons = function(callback) {
                var req = opensocial.newDataRequest();
                req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.VIEWER), 'viewer');
                req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.OWNER), 'owner');
                req.send(function(resp) {
                    var extractUser = function(type, resp) {
                        var d = resp.get(type).getData();
                        var u = new User({
                            id: d.getId(),
                            name: d.getDisplayName()
                        });
                        return u;
                    };
                    owner = extractUser('owner',resp);
                    viewer = extractUser('viewer',resp);
                    callback();
                });
            };

            var setFromCache = function(key){
                if (!setCache[key]) {
                    setCache[key] = [];
                }
                return setCache[key];
            };

            return {
                getOwner: function(callback, context) {
                    if (owner) {
                        callback.call(context, owner);
                    } else if (iwiw) {
                        fetchPersons(function() {
                            User.CACHE[owner.get('id')] = owner;
                            callback.call(context, owner);
                        });
                    } else {
                        owner = new User({
                            id: 'sandbox.iwiw.hu:Xm9W017W9Vg',
                            name: 'Tóth Dávid'
                        });
                        User.CACHE[owner.get('id')] = owner;
                        callback.call(context,owner);
                    }
                }
            };
        })();

        // User model
        function User() {
            User.superclass.constructor.apply(this, arguments);
        }

        Y.mix(User, {
            NAME: "user",
            ATTRS: {
                name: {},
                id: {}
            }
        });

        Y.extend(User, Y.Base,{
            initializer: function(){
                this.sets = Y.Array([]);
            },
            createSet: function() {
                var s = new Set({});
                s.bucket_stat = [0,0,0,0,0];
                s.loaded = true;
                s.dirty = true;
                this.sets.push(s);
                return s;
            },
            getSets: function(callback, context){
                if (this.loaded) {
                    callback.call(context, this.sets);
                } else {
                    var that = this;
                    transport.GET("/sets/", function(resp){
                        Y.each(resp.data, function(s) {
                            var set = Set.fromObj(s);
                            set.set('user', that);
                            that.sets.push(set);
                        });
                        that.loaded = true;
                        callback.call(context, that.sets);
                    }, {'author_id': that.get('id')});
                }
            },
            save: function(){
                Y.each(this.sets, function(s){
                    s.save();
                });
            },
            removeSet: function(set){
                var idx = this.sets.indexOf(set);
                if (idx != -1) {
                    this.sets.splice(idx,1);
                }
            }
        }, {
            CACHE: {},
            getUser: function(id){
                return User.CACHE[id];
            },
            getFriends: function(callback, context){
                if (User.friends) {
                    callback.call(context, User.friends);
                } else {
                    var req = opensocial.newDataRequest();
                    var friends_params = {};
                    //legfeljebb 5 ismerőst kérünk
                    friends_params[opensocial.DataRequest.PeopleRequestFields.MAX] = 5;
                    //név szerint rendezve
                    friends_params[opensocial.DataRequest.PeopleRequestFields.SORT_ORDER] = opensocial.DataRequest.SortOrder.NAME;
                    //csak azokat, akiknek telepítve van az alkalmazás
                    friends_params[opensocial.DataRequest.PeopleRequestFields.FILTER] =opensocial.DataRequest.FilterType.HAS_APP;
                    var ownerFriends = opensocial.newIdSpec({ "userId" : "OWNER", "groupId" : "FRIENDS" });
                    //ismerősök, es a hozzájuk tartozó alkalmazás-adatok
                    req.add(req.newFetchPeopleRequest(ownerFriends, friends_params), 'friends');
                    req.send(function(resp){
                        User.friends = [];
                        User.friendsById = {};
                        var friends = resp.get('friends').getData();
                        friends.each(function(f){
                            var u = new User({
                                id: f.getId(),
                                name: f.getDisplayName()
                            });
                            User.friends.push(u);
                            User.CACHE[u.get('id')] = u;
                        });
                        callback.call(context, User.friends);
                    });
                }
            }
        });

        // Card model
        function Card(){
            Card.superclass.constructor.apply(this, arguments);
        }

        Y.mix(Card, {
            ATTRS: {
                id: {},
                front: {value:""},
                flip: {value:""},
                bucket: {value: 0},
                time: {
                    set: function(t){
                        switch (typeof t) {
                        case "string":
                            return new Date().setISO8601(t);
                        default:
                            return t;
                        }
                    }
                },
                result: {},
                set: {}
            },
            NAME: "card",
            BUCKET: [0,1,3,7,30]
        });

        Y.extend(Card, Y.Base, {
            initializer: function() {
                if (this.newObj()) {
                    // ha ez egy új kártya, akkor az aktuális dátum lesz az utolsó gyakorlás dátuma
                    this.set('time', new Date());
                    // hozzáadjuk 0-ás bucket-hez
                    var s = this.get('set');
                    s.bucket_stat[0]++;
                }
            },
            newObj: function(){
                return typeof this.get('id') === "undefined";
            },
            id: function(){
                return this.newObj() ? (this.guid ? this.guid : (this.guid = Y.guid(this.NAME))) : this.get('id');
            },
            empty: function(){
                return this.get('front') === "" && this.get('flip') === "";
            },
            shouldSave: function(){
                return (this.newObj() && !this.empty()) || (!this.newObj());
            },
            expired: function() {
                return this.expiredSince() > 0;
            },
            expiredSince: function() {
                var time = this.get('time');
                var bucket = this.get('bucket');
                var expireDate = new Date(time.valueOf());
                expireDate.setDate(expireDate.getDate() + Card.BUCKET[bucket]);
                return new Date() - expireDate;
            },
            toObj: function(){
                var c = {};
                c.front = this.get('front');
                c.flip = this.get('flip');
                c.bucket = this.get('bucket');
                c.time = this.get('time');
                c.result = this.get('result');
                c.deleted = this.deleted;
                if (!this.newObj()) {
                    c.id = this.id();
                } else {
                    c.guid = this.id();
                }
                return c;
            },
            destroy: function(){
                this.deleted = true;
                this.get('set').dirty = true;
            },
            know: function() {
                var b = this.get('bucket');
                var newBucket = Math.min(b + 1, 4);
                this.update(newBucket, true);
            },
            dunno: function() {
                this.update(0,false);
            },
            update: function(newBucket,result){
                var s = this.get('set');
                var oldBucket = this.get('bucket');
                s.bucket_stat[oldBucket]--;
                s.bucket_stat[newBucket]++;
                this.set('time', new Date());
                this.set('bucket', newBucket);
                this.set('result', result);
                this.get('set').dirty = true;

            }
        }, {
            fromObj: function(o){
                var c = new Card({
                    'front': o.front,
                    'flip': o.flip,
                    'bucket': o.bucket,
                    'time': o.time,
                    'id': o.id
                });
                return c;
            }
        });

        // Set model
        function Set() {
            Set.superclass.constructor.apply(this, arguments);
        }

        Y.mix(Set, {
            NAME: "set",
            ATTRS: {
                id: {},
                title: { value: ''},
                description: { value: ''},
                user: {},
                loaded: { value: false }
            },
            CACHE: {}
        });

        Y.extend(Set, Y.Base, {
            initializer: function(){
                this.cards = [];
                var cf = ['description', 'title'];
                Y.each(cf, function(f){
                    this.on(f+'Change', function(){
                        this.dirty = true;
                    }, this);
                }, this);
                Set.CACHE[this.id()] = this;
                this.after('idChange', function(){
                    Set.CACHE[this.id()] = this;
                });
            },
            newObj: function(){
                return typeof this.get('id') === "undefined";
            },
            id: function(){
                return this.newObj() ? (this.guid ? this.guid : (this.guid = Y.guid(this.NAME))) : this.get('id');
            },
            getCards: function(){
                var ret = [];
                for (var i=0;i<this.cards.length;i++){
                    if (!this.cards[i].deleted) {
                        ret.push(this.cards[i]);
                    }
                }
                return ret;
            },
            createCard: function(){
                var c = new Card({
                    set: this
                });
                this.cards.push(c);
                this.dirty = true;
                return c;
            },
            toObj: function(){
                var o = {};
                var guids = {};
                o.title = this.get('title');
                o.description = this.get('description');
                o.cards = [];
                Y.each(this.cards, function(c){
                    if (c.shouldSave()) {
                        var cc = c.toObj();
                        guids[c.id()] = c;
                        o.cards.push(cc);
                    }
                }, this);
                return [o, guids];
            },
            save: function(){
                if (!this.dirty) {
                    return;
                }
                status("lecke mentése...");
                var key = this.get('id');
                var method = key ? 'PUT' : 'POST';
                var url = "/sets/" + (key ? key : "");
                var tmpArr = this.toObj();
                var o = tmpArr[0];
                var guidHash = tmpArr[1];
                var that = this;
                transport[method](url, function(resp) {
                    // Y.each(resp.data.cards, function(id,guid){
                    //     var card = guidHash[guid];
                    //     card.set('id', id);
                    // });
                    if (!key) {
                        that.set('id', resp.data.id);
                    }
                    that.dirty = false;
                    status("lecke mentése sikeresen befejeződött");
                }, o);
            },
            destroy: function(callback, context){
                var that = this;
                var doIt = function(){
                    delete Set.CACHE[that.id()];
                    that.get('user').removeSet(that);
                    callback.call(context);
                };
                if (this.newObj()) {
                    doIt();
                } else {
                    status("Lecke törlése...");
                    transport.DELETE("/sets/"+that.id(), function(){
                        doIt();
                    });
                }
            }
        }, { // static methods
            getSet: function(id, callback, context){
                var set = Set.CACHE[id];
                if (set.loaded) {
                    callback.call(context, Set.CACHE[id]);
                } else {
                    status("lecke letöltése...");
                    transport.GET("/sets/" + id, function(resp){
                        var card;
                        Y.each(resp.data.cards, function(c){
                            card = Card.fromObj(c);
                            card.set('set', set);
                            set.cards.push(card);
                        });
                        set.loaded = true;
                        status("lecke letöltve");
                        callback.call(context, set);
                    });
                }
            },
            fromObj: function(o) {
                var s = new Set({
                    title: o.title,
                    description: o.description,
                    id: o.id
                });
                s.bucket_stat = o.bucket_stat;
                return s;
            }
        });

        // CardWidget

        function CardWidget(){
            CardWidget.superclass.constructor.apply(this, arguments);
        }

        Y.mix(CardWidget, {
            NAME: "cardwidget",
            ATTRS: {
                card: {}
            }
        });

        Y.extend(CardWidget, Y.Widget, {
            renderUI: function(){
                var cb = this.get('contentBox');
                this.frontInput = N.create('<td class="bor-right bor-bott">'+this.get('card').get('front')+'</td>');
                this.flipInput = N.create('<td class="bor-bott">'+this.get('card').get('flip')+'</td>');
                cb.appendChild(this.frontInput);
                cb.appendChild(this.flipInput);
            }
        });

        // SetWidget
        function SetWidget(){
            SetWidget.superclass.constructor.apply(this, arguments);
        }

        Y.mix(SetWidget, {
            NAME: "setwidget",
            ATTRS: {
                set: {}
            }
        });

        Y.extend(SetWidget, Y.Widget, {
            initializer: function(){
            },
            destructor: function() {
                this.titleNode = null;
            },
            renderUI: function() {
                var cb = this.get('contentBox');
                this._resetUI(cb);
                this.headerNode = N.create('<div class="'+this.getClassName('header')+'"></div>');
                this.cardsNode = N.create('<div id="card-container"></div>');
                this.cardsTable = N.create('<table class="'+this.getClassName('cards')+'"></table>');
                this.cardsNode.appendChild(this.cardsTable);
                this._renderEditor();
                this.cardsNode.appendChild(this.editor.textArea());

                this._renderSetHeader(this.headerNode);
                cb.appendChild(this.headerNode);
                cb.appendChild(this.cardsNode);
            },
            bindUI: function() {
                var boundingBox = this.get("boundingBox");
                Y.on('change', Y.bind(this._onInputChange, this), boundingBox);
                this.after('setChange', function(){
                    this.syncUI();
                }, this);
                this._bindHighlightHandlers();
                this._bindDeleteHandler();
            },
            syncUI: function() {
               this.titleNode.set('value',this.get('set').get('title'));
               this.descriptionNode.set('value', this.get('set').get('description'));
               this._renderCards();
            },
            _resetUI: function(cb) {
                cb.set('innerHTML', '');
            },
            _renderSetHeader: function(cb){
                this.titleNode = N.create('<input type="text" class="'+ this.getClassName('title')+'" />');
                this.descriptionNode = N.create('<textarea class="set-description '+ this.getClassName('description')+'"></textarea>');
                this.deleteNode = N.create('<a href="javascript:void(0)">Lecke törlése</a>');
                cb.appendChild(this.titleNode);
                cb.appendChild(this.descriptionNode);
                cb.appendChild(this.deleteNode);
            },
            _renderCards: function(){
                this.cardsTable;
                this.cardsTable.set('innerHTML', '');
                var cards = this.get('set').getCards();
                this.start = {};
                this.end = {};
                var prev = this.start;
                Y.each(cards, function(c){
                    prev = this._renderCard(prev,c);
                }, this);
                prev = this._renderCard(prev);
                prev.next = this.end;
                this.end.prev = prev;
            },
            _renderCard: function(prevElem, card){
                var me = this;
                var tr = N.create('<tr></tr>');
                var set = this.get('set');
                var renderSide = function(side,prev){
                    var txt = card ? card.get(side) : '';
                    var listElem = {
                        node: N.create('<td class="'+side+'">'+txt+'</td>'),
                        card: card,
                        side: side,
                        prev: prev,
                        set: set
                    };
                    prev.next = listElem;
                    tr.appendChild(listElem.node);
                    listElem.node.on('click', function(){
                        me.editor.positionOn(listElem);
                    });
                    return listElem;
                };
                var flipElem = renderSide('flip', prevElem);
                var frontElem = renderSide('front', flipElem);
                // beállítjuk őket párnak
                flipElem.pair = frontElem;
                frontElem.pair = flipElem;

                // mellétesszük a kukát, vagy a plusz jelet
                var n = N.create('<td><a class="trash" href="javascript:void(0)">&nbsp;</a></td>');
                tr.appendChild(n);
                n.on('click', function(e){
                    if (flipElem.card) {
                        flipElem.card.destroy();
                    }
                    tr.get('parentNode').removeChild(tr);
                    // láncolt lista karbantartása
                    flipElem.prev.next = frontElem.next;
                    frontElem.next.prev = flipElem.prev;
                });
                this.cardsTable.appendChild(tr);
                return frontElem;
            },
            _renderEditor: function(){
                var me = this;
                this.editor = (function(){
                    var t = N.create('<textarea id="card-editor" class="editor"></textarea>');
                    var item;
                    var blurHandler, tabHandler;

                    function fitToContent(node, maxHeight)
                    {
                        var adjustedHeight = node.get('clientHeight');
                        //Y.log(adjustedHeight);
                        if ( !maxHeight || maxHeight > adjustedHeight )
                        {
                            adjustedHeight = Math.max(node.get('scrollHeight'), adjustedHeight);
                            if ( maxHeight )
                                adjustedHeight = Math.min(maxHeight, adjustedHeight);
                            if ( adjustedHeight > node.get('clientHeight')) {
                                Y.log('adjustedHeight: '+adjustedHeight);
                                node.setStyle('height',adjustedHeight + "px");
                                item.node.setStyle('height',adjustedHeight + "px");
                            }
                        }
                    }

                    var updateIfChanged = function(){
                        var val = t.get('value');
                        if (item.card) {
                            if (item.card.get(item.side) != val) {
                                item.card.set(item.side, val);
                                item.node.set('innerHTML', val);
                            }
                        } else {
                            // akkor hozunk létre kártyát, ha az adott item-hez még nincs, és az editor-ba be lett írva valami
                            if (val) {
                                Y.log("create card");
                                item.card = item.set.createCard();
                                item.pair.card = item.card;
                                item.card.set(item.side, val);
                                item.node.set('innerHTML', val);
                            }
                        }
                    };
                    // TAB handler
                    Y.on('key', function(e){
                        var i = e.shiftKey ? item.prev : item.next;
                        // ha sima TAB-ot nyomnak az utolsó kártyán, akkor kell egy új sor
                        if (!i.node && !e.shiftKey) {
                            var newFront = me._renderCard(item); // a front-ot adja vissza
                            // a strázsát a lista végére kell tenni
                            newFront.next = i;
                            // az új kártya flipside-jára ugorjunk
                            i = newFront.pair;
                        }
                        if (i.node) {
                            updateIfChanged();
                            me.editor.positionOn(i);
                        }
                        e.preventDefault();
                    }, t, 'down:9');
                    // blur handler
                    Y.on('blur', function(){
                        updateIfChanged();
                        t.setStyle('top', '-2000px');
                    },t);
                    // keyup handler
                    Y.on('key', function(e){
                        fitToContent(t);
                    }, t, 'down');

                    return {
                        positionOn: function(listElem){
                            item = listElem;
                            var n = listElem.node;
                            var height = n.getComputedStyle("height").replace(/px/,'');
                            var width = n.getComputedStyle("width").replace(/px/,'');
                            //var width = n.get('offsetWidth');
                            //var height = n.get('offsetHeight');
                            var left = n.get('offsetLeft');
                            var top = n.get('offsetTop');
                            t.setStyles({
                                top: top+'px',
                                left: left+'px',
                                height: height+'px',
                                width: width+'px'
                            });
                            var txt = listElem.card ? listElem.card.get(listElem.side) : '';
                            t.set('value', txt);
                            t.select();
                        },
                        textArea: function(){return t;}
                    };
                })();
            },
            _bindDeleteHandler: function(){
                this.deleteNode.on('click', function(){
                    this.get('set').destroy(function(){
                        controller.fire('allSets');
                    });
                }, this);
            },
            _onInputChange: function(e) {
                switch (e.target) {
                case this.titleNode:
                    this.get('set').set('title', this.titleNode.get('value'));
                    break;
                case this.descriptionNode:
                    this.get('set').set('description', this.descriptionNode.get('value'));
                    break;
                }
            },
            _bindHighlightHandlers: function(){
                function doIt(node) {
                    node.on('focus', function(e) { e.target.addClass('focus');});
                    node.on('blur', function(e) { e.target.removeClass('focus');});
                    node.on('mouseover', function(e) { e.target.addClass('highlight');});
                    node.on('mouseout', function(e) { e.target.removeClass('highlight');});
                }
                doIt(this.titleNode);
                doIt(this.descriptionNode);
            }
        });

        // SetList widget
        function SetListWidget() {
            SetListWidget.superclass.constructor.apply(this, arguments);
        }

        Y.mix(SetListWidget, {
            ATTRS: {
                owner: {},
                sets: {}
            },
            NAME: "setlist"
        });

        Y.extend(SetListWidget, Y.Widget, {
            renderUI: function() {
                var contentBox = this.get('contentBox');
                this.listNode = N.create('<ul></ul>');
                Y.each(this.get('sets'), function(s) {
                    this.renderSet(s);
                }, this);
                contentBox.set('innerHTML', '');
                contentBox.appendChild(this.listNode);
            },
            renderSet: function(set){
                var li = N.create('<li id="'+set.id()+'" class="'+this.getClassName('set')+'"></li>');
                var head = N.create('<div class="'+this.getClassName('head')+'"></div>');
                var title = N.create('<h3><a class="set-title" href="javascript:void(0)">'+set.get('title')+'</a></h3>');
                var descr = N.create('<p>'+set.get('description')+'</p>');
                head.appendChild(title);
                head.appendChild(descr);
                var func = N.create('<div class="'+this.getClassName('func')+'"></div>');
                var practice = N.create('<a class="set-practice" href="javascript:void(0)">gyakorlás</a>');
                func.appendChild(practice);
                var stat = N.create('<div class="'+this.getClassName('stat')+'"></div>');
                this.renderStat(stat, set);
                li.appendChild(head);
                li.appendChild(stat);
                li.appendChild(func);
                this.listNode.appendChild(li);
            },
            renderStat: function(div, set) {
                var barHeight = 30;
                var s = set.bucket_stat;
                var sum = s[0]+s[1]+s[2]+s[3]+s[4];
                for (var i=0; i<5; i++) {
                    var h = Math.round(barHeight * s[i] / sum);
                    var bucket = N.create('<div class="bucket"></div');
                    var bar = N.create('<div class="bar bucket_'+i+'"></div>');
                    bar.setStyles({
                        height: h+'px',
                        marginTop: (barHeight-h) +'px'
                    });
                    var count = N.create('<div class="count">'+set.bucket_stat[i]+'</div>');
                    bucket.appendChild(bar);
                    bucket.appendChild(count);
                    div.appendChild(bucket);
                }
            },
            bindUI: function() {
                var boundingBox = this.get("boundingBox");
                boundingBox.on('click', function(e){
                    var t = e.target;
                    var key = t.ancestor("li").get('id');
                    if (t.test(".set-title")) {
                        controller.fire('showSet', key);
                    }
                    if (t.test('.set-practice')) {
                        controller.fire('practice', key);
                    }
                });
            },
            syncUI: function() {

            }
        });

        function LinearPracticeStrategy(sets){
            var me = this;
            me.cards = Y.Array([]);
            Y.each(sets, function(s){
                Y.each(s.cards, function(c){
                    me.cards.push(c);
                });
            });
            if (me.cards.length < 1) {
                throw 'no cards!';
            }
            me.idx = 0;
            me.sort();
        }

        Y.mix(LinearPracticeStrategy.prototype, {
            sort: function(){},
            cur: function(){ return this.cards[this.idx];},
            curPos: function() {return this.idx + 1;},
            next: function() {this.idx < this.cards.length - 1 && this.idx++;},
            prev: function() {0 < this.idx && this.idx--;},
            length: function() {return this.cards.length;},
            isFirst: function() {return this.idx == 0;},
            isLast: function() {return this.idx == this.cards.length-1;}
        });

        function ShuffledPracticeStrategy(sets){
            ShuffledPracticeStrategy.superclass.constructor.apply(this, arguments);
        }

        Y.extend(ShuffledPracticeStrategy, LinearPracticeStrategy, {
            sort: function(){
                shuffle(this.cards);
            }
        });

        shuffle = function(o){ //v1.0
            for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        };


        var DEFAULT_STRATEGY = ShuffledPracticeStrategy;

        // SetPracticeWidget
        function SetPracticeWidget(){
            SetPracticeWidget.superclass.constructor.apply(this, arguments);
        }

        Y.mix(SetPracticeWidget, {
            NAME:"practice",
            ATTRS: {
                sets: {value:[]}
            }
        });

        Y.extend(SetPracticeWidget, Y.Widget, {
            initializer: function(){
                var me = this;
                this.after('setsChange', function(){
                    me.strategy = new DEFAULT_STRATEGY(this.get('sets'));
                });
            },
            renderUI: function(){
                var cb = this.get('contentBox');
                this.infoNode = N.create('<div class='+this.getClassName('info')+'></div>');
                this.cardNode = N.create('<div class='+this.getClassName('card')+'></div>');
                this.nextButton = N.create('<button>Következő</button>');
                this.previousButton = N.create('<button>Előző</button>');
                this.flipButton = N.create('<button>Másik oldal</button>');
                this.knowButton = N.create('<button>Tudom</button>');
                this.dunnoButton = N.create('<button>Nem tudom</button>');
                cb.appendChild(this.infoNode);
                cb.appendChild(this.cardNode);
                var buttons = N.create('<div class='+this.getClassName('nav')+'></div>');
                this. answerButtons = N.create('<div class='+this.getClassName('answer')+'></div>');
                buttons.appendChild(this.previousButton);
                buttons.appendChild(this.flipButton);
                buttons.appendChild(this.nextButton);
                this.answerButtons.appendChild(this.dunnoButton);
                this.answerButtons.appendChild(this.knowButton);
                cb.appendChild(buttons);
                cb.appendChild(this.answerButtons);
            },
            syncUI: function(){

            },
            bindUI: function() {
                var bb = this.get('boundingBox');
                bb.on('click', function(e){
                    var t = e.target;
                    switch (t) {
                    case this.flipButton:
                        this.toggle();
                        break;
                    case this.previousButton:
                        this.renderPrevCard();
                        break;
                    case this.nextButton:
                        this.renderNextCard();
                        break;
                    case this.knowButton:
                        this.card.know();
                        this.renderNextCard();
                        break;
                    case this.dunnoButton:
                        this.card.dunno();
                        break;
                    }
                }, this);
                Y.on('key', function(e){
                    switch(e.charCode){
                    case 37:
                        this.renderPrevCard();
                        break;
                    case 39:
                        this.renderNextCard();
                        break;
                    case 38:
                        this.toggle();
                        break;
                    case 40:
                        this.toggle();
                        break;
                    }
                    e.preventDefault();
                }, window.document, 'down:37,38,39,40', this);
            },
            renderNextCard: function(){
                this.strategy.next();
                this.renderCard();
            },
            renderPrevCard: function(){
                this.strategy.prev();
                this.renderCard();
            },
            renderCard: function(){
                this.card = this.strategy.cur();
                this.front = false;
                this.toggle();
                this.disableButtons();
                this.renderInfo();
            },
            renderInfo: function() {
                this.infoNode.set('innerHTML', this.strategy.curPos() + ' / ' + this.strategy.length());
            },
            toggle: function(){
                var txt = this.front ? this.card.get('flip') : this.card.get('front');
                this.front = !this.front;
                this.cardNode.set('innerHTML', txt);
            },
            disableButtons: function(){
                this.previousButton.set('disabled', this.strategy.isFirst() ? true : false);
                this.nextButton.set('disabled', this.strategy.isLast() ? true : false);
                if (!this.card.expired()) {
                    this.answerButtons.setStyle('display', 'none');
                } else {
                    this.answerButtons.setStyle('display', '');
                }
            }
        });

        // SideBarWidget

        function SideBarWidget() {
            SideBarWidget.superclass.constructor.apply(this, arguments);
        }

        Y.mix(SideBarWidget, {
            ATTRS: {},
            NAME: "sidebar",
            MENU_ITEMS: [['Leckéim', 'allSets'], ["Új lecke", 'newSet'], ['Ismerőseim','friends']],
            MENU_ITEM_TEMPLATE: '<li><a rel="{rel}", href="javascript:void(0)">{item}</a></li>'
        });

        Y.extend(SideBarWidget, Y.Widget, {
            renderUI: function() {
                var cb = this.get('contentBox');
                this.ul = N.create('<ul></ul>');
                Y.each(SideBarWidget.MENU_ITEMS, function(i){
                    this.addItem(i);
                }, this);
                cb.appendChild(this.ul);
            },
            bindUI: function(){
                var bb = this.get('boundingBox');
                bb.on('click', function(e){
                    var t = e.target;
                    var event = t.getAttribute('rel');
                    controller.fire(event);
                    e.preventDefault();
                }, this);
            },
            addItem: function(i){
                this.ul.appendChild(N.create(Y.substitute(SideBarWidget.MENU_ITEM_TEMPLATE, {item: i[0], rel: i[1]})));
            },
            removeItem: function(i){
                var li =this.ul.query('a[rel="'+i+'"]').ancestor('li');
                this.ul.removeChild(li);
            }
        });

        // StatusBarWidget

        function StatusBarWidget() {
            StatusBarWidget.superclass.constructor.apply(this, arguments);
        }

        Y.mix(StatusBarWidget, {
            NAME: 'statusbar',
            ATTRS: {
                message: {}
            }
        });

        Y.extend(StatusBarWidget, Y.Widget, {
            initializer: function(){
                this.publish('status:print');
            },
            renderUI: function(){
                var cb = this.get('contentBox');
                this.saveButton = N.create('<button>Mentés</button>');
                this.messagePanel = N.create('<span></span>');
                cb.appendChild(this.saveButton);
                cb.appendChild(this.messagePanel);
            },
            bindUI: function(){
                var cb = this.messagePanel;
                this.subscribe('status:print', function(e) {
                    cb.set('innerHTML', '<span>'+e.details[0]+'</span>');
                });
                this.saveButton.on('click', function(){
                    controller.fire('save');
                });
                // Y.later(3000, null, function(){
                //     cb.set('innerHTML','');
                // });
            }
        });

        function FriendsWidget() {
            FriendsWidget.superclass.constructor.apply(this, arguments);
        }

        Y.mix(FriendsWidget, {
            NAME: 'friends',
            ATTRS: {
                friends: {}
            },
            FRIEND_TEMPLATE: '<li id="{id}"><a class="friend-name" href="javascript:void(0)">{name}</a></li>'
        });

        Y.extend(FriendsWidget, Y.Widget, {
            renderUI: function(){
                var cb = this.get('contentBox');
                this.ul = N.create('<ul></ul>');
                Y.each(this.get('friends'), function(f){
                    this.ul.appendChild(N.create(Y.substitute(FriendsWidget.FRIEND_TEMPLATE, {id: f.get('id'), name: f.get('name')})));
                }, this);
                cb.appendChild(this.ul);
            },
            bindUI: function(){
                var boundingBox = this.get("boundingBox");
                boundingBox.on('click', function(e){
                    var t = e.target;
                    var key = t.ancestor("li").get('id');
                    if (t.test(".friend-name")) {
                        controller.fire('allSets', key);
                    }
                });
            }
        });

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

        controller.publish('allSets');
        controller.subscribe('allSets', function(userId){
            Y.log('allSets '+userId, 'info', 'fc-pubsub');
            var u = User.getUser(userId) || User.owner;
            u.getSets(function(sets){
                setListWidget.set('sets', sets);
                setWidget.hide();
                setPracticeWidget.hide();
                friendsWidget.hide();
                setListWidget.render();
                setListWidget.renderUI();
                setListWidget.show();
            });
        });

        controller.publish('newSet');
        controller.subscribe('newSet', function(){
            setListWidget.hide();
            setPracticeWidget.hide();
            friendsWidget.hide();
            var s = User.owner.createSet();
            setWidget.set('set',s);
            setWidget.render();
            setWidget.show();
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
            Y.log('friends', 'info', 'fc-pubsub');
            User.getFriends(function(friends){
                friendsWidget.set('friends', friends);
                setWidget.hide();
                setListWidget.hide();
                setPracticeWidget.hide();
                friendsWidget.render();
                friendsWidget.show();
            });
        });

        var onOwnerLoaded = function(owner) {
            status('felhasználók betöltve');
            User.owner = owner;
            controller.fire('allSets', User.owner.get('id'));
        };

        var sideBarWidget = new SideBarWidget({
            contentBox: '#fc-nav'
        });
        sideBarWidget.render();

        var status = function(msg){
            statusBarWidget.fire('status:print', msg);
        };

        var statusBarWidget = new StatusBarWidget({
            contentBox: '#fc-status'
        });
        statusBarWidget.render();

        var setListWidget = new SetListWidget({
            contentBox: "#fc-main"
        });

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
        ds.getOwner(onOwnerLoaded);

    });

}