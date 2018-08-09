var Parser = {
    parseHTML: parseHTML,
    createVDOM: createVDOM
};

function loop(loopVal, ref) {
    var arr = loopVal.split(" ");
    var dataObj = Object.create(ref);
    var ObjName = arr[0];
    var ObjRef = arr[2];

    ref[ObjRef].forEach(
        function(item, index) {
            this[ObjName] = item;
            console.log(this[ObjName].street);
        }.bind(dataObj)
    );
}

function evaluateExpression(dataExpr, dataRef) {
    var fn, strippedExp, evaluatedValue;
    strippedExp = stripInterpolation(dataExpr);
    strippedExp = "return (" + strippedExp + ");";
    fn = new Function(strippedExp);
    evaluatedValue = fn.call(dataRef);

    return evaluatedValue;
}

function stripInterpolation(exp) {
    exp = exp.replace(/{{/g, "this.");
    exp = exp.replace(/}}/g, "");
    return exp;
}

function createVDOM(template) {
    var parser, elem, parsedTemplate;
    parser = new DOMParser();
    parsedTemplate = parser.parseFromString(template, "text/html");
    elem = parsedTemplate.body.firstChild;
    return elem;
}

function parseHTML(template, component) {
    var vdom, interpolatedVdom;
    vdom = createVDOM(template);
    interpolatedVdom = parseNodes(vdom, component);
    return interpolatedVdom;
}

function parseNodes(template, dataRef) {
    var nodes = template.childNodes;
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].hasChildNodes()) {
            nodes[i] = parseNodes(nodes[i], dataRef);
        } else {
            nodes[i] = parseIndividualNode(nodes[i], dataRef);
        }
    }
    return template;
}

function parseIndividualNode(node, dataRef) {
    var textContent, mcAttribs;
    textContent = node.textContent;
    if (if_MCExpression(textContent)) {
        node.textContent = evaluateTokens(textContent, dataRef);
    }
    return node;
}

function evaluateTokens(text, dataref) {
    var tokens,
        evaluatedText = text;
    tokens = tokenize(text);
    tokens.forEach(function(token, index, all) {
        var evaluatedToken = evaluateExpression(token, dataref);
        evaluatedText = evaluatedText.replace(token, evaluatedToken);
    });
    return evaluatedText;
}

function tokenize(text) {
    var expressions = [];
    var mode = "open",
        openIndex,
        closedIndex;
    for (var i = 0; i < text.length; i++) {
        if (mode === "open" && text[i] === "{" && text[i + 1] === "{") {
            openIndex = i;
            mode = "close";
        } else if (mode === "close" && text[i] === "}" && text[i + 1] === "}") {
            closedIndex = i + 1;
            mode = "open";
            expressions.push(text.substring(openIndex, closedIndex + 1));
        }
    }
    return expressions;
}

function if_MCExpression(content) {
    var expReg = /{{([a-zA-Z\d\-_.,\s/\W|_]*)}}/g;
    return content.match(expReg) ? true : false;
}

