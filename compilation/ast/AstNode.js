/**
 * Created by yinhe on 2020/2/13.
 */

const stack = require("../Stack")
const TokenEnum = require("../lexer/TokenEnum")
        
class AstNode{
    constructor(type, value) {
        this.type = type;
        this.value = value || '';
        this.children = []
        this.parent = null;
        this._index = stack.getIndex();
    }

    addChild(child) {
        child && this.children.push(child)
        //child.parent = this;
        child && child.setParent(this)
    }


    getValue() {
        let funcParent = this.getParent("Function");
        let last = ''
        for(let i =0; i< this.children.length; i++){
            let child = this.children[i]
            if(funcParent) {
                // function 内才支持return
                if(child.type === "Return" || child.type === TokenEnum.type.RETURN) {
                    return child.getValue()
                }
            } else {
                let isInIteration = this.isInIteration();
                // console.log("====", isInIteration, child.type,TokenEnum.type.CONTINUE)
                if(isInIteration) {
                    if(child.type === TokenEnum.type.CONTINUE ) {
                        return {__type__: "continue"}
                    } else if(child.type === TokenEnum.type.BREAK) {
                        return {__type__: "break"}
                    } else if(child.type === TokenEnum.type.RETURN) {
                        return {__type__: "return", obj: child.getValue()}
                    }
                }
            }
            last = child.getValue()
            // v0.0.7 fix 语句中断
            if(last && ["continue", "break", "return"].includes(last.__type__)){
                return last;
            }
        }
        // v0.0.6 如果是函数内, 并且通过new调用的, 需要返回 this
        if(funcParent) {
            let curF = stack.peekFrame()
            if(curF.type === "FUNCTION" && curF._callType === "newExpression") {
                return curF.getVal("this")
            }
            return undefined
        }
        return last
    }

    getRef() {
        return this.value
    }
    
    /**
     * v0.0.5 改成set监听
     * @param p
     */
    setParent(p) {
        this.parent = p
    }
    
    getParent(type) {
        let p = this.parent;
        while(p) {
            if(type) {
                if(type === p.type) {
                    return p;
                } else {
                    p = p.parent
                }
            } else {
                return p
            }
        }
        return p;
    }

    /**
     * v0.0.7 简单查找直接或间接父级是否是迭代语句
     * 
     * @returns {boolean}
     */
    isInIteration() {
        let p = this.parent;
        while(p) {
            if(p.isIteration) {
                return true;
            } else {
                p = p.parent
            }
        }
        return false;
    }

    showStructure() {
        return {
            type: this.type,
            value: this.value,
            children: this.children.map(item => {return item.showStructure()})
        }
    }
    
}


module.exports = AstNode