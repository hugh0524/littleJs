/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const AstNode = require("./AstNode")
class ReturnStatementAstNode extends AstNode{
    constructor(type, value) {
        super(type, value)
        this.expression = null
    }

    /**
     * 添加 return 表达式
     * @param child
     */
    addExpression(child) {
        this.expression = child;
        super.addChild(child)
    }

    /**
     * 
     * TODO
     * 
     * @returns {*}
     */
    getValue(){
        // console.log("=====if value", this.test.getValue())
        return this.expression && this.expression.getValue();
    }

}

module.exports = ReturnStatementAstNode

