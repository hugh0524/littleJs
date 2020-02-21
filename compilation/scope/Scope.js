/**
 * Created by yinhe on 2020/2/15.
 */

/**
 * 定义作用域
  */
class Scope {
    /**
     * 
     * @param name 名称
     * @param type 类型 
     */
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.parentScope = null; // 父级作用域, 用于链式查找
        this.variables = {};
    }

    /**
     * 在当前作用域查找,赋值
     * @param key
     * @param value
     */
    addVar(key, value) {
        this.variables[key] = value;
    }

    setVal(key, value) {
        this.variables[key] = value;
    }

    deleteVar(key) {
        delete this.variables[key];
    }

    /**
     * 按作用域链查找
     * @param key
     * @returns {boolean}
     */
    hasVar(key) {
        return this.variables.hasOwnProperty(key)
    }

    /**
     * 按作用域链查找求值
     * @param key
     * @returns {*}
     */
    getVal(key) {
        return this.variables[key]
    }
}

module.exports = Scope