/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const IterationStatementAstNode = require("./IterationStatementAstNode")
class ForStatementAstNode extends IterationStatementAstNode{
    constructor(type, value) {
        super(type, value)
        this.init = null;
        this.update = null;
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

    addInit(child) {
        this.init = child;
        super.addChild(child)
    }

    addUpdate(child) {
        this.update = child;
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
        // Let exprRef be the result of evaluating ExpressionNoIn.
        // Call GetValue(exprRef). (This value is not used but the call may have side-effects.)
        let initValue = this.init ? this.init.getValue() : null;

        //
        let testVal = this.test ? !!(this.test.getValue()) : true // 转换成boolean

        while(testVal) {
            let val = this.body.getValue();

            if(val) {
                if(val.__type__ === "break") {
                    break;
                }else if(val.__type__ === "return") {
                    return val.obj
                }
            }
            // continue的操作同 普通语句

            // Let incExprRef be the result of evaluating the second Expression.
            this.update && this.update.getValue()

            // 更新test 标识
            testVal = this.test ? !!(this.test.getValue()) : true
            if(!testVal){
                return {__type__:"normal", obj: val && val.obj}
            }

        }
    }

    showStructure() {
        return {
            type: this.type,
            value: this.value,
            init: this.init && this.init.showStructure(),
            test: this.test && this.test.showStructure(),
            update: this.update && this.update.showStructure(),
            body: this.body && this.body.showStructure()
        }
    }

}

module.exports = ForStatementAstNode

