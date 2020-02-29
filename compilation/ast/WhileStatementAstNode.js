/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const IterationStatementAstNode = require("./IterationStatementAstNode")
class WhileStatementAstNode extends IterationStatementAstNode{
    constructor(type, value) {
        super(type, value)
        this.test = null
        this.body = null;
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
     * 添加body
     * @param child
     */
    addBody(child) {
        this.body = child;
        super.addChild(child)
    }


    /**
     * while
     * 
     * @returns {*}
     */
    getValue() {
        // console.log("=====if value", this.test.getValue())
        let testVal = !!(this.test.getValue()) // 转换成boolean
        while(testVal) {
            let val = this.body.getValue();
            if(val) {
                if(val.__type__ === "continue") {
                    continue;
                }else if(val.__type__ === "break") {
                    break;
                }else if(val.__type__ === "return") {
                    return val.obj
                }
            }
        }
    }

    showStructure() {
        return {
            type: this.type,
            value: this.value,
            test: this.test && this.test.showStructure(),
            body: this.body && this.body.showStructure()
        }
    }

}

module.exports = WhileStatementAstNode

