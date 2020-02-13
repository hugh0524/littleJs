/**
 * Created by yinhe on 2020/2/13.
 */


class AstNode{
    constructor(type, value) {
        this.type = type;
        this.value = value || '';
        this.children = []
        this.parent = null
    }

    addChild(child) {
        this.children.push(child)
        child.parent = this;
    }


    getValue() {
        return this.value
    }
}


module.exports = AstNode