var expressionLexer = (() => {
    class Lexer {
        constructor(buffer, offset) {
            this.setTokenTypes();
            this.buf = buffer;
            this.bufLen = this.buf.length;
            this.pos = 0;
            this.offset = offset || 0;
            this.tokens = [];
        }

        getListOfToken() {
            while (this.pos < this.bufLen) {
                var ch = this.buf.charAt(this.pos);
                if (
                    this._isnonToken(ch) ||
                    (this._isopenExpression(ch) && this.checkIfExpression(ch) ) ||
                    (this._isalpha(ch) && this.checkIfIdentifier()) ||
                    (this._isquote(ch) && this.checkIfStringLiteral()) ||
                    (this._isdigit(ch) && this.checkIfNumberLiteral()) ||
                    this.checkIfOperator(ch)
                ) {
                    this.pos++;
                    continue;
                } else {
                    this._throwError(
                        "Invalid token at position: " + this.pos + " of expression: " + this.buf
                    );
                }
            }
            return this.tokens;
        }

        getToken(type, start, end, value) {
            return {
                type: type,
                start: start + this.offset,
                end: end + this.offset,
                value: value
            };
        }

        checkIfExpression(ch) {
            var tokenRef = this.tokenTypes.ExpressionOpen,
                closetokenRef = this.tokenTypes.ExpressionClose,
                endpos,
                closedExp = false;
            for (var i = 0; i < tokenRef.length; i++) {
                if (tokenRef[i] === ch) {
                    closedExp = false;
                    endpos = this.pos + 1;
                    while (endpos < this.bufLen) {
                        if (closetokenRef[i] === this.buf.charAt(endpos)) {
                            closedExp = true;
                            var subexprLexer = new Lexer(this.buf.substring(this.pos + 1, endpos), this.pos+1);
                            var subTokens = subexprLexer.getListOfToken();
                            this.tokens =this.tokens.concat(subTokens);
                            this.pos = endpos;
                            endpos++;
                        }
                        else{
                            endpos++;
                        }
                    }
                    if (!closedExp) {
                        this._throwError(
                            "Missing closing tag for opening tag in expression at location: " +
                                this.pos +
                                " of " +
                                this.buf
                        );
                    }
                    return true;
                }
            }
            return false;
        }

        checkIfIdentifier() {
            var token,
                endpos = this.pos + 1;
            while (endpos < this.bufLen && this._isalphaNum(this.buf.charAt(endpos))) {
                endpos++;
            }
            token = this.getToken(
                "IDENTIFIER",
                this.pos,
                endpos - 1,
                this.buf.substring(this.pos, endpos)
            );
            this.pos = endpos - 1;
            this.tokens.push(token);
            return token;
        }

        checkIfOperator(ch) {
            if(this.checkIfDoubleOperator(ch)){
                this.pos++;
                return true;
            } else if( this.checkIfSingleOperator(ch)){
                this.pos++;
                return true;
            }else{
                return false;
            }
        }

        checkIfSingleOperator(ch) {}

        checkIfDoubleOperator(ch) {
            
        }

        checkIfNumberLiteral() {
            var token,
                endpos = this.pos + 1;
            while (endpos < this.bufLen && this._isdigit(this.buf.charAt(endpos))) {
                endpos++;
            }
            token = this.getToken(
                "Number Literal",
                this.pos,
                endpos - 1,
                this.buf.substring(this.pos, endpos)
            );
            this.tokens.push(token);
            this.pos = endpos -1;
            return token;
        }

        checkIfStringLiteral() {
            var token,
                endpos = this.pos + 1,
                quoteChar = this.buf.charAt(this.pos);
            while (endpos < this.bufLen && quoteChar !== this.buf.charAt(endpos)) {
                endpos++;
            }
            token = this.getToken(
                "String Literal",
                this.pos,
                endpos - 1,
                this.buf.substring(this.pos, endpos+1)
            );
            this.tokens.push(token);
            this.pos = endpos;
            return token;
        }

        _isalpha(ch) {
            return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_" || ch === "$";
        }

        _isopenExpression(ch){
            var match = this.tokenTypes.ExpressionOpen;
            var matched = false;
            for(var i = 0 ; i< match.length; i++){
                if(ch === match[i]){
                    matched = true;
                    break;
                }
            }
            return matched;
        }
        _isdigit(ch) {
            return ch >= "0" && ch <= "9";
        }

        _isquote(ch) {
            return ch === "'" || ch === '"';
        }

        _isalphaNum(ch) {
            return this._isalpha(ch) || this._isdigit(ch);
        }

        _isnewLine(ch) {
            return ch === "\n" || ch === "\r";
        }

        _iswhiteSpace(ch) {
            return ch === " " || ch === "\t";
        }
        _isnonToken(ch) {
            return this._iswhiteSpace(ch) || this._isnewLine(ch);
        }

        setTokenTypes() {
            this.tokenTypes = {
                ExpressionOpen: ["("],
                ExpressionClose: [")"],
                SingleOperator: ["+", "-", "/", "%", "!", "&", "|", "*", "?", ":", "<", ">", "="],
                doubleOperator: ["&&", "||", "++", "--", "==(?==)", "==","<=",">=", "!=", "!=(?==)"]
            };
        }

        _throwError(msg) {
            throw new Error(msg);
        }
    }
    return Lexer;
})();

/* parser test code 

var sampletemplate = `<div class="container"><span>Your Name is: {{name }} {{lastName}} and your age is {{age}}</span>
                        <div>
                            <span>{{name}}'s Department: 
                                <b>{{dept}}</b> 
                             </span>
                        </div>
                      </div>`;
var data = {name: 'Steve', lastName: "Smith", age: 32,dept:"sales"};
var viewHTML = parseHTML(sampletemplate, data);

document.body.innerHTML = "";
document.body.appendChild(viewHTML);


*/
