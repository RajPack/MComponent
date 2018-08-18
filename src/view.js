import { Parser } from "./parser";
import { Loader } from "./MCLoader";
export class View {
    bindings;
    template;
    originalDOMRef;
    dataRef;
    DOMRef;

    constructor(template, dataref, originalDOMRef) {
        this.template = template;
        this.dataRef = dataref;
        this.originalDOMRef = originalDOMRef;
        this.changeDetectionRef = new Loader();
    }

    init() {
        this.parse();
        this.initialRender();
    }

    parse() {
        this.DOMRef = Parser.parseHTML(this.template, this.dataRef);
    }
    initialRender() {
        this.originalDOMRef = viewUtils.replaceDOM(
            this.originalDOMRef,
            this.DOMRef
        );
    }
}

var viewUtils = (function() {
    replaceDOMRef = function(oldRef, newRef) {
        oldRef.parentNode.replaceChild(newRef, oldRef);
        return newRef;
    };

    return {
        replaceDOM: replaceDOMRef
    };
})();
