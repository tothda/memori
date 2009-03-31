var profileView = {
    render: function(){
        console.log(this.sets);
        var link;
        memoriContent.clear().show();
        memoriContent.app(
            div().id('profile').app(
                h3('Legújabb leckék'),
                this.renderSets(),
                div().id('app-link').app(
                    link = a('tovább az alkalmazáshoz').attr('href','#')
                )
            )
        );
        link.on('click', function(){
            var canvas = gadgets.views.getSupportedViews()["canvas"];
            if (canvas) {
                gadgets.views.requestNavigateTo(canvas);
            }
        });
        gadgets.window.adjustHeight();
    },
    renderSets: function(){
        var tb;
        var node = table(
            tb = tbody()
        );        
        Y.each(this.sets, function(set, idx){
            if (idx < 5) { // legújabb 5
                tb.app(
                    tr(
                        th(set.title()),
                        td(set.cards.length+' szó')
                    )
                );
            }
        });
        return node;
    },
    cleanUp: function(){
        
    }
}