/**
 * Created by yinhe on 2020/2/25.
 */


const AstNode = require("./AstNode")

class JsonArrayAstNode extends AstNode {

    constructor(type, value) {
        super(type, value)
        
        
    }

    
    getValue() {
        let arr = [];
        for(let i =0; i< this.children.length; i++){
            let child = this.children[i]
            arr.push(child.getValue())
        }
        return arr;
    }

}

module.exports = JsonArrayAstNode