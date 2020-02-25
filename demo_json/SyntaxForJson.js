/**
 * Created by yinhe on 2020/2/25.
 */

const LexerForJson = require("./LexerForJson")
const JsonValueAstNode = require("./ast/JsonValueAstNode")
const JsonObjectAstNode = require("./ast/JsonObjectAstNode")
const JsonMemberAstNode = require("./ast/JsonMemberAstNode")
const JsonArrayAstNode = require("./ast/JsonArrayAstNode")

class SyntaxForJson {
    constructor(code) {
        this.code = code;
        // 词法分析对象
        this.lexer = new LexerForJson(code)
        // 词法分析
        this.lexer.dfaParse();

        this.tokens = this.lexer.tokens;
    }

    jsonParse() {
        let node = this.jsonArray()
        if(!node) {
            node = this.jsonObject();
        }
        return node
    }

    jsonArray() {
        let nextToken = this.lexer.tokenPeek()
        let node = null;
        if(nextToken) {
            if(nextToken.type === this.lexer.DfaState.LeftBracket) {
                this.lexer.tokenRead();
                node = new JsonArrayAstNode("jsonArray", '');
                while(nextToken.type != this.lexer.DfaState.RightBracket){
                    //

                    let child = this.jsonValue()
                    if(child) {
                        node.addChild(child)
                    }

                    nextToken = this.lexer.tokenPeek()
                    if(nextToken.type == this.lexer.DfaState.Comma) {
                        this.lexer.tokenRead();
                        nextToken = this.lexer.tokenPeek()
                    }
                }

                if(nextToken.type === this.lexer.DfaState.RightBracket) {
                    this.lexer.tokenRead();
                }
            } 
        }
        
        return node;
    }

    jsonObject() {
        let nextToken = this.lexer.tokenPeek()
        let node = null;
        if(nextToken) {
            if(nextToken.type === this.lexer.DfaState.LeftBrace) {
                // 
                this.lexer.tokenRead();
                node = new JsonObjectAstNode("jsonObject", '');
                while(nextToken.type != this.lexer.DfaState.RightBrace){
                    //

                    let child = this.jsonMember()
                    if(child) {
                        node.addChild(child)
                    }
                    nextToken = this.lexer.tokenPeek()
                    if(nextToken.type == this.lexer.DfaState.Comma) {
                        this.lexer.tokenRead();
                        nextToken = this.lexer.tokenPeek()
                    }
                }
                
                if(nextToken.type === this.lexer.DfaState.RightBrace) {
                    this.lexer.tokenRead();
                }
            }
        }


        return node;
    }

    jsonMember() {
        let child = this.jsonValue();
        let node = child;
        let nextToken = this.lexer.tokenPeek()
        if(child && nextToken) {
            if(nextToken.type === this.lexer.DfaState.Colon) {
                // 
                this.lexer.tokenRead()
                node = new JsonMemberAstNode("jsonMember", "")
                node.addLeftChild(child)
                let child2 = this.jsonValue()
                if(child2) {
                    node.addRightChild(child2)
                }
                nextToken = this.lexer.tokenPeek()
            }
        }
        return node;
    }

    jsonValue() {
        
        let nextToken = this.lexer.tokenPeek()
        let node = null;
        if(nextToken) {
            if(nextToken.type === this.lexer.DfaState.Num || nextToken.type === this.lexer.DfaState.String || nextToken.type === this.lexer.DfaState.Null || nextToken.type === this.lexer.DfaState.True || nextToken.type === this.lexer.DfaState.False) {
                nextToken = this.lexer.tokenRead();
                node = new JsonValueAstNode(nextToken.type, nextToken.value)
            } else if(nextToken.type === this.lexer.DfaState.LeftBrace){
                node = this.jsonObject()
            } else if(nextToken.type === this.lexer.DfaState.LeftBracket){
                node = this.jsonArray()
            }
        }

        return node;
        
    }
    
    
}


function main () {
    let obj = {a:1, b: "1", c:[1,3.3, {a:1}]}
    let synxtax = new SyntaxForJson(JSON.stringify(obj))

    // console.log("====abc",synxtax.jsonParse().showStructure())
    console.log("====源字符串:",JSON.stringify(obj),"===parse结果",synxtax.jsonParse().getValue())
}

main();