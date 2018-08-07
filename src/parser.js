var Parser = {
    parseHTML: function (template, data) {
        //recursion code here
    }
}


function loop (loopVal, ref) {
    var arr = loopVal.split(' ');
    var dataObj = Object.create(ref);
    var ObjName = arr[0];
    var ObjRef = arr[2];
    
    ref[ObjRef].forEach(function(item, index) {
        this[ObjName] = item
        console.log(this[ObjName].street);
    }.bind(dataObj));
}

function evaluateData(dataExpr, dataRef){
  
}