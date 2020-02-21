/**
 * Created by yinhe on 2020/2/18.
 */

/**
 *
  */
class CharSet {
    /**
     *
     * @param from 起始字符
     * @param to 缺省为form
     * @param exclude
     */
    constructor(from, to, exclude) {
        this.formChar = from
        this.toChar = to ?  to : form;

        this.exclude = !!exclude

        this.subSet = null
    }

    isDigit() {
        return this.formChar >= 0 && this.toChar <=9;
    }

    isLetter(isSmall) {
        if(isSmall) {
            return this.formChar >= 'a' && this.toChar<='z'
        } else {
            return this.formChar >= 'A' && this.toChar<='Z'
        }
    }

    addChildChar(charSet) {
        if(!this.subSet) {
            this.subSet = []
        }

        this.subSet.push(charSet)
    }

    /**
     * 查看是否匹配
     * @param ch
     * @returns {boolean}
     */
    match(ch) {
        let rtn = false;
        if(this.subSet && this.subSet.length > 0) {
            for(let sSet of this.subSet){
                rtn = sSet.match(ch);
                if (rtn){
                    break;
                }
            }
        } else {
            rtn = (this.formChar <= ch && ch <= this.toChar);
        }

        if(this.exclude) {
            rtn = !rtn
        }

        return rtn;
    }





}

module.exports = CharSet;