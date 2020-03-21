/**
 * Created by yinhe on 2020/2/13.
 */

const stack = require("../Stack")
const TokenEnum = require("../lexer/TokenEnum")
const AstNode = require("./AstNode")
        
class ContinueAstNode extends AstNode{
    constructor() {
        super(TokenEnum.type.CONTINUE, "continue")
    }


    getValue() {

    }



    showStructure() {
        return {
            type: this.type,
            value: this.value,
        }
    }
    
}


module.exports = ContinueAstNode