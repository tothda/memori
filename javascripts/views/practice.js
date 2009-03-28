var practiceView = {};

Y.mix(practiceView, {
    render: function(){
        var me = this;
        me.strategy = new ExpiredPracticeStrategy([me.set]);
        if (me.strategy.length == 0) {
            me.strategy = new ShuffledPracticeStrategy([me.set]);
        }
        menuBar.clear();
        ibNode.clear();
        board.clear();
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
                div().id('card-wrapper').app(
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
            this.practiceSummary = div().id('practice-summary').cls('written').hide()
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
                div('Legutóbb ' + DateHelper.time_ago_in_words(this.card.get('time')) + ' gyakoroltad.')
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
                h3('A gyakorlás végére értél.'),
                table(
                    tr(td('tudtál:').cls('right-pad'),td(strong(this.know +' db').cls('know'), ' kártyát')),
                    tr(td('nem tudtál:').cls('right-pad'),td(strong(this.dunno + ' db').cls('dunno'), ' kártyát'))
                ),
                n == 0 ?
                    div(strong('Ügyes voltál,'), ' nem maradt aktív kártya.').cls('top-pad bottom-pad') :
                    div('Folytatod a gyakorlást az aktívan maradt ',strong(n+' db '),'kártyával?').cls('top-pad bottom-pad'),
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
            back, save,
            node, sel;

        node = div().app(
            back = a('« vissza a leckékhez').attr('href','#'),
            save = button('Mentés').cls('left-mar'),
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
            case save:
                me.set.save();
                break;
            }
        });
        return node;
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
        return div().id('practice-info').app(
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
        this.keyHandle = Y.on('key', this.eventHandler, window.document, 'down:37,38,39,40', this);
        this.box.on('click', this.eventHandler, this);
    },
    eventHandler: function(e){
        var t = e.target,
            c = e.charCode;

        // prev, left
        if ((t == this.prevButton || c == 37) && !this.strategy.first()) {
            this.prevCard().show();
        }
        // next, right
        if ((t == this.nextButton || c == 39) && !this.strategy.last()) {
            this.nextCard().show();
        }
        // flip, up, down
        if (t == this.cardTxt || c == 38 || c == 40) {
            this.flip().show();
        }
        // know
        if (t == this.knowButton) {
            this.know++;
            this.card.practice(true);
            this.nextCard().show();
        }
        // dunno
        if (t == this.dunnoButton) {
            this.dunno++;
            this.card.practice(false);
            this.nextCard().show();
        }

        e.preventDefault();
    },
    cleanUp: function(){
        ibNode.clear();
        this.keyHandle.detach();
    }
});
