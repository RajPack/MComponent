import { View } from "./view";

var MComponent = (function() {
    class MComponent {
        constructor() {}
        _initView() {
            this._viewRef.parse();
        }

        _init(componentDOMRef) {
            this._viewRef = new View(this.template, this, componentDOMRef);
            this.mcOnInit();
            this._initView();
        }
        _initialRender() {
            this._viewRef.initialRender();
        }

        mcOnInit() {}
    }
    MComponent.bootstrap = function(selector, rootComponent) {
        var elem;
        elem =
            document.querySelector(selector) ||
            _throwError(
                "Error at bootstrap, selector : " +
                    selector +
                    " doesn't exist in DOM"
            );
        rootComponent = rootComponent || _throwError("rootComponent not found");
    };
    MComponent.extend = function(childClass) {
        childClass.prototype = Object.create(MComponent.prototype);
        childClass.prototype.super = MComponent;
    };

    function _throwError(msg) {
        throw new Error(msg);
    }

    return MComponent;
})();

/* Test sample code

document.querySelector('body').innerHTML = "<div id='myObj'></div>";
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


function mycomp (template) {
    
    this.super.call(this);
    this.template = template;
}

MComponent.extend(mycomp);

mycomp.prototype.mcOnInit = function(){
    this.name = 'Steve',
    this.lastName = "Smith";
    this.age = 32;
    this.dept = 'sales';
    this.alias =  "Steve";
}

var myObj = new mycomp(sampletemplate);

myObj._init(
    document.getElementById('myObj')
);
myObj._initialRender();

*/
