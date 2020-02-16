/**
 * Created by yinhe on 2020/2/13.
 */
const stack = require("../Stack")
const AstNode = require("./AstNode")
/**
 * v0.0.5
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
     *
     * @returns {*}
     */
    getValue(){

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

