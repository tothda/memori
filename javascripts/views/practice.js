var practiceView = {};

Y.mix(practiceView, {
    init: function(){
        Y.on('key', this.eventHandler, window.document, 'down:37,39,32,78,84', this);
    },
    render: function(){
        var me = this;
        me.handleKeys = true; // az event detach mintha bugos lenne, ezért kell így
        me.strategy = new ExpiredPracticeStrategy([me.set]);
        if (me.strategy.length == 0) {
            me.strategy = new ShuffledPracticeStrategy([me.set]);
        }
        menuBar.app(me.renderMenuBar());
        board.app(
            me.box = div().id('practice-wrapper').app(
                me.renderCardAndNav(),
                me.renderKnowDunno()
            )
        );
        me.start();
        me.bindEventHandlers();
    },
    start: function(){
        ibNode.clear().app(this.renderInfoBar());
        helpNode.clear().app(this.renderHelpNode());
        this.practiceSummary.clear().hide();
        this.cardTxt.show();
        this.cardInfo.show();
        this.nextCard().show();
        this.know = 0;
        this.dunno = 0;
    },
    renderCardAndNav: function(){
        var me = this;
        var node = div().id('card-line');
        node.app(
            div().id('card-with-nav').app(
                div().id('prev-button-wrapper').app(
                    me.prevButton = div().id('prev-button').html('&nbsp;')
                ),
                div().id('card-wrapper').cls('shadow round10').app(
                    me.renderCard()
                ),
                div().id('next-button-wrapper').app(
                    me.nextButton = div().id('next-button').html('&nbsp;')
                ),
                div().cls('clear')
            )
        );
        return node;
    },
    renderCard: function(){
        this.cardDiv = div().id('card').app(
            this.cardTxt = div().id('card-text').cls('written'),
            div().id('card-info').app(
                this.cardInfo = div()
            ),
            this.practiceSummary = div().id('practice-summary').hide()
        );
        return this.cardDiv;
    },
    nextCard: function(){
        this.side = -1;
        this.card = this.strategy.next();
        return this;
    },
    prevCard: function(){
        this.side = -1;
        this.card = this.strategy.prev();
        return this;
    },
    flip: function(){
        this.side = this.side * -1;
        return this;
    },
    // -1 : magyar - front
    //  1 : idegen - flip
    cardText: function(){
        return this.side < 0 ? this.card.get('front') : this.card.get('flip');
    },
    show: function(){
        if (this.card) {
            this.updateButtons();
            this.cardTxt.html(this.cardText());
            var b = this.card.get('bucket') + 1;
            var t = this.card.get('time');
            this.cardInfo.clear().app(
                div(b + '. dobozból').id('box-number').cls('bucket_'+(b-1)),
                div(t ? 'Legutóbb ' + DateHelper.time_ago_in_words(t) + ' gyakoroltad.' : 'Még nem gyakoroltad.')
            );
            var n = memoriContent;
            var e = n.appendChild(document.createTextNode(' '));
            n.removeChild(e);

        } else { // ha a lecke végére értünk
            var restart,
                back,
                me = this,
                n = this.strategy.expiredCount();

            this.practiceSummary.app(
                h3('A gyakorlás végére értél.').cls('bottom-pad'),
                table(
                    tbody(
                        tr(td('sikeres ismételések:').cls('right-pad bottom-pad top-pad'),td(strong(this.know +' db').cls('know'))),
                        tr(td('sikertelen ismétlések:').cls('right-pad'),td(strong(this.dunno + ' db').cls('dunno')))
                    )
                ).cls('bottom-pad'),
                n == 0 ?
                    p(strong('Ügyes voltál,'), ' nem maradt aktív kártya.').cls('top-pad bottom-pad') :
                    p('Folytatod a gyakorlást az aktívan maradt kártyákkal?').cls('top-pad bottom-pad'),
                n == 0 ?
                    div(
                        back = a('vissza a leckékhez').attr('href','#').cls('nav-link dark')
                    ):
                    div(
                        restart = button('Folytatom').cls('right-mar'),
                        back = a('nem, vissza a leckékhez').attr('href','#').cls('nav-link dark')
                    )
            ).show();
            if (restart) {
                restart.on('click', function(){
                    controller.fire('practice', me.set.id());
                });
            }
            back.on('click', function(){
                controller.fire('allSets');
            });
            this.cardTxt.hide();
            this.cardInfo.hide();
            this.prevButton.hide();
            this.nextButton.hide();
            this.resultDiv.hide();
        }
    },
    updateButtons: function(){
        this.prevButton.setStyle('display', this.strategy.first() ? 'none' : '');
        this.nextButton.setStyle('display', this.strategy.last() ? 'none' : '');
        this.actCardNo.html(this.strategy.pos()+'');
        if (this.strategyIndex() == 0) {
            this.resultDiv.show();
            this.prevButton.hide();
            this.nextButton.hide();
        } else {
            this.resultDiv.hide();
            this.prevButton.show();
            this.nextButton.show();
        }
    },
    renderKnowDunno: function(){
        var node = div().id('result-line').app(
            this.resultDiv = div().id('result-wrapper').app(
                div().id('dunno-button-wrapper').app(
                    this.dunnoButton = div().id('dunno-button').cls('button').html('Nem tudom')
                ),
                div().id('know-button-wrapper').app(
                    this.knowButton = div().id('know-button').cls('button').html('Tudom')
                ),
                div().cls('clear')
            )
        );
        return node;
    },
    expiredStrategy: function(){
        return this.strategyIndex() == 0;
    },
    strategyIndex: function() {
        var me = this,
            n;
        switch (me.strategy.constructor) {
        case LinearPracticeStrategy:
            n = 1;
            break;
        case ShuffledPracticeStrategy:
            n = 2;
            break;
        case ExpiredPracticeStrategy:
            n = 0;
            break;
        }
        return n;
    },
    renderMenuBar: function() {
        var me = this,
            back, node, sel;

        node = div().app(
            back = a('« vissza a leckékhez').attr('href','#'),
            me.saveButton = button('Mentés').cls('left-mar'),
            span('amit gyakorolni szeretnék:').cls('left-mar'),
            sel = select(
                option('csak az aktív kártyákat').attr('value','0'),
                option('minden kártyát sorban').attr('value','1'),
                option('minden kártyát keverve').attr('value','2')
            ).cls('left-mar')
        );

        sel.set('selectedIndex', me.strategyIndex());

        sel.on('change', function(){
            switch (sel.get('value')) {
            case '0':
                me.strategy = new ExpiredPracticeStrategy([me.set]);
                break;
            case '1':
                me.strategy = new LinearPracticeStrategy([me.set]);
                break;
            case '2':
                me.strategy = new ShuffledPracticeStrategy([me.set]);
                break;
            }
            me.start();
        });
        node.on('click', function(e){
            switch (e.target) {
            case back:
                me.set.save();
                controller.fire('allSets');
                break;
            case me.saveButton:
                me.set.save();
                break;
            }
        });

        me.saveButton.set('disabled', !me.dirty);
        controller.subscribe('dirty', me.dirtyHandler, me);

        return node;
    },
    dirtyHandler: function(dirty){
        this.saveButton.set('disabled', !dirty);
        this.saveButton.blur(); // ha disabled lesz és rajtmarad a focus, akkor a key event-ek nem működnek
    },
    renderInfoBar: function(){
        var me = this;
        var formatStrategy = function() {
            switch (me.strategy.constructor) {
            case LinearPracticeStrategy:
                return 'összes kártya gyakorlása sorrendben';
            case ShuffledPracticeStrategy:
                return 'összes kártya gyakorlása véletlenszerű sorrendben';
            case ExpiredPracticeStrategy:
                return 'aktív kártyák gyakorlása';
            }
        };
        return div().cls('info').app(
            div().cls('info-text').app(
                div(this.set.get('title')).cls('title'),
                div(formatStrategy()).cls('practice-type')
            ),
            span(
                this.actCardNo = span('1'),
                ' / ',
                this.sumCardNo = span(this.strategy.length+'')
            ).cls('counter'),
            div().cls('clear')
        );
    },
    bindEventHandlers: function(){
        this.box.on('click', this.eventHandler, this);
    },
    eventHandler: function(e){
        if (!this.handleKeys){
            return;
        }
        var t = e.target,
            c = e.charCode;

        if (!this.expiredStrategy()){
            // prev, left
            if ((t == this.prevButton || c == 37) && !this.strategy.first()) {
                this.prevCard().show();
            }
            // next, right
            if ((t == this.nextButton || c == 39) && !this.strategy.last()) {
                this.nextCard().show();
            }
        }
        // flip, up, down
        if (t == this.cardTxt || c == 32) {
            this.flip().show();
        }

        if (this.expiredStrategy()){
            // know, T
            if (this.card && (t == this.knowButton|| c == 84)) {
                this.know++;
                this.card.practice(true);
                this.nextCard().show();
            }
            // dunno, N
            if (this.card && (t == this.dunnoButton || c == 78)) {
                this.dunno++;
                this.card.practice(false);
                this.nextCard().show();
            }
        }

        e.preventDefault();
    },
    renderHelpNode: function(){
        var help = div().id('help-content').cls('round10-bottom');
        if (this.expiredStrategy()){
            help.app(
                div(div('tudom').cls('help-shortcut')).id('help-know').cls('help-shortcut-wrapper'),
                div(div('nem tudom').cls('help-shortcut')).id('help-dunno').cls('help-shortcut-wrapper'),
                div(div('másik oldal').cls('help-shortcut')).id('help-turn')
            );
        } else {
            help.app(
                div(div('következő').cls('help-shortcut')).id('help-next').cls('help-shortcut-wrapper'),
                div(div('előző').cls('help-shortcut')).id('help-prev').cls('help-shortcut-wrapper'),
                div(div('másik oldal').cls('help-shortcut')).id('help-turn')
            );
        }
        var node = div().app(
            div().id('help-header').cls('round10-top').html('TIPP'),
            help
        );
        return node;
    },
    cleanUp: function(){
        menuBar.clear();
        board.clear();
        ibNode.clear();
        helpNode.clear();
        this.handleKeys = false;
        this.set.save();
        controller.unsubscribe('dirty', me.dirtyHandler);
    }
});

practiceView.init();