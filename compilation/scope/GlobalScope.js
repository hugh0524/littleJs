/**
 * Created by yinhe on 2020/2/15.
 */

const Scope = require("./Scope")
/**
 * 定义全局作用域
  */
class GlobalScope extends Scope{
    /**
     * 
     * @param name 名称
     * @param type 类型 
     */
    constructor() {
        super("global", "GLOBAL")
    }
    
}

module.exports = GlobalScope