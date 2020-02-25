/**
 * Created by yinhe on 2020/2/13.
 */


class AstNode{
    constructor(type, value) {
        this.type = type;
        this.value = value || '';
        this.children = []
        this.parent = null;
    }

    addChild(child) {
        this.children.push(child)
        //child.parent = this;
        child.setParent(this)
    }


    getValue() {
        let last = ''
        for(let i =0; i< this.children.length; i++){
            let child = this.children[i]
            last = child.getValue()
        }

        return last
    }

    getRef() {
        return this.value
    }
    
    /**
     * v0.0.5 改成set监听
     * @param p
     */
    setParent(p) {
        this.parent = p
    }
    
    getParent(type) {
        let p = this.parent;
        while(p) {
            if(type) {
                if(type === p.type) {
                    return p;
                } else {
                    p = p.parent
                }
            } else {
                return p
            }
        }
        return p;
    }

    showStructure() {
        return {
            type: this.type,
            value: this.value,
            children: this.children.map(item => {return item.showStructure()})
        }
    }
    
}


module.exports = AstNode