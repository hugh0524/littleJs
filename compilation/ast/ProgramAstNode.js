/**
 * Created by yinhe on 2020/2/13.
 */

const stack = require("../Stack")
const AstNode = require("./AstNode")
class ProgramAstNode extends AstNode{
    constructor() {
        super("Program", "program")
        
    }

    /**
     * 初始化
     */
    init() {
        // 初始化全局作用于
        
    }
    
    
}


module.exports = ProgramAstNode