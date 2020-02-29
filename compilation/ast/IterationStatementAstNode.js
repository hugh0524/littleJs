/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const AstNode = require("./AstNode")
class IterationStatementAstNode extends AstNode{
    constructor(type, value) {
        super(type, value)
        this.isIteration = true;
    }



}

module.exports = IterationStatementAstNode

