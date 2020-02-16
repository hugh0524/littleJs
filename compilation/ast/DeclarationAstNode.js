/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const AstNode = require("./AstNode")
class DeclarationAstNode extends AstNode{
    constructor(type, value) {
        super(type, value)
        this.id = null;
        this.init = null
    }

    /**
     *
     * @returns {*}
     */
    getValue(){
       // 仅对变量赋值
       stack.setVal(this.id.value, this.init? this.init.getValue(): undefined);
        
       return stack.getVal(this.id.value);
    }

    addLeftChild(child) {
        this.id = child;
        super.addChild(child)
        // v0.0.3版本, 暂不考虑作用域链的情况
        // v0.0.5版本, 增加栈帧
        stack.addVar(child.value, undefined)
    }

    addRightChild(child) {
        this.init = child;
        super.addChild(child)
    }

    showStructure() {
        return {
            type: this.type,
            value: this.value,
            left: this.left && this.left.showStructure(),
            right: this.right && this.right.showStructure()
        }
    }

}

module.exports = DeclarationAstNode

