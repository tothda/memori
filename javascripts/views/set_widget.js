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
        this.cardsTable.set('innerHTML', '');
        var cards = this.get('set').getCards();
        this.start = {};
        this.end = {};
        var prev = this.start;
        Y.each(cards, function(c){
            prev = this._renderCard(prev,c);
        }, this);
        var emptyCardNo = Math.max(0, 3 - cards.length); // legalább 3 hely látható legyen mindig
        for (var i = emptyCardNo; i > 0; i--) {
            prev = this._renderCard(prev);   
        }        
        prev.next = this.end;
        this.end.prev = prev;
    },
    _renderCard: function(prevElem, card){
        var me = this;
        var tr = N.create('<tr></tr>');
        var set = this.get('set');
        var renderSide = function(side,prev){
            var txt = card ? card.get(side) : '&nbsp;';
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
                        item.card = item.set.createCard();
                        item.pair.card = item.card;
                        item.card.set(item.side, val);
                        item.node.set('innerHTML', val);
                    }
                }
            };
            // TAB handler
            Y.on('key', function(e){
                // ha CTRL+TAB-ot nyomtak, akkor ne ugorjunk, mert csak tab-ot akar váltani a user
                if (e.ctrlKey) {
                    return;
                }
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

            // ha visszakapja a fókuszt (pl átmegy a user egy másik tab-ra, majd vissza), akkor álljunk vissza az utolsó pozícióra
            Y.on('focus', function(){
                me.editor.positionOn(item);
            }, t);

            return {
                positionOn: function(listElem){
                    item = listElem;
                    var n = listElem.node;
                    var height = parseInt(n.getComputedStyle("height").replace(/px/,'')) + 6;
                    var width = parseInt(n.getComputedStyle("width").replace(/px/,'')) + 27;
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
