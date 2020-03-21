/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const BinaryAstNode = require("./BinaryAstNode")

/**
 * v0.0.6
 *      生产的AssignmentExpression：LeftHandSideExpression = AssignmentExpression的计算如下：
 *            1.令lref为计算LeftHandSideExpression的结果。
 *            2.令rref为计算AssignmentExpression的结果。
 *            3.令rval为GetValue（rref）。
 *            4.如果满足以下所有条件，则引发SyntaxError异常：
 *               Type（lref）为Reference为true
 *               IsStrictReference（lref）为true
 *               Type（GetBase（lref））是环境记录
 *               GetReferencedName（lref）是“ eval”或“ arguments”
 *            5.调用PutValue（lref，rval）。
 *            6.返回rval。
 */
class AssignmentAstNode extends BinaryAstNode{
    constructor(type, value) {
        super(type, value)
    }

    /**
     *
     * 左值: 取地址   -》 赋值
     * v0.0.6
     *  如果left 是 memberExpression,
     *
     * @returns {*}
     */
    getValue(){
        // console.log("===ass", this.left.showStructure(), this.right.showStructure())
        let rVal = this.right? this.right.getValue(): undefined;
        if(this.left.type === "Member") {
            this.left.setVal(rVal)
            //
            return rVal;
        } else {
            stack.setVal(this.left.getRef(), rVal);
            return stack.getVal(this.left.getRef());
        }

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

