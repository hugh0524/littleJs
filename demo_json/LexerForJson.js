/**
 * Created by yinhe on 2020/2/10.
 */

// token 含义type 和value 属性
function Token (type, value) {
    this.type = type;
    this.value = value || '';
}

Utils = {
    // 是 0~9
    isNum(ch) {
        return /^\d$/.test(ch)
    },
    // 是字母
    isAlpha(ch) {
        return /^([a-z]|[A-Z])$/.test(ch)
    },
    // 判断空格
    isBlank(ch) {
        return ch == ' ' || ch == '\t' || ch == '\n';
    }
}

/**
 * 解析JSON的TOKENS
 *
 *
 *
 */
class LexerForJson {
    constructor(code) {
        // 定义状态机的状态
        this.DfaState = {
            Initial: "Initial",
            SemiColon:"SemiColon", Comma: "Comma", //,
            Colon: "colon", // :
            Dot: "Dot",
            LeftBrace: "LeftBrace", RightBrace:"RightBrace", // {}
            LeftBracket: "LeftBracket",RightBracket: "RightBracket", // []
            Quotes: "Quotes", //"
            Num:"Num",String:"String",
            Null: "null", Null_1: "null_1", Null_2: "null_2", Null_3: "null_3",
            True: "True", True_1: "True_1",True_2: "True_2",True_3: "True_3",
            False: "False", False_1: "False_1",False_2: "False_2",False_3: "False_3",False_4: "False_4"
        }

        this.tokenMap = {
            "(": this.DfaState.LeftParen,
            ")": this.DfaState.RightParen,
            "{": this.DfaState.LeftBrace,
            "}": this.DfaState.RightBrace,
            "[": this.DfaState.LeftBracket,
            "]": this.DfaState.RightBracket,
            ",": this.DfaState.Comma,
            ":": this.DfaState.Colon,
            '.': this.DfaState.Dot,

        }

        this.tokens = []

        this.code = code;

        this.token = null;
        this.tokensTmpl = [];
    }
    
    tokenRead() {
        if(this.tokens.length > 0) {
           let t = this.tokens.shift()
           this.tokensTmpl.push(t);
           return t;
        }
        return null
    }
    tokenUnRead(token) {
        this.tokens.unshift(token)
    }
    tokenPeek() {
        return this.tokens[0]
    }
    // 记录标识
    tokenSignPos() {
        return this.tokensTmpl.length
    }
    tokenRePushByPos(index){
        this.tokensTmpl.splice(index).reverse().forEach(t => {
            this.tokenUnRead(t)
        })
    }


    /**
     * 1. 将原token放入到tokens, 初始化token
     * 2. 判断下一个状态
     */
    toInitial(ch) {

        if(this.token && this.token.value.length > 0) {
            this.tokens.push(this.token)
        }
        this.token = new Token();

        let state = this.DfaState.Initial // 初始化状态
        // console.log("=====", ch)
        if(ch === '"'){
            state = this.DfaState.String
            this.token.type = state
            this.token.value = this.token.value + '';
        } else if(Utils.isAlpha(ch)) {
            if(ch === 'n') {
                state = this.DfaState.Null_1
            } else if(ch === 't') {
                state = this.DfaState.True_1
            } else if(ch === 'f') {
                state = this.DfaState.False_1
            } else {
                // 其他的非"开始的数据将报错
                throw Error(`不支持的Token: ${ch}`)
            }
            this.token.type = state
            this.token.value = this.token.value + ch;
        } else if(Utils.isNum(ch)) {
            state = this.DfaState.Num
            this.token.type = this.DfaState.Num
            this.token.value = this.token.value + ch;
        } else if (this.tokenMap[ch]) {
            state = this.tokenMap[ch]
            this.token.type = this.tokenMap[ch]
            this.token.value = this.token.value + ch;
        } else if(ch === " ") {
            this.token.value = ""; // 用于跳过
        } else {
            throw Error(`不支持的Token: ${ch}`)
        }

        return state;
    }

    switchState(newState, val) {
        this.token.type = newState
        this.token.value = this.token.value + val;
        return newState
    }

