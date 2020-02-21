/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const CallAstNode = require("./CallAstNode")
/**
 * v0.0.5
 */
class NewAstNode extends CallAstNode{
    constructor(type, value) {
        super(type, value)
    }


    /**
     * v0.0.6
     * new
     *   指向一个新的对象 (暂时不处理原型)
     * @private
     */
    _createThisArg() {
        return {};
    }
}

module.exports = NewAstNode
