/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const AstNode = require("./AstNode")

const FunctionScope = require("../scope/FunctionScope")

/**
 * v0.0.5
 */
class NewAstNode extends AstNode{
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
     * 运行时, 创建函数作用域
     * @returns {*}
     */
    getValue(){
        // 根据callee 找到对应的fun
        if(this.callee) {
            // 从当前作用域内查找
            // console.log("==========================1", stack)
            let funcNode = stack.getVal(this.callee.getRef())
            if(funcNode) {
                // 创建函数作用域
                stack.pushFrame(new FunctionScope(funcNode.id.getRef()))
                let funParams = funcNode.params;
                // arguments 处理参数
                // 参数里的标识符, 需要绑定注入到当前作用域
                if(this.arguments) {
                    for(let i=0; i< this.arguments.length; i++) {
                        let arg = this.arguments[i]
                        let fParam = funParams[i]
                        // v0.0.5 只对function定义的属性注入
                        if(fParam) {
                            if(arg.type === 'Num') {
                                stack.setVal(fParam.getRef(), arg.getValue())
                            } else if(arg.type === "Identifier") {
                                // 从作用域取值
                                stack.setVal(fParam.getRef(), stack.getVal(arg.getValue()))
                            } else {
                                // TODO
                            }
                        }

                    }
                }

                // 运行函数体部分
                return funcNode.visitBody();

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

module.exports = NewAstNode

