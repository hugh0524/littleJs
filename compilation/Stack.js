/**
 * Created by yinhe on 2020/2/14.
 */

/**
 * 简易变量存储区域
 * v0.0.3版本, 暂不考虑作用域链的情况, 使用同一的Scope存储
  */
class Stack {

    constructor() {
        this.variables = {}
    }
    
    addVar(key, value) {
        this.variables[key] = value;
    }
    
    setVal(key, value) {
        this.variables[key] = value; 
    }
    
    deleteVar(key) {
        delete this.variables[key];
    }
    
    hasVar(key) {
        return this.variables.hasOwnProperty(key)
    }
    
    getVal(key) {
        return this.variables[key]
    }

}

module.exports = new Stack()

