/**
 * Created by yinhe on 2020/2/25.
 */


const AstNode = require("./AstNode")

class JsonObjectAstNode extends AstNode {

    constructor(type, value) {
        super(type, value)
        
        
    }

    getValue() {
        let obj = {}
        for(let i =0; i< this.children.length; i++){
            let child = this.children[i]
            obj[child.left.getValue()] = child.getValue()
        }
        return obj;
    }


}

module.exports = JsonObjectAstNode