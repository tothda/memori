var practiceView = {};

Y.mix(practiceView, {
    init: function(){
        var me = this;
        controller.subscribe('practice', function(id){
            Set.getSet(id, function(set){
                console.log(set);
                me.set = set;
                me.strategy = new DEFAULT_STRATEGY([me.set]);
                me.render();
            });
        });
    },
    render: function(){
        var me = this;
        menuBar.html('');
        board.html('').app(
            me.box = div().id('practice-wrapper').app(
                me.renderCardAndNav(),
                me.renderKnowDunno()
            )
        );
        menuBar.app(me.renderStatusBar());
        me.nextCard().show();
        me.bindEventHandlers();
        me.know = 0;
        me.dunno = 0;
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
            this.cardInfo = div().id('card-info'),
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
            var the = b == 1 || b == 5 ? 'az ' : 'app ';
            this.cardInfo.html(b + '. dobozban, elmúlt gyakorlás:' + t);
        } else { // ha a lecke végére értünk
            var restart,
                back,
                me = this,
                n = this.strategy.expiredCount();

            this.practiceSummary.app(
                h3('A gyakorlás végére értél.'),
                table(
                    tr(td('tudtál:').cls('mar-right'),td(strong(this.know +' db').cls('know'), ' kártyát')),
                    tr(td('nem tudtál:').cls('mar-right'),td(strong(this.dunno + ' db').cls('dunno'), ' kártyát'))
                ),
                n == 0 ?
                    div(strong('Ügyes voltál,'), ' nem maradt aktív kártya').cls('top-pad bottom-pad') :                
                    div('Újrakezded a gyakorlást az aktívan maradt ',strong(n+' db '),'kártyával?').cls('top-pad bottom-pad'),
                n == 0 ?
                    div(
                        back = a('vissza a leckékhez').attr('href','#').cls('nav-link dark')
                    ):
                    div(
                        restart = button('Igen').cls('right-mar'),
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
            this.dunnoButton.hide();
            this.knowButton.hide();
        }
    },
    updateButtons: function(){
        this.prevButton.setStyle('display', this.strategy.first() ? 'none' : '');
        this.nextButton.setStyle('display', this.strategy.last() ? 'none' : '');
        if (this.card.expired()) {
            this.resultDiv.setStyle('display', '');
        } else {
            this.resultDiv.setStyle('display', 'none');
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
    renderStatusBar: function() {
        var me = this,
            back, save;

        var node = div().app(
            back = N.create('<a href="#">« vissza a leckékhez</a>'),
            save = N.create('<button>Mentés</button>'),
            N.create('<select></select>').app(
                N.create('<option>ismétlés sorban</option>'),
                N.create('<option>ismétlés keverve</option>'),
                N.create('<option>gyakorlás</option>')
            )
        );
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
    }
});

practiceView.init();
