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
            Plus:"Plus", Minus:"Minus", Star:"Star", Slash:"Slash", Mod: "Mod",
            LeftShirt: "LeftShirt", RightShirt: "RightShirt", RightShirt2: "RightShirt2",
            DoublePlus: "DoublePlus",DoubleMinus: "DoubleMinus",
            SemiColon:"SemiColon",
            Num:"Num",
            LeftParen: "LeftParen",RightParen: "RightParen", // ()
            LeftBrace: "LeftBrace", RightBrace:"RightBrace", // {}
            If: "If", If_1: "If_1",
            Else: "Else", Else_1: "Else_1",Else_2: "Else_2",Else_3: "Else_3"

        }

        this.tokenMap = {
            "+": this.DfaState.Plus,
            "-": this.DfaState.Minus,
            "*": this.DfaState.Star,
            "/": this.DfaState.Slash,
            "%": this.DfaState.Mod,
            "(": this.DfaState.LeftParen,
            ")": this.DfaState.RightParen,
            ">": this.DfaState.GT,
            "<": this.DfaState.LT,
            "=": this.DfaState.Assignment,
            ";": this.DfaState.SemiColon,
            "{": this.DfaState.LeftBrace,
            "}": this.DfaState.RightBrace


        }

        this.tokens = []

        this.code = code;

        this.token = null;
    }
    
    tokenRead() {
        return this.tokens.length > 0 ? this.tokens.shift() : null
    }
    tokenUnRead(token) {
        this.tokens.unshift(token)
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
            } else if(ch === 'i'){
                state = this.DfaState.If_1
            } else if(ch === 'e'){
                state = this.DfaState.Else_1
            } else {
                state = this.DfaState.Identifier
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
     * fix : v0.0.1, v0.0.2 var语言的bug
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
            switch(state) {
                case this.DfaState.Initial:
                    state = this.toInitial(ch)
                    break;
                case this.DfaState.Id_var1:
                    if(ch === 'a') {
                        state = this.switchState(this.DfaState.Id_var2, ch)
                    } else if(Utils.isAlpha(ch) || Utils.isNum(ch)){
                        state = this.switchState(this.DfaState.Identifier, ch)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.Id_var2:
                    if(ch === 'r') {
                        state = this.switchState(this.DfaState.Var, ch)
                    } else if(Utils.isAlpha(ch) || Utils.isNum(ch)){
                        state = this.switchState(this.DfaState.Identifier, ch)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.Var:
                    if(Utils.isAlpha(ch) || Utils.isNum(ch)){
                        state = this.switchState(this.DfaState.Identifier,ch)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.If_1:
                    if(ch === 'f') {
                        state = this.switchState(this.DfaState.If, ch)
                    } else if(Utils.isAlpha(ch) || Utils.isNum(ch)){
                        state = this.switchState(this.DfaState.Identifier,ch)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.If:
                    if(Utils.isAlpha(ch) || Utils.isNum(ch)){
                        state = this.switchState(this.DfaState.Identifier,ch)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.Else_1:
                    if(ch === 'l') {
                        state = this.switchState(this.DfaState.Else_2, ch)
                    } else if(Utils.isAlpha(ch) || Utils.isNum(ch)){
                        state = this.switchState(this.DfaState.Identifier,ch)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.Else_2:
                    if(ch === 's') {
                        state = this.switchState(this.DfaState.Else_3, ch)
                    } else if(Utils.isAlpha(ch) || Utils.isNum(ch)){
                        state = this.switchState(this.DfaState.Identifier,ch)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.Else_3:
                    if(ch === 'e') {
                        state = this.switchState(this.DfaState.Else, ch)
                    } else if(Utils.isAlpha(ch) || Utils.isNum(ch)){
                        state = this.switchState(this.DfaState.Identifier,ch)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.Else:
                    if(Utils.isAlpha(ch) || Utils.isNum(ch)){
                        state = this.switchState(this.DfaState.Identifier,ch)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.Identifier:
                    if(Utils.isAlpha(ch) || Utils.isNum(ch)){
                        state = this.switchState(this.DfaState.Identifier, ch)
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
                    if(ch === ">") {
                        state = this.switchState(this.DfaState.LeftShirt, ch)
                    } else if(ch === "=") {
                        state = this.switchState(this.DfaState.GE, ch)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.LT:
                    if(ch === "<") {
                        state = this.switchState(this.DfaState.RightShirt, ch)
                    } else if(ch === "=") {
                        state = this.switchState(this.DfaState.LE, ch)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.RightShirt:
                    if(ch === "<") {
                        state = this.switchState(this.DfaState.RightShirt2, ch)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.Plus:
                    if(ch === "+") {
                        state = this.switchState(this.DfaState.DoublePlus, ch)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.Minus:
                    if(ch === "-") {
                        state = this.switchState(this.DfaState.DoubleMinus, ch)
                    } else {
                        state = this.toInitial(ch)
                    }
                    break;
                case this.DfaState.LeftShirt:
                case this.DfaState.RightShirt2:
                case this.DfaState.Assignment:
                case this.DfaState.DoublePlus:
                case this.DfaState.DoubleMinus:
                case this.DfaState.Star:
                case this.DfaState.Slash:
                case this.DfaState.Mod:
                case this.DfaState.GE: 
                case this.DfaState.LE:
                case this.DfaState.LeftParen:
                case this.DfaState.RightParen:
                case this.DfaState.LeftBrace:
                case this.DfaState.RightBrace:
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
    let lexer = new LexerLevel1("if(a > 2){ a= a+2;}");

    lexer.dfaParse();
    console.log(lexer.tokens)

}

main()
