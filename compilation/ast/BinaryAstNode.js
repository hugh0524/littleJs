/**
 * Created by yinhe on 2020/2/13.
 */

const AstNode = require("./AstNode")
const TokenEnum = require("../lexer/TokenEnum")

class BinaryAstNode  extends AstNode{
    constructor(type, value, opera) {
        super(type, value)
        this.opera = opera;
        this.left = null;
        this.right = null;
    }

    getValue(){
         console.log('=====binary params', this.opera, this.left.getValue(), this.right.getValue())
        switch(this.opera) {
            case TokenEnum.type.Addition:
            case "Plus":
                return this.left.getValue() + this.right.getValue();
            case TokenEnum.type.Subtraction:
            case "Minus":
                return this.left.getValue() - this.right.getValue();
            case TokenEnum.type.Multiplication:
            case "Star":
                return this.left.getValue() * this.right.getValue();
            case TokenEnum.type.Division:
            case "Slash":
                return this.left.getValue() / this.right.getValue();
            case TokenEnum.type.LeftShift:
            case "LeftShirt":
                return this.left.getValue() << this.right.getValue();
            case TokenEnum.type.RightShift:
            case "RightShirt":
                return this.left.getValue() >>> this.right.getValue();
            case TokenEnum.type.UnsignedRightShift:
            case "RightShirt2":
                return this.left.getValue() >>> this.right.getValue();
            case TokenEnum.type.Remainder:
            case "Mod":
                return this.left.getValue() % this.right.getValue();
            case TokenEnum.type.GT:
            case "GT":
                return this.left.getValue() > this.right.getValue();
            case TokenEnum.type.GE:
            case "GE":
                return this.left.getValue() >= this.right.getValue();
            case TokenEnum.type.LT:
            case "LT":
                return this.left.getValue() < this.right.getValue();
            case TokenEnum.type.LE:
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