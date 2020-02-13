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
 * 解析简单的词法
 *
 * a > 35
 * var a = 1
 * a + b  * 3
 *
 */
class LexerLevel1 {
    constructor(code) {
        // 定义状态机的状态
        this.DfaState = {
            Initial: "Initial",
            Var:"Var", Id_var1:"Id_var1", Id_var2:"Id_var2", Id_var3:"Id_var3",
            Identifier:"Identifier",
            GT:"GT", GE:"GE", EQ: 'EQ',
            LT: "LT", LE: "LE",
            Assignment:"Assignment",
            Plus:"Plus", Minus:"Minus", Star:"Star", Slash:"Slash", Remainder: "Remainder",
            SemiColon:"SemiColon",
            Num:"Num",
            LeftParen: "LeftParen",
            RightParen: "RightParen",
        }

        this.tokenMap = {
            "+": this.DfaState.Plus,
            "-": this.DfaState.Minus,
            "*": this.DfaState.Star,
            "/": this.DfaState.Slash,
            "%": this.DfaState.Remainder,
            "(": this.DfaState.LeftParen,
            ")": this.DfaState.RightParen,
            ">": this.DfaState.GT,
            "<": this.DfaState.LT,
            "=": this.DfaState.Assignment,
            ";": this.DfaState.SemiColon,


        }

        this.tokens = []

        this.code = code;

        this.token = null;
    }
    
    tokenRead() {
        return this.tokens.length > 0 ? this.tokens.shift() : null
    }
    tokenPeek() {
        return this.tokens[0]
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

        if(Utils.isAlpha(ch)) {
            if(ch === 'v') {
                state = this.DfaState.Id_var1
            } else {
                state = this.DfaState.Identifier
            }
            this.token.type = this.DfaState.Identifier
            this.token.value = this.token.value + ch;
        } else if(Utils.isNum(ch)) {
            state = this.DfaState.Num
            this.token.type = this.DfaState.Num
            this.token.value = this.token.value + ch;
        } else if (this.tokenMap[ch]) {
            state = this.tokenMap[ch]
            this.token.type = this.tokenMap[ch]
            this.token.value = this.token.value + ch;
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
     */
    dfaParse() {
        let code = this.code
        let codeLen = code.length;
        let chIndex = 0;
        let ch = ''
        let state = this.DfaState.Initial // 初始化状态
        while(chIndex < codeLen) {
            ch = code.charAt(chIndex);
            switch(state) {
                case this.DfaState.Initial:
                    state = this.toInitial(ch)
                    break;
                case this.DfaState.Id_var1:
                    if(ch === 'a') {
                        state = this.DfaState.Id_var2
                        this.token.value = this.token.value + ch;
                    } else if(Utils.isAlpha(ch) || Utils.isNum(ch)){
                        state = this.switchState(this.DfaState.Identifier)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.Id_var2:
                    if(ch === 'r') {
                        state = this.DfaState.Id_var2
                        this.token.value = this.token.value + ch;
                    } else if(Utils.isAlpha(ch) || Utils.isNum(ch)){
                        state = this.switchState(this.DfaState.Identifier)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.Id_var3:
                    if(Utils.isAlpha(ch) || Utils.isNum(ch)){
                        state = this.switchState(this.DfaState.Identifier)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.Identifier:
                    if(Utils.isAlpha(ch) || Utils.isNum(ch)){
                        state = this.switchState(this.DfaState.Identifier)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.Num:
                    if(!Utils.isNum(ch)) {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.GT:
                case this.DfaState.Assignment:
                case this.DfaState.Plus:
                case this.DfaState.Minus:
                case this.DfaState.Star:
                case this.DfaState.Slash:
                case this.DfaState.LeftParen:
                case this.DfaState.RightParen:
                case this.DfaState.SemiColon:
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

module.exports = LexerLevel1

// test

function main () {
    let lexer = new LexerLevel1("var a = 1");

    let lexer4 = new LexerLevel1("2 + (4 + 3)");

    lexer4.dfaParse();
    console.log(lexer4.tokens)
}

main()
