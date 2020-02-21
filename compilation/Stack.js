/**
 * Created by yinhe on 2020/2/14.
 */

/**
 * 简易变量存储区域
 * v0.0.3版本, 暂不考虑作用域链的情况, 使用同一的Scope存储
 *
 * v0.0.5 版本,
 *  新增栈帧结构
 *  作用域 暂时支持  全局作用于 -》 函数作用域
 *
 *
 *
 * @version v0.0.5
 */

const GlobalScope = require("./scope/GlobalScope")
class Stack {

    constructor() {
        this.stackFrames = []
        this.variables = {}
        this._globalScope = null;
        this._initGlobal()
        this._index = 0;
    }

    _initGlobal() {
        let gc = new GlobalScope();
        gc.addVar('this', gc.variables); // 模拟this, 每个作用域都有一个this, 全局的this指向本身的属性对象
        this._globalScope = gc;
        return this.pushFrame(gc);
    }
    
    getRootScope() {
        return this._globalScope;
    }

    getIndex() {
        return "_scope_"+this._index++;
    }

    pushFrame(scope) {
        this.stackFrames.push(scope)
    }

    popFrame() {
        return this.stackFrames.pop()
    }
    peekFrame() {
        return this.stackFrames[this.stackFrames.length-1]
    }


    /**
     * v0.0.5
     *   往当前作用域添加值
     * @param key
     * @param value
     */
    addVar(key, value) {
        // this.variables[key] = value;
        let curScope = this.peekFrame()
        if(curScope) {
            curScope.addVar(key, value)
        }

    }

    /**
     * TODO
     * @param key
     */
    deleteVar(key) {
        // delete this.variables[key];
    }

    /**
     * 按作用域链添加 TODO
     * @param key
     * @param value
     */
    setVal(key, value) {
        // this.variables[key] = value;
        this.addVar(key, value)
    }
    

    hasVar(key) {
        let curScope = this.peekFrame()
        if(curScope) {
            if(curScope.hasVar(key)) {
                return true
            } else {
                let pc = curScope.parentScope
                while(pc) {
                    if(pc.hasVar(key)) {
                        return true;
                    }
                    pc = pc.parentScope;
                }
            }
        }
        return false
    }
    
    getVal(key) {
        let curScope = this.peekFrame()
        if(curScope) {
            if(curScope.hasVar(key)) {
                return curScope.getVal(key)
            } else {
                let pc = curScope.parentScope
                while(pc) {
                    if(pc.hasVar(key)) {
                        return pc.getVal(key);
                    }
                    pc = pc.parentScope;
                }
            }
        }
        return undefined
    }

}

module.exports = new Stack()

