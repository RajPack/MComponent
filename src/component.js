class MComponent {
    constructor(){
        this.viewRef = new View(this.template, this);
    }
    initView(){
        this.viewRef.parse();
    }
}