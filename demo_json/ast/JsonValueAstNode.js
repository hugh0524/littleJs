/**
 * Created by yinhe on 2020/2/25.
 */

const AstNode = require("./AstNode")

class JsonValueAstNode extends AstNode {

    constructor(type, value) {
        super(type, value)

        
    }
    
    getValue() {
        if(this.type === "Num") {
            return Number(this.value)
        } else if(this.type === "String") {
            return String(this.value)
        } else if(this.type === "Null") {
            return null
        } else if(this.type === "true") {
            return true
        } else if(this.type === "false") {
            return false
        }
    }
    
    
}

module.exports = JsonValueAstNode