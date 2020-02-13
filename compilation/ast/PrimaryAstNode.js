/**
 * Created by yinhe on 2020/2/13.
 */

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
            return this.value;
        }
        return Number(this.value);
    }
}

module.exports = PrimaryAstNode

