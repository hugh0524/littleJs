/**
 * Created by yinhe on 2020/2/13.
 */

const AstNode = require("./AstNode")

class BinaryAstNode  extends AstNode{
    constructor(type, value, opera) {
        super(type, value)
        this.opera = opera;
        this.left = null;
        this.right = null;
    }

    getValue(){
        // console.log('=====binary params', this.opera, this.left.getValue(), this.right.getValue())
        switch(this.opera) {
            case "Plus":
                return this.left.getValue() + this.right.getValue();
            case "Minus":
                return this.left.getValue() - this.right.getValue();
            case "Star":
                return this.left.getValue() * this.right.getValue();
            case "Slash":
                return this.left.getValue() / this.right.getValue();
            case "LeftShirt":
                return this.left.getValue() << this.right.getValue();
            case "RightShirt":
                return this.left.getValue() >>> this.right.getValue();
            case "RightShirt2":
                return this.left.getValue() >>> this.right.getValue();
            case "Mod":
                return this.left.getValue() % this.right.getValue();
            case "GT":
                return this.left.getValue() > this.right.getValue();
            case "GE":
                return this.left.getValue() >= this.right.getValue();
            case "LT":
                return this.left.getValue() < this.right.getValue();
            case "LE":
                return this.left.getValue() <= this.right.getValue();
        }
        return NaN
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
            opera: this.opera,
            left: this.left.showStructure(),
            right: this.right.showStructure()
        }
    }
}

module.exports = BinaryAstNode