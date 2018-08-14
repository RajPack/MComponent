var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var Parser = {
    parseHTML: parseHTML,
    createVDOM: createVDOM
};

// function loop(loopVal, ref) {
//     var arr = loopVal.split(" ");
//     var dataObj = Object.create(ref);
//     var ObjName = arr[0];
//     var ObjRef = arr[2];

//     ref[ObjRef].forEach(
//         function(item, index) {
//             this[ObjName] = item;
//             console.log(this[ObjName].street);
//         }.bind(dataObj)
//     );
// }

function evaluateExpression(dataExpr, dataRef) {
    var fn, strippedExp, evaluatedValue;
    strippedExp = stripInterpolation(dataExpr);
    strippedExp = bindIdentifiers(strippedExp, dataRef);
    strippedExp = "return (" + strippedExp + ");";
    fn = new Function(strippedExp);
    evaluatedValue = fn.call(dataRef);

    return evaluatedValue;
}

function stripInterpolation(exp) {
    exp = exp.replace(/{{/g, "");
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

function bindIdentifiers(expression, obj) {
    var lex = new ExpressionLexer(expression),
        expTokens,
        intialExpressionLength = expression.length,
        index = 0,
        offset = 0,
        updatedExpression = expression;
    expTokens = lex.getAllTokens();
    while (index < expTokens.length) {
        var token = expTokens[index];
        updatedExpression = token.type === "IDENTIFIER" ? shouldBindIdenfier(token.value, obj) ? bindObjToIdentifer(updatedExpression, token, offset) : updatedExpression : updatedExpression;
        index++;
        offset = updatedExpression.length - intialExpressionLength;
    }
    return updatedExpression;
}

function shouldBindIdenfier(identifier, data) {
    return data[identifier] ? true : window[identifier] ? false : true;
}

function bindObjToIdentifer(expression, token, offset) {
    var startIndex = token.start + offset,
        endIndex = token.end + offset;
    var updatedExpression = expression.substring(0, startIndex) + "this." + token.value + expression.substring(endIndex + 1, expression.length);
    return updatedExpression;
}

function parseHTML(template, component, vdom) {
    var interpolatedVdom;
    vdom = vdom || createVDOM(template);
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
    var textContent;
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
    tokens.forEach(function (token, index, all) {
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

var ExpressionLexer = function () {
    var Lexer = function () {
        function Lexer(buffer, offset) {
            classCallCheck(this, Lexer);

            this.setTokenTypes();
            this.buf = buffer;
            this.bufLen = this.buf.length;
            this.pos = 0;
            this.offset = offset || 0;
            this.tokens = [];
        }

        createClass(Lexer, [{
            key: "getAllTokens",
            value: function getAllTokens() {
                while (this.pos < this.bufLen) {
                    var ch = this.buf.charAt(this.pos);
                    if (this._isnonToken(ch) || this._isopenExpression(ch) && this.checkIfExpression(ch) || this._isalpha(ch) && this.checkIfIdentifier() || this._isquote(ch) && this.checkIfStringLiteral() || this._isdigit(ch) && this.checkIfNumberLiteral() || this.checkIfOperator(ch)) {
                        this.pos++;
                        continue;
                    } else {
                        this._throwError("Invalid token: " + this.buf[this.pos] + "at position: " + this.pos + " of expression: " + this.buf);
                    }
                }
                return this.tokens;
            }
        }, {
            key: "getToken",
            value: function getToken(type, start, end, value) {
                return {
                    type: type,
                    start: start + this.offset,
                    end: end + this.offset,
                    value: value
                };
            }
        }, {
            key: "checkIfExpression",
            value: function checkIfExpression(ch) {
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
                                var subexprLexer = new Lexer(this.buf.substring(this.pos + 1, endpos), this.pos + 1 + this.offset);
                                var subTokens = subexprLexer.getAllTokens();
                                this.tokens = this.tokens.concat(subTokens);
                                this.pos = endpos;
                                endpos++;
                            } else {
                                endpos++;
                            }
                        }
                        if (!closedExp) {
                            this._throwError("Missing closing tag for opening tag in expression at location: " + this.pos + " of " + this.buf);
                        }
                        return true;
                    }
                }
                return false;
            }
        }, {
            key: "checkIfIdentifier",
            value: function checkIfIdentifier() {
                var token,
                    endpos = this.pos + 1;
                while (endpos < this.bufLen && this._isalphaNum(this.buf.charAt(endpos))) {
                    endpos++;
                }
                token = this.getToken("IDENTIFIER", this.pos, endpos - 1, this.buf.substring(this.pos, endpos));
                this.pos = endpos - 1;
                this.tokens.push(token);
                return token;
            }
        }, {
            key: "checkIfOperator",
            value: function checkIfOperator(ch) {
                return this.checkIfDoubleOperator(ch) || this.checkIfSingleOperator(ch) ? true : false;
            }
        }, {
            key: "checkIfSingleOperator",
            value: function checkIfSingleOperator(ch) {
                var matchArr = this.tokenTypes.SingleOperator;
                for (var i = 0; i <= matchArr.length; i++) {
                    if (ch === matchArr[i]) {
                        var token = this.getToken("OPERATOR", this.pos, this.pos + 1, this.buf.substring(this.pos, this.pos + 1));
                        this.tokens.push(token);
                        return true;
                    }
                }
                return false;
            }
        }, {
            key: "checkIfDoubleOperator",
            value: function checkIfDoubleOperator(ch) {
                var matchArr = this.tokenTypes.doubleOperator;
                for (var i = 0; i <= matchArr.length; i++) {
                    var op = matchArr[i],
                        bufSubStr = this.buf.substring(this.pos);
                    if (bufSubStr.indexOf(op) === 0) {
                        var token = this.getToken("OPERATOR", this.pos, this.pos + op.length - 1, this.buf.substring(this.pos, this.pos + op.length));
                        this.tokens.push(token);
                        this.pos += op.length - 1;
                        return true;
                    }
                }
                return false;
            }
        }, {
            key: "checkIfNumberLiteral",
            value: function checkIfNumberLiteral() {
                var token,
                    endpos = this.pos + 1;
                while (endpos < this.bufLen && this._isdigit(this.buf.charAt(endpos))) {
                    endpos++;
                }
                token = this.getToken("NUMBER LITERAL", this.pos, endpos - 1, this.buf.substring(this.pos, endpos));
                this.tokens.push(token);
                this.pos = endpos - 1;
                return token;
            }
        }, {
            key: "checkIfStringLiteral",
            value: function checkIfStringLiteral() {
                var token,
                    endpos = this.pos + 1,
                    quoteChar = this.buf.charAt(this.pos);
                while (endpos < this.bufLen && quoteChar !== this.buf.charAt(endpos)) {
                    endpos++;
                }
                token = this.getToken("STRING LITERAL", this.pos, endpos - 1, this.buf.substring(this.pos, endpos + 1));
                this.tokens.push(token);
                this.pos = endpos;
                return token;
            }
        }, {
            key: "_isalpha",
            value: function _isalpha(ch) {
                return ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z" || ch === "_" || ch === "$";
            }
        }, {
            key: "_isopenExpression",
            value: function _isopenExpression(ch) {
                var match = this.tokenTypes.ExpressionOpen;
                for (var i = 0; i < match.length; i++) {
                    if (ch === match[i]) {
                        return true;
                    }
                }
                return false;
            }
        }, {
            key: "_isdigit",
            value: function _isdigit(ch) {
                return ch >= "0" && ch <= "9";
            }
        }, {
            key: "_isquote",
            value: function _isquote(ch) {
                return ch === "'" || ch === '"';
            }
        }, {
            key: "_isalphaNum",
            value: function _isalphaNum(ch) {
                return this._isalpha(ch) || this._isdigit(ch);
            }
        }, {
            key: "_isnewLine",
            value: function _isnewLine(ch) {
                return ch === "\n" || ch === "\r";
            }
        }, {
            key: "_iswhiteSpace",
            value: function _iswhiteSpace(ch) {
                return ch === " " || ch === "\t";
            }
        }, {
            key: "_isnonToken",
            value: function _isnonToken(ch) {
                return this._iswhiteSpace(ch) || this._isnewLine(ch);
            }
        }, {
            key: "setTokenTypes",
            value: function setTokenTypes() {
                this.tokenTypes = {
                    ExpressionOpen: ["("],
                    ExpressionClose: [")"],
                    SingleOperator: ["+", "-", "/", "%", "!", "&", "|", "*", "?", ":", "<", ">", "="],
                    doubleOperator: ["&&", "||", "++", "--", "===", "==", "<=", ">=", "!=", "!=="]
                };
            }
        }, {
            key: "_throwError",
            value: function _throwError(msg) {
                throw new Error(msg);
            }
        }]);
        return Lexer;
    }();

    return Lexer;
}();

/* sample test code 

var sampletemplate = `<div class="container"><span>Your Name is: {{name }} {{lastName}} and your age is {{age}}</span>
                        <div>
                            <span>{{name}}'s Department: 
                                <b>{{dept}}</b> 
                             </span>
                        </div>
                        <div>age > 30 : {{age > 30}}</div>
                        <div> Last name is Jones ? -- {{lastName === 'Jones'}}</div>
                        <div> Your alias is different from your first name ? -- {{alias !== name || (alias === lastName) }}</div>
                      </div>`;
var data = {name: 'Steve', lastName: "Smith", age: 32,dept:"sales", alias: "Steve"};
var viewHTML = parseHTML(sampletemplate, data);

document.body.innerHTML = "";
document.body.appendChild(viewHTML);


*/

var View = function () {
    function View(template, dataref) {
        classCallCheck(this, View);

        this.template = template;
        this.dataRef = dataref;
    }

    createClass(View, [{
        key: 'init',
        value: function init() {}
    }, {
        key: 'parse',
        value: function parse() {
            this.DOMRef = Parser.parseHTML(this.template, this.dataRef);
        }
    }]);
    return View;
}();

var MComponent = function () {
  function MComponent() {
    classCallCheck(this, MComponent);

    this._viewRef = new View(this.template, this);
  }

  createClass(MComponent, [{
    key: "initView",
    value: function initView() {
      this._viewRef.parse();
    }
  }, {
    key: "init",
    value: function init() {
      this._viewRef.init();
      this.mcOnInit();
    }
  }, {
    key: "mcOnInit",
    value: function mcOnInit() {}
  }]);
  return MComponent;
}();

export { MComponent };
