import {Parser } from './parser';
export class View {
    bindings;
    template;
    dataRef;
    DOMRef;
    
    constructor(template, dataref){
        this.template = template;
        this.dataRef =  dataref;
        
    }

    init(){
        
    }

    parse(){
        this.DOMRef = Parser.parseHTML(this.template, this.dataRef)
    }
}