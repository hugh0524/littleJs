/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const AstNode = require("./AstNode")
/**
 * v0.0.5
 * 

 * 
 */
class MemberAstNode extends AstNode{
    constructor(type, value, computed) {
        super(type, value)
        this.object = null;
        this.property = null;
        this.computed = !!computed;
    }


    addObject(child) {
        this.object = child
        super.addChild(child)
    }
    
    addProperty(child) {
        this.property = child
        super.addChild(child)
    }

    /**
     * v0.0.6
     *  对object对应的对象取proterty属性值
     * @returns {*}
     */
    getValue(){
        let val = this.object.getValue();
        if(val) {
            return val[this.property.getRef()]
        } else {
            throw Error(this.object.value + " is not defined")
        }
    }

    /**
     * v0.0.6
     *  member的Ref 为 当前对象
     */
    getRef() {
        let val = this.object.getValue();
        return val
    }

    /**
     * 设置值
     */
    setVal(val) {
        let obj = this.object.getValue();
        obj[this.property.getRef()] = val
    }

    showStructure() {
        return {
            type: this.type,
            value: this.value,
            computed: this.computed,
            object: this.object.showStructure(),
            property: this.property.showStructure(),
        }
    }

}

module.exports = MemberAstNode

