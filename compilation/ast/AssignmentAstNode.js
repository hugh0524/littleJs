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
     * 左值: 取地址   -》 赋值
     * @returns {*}
     */
    getValue(){
        stack.setVal(this.left.value, this.right? this.right.getValue(): undefined);
        return stack.getVal(this.left.value);
    }

    showStructure() {
        return {
            type: this.type,
            value: this.value,
            left: this.left.showStructure(),
            right: this.right.showStructure()
        }
    }
}

module.exports = AssignmentAstNode

