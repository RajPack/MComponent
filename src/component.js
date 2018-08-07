class MComponent {
    constructor(){
        this.view = new View(this.template, this);
    }
    initView(){
        this.view.parse();
    }
}