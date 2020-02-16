/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const AstNode = require("./AstNode")
class PrimaryAstNode extends AstNode{
    constructor(type, value) {
        super(type, value)
    }

    /**
     * 先对普通值转int处理
     * @returns {*}
     */
    getValue(){
        if(this.type === "Identifier") {
            if(stack.hasVar(this.value)) {
                // todo v0.0.3 只支持数字
                return Number(stack.getVal(this.value))
            } else {
                throw Error("Identifier " +this.value +" is not defined")
            }
        }
        return Number(this.value);
    }

    getRef() {
        return this.value
    }
}

module.exports = PrimaryAstNode

