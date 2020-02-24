/**
 * Created by yinhe on 2020/2/15.
 */

const Scope = require("./Scope")

/**
 * 代码空间
  */
class CodeScope extends Scope{
    /**
     * 
     * @param name 名称
     * @param type 类型 
     */
    constructor() {
        super('', "CODE")
    }

}

module.exports = CodeScope