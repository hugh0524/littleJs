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
        let last = ''
        for(let i =0; i< this.children.length; i++){
            let child = this.children[i]
            last = child.getValue()
        }
        return last
    }
}


module.exports = AstNode