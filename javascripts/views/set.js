var setView = {};

Y.mix(setView, {
    init: function(){
        var me = this;
        me.initEditor();
        controller.subscribe('newSet', function(){
            me.set = User.owner.createSet();
            me.render();
        });
    },
    render: function() {
        var me = this;
        board.html('');
        board.appendChild(me.renderCardsTable());
    },
    renderCardsTable: function(){
        var me = this;
        me.table = N.create('<table id="cards-table"></table>');
        me.lastRow = N.create('<tr class="last"><td class="flip"></td><td class="front"></td><td class="trash"></td></tr>');
        me.table.appendChild(me.lastRow);
        this.start = {};
        this.end = {};
        var prev = me.start;
        Y.each(me.set.cards, function(c){
            prev = me.renderCard(prev,c);
        });
        var emptyCardNo = Math.max(0, 3 - me.set.cards.length); // legalább 3 hely látható legyen mindig
        for (var i = emptyCardNo; i > 0; i--) {
            prev = me.renderCard(prev);   
        }        
        prev.next = me.end;
        me.end.prev = prev;
        me.tableWrapper = N.create('<div id="cards-table-wrapper"></div>');
        me.tableWrapper.appendChild(me.table);
        me.tableWrapper.appendChild(me.editor.textArea());
        return me.tableWrapper;
    },
    renderCard: function(prevElem, card){
        var me = this;
        var tr = N.create('<tr></tr>');
        var set = me.set;
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

        // mellétesszük a kukát
        var n = N.create('<td class="trash"><a href="javascript:void(0)">&nbsp;</a></td>');
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
        me.table.insertBefore(tr, me.lastRow);
        return frontElem;
    },
    initEditor: function(){
        var me = this;
        me.editor = (function(){
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
                    var newFront = me.renderCard(item); // a front-ot adja vissza
                    // a strázsát a lista végére kell tenni
                    newFront.next = i;
                    // az új kártya flipside-jára ugorjunk
                    i = newFront.pair;
                    me.lastRow.scrollIntoView();
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
                    var height = parseInt(n.getComputedStyle("height").replace(/px/,''));// + 6;
                    var width = parseInt(n.getComputedStyle("width").replace(/px/,''));// + 27;
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
    }
});

setView.init();