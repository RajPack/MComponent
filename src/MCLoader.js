// MCLoader keeps instances of MComponents apps and registers all components within a MC application

export var Loader = (() => {
    class Loader {}
    Loader.prototype.dirtyCheck = function() {
        //trigger change Detection for th application component tree
    };
})();
