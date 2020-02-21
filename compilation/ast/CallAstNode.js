/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const AstNode = require("./AstNode")

const FunctionScope = require("../scope/FunctionScope")
const TokenEnum = require("../lexer/TokenEnum")

/**
 * v0.0.5
 * v0.0.6 new 和call改变继承顺序
 */
class CallAstNode extends AstNode{
    constructor(type, value) {
        super(type, value)
        this.callee = null;
        this.arguments = null;
    }


    addCallee(child) {
        this.callee = child
        super.addChild(child)
    }

    addArgument(child) {
        if(!this.arguments) {
            this.arguments = []
        }
        this.arguments.push(child)
    }

    addArguments(childs) {
        if(childs) {
            for(let i = 0; i< childs.length; i++) {
                this.addArgument(childs[i])
            }
        }
    }

    /**
     * new
     *  指向一个新的对象
     * call
     *  指向调用者, 调用者如果是memberExpression, 则this未对应member Ref
     *             调用者类型如果是Identifier(即无调用者), 则 this指向全局
     *
     * @private
     */
    _createThisArg() {
        if(this.callee) {
            if(this.callee.type === "Member") {
                // this 指向 Ref(callee.object)
                return this.callee.object.getRef();
            }
        }
        // 指向全局作用域
        return stack.getRootScope().variables

    }

    /**
     * 运行时, 创建函数作用域
     * @returns {*}
     */
    getValue(){
        // 根据callee 找到对应的fun
        if(this.callee) {
            // 从当前作用域内查找
            let funcNode = stack.getVal(this.callee.getRef())
            if(funcNode) {
                // 创建函数作用域
                let fs = new FunctionScope(funcNode.id.getRef(), this.type);
                stack.pushFrame(fs)
                // v0.0.6 
                stack.addVar("this", this._createThisArg())
                let funParams = funcNode.params;
                // arguments 处理参数
                // 参数里的标识符, 需要绑定注入到当前作用域
                if(this.arguments) {
                    for(let i=0; i< this.arguments.length; i++) {
                        let arg = this.arguments[i]
                        let fParam = funParams[i]
                        // v0.0.5 只对function定义的属性注入
                        if(fParam) {
                            if(arg.type === 'Num' || arg.type === TokenEnum.type.NumericLiteral || arg.type === TokenEnum.type.StringLiteral || arg.type === TokenEnum.type.BooleanLiteral) {
                               console.log("=====call ---args", fParam.getRef(), arg.getValue())
                                stack.setVal(fParam.getRef(), arg.getValue())
                            } else if(arg.type === TokenEnum.type.Identifier) {
                                // 从作用域取值
                                stack.setVal(fParam.getRef(), stack.getVal(arg.getValue()))
                            } else {
                                // TODO
                            }
                        }

                    }
                }

                // 运行函数体部分
                let bt = funcNode.visitBody();

                // 退出作用域
                stack.popFrame();

                return bt;

            }else {
                throw Error("function is not defined")
            }
        }
        return ""

    }

    showStructure() {
        return {
            type: this.type,
            value: this.value,
            callee: this.callee.showStructure(),
            arguments: this.arguments && this.arguments.map(i => {return i.showStructure()})
        }
    }

}

module.exports = CallAstNode


