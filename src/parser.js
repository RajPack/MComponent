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

function evaluateExpression(dataExpr, dataRef){
    var fn, strippedExp, evaluatedValue;
    strippedExp = stripInterpolation(dataExpr);
    strippedExp = 'return ('+strippedExp+');'
    fn = new Function(strippedExp);
    evaluatedValue = fn.call(dataRef);

    return evaluatedValue;
}

function stripInterpolation(exp){
    exp = exp.replace(/{{/g, "this.");
    exp = exp.replace(/}}/g, "");
    return exp;
}

function createVDOM (template){
    var parser, elem, parsedTemplate;
    parser = new DOMParser();
    parsedTemplate = parser.parseFromString(template, 'text/html');
    elem = parsedTemplate.body.firstChild;
    return elem;
}

function parseHTML(template, component) {
    var vdom, interpolatedVdom;
    vdom = createVDOM(template);
    interpolatedVdom = parseNodes(vdom, component);
    return interpolatedVdom;
}

function parseNodes(template, dataRef){
    for(var i = 0 ; i< template.childElementCount; i++){
        template.children[i] = parseIndividualNode(template.children[i], dataRef);
    }

    return template;
}

function parseIndividualNode(node, dataRef){
    var textContent, mcAttribs;
    textContent = node.textContent;
    if(if_MCExpression(textContent)){
        node.textContent = evaluateTokens(textContent, dataRef) ;
    }
    return node;
}

function evaluateTokens(text, dataref) {
    var tokens, evaluatedText = text;
    tokens = tokenize(text);
    tokens.forEach(function (token, index, all){
        var evaluatedToken = evaluateExpression(token, dataref);
        evaluatedText = evaluatedText.replace(token, evaluatedToken);
    });
    return evaluatedText;
}

function tokenize(text){
    var expressions=[];
    var mode = "open", openIndex, closedIndex;
    for(var i = 0 ; i< text.length; i++) {
        if(mode === "open" && text[i]==="{" && text[i+1]==="{"){
           openIndex = i;
           mode = "close"; 
        } else if (mode === "close" && text[i]==="}" && text[i+1]==="}" ){
            closedIndex = i+1;
            mode = "open";
            expressions.push(text.substring(openIndex, closedIndex+1));

        }
    }
    return expressions;
}

function if_MCExpression(content){
    var expReg = /{{([a-zA-Z\d\-_.,\s/\W|_]*)}}/g;
    return content.match(expReg) ? true : false;
}


/* parser test code 

var sampletemplate = '<div class="container"><span>Your Name is: {{name}} and your age is {{age}}</span></div>';
var data = {name: 'john', age: 23};
var viewHTML = parseHTML(sampletemplate, data);

document.body.innerHTML = "";
document.body.appendChild(viewHTML);

*/