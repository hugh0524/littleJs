/**
 * Created by yinhe on 2020/2/18.
 */

const TokenEnum = require("./TokenEnum")
    
class Token {
    /**
     * 
     * @param type token类型
     * @param value token 值
     * @param parentType  父类型
     */
    constructor(type, value, parentType) {
        this.type = type;
        this.value = value;
        this.parentType = parentType;
    }
    

    /**
     * 获取类型 或父类型
     * @returns {*}
     */
    getType() {
        return this.type || this.parentType
    }
}

module.exports = Token;