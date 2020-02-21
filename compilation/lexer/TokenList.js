/**
 * Created by yinhe on 2020/2/18.
 */


class TokenList{

    constructor() {
        this.tokens = [];
        this.tokensTmpl = []
    }


    read() {
        if(this.tokens.length > 0) {
            let t = this.tokens.shift()
            this.tokensTmpl.push(t);
            return t;
        }
        return null
    }
    unRead(token) {
        this.tokens.unshift(token)
    }
    peek() {
        return this.tokens[0]
    }
    // 记录标识
    signPos() {
        return this.tokensTmpl.length
    }
    
    rePushByPos(index){
        this.tokensTmpl.splice(index).reverse().forEach(t => {
            this.unRead(t)
        })
    }

}

module.exports = TokenList;