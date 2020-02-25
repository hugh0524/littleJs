/**
 * Created by yinhe on 2020/2/25.
 */


const AstNode = require("./AstNode")

class JsonMemberAstNode extends AstNode {

    constructor(type, value) {
        super(type, value)
        this.left = null
        this.right = null
        
    }

    addLeftChild(child) {
        this.left = child;
        super.addChild(child)
    }

    addRightChild(child) {
        this.right = child;
        super.addChild(child)
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

module.exports = JsonMemberAstNode