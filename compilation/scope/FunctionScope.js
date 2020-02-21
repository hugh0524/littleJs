/**
 * Created by yinhe on 2020/2/15.
 */

const Scope = require("./Scope")

/**
 * 定义 函数作用域
  */
class FunctionScope extends Scope{
    /**
     * 
     * @param name 名称
     */
    constructor(name, callType) {
        super(name, "FUNCTION")
        this._callType = callType; // 存储调用方式
    }

    setCallType(type) {
        this._callType = type;
    }
    
    
}

module.exports = FunctionScope