/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const AstNode = require("./AstNode")

const TokenEnum = require("../lexer/TokenEnum")
/**
 * v0.0.6 类型完善
 */
class PrimaryAstNode extends AstNode{
    constructor(type, value) {
        super(type, value)
    }

    /**
     * 先对普通值转int处理
     * v0.0.6 
     *   增加this支持
     *   类型支持
     * 
     * @returns {*}
     */
    getValue(){
        if(this.type === TokenEnum.type.Identifier) {
            if(stack.hasVar(this.value)) {
                // v0.0.6 类型系统支持
                return stack.getVal(this.value)
            } else {
                throw Error("Identifier " +this.value +" is not defined")
            }
        } else if(this.type === TokenEnum.type.THIS) {
            return stack.getVal("this")
        } else if(this.type === TokenEnum.type.StringLiteral) {
            return this.value
        } else if(this.type === TokenEnum.type.NumericLiteral) {
            return Number(this.value);
        } else if(this.type === TokenEnum.type.BooleanLiteral) {
            return this.value === 'true';
        }
        return Number(this.value);
    }

    getRef() {
        return this.value
    }
}

module.exports = PrimaryAstNode

