class View {
    bindings;
    template;
    dataRef;
    DOMRef;
    
    constructor(template, dataref){
        this.template = template;
        this.dataRef =  dataref;
        
    }

    parse(){
        Parser.parseHTML(this.template, this.dataRef)
    }
}