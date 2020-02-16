/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")

const AstNode = require("./AstNode")
class FunctionDeclarationAstNode extends AstNode{
    constructor(type, value) {
        super(type, value)
        this.id = null;
        this.params = null;
        this.body = null;
        this._scopeParent = null;
    }

    addId(id) {
        this.id = id;
        // 创建变量

    }

    /**
     * 函数变量初始化
     * @private
     */
    _initDeclaration() {
        var p = this.getParent(this.type)
        if(p) {
            // 某一父级是函数, 暂时不初始化, 只记录词法上的级别
            this._scopeParent = p.id.getRef();
        } else {
            // 父级是全局作用于, 直接创建引用即可, 类似变量提升
            stack.addVar(this.id.getRef(), this)
        }
    }

    /**
     *
     * @param p
     */
    setParent(p) {
        super.setParent(p)
        this._initDeclaration();
    }

    addParams(param) {
        if(!this.params) {
            this.params = [];
        }
        this.params.push(param)
    }

    addBody(child) {
        this.body = child
        super.addChild(child)
    }

    /**
     *
     *
     * @returns {*}
     */
    getValue(){
         // 运行函数体内的语句即可
        // return this.body && this.body.getValue()

    }
    
    visitBody() {
        return this.body && this.body.getValue()
    }

    showStructure() {
        return {
            type: this.type,
            value: this.value,
            id: this.id && this.id.showStructure(),
            params: this.params && this.params.map(p => {return p.showStructure()}),
            body: this.body && this.body.showStructure()
        }
    }


}

module.exports = FunctionDeclarationAstNode

