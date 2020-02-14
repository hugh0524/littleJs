/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const AstNode = require("./AstNode")
class IfStatementAstNode extends AstNode{
    constructor(type, value) {
        super(type, value)
        this.test = null
        this.consequent = null;
        this.alternate = null;
    }

    /**
     * 添加测试语句
     * @param child
     */
    addTest(child) {
        this.test = child;
        super.addChild(child)
    }

    /**
     * 添加if代码块
     * @param child
     */
    addConsequent(child) {
        this.consequent = child;
        super.addChild(child)
    }

    /**
     * 添加else代码块
     * @param child
     */
    addAlternate(child) {
        this.alternate = child;
        super.addChild(child)
    }

    /**
     * if 语句计算值
     * 
     * @returns {*}
     */
    getValue(){
        // console.log("=====if value", this.test.getValue())
        let testVal = !!(this.test.getValue()) // 转换成boolean
        if(testVal) {
           return this.consequent.getValue();
        } else if(this.alternate) {
            return this.alternate.getValue();
        }
    }

}

module.exports = IfStatementAstNode

