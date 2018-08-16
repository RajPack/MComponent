import { View } from "./view";

export var MComponent = (function() {
    class MComponent {
        constructor() {
            this._viewRef = new View(this.template, this, componentDOMRef);
        }
        initView() {
            this._viewRef.parse();
        }

        init() {
            this._viewRef.init();
            this.mcOnInit();
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

    function _throwError(msg) {
        throw new Error(msg);
    }

    return MComponent;
})();
