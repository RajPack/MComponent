var Parser = {
    parseHTML: parseHTML,
    createVDOM: createVDOM
}


function loop (loopVal, ref) {
    var arr = loopVal.split(' ');
    var dataObj = Object.create(ref);
    var ObjName = arr[0];
    var ObjRef = arr[2];
    
    ref[ObjRef].forEach(function(item, index) {
        this[ObjName] = item
        console.log(this[ObjName].street);
    }.bind(dataObj));
}

function evaluateData(dataExpr, dataRef){
  
}

function createVDOM (template){
    var parser, elem, parsedTemplate;
    parser = new DOMParser();
    parsedTemplate = parser.parseFromString(template, 'text/html');
    elem = parsedTemplate.body.firstChild;
    return elem;
}

function parseHTML() {
    
}