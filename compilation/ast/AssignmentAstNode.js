/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const BinaryAstNode = require("./BinaryAstNode")
class AssignmentAstNode extends BinaryAstNode{
    constructor(type, value) {
        super(type, value)
    }

    /**
     * 
     * @returns {*}
     */
    getValue(){
        stack.setVal(this.left.value, this.right? this.right.getValue(): undefined);
        return stack.getVal(this.left.value);
    }
}

module.exports = AssignmentAstNode

