/**
 * Created by yinhe on 2020/2/17.
 */


const TokenList = require("./lexer/TokenList")
const Token = require("./lexer/Token")
const TokenEnum = require("./lexer/TokenEnum")

/**
 * v0.0.6
 *
 * 词法分析器
 *
 * 1. 使用正则工具解析词法
 *
 *
 *
 *
 */
class LexerLevel2 {
    constructor(code) {
        this.code = code;

        this.regexpList = [
            // "break|else|new|var|case|finally|return|void|catch|for|switch|while|continue|function|this|with|default|if|throw|delete|in|try|do|instanceof|typeof", // 保留字
            // "abstract|enum|int|short|boolean|export|interface|static|byte|extends|long|super|char|final|native|synchronized|class|float|package|throws|const|goto|private|transient|debugger|implements|protected|volatile|double|import|public", // 未来保留字
            // "null|true|false", // null, boolean常量
            ...TokenEnum.keyWords,
            "[a-zA-Z\$_][a-zA-Z0-9\$_]*", // 标识符
            "[0-9]+", // 数字字面量
            "\\s|\\n|\\r", // 空格, 换行
            "\{|\}|\\(|\\)|\\[|\\]|\\.|;|\,|===|\!=|\!==|<<=|>>=|>>>=|>>>|<<|>>|<=|>=|==|<|>|\-\-|\\+=|\-=|\\*=|%=|&&|&=|\\|=|\^=|\\+\\+|\\+|\-|\\*|%|&|\\^|\!|\~|\\|\\||\\?|\:|=", // 标点符号
            "\".*\"|\'.*\'", // 字符串
            "\"|\'|`", // " '
        ]

        this.regExpCmd = new RegExp("^" + this.regexpList.join("|"))

        this.tokenTypes = /**关键字**/TokenEnum.keyWords[0]
                .split("|").map(i => {return new Token(TokenEnum.type.KEYWORD, i, TokenEnum.type.ReservedWord)})
                .concat(
                  /**未来保留字**/
                  TokenEnum.keyWords[1]
                  .   split("|").map(i => {return new Token(TokenEnum.type.FutureReservedWord, i, TokenEnum.type.ReservedWord)})
                )
                .concat([
                    new Token(TokenEnum.type.NULL, 'null', TokenEnum.type.ReservedWord),
                    new Token(TokenEnum.type.BOOLEAN, 'true', TokenEnum.type.ReservedWord),
                    new Token(TokenEnum.type.BOOLEAN, 'false', TokenEnum.type.ReservedWord),
                ])
                .concat([

                ])

        this.tokenList = new TokenList();
        this.tokens = this.tokenList.tokens
    }

    isKeyWord(name) {
        return name && (TokenEnum.keyWords[0]+"|"+TokenEnum.keyWords[1]).split("|").includes(name);
    }

    parseTokenType(name) {
        if(name === 'true' || name === 'false') {
            return {type: TokenEnum.type.BooleanLiteral, parent: TokenEnum.type.Literal}
        } else if(TokenEnum.maps.hasOwnProperty(name.toUpperCase())) {
            return {type: TokenEnum.maps[name.toUpperCase()],parent: this.isKeyWord(name)? TokenEnum.type.ReservedWord: TokenEnum.type.PUNCTUATORS}
        } else if(/^[0-9]+$/.test(name)){ //
            return {type: TokenEnum.type.NumericLiteral, parent: TokenEnum.type.Literal}
        } else if(/^".*"|'.*'$/.test(name)) { // 字符串
            return {type: TokenEnum.type.StringLiteral, parent: TokenEnum.type.Literal}
        } else if(/^[a-zA-Z\$_][a-zA-Z0-9\$_]*$/) {
            return {type: TokenEnum.type.Identifier}
        }
        return {type: TokenEnum.type.Identifier}
    }

    // 暂时支持level1对应的方法
    tokenRead() {
        return this.tokenList.read();
    }
    tokenUnRead(token) {
        return this.tokenList.unRead();
    }
    tokenPeek() {
        return this.tokenList.peek();
    }
    // 记录标识
    tokenSignPos() {
        return this.tokenList.signPos();
    }
    tokenRePushByPos(index){
        this.tokenList.rePushByPos(index)
    }

    dfaParse() {
        this.regexpLexer();
    }
    // --------



    /**
     * 使用正则工具解析
     */
    regexpLexer() {
        let code = this.code
        let rl = this.regExpCmd;
        while(code) {
            let hasPatten = false
            let rc = code.match(rl)
            if(rc && rc[0] != "") {
                if(rc[0] != " " && rc[0] != '\n') {
                    let tt = this.parseTokenType(rc[0])
                    // console.log("====4", tt)
                    this.tokens.push(new Token(tt.type, rc[0], tt.parent))
                }
                code = code.replace(rc[0], "")
                hasPatten = true;
                // console.log(hasPatten, code, rc[0])

            }
            // for(let i = 0; i< rl.length; i++) {
            //     let rc = code.match(rl[i])
            //     if(rc && rc[0] != "") {
            //         if(rc[0] != " ")
            //             this.tokens.push(rc[0])
            //         code = code.replace(rc[0], "")
            //         hasPatten = true;
            //         // console.log(hasPatten, code, rc[0])
            //         break;
            //     }
            // }
            if(!hasPatten) {
                throw Error("not support expression:"+code)
            }
        }
        console.log(this.tokens)
    }



}

module.exports = LexerLevel2


function main () {
    let lexer = new LexerLevel2(`abc = "2";
    var $b = c();
    let d23 = true;
    if(a){
        b = a[0] >>> 2
    }
    `)
    lexer.regexpLexer()


}

// main()