    /**
     * 运行自动机,解析出token
     *
     *
     * 
     */
    dfaParse() {
        let code = this.code
        let codeLen = code.length;
        let chIndex = 0;
        let ch = ''
        let state = this.DfaState.Initial // 初始化状态
        while(chIndex < codeLen) {
            ch = code.charAt(chIndex);
             // console.log("===1",ch, state)
            switch(state) {
                case this.DfaState.Initial:
                    state = this.toInitial(ch)
                    break;
                // 首先处理字符串, 以"开始
                case this.DfaState.String:
                    if(ch === '"') {
                        chIndex++;
                        state = this.toInitial(code.charAt(chIndex))
                    } else if(Utils.isAlpha(ch) || Utils.isNum(ch)) {
                        state = this.switchState(this.DfaState.String, ch)
                    } else {
                        throw Error(`String类型中不支持该字符: ${ch}`)
                    }
                    break;
                case this.DfaState.Null_1:
                    if(ch === 'u') {
                        state = this.switchState(this.DfaState.Null_2, ch)
                    } else {
                        throw Error(`您是想输入null吗? `)
                    }
                    break;
                case this.DfaState.Null_2:
                    if(ch === 'l') {
                        state = this.switchState(this.DfaState.Null_3, ch)
                    } else {
                        throw Error(`您是想输入null吗? `)
                    }
                    break;
                case this.DfaState.Null_3:
                    if(ch === 'l') {
                        state = this.switchState(this.DfaState.Null, ch)
                    } else {
                        throw Error(`您是想输入null吗? `)
                    }
                    break;
                case this.DfaState.Null:
                    state = this.toInitial(ch)
                    break;
                case this.DfaState.True_1:
                    if(ch === 'r') {
                        state = this.switchState(this.DfaState.True_2, ch)
                    } else {
                        throw Error(`您是想输入true吗? `)
                    }
                    break;
                case this.DfaState.True_2:
                    if(ch === 'u') {
                        state = this.switchState(this.DfaState.True_3, ch)
                    } else {
                        throw Error(`您是想输入true吗? `)
                    }
                    break;
                case this.DfaState.True_3:
                    if(ch === 'e') {
                        state = this.switchState(this.DfaState.True, ch)
                    } else {
                        throw Error(`您是想输入true吗? `)
                    }
                    break;
                case this.DfaState.True:
                    state = this.toInitial(ch)
                    break;
                case this.DfaState.False_1:
                    if(ch === 'a') {
                        state = this.switchState(this.DfaState.False_2, ch)
                    } else {
                        throw Error(`您是想输入false吗? `)
                    }
                    break;
                case this.DfaState.False_2:
                    if(ch === 'l') {
                        state = this.switchState(this.DfaState.False_3, ch)
                    } else {
                        throw Error(`您是想输入false吗? `)
                    }
                    break;
                case this.DfaState.False_3:
                    if(ch === 's') {
                        state = this.switchState(this.DfaState.False_4, ch)
                    } else {
                        throw Error(`您是想输入false吗? `)
                    }
                    break;
                case this.DfaState.False_4:
                    if(ch === 'e') {
                        state = this.switchState(this.DfaState.False, ch)
                    } else {
                        throw Error(`您是想输入false吗? `)
                    }
                    break;
                case this.DfaState.False:
                    state = this.toInitial(ch)
                    break;
                case this.DfaState.Num:
                    if(Utils.isNum(ch) || ch === "."){
                        state = this.switchState(this.DfaState.Num, ch)
                    } else if(!Utils.isNum(ch)) {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.LeftParen:
                case this.DfaState.RightParen:
                case this.DfaState.LeftBrace:
                case this.DfaState.RightBrace:
                case this.DfaState.LeftBracket:
                case this.DfaState.RightBracket:
                case this.DfaState.SemiColon:
                case this.DfaState.Comma:
                case this.DfaState.Colon:
                case this.DfaState.Dot:
                    state = this.toInitial(ch)
                    break;
                default:

            }
            chIndex++;

        }
        // 字符
        state = this.toInitial(ch)

    }


}

module.exports = LexerForJson

// test

function main () {
    let obj = {a:1, b: "1", c:[1,3.3, {a:1}]}
    let lexer = new LexerForJson(JSON.stringify(obj))
    lexer.dfaParse()
    console.log(lexer.tokens)

    // 测试错误
    let lexer2 = new LexerForJson('{"a" : tru}')
    lexer2.dfaParse()
    console.log(lexer2.tokens)
}

// main()
