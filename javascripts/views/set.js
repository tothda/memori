var setView = {};

Y.mix(setView, {
    init: function(){
        var me = this;
        me.initEditor();
    },
    render: function() {
        var me = this;
        menuBar.appendChild(me.renderMenuBar());
        board.appendChild(me.renderSetHeader());
        board.appendChild(me.renderCardsTable());
    },
    renderMenuBar: function() {
        return this.set.ownerSet() ? this.renderOwnMenuBar() : this.renderFriendMenuBar();
    },
    renderOwnMenuBar: function(){
        var me = this,
            node,deleteButton,practiceButton,backLink;

        node = div(
            backLink = a('« vissza a leckékhez').attr('href','#'),
            me.saveButton = button('Mentés'),
            deleteButton = button('Törlés'),
            practiceButton = button('Gyakorlás')
        );

        node.on('click', function(e){
            switch (e.target) {
            case me.saveButton:
                me.set.save();
                break;
            case backLink:
                controller.fire('allSets', me.set.owner().id);
                break;
            case practiceButton:
                controller.fire('practice', me.set.id());
                break;
            case deleteButton:
                if (confirm('Biztosan törlöd?')){
                    me.set.destroy(function(){
                        controller.fire('allSets');
                    });
                }
                break;
            }
        });

        me.saveButton.set('disabled', !me.dirty);
        controller.subscribe('dirty', me.dirtyHandler, me);
        return node;
    },
    renderFriendMenuBar: function(){
        var me = this,
            node,takeButton,backLink;

        node = div(
            backLink = a('« vissza '+ me.set.owner().name +' leckéihez').attr('href','#'),
            takeButton = button('Átveszem')
        );

        node.on('click', function(e){
            switch (e.target) {
            case takeButton:
                controller.fire('takeSet', me.set.id());
                break;
            case backLink:
                controller.fire('allSets', me.set.owner().id);
                break;
            }
        });
        return node;
    },
    renderSetHeader: function(){
        return this.set.ownerSet() ? this.renderOwnSetHeader() : this.renderFriendSetHeader();
    },
    renderOwnSetHeader: function() {
        var me = this,
            titleLabel,descriptionLabel;

        var node = div().id('set-header').cls('written shadow round10').app(
            div().cls('overflow-wrapper').app(
                titleLabel = label('lecke címe').cls('overflow').id('set-title-label').attr('for','set-title'),
                me.titleNode = N.create('<input type="text" class="written" id="set-title" />').set('value', me.set.get('title'))
            ),
            div().cls('overflow-wrapper').app(
                descriptionLabel = label('lecke rövid leírása').cls('overflow').id('set-description-label').attr('for','set-description'),
                me.descriptionNode = textarea().id('set-description').set('value', me.set.get('description'))
            )
        );

        var overflowHandler = function(l,n){
            if (n.get('value') != ''){
                l.hide();
            }

            Y.on('focus', function(){
                l.hide();
                n.addClass('focus');
            },n);

            Y.on('blur', function(){
                if (n.get('value') == ''){
                     l.show();
                }
                n.removeClass('focus');
            },n);
            Y.on('click', function(){
                n.focus();
            },l);
        };

        overflowHandler(titleLabel, me.titleNode);
        overflowHandler(descriptionLabel, me.descriptionNode);

        Y.on('change', function(e){
            switch (e.target) {
            case me.titleNode:
                me.set.set('title', me.titleNode.get('value'));
                break;
            case me.descriptionNode:
                me.set.set('description', me.descriptionNode.get('value'));
                break;
            }
        }, node);
        Y.on('key', function(e){
            if (e.ctrlKey || e.shiftKey) {
                return; // CTRL+TAB-ra ne csináljon semmit
            }
            me.editor.positionOn(me.start.next);
            e.preventDefault();
        }, me.descriptionNode, 'down:9');
        return node;
    },
    renderFriendSetHeader: function(){
        return div().id('set-header').cls('round10 written shadow').app(
            h2(this.set.title()),
            p(this.set.description())
        );
    },
    renderCardsTable: function(){
        var me = this;
        me.tableWrapper = div().id('cards-table-wrapper').app(
            div().id('cards-table-inner-wrapper').cls('shadow').app(
                table().id('cards-table').cls('written').app(
                    me.table = tbody(
                        me.lastRow = tr().cls('last').app(
                            td().cls('flip').html('&nbsp;'),
                            td().cls('front').html('&nbsp;'),
                            td().cls('trash')
                        )
                    )
                ),
                me.editor.textArea()
            )
        );
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
        me.table.app(
        );
        // utolsó sorra kattintva jelenjen meg egy új sor
        me.lastRow.on('click', function(e){
            var newFront = me.renderCard(me.end.prev);
            newFront.next = me.end;
            me.end.prev = newFront;
            me.editor.positionOn(newFront.pair);
        });
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
            if (set.ownerSet()) { // csak akkor lehessen szerkeszteni, ha saját lecke
                listElem.node.on('click', function(){
                    me.editor.positionOn(listElem);
                });
            }
            return listElem;
        };
        var flipElem = renderSide('flip', prevElem);
        var frontElem = renderSide('front', flipElem);
        // beállítjuk őket párnak
        flipElem.pair = frontElem;
        frontElem.pair = flipElem;

        // mellétesszük a kukát, de csak ha saját lecke
        if (set.ownerSet()){
            var n;
            tr.app(
                n = td().cls('trash').app(
                    a().attr('href', '#').html('&nbsp;')
                )
            );
            n.on('click', function(e){
                if (flipElem.card) {
                    flipElem.card.destroy();
                }
                tr.get('parentNode').removeChild(tr);
                // láncolt lista karbantartása
                flipElem.prev.next = frontElem.next;
                frontElem.next.prev = flipElem.prev;
            });
        }
        me.table.insertBefore(tr, me.lastRow);
        return frontElem;
    },
    dirtyHandler: function(dirty){
        this.saveButton.set('disabled', !dirty);
    },
    initEditor: function(){
        var me = this;
        me.editor = (function(){
            var t = N.create('<textarea id="card-editor" class="editor written"></textarea>');
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

                if (!i.node){
                    if (e.shiftKey){ // ha shift + TAB-ot nyomnak az első kártyán, akkor a set description-be kell ugrani
                        me.descriptionNode.focus();
                    } else { // ha sima TAB-ot nyomnak az utolsó kártyán, akkor kell egy új sor
                        var newFront = me.renderCard(item); // a front-ot adja vissza
                        // a strázsát a lista végére kell tenni
                        newFront.next = i;
                        // az új kártya flipside-jára ugorjunk
                        i = newFront.pair;
                        me.lastRow.scrollIntoView();
                    }
                }
                if (i.node) {
                    updateIfChanged();
                    me.editor.positionOn(i);
                }
                e.preventDefault();
            }, t, 'down:9,27');
            // ESC handler
            Y.on('key', function(e){
                t.setStyle('top','-2000px');
            }, t, 'down:27');

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
                    var p = listElem.side == 'flip' ? 29 : 27;
                    width = n.get('offsetWidth') - p;
                    //var height = n.get('offsetHeight');
                    var left = n.get('offsetLeft') + 20;
                    var top = n.get('offsetTop') + 20;
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
    cleanUp: function(){
        this.set.save();
        board.clear();
        menuBar.clear();
        controller.unsubscribe('dirty', me.dirtyHandler);
    }
});

setView.init();