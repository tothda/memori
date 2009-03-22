Y.mix(Y.DOM, {
    html: function(node, htmlString){
        node.innerHTML = htmlString;
    },
    app: function(node){
        var children = Y.Array(arguments);
        children.shift();
        Y.Array.each(children, function(child){
            var childNode = Y.Lang.isString(child) ? document.createTextNode(child) : Y.Node.getDOMNode(child);
            node.appendChild(childNode);
        });
        return node;
    },
    clear: function(node){
        node.innerHTML = '';
        return node;
    },
    hide: function(node){
        Y.DOM.setStyle(node, 'display', 'none');
        return node;
    },
    show: function(node){
        Y.DOM.setStyle(node, 'display', '');
        return node;
    },
    id: function(node,id){
        node.setAttribute('id',id);
        return node;
    },
    cls: function(node, cls){
        node.setAttribute('class',cls);
    },
    attr: function(node, attrName, attrValue){
        node.setAttribute(attrName,attrValue);
    }
});

Y.Node.addDOMMethods(['html', 'app', 'clear', 'hide', 'show','id','cls','attr']);

var createTagHelper = function(tagName){
    this[tagName] = function(){
        var children = Y.Array(arguments);
        var node = N.create('<'+tagName+'></'+tagName+'>');
        node.app.apply(node, children);
        return node;
    };
};

Y.each(['div','span','table','tr','td','a','button','h1','h2','h3','strong','ul','li','select','option'], function(tag){
    createTagHelper(tag);
});

