/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const NewAstNode = require("./NewAstNode")
/**
 * v0.0.5
 */
class CallAstNode extends NewAstNode{
    constructor(type, value) {
        super(type, value)
    }
    
}

module.exports = CallAstNode

