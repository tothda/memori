var practiceView = {}

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
        board.html('');
        me.box = div('practice-wrapper');
        me.box.appendChild(me.renderCardAndNav());
        board.appendChild(me.box);
    },
    renderCardAndNav: function(){
        var me = this;
        var node = div('card-line');
        var prevDivWrapper = div('prev-button-wrapper');
        me.prevButton = div('prev-button').html('&nbsp;');
        prevDivWrapper.appendChild(me.prevButton);
        var nextDivWrapper = div('next-button-wrapper');
        me.nextButton = div('next-button').html('&nbsp');
        nextDivWrapper.appendChild(me.nextButton);

        me.prevButton.on('click', function(){
            me.prevCard().show();
        });

        me.nextButton.on('click', function(){
            me.nextCard().show();
        });

        var cardDiv = div('card-wrapper');
        cardDiv.appendChild(me.renderCard());

        node.appendChildren([prevDivWrapper, cardDiv, nextDivWrapper]);
        return node;
    },
    renderCard: function(){
        var me = this;
        me.cardDiv = div('card', 'written');
        me.nextCard().show();
        me.cardDiv.on('click', function(){
            me.flip().show();
        });
        return me.cardDiv;
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
    cardText: function(){
        return this.side > 0 ? this.card.get('front') : this.card.get('flip');
    },
    show: function(){
        this.updateButtons();
        this.cardDiv.html(this.cardText());
    },
    updateButtons: function(){
        this.prevButton.setStyle('display', this.strategy.first() ? 'none' : '');
        this.nextButton.setStyle('display', this.strategy.last() ? 'none' : '');
    }
});

practiceView.init();

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
        this.nextButton = N.create('<button class='+this.getClassName('next')+'>></button>');
        this.previousButton = N.create('<button class='+this.getClassName('next')+'><</button>');
        this.knowButton = N.create('<a class='+this.getClassName('know')+' href="javascript:void(0)">Tudom</a>');
        this.dunnoButton = N.create('<a class='+this.getClassName('dunno')+' href="javascript:void(0)">Nem tudom</a>');
        cb.appendChild(this.infoNode);
        cb.appendChild(this.previousButton);
        cb.appendChild(this.cardNode);
        cb.appendChild(this.nextButton);
        var buttons = N.create('<div class='+this.getClassName('func')+'></div>');
        buttons.appendChild(this.dunnoButton);
        buttons.appendChild(this.knowButton);
        cb.appendChild(buttons);
    },
    syncUI: function(){

    },
    bindUI: function() {
        var bb = this.get('boundingBox');
        bb.on('click', function(e){
            var t = e.target;
            switch (t) {
            case this.cardNode:
                this.toggle();
                break;
            case this.previousButton:
                this.renderPrevCard();
                break;
            case this.nextButton:
                this.renderNextCard();
                break;
            case this.knowButton:
                this.card.practice(true);
                this.renderNextCard();
                break;
            case this.dunnoButton:
                this.card.practice(false);
                this.renderNextCard();
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
        this.front = true;
        this.toggle();
        this.disableButtons();
        this.renderInfo();
    },
    renderInfo: function() {
        this.infoNode.set('innerHTML', this.strategy.curPos() + ' / ' + this.strategy.length());
    },
    toggle: function(){
        var newSide = !this.front ? 'flip' : 'front';
        var oldSide = this.front ? 'flip' : 'front';
        var txt = this.card.get(newSide);
        this.front = !this.front;
        this.cardNode.set('innerHTML', txt);
        this.cardNode.replaceClass(oldSide, newSide);
    },
    disableButtons: function(){
        this.previousButton.set('disabled', this.strategy.isFirst() ? true : false);
        this.nextButton.set('disabled', this.strategy.isLast() ? true : false);
        if (!this.card.expired()) {
            this.knowButton.setStyle('display', 'none');
            this.dunnoButton.setStyle('display', 'none');
        } else {
            this.knowButton.setStyle('display', '');
            this.dunnoButton.setStyle('display', '');
        }
    }
});