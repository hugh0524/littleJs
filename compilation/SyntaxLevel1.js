/**
 * Created by yinhe on 2020/2/11.
 */

const LexerLevel = require("./LexerLevel1")
const AstNode = require("./ast/AstNode")
const BinaryAstNode = require("./ast/BinaryAstNode")
const PrimaryAstNode = require("./ast/PrimaryAstNode")

/**
 * Ast 节点对象
 * @param type
 * @param value
 * @constructor
 */
// function AstNode (type, value) {
//     this.type = type;
//     this.value = value || '';
//     this.children = []
//     this.parent = null
// }
//
// AstNode.prototype.addChild = function(child) {
//     this.children.push(child)
//     child.parent = this;
// }

/**
 * 简单语法解析器
 *
 * 语法规则基于指定的文法, 所以需要先确定文法规则(详见对应的表达式处理方法)
 *
 *
 * 由于语法解析存在优先级, 所以需要分级处理
 * 1. 定义primary Expressions
 * 2. 定义multiplicative Expression
 * 3. 定义additive Expression
 *
 * 解析如下语法:
 *   3 * 4 + 2
 *   3 * 4
 *   2 + 3 * 4
 *
 */
class SyntaxLevel1 {
    constructor(code) {
        this.code = code;
        // 词法分析对象
        this.lexerLevel = new LexerLevel(code)
        // 词法分析
        this.lexerLevel.dfaParse();

        this.tokens = this.lexerLevel.tokens;
    }


    /**
     * 解析生成AST
     */
    astParse() {
        // 低优先级的表达式预测
       return this.bitwiseShift()
    }




    /**
     * 二进制操作
     * Bitwise Shift Operators
     *
     * ShiftExpression : 
     *      AdditiveExpression
     *      ShiftExpression << AdditiveExpression 
     *      ShiftExpression >> AdditiveExpression 
     *      ShiftExpression >>> AdditiveExpression
     */
    bitwiseShift() {

        let child = this.additive();
        let node = child;
        if(child ) {
            while(true) {
                let nextToken = this.lexerLevel.tokenPeek()
                if(nextToken && (nextToken.type === this.lexerLevel.DfaState.LeftShirt || nextToken.type === this.lexerLevel.DfaState.RightShirt || nextToken.type === this.lexerLevel.DfaState.RightShirt2)) {
                    nextToken = this.lexerLevel.tokenRead();
                    let childRight = this.additive();
                    if(childRight) {
                        // 构建一个加法表达式 AstNode
                        node = new BinaryAstNode("BitwiseShift", nextToken.value, nextToken.type);
                        node.addRightChild(child)
                        node.addLeftChild(childRight)
                        child = node;
                    } else {
                        throw Error("error bitwise Expression")
                    }
                } else {
                    break;
                }
            }
        }

        return node
    }

    /**
     * 加减语法
     * Additive Operators
     * 简化如下
     * AdditiveExpression :
     *      MultiplicativeExpression
     *      AdditiveExpression + MultiplicativeExpression
     *      AdditiveExpression - MultiplicativeExpression
     *
     *
     */
    additive() {
        let tokens = this.tokens;
        let child = this.multiplicative();
        let node = child;

        if(child ) {
            while(true) {
                let nextToken = this.lexerLevel.tokenPeek()
                if(nextToken && (nextToken.type === this.lexerLevel.DfaState.Plus || nextToken.type === this.lexerLevel.DfaState.Minus)) {
                    nextToken = this.lexerLevel.tokenRead();
                    // 左侧已经满足是一个加法表达式, 判断右侧是否是一个乘法表达式
                    let childRight = this.multiplicative();
                    if(childRight) {
                        // 构建一个加法表达式 AstNode
                        node = new BinaryAstNode("Additive", nextToken.value, nextToken.type);
                        node.addRightChild(child)
                        node.addLeftChild(childRight)
                        // 上一个语句判断已经完成, 将当前add语句设为child
                        child = node;
                    } else {
                        throw Error("error Additive Expression")
                    }
                } else {
                    break;
                }
            }

        }
        return node
    }

    /**
     * 使用循环改写,消除左递归
     *
     * 乘除语法
     * Multiplicative Operators
     * 简化乘法语法如下
     * MultiplicativeExpression :
     *      PrimaryExpression
     *      MultiplicativeExpression * PrimaryExpression
     *      MultiplicativeExpression / PrimaryExpression
     * 
     */
    multiplicative() {
        let tokens = this.tokens;
        // 先判断是否符合基本表达式, 如果符合基本表达式, 暂时就已经找到了一个叶子节点(TOKEN)
        let child = this.primary();
        let node = child;

        if(child) {
            while(true) {
                let nextToken = this.lexerLevel.tokenPeek()
                if(nextToken && (nextToken.type === this.lexerLevel.DfaState.Star || nextToken.type === this.lexerLevel.DfaState.Slash)) {
                    nextToken = this.lexerLevel.tokenRead();
                    // 左侧满足MultiplicativeExpression ,检查右侧是否满足PrimaryExpression
                    let childRight = this.primary();
                    if(childRight) {
                        // 构建一个乘法表达式 AstNode
                        node = new BinaryAstNode("Multiplicative", nextToken.value, nextToken.type);
                        node.addLeftChild(child)
                        node.addRightChild(childRight)
                        child = node;
                    } else {
                        throw Error("error Multiplicative Expression")
                    }
                } else {
                    break;
                }
            }

        }

        return node;

    }


    /**
     * primary Expressions
     * 针对最基本的预计, 我们设定文法规则如下, 只处理标识符 和 Number类型的字面量
     * v0.0.2 支持表达式 - (expression)
     * PrimaryExpression :
     *      Identifier
     *      Literal
     *      (expression)
     */
    primary() {
        let tokens = this.tokens;
        let node = null;

        // 预读判断
        let nextToken = this.lexerLevel.tokenPeek()
        if(nextToken) {
            // 判断是否符合文法规则
            if(nextToken.type === this.lexerLevel.DfaState.Identifier) {
                nextToken = this.lexerLevel.tokenRead();
                node = new PrimaryAstNode(this.lexerLevel.DfaState.Identifier, nextToken.value);
            } else if(nextToken.type === this.lexerLevel.DfaState.Num) {
                nextToken = this.lexerLevel.tokenRead();
                node = new PrimaryAstNode(this.lexerLevel.DfaState.Num, nextToken.value);
            } else if(nextToken.type === this.lexerLevel.DfaState.LeftParen) {
                // v0.0.2 新增支持( )简单处理
                nextToken = this.lexerLevel.tokenRead();
                // 检测下一个表达式
                node = this.additive();
                if(node) {
                    nextToken = this.lexerLevel.tokenPeek();
                    if(nextToken.type === this.lexerLevel.DfaState.RightParen) {
                        this.lexerLevel.tokenRead()
                    } else {
                        throw Error("right paren is lost")
                    }
                }
            }
            // 剩余类型待处理
        }

        return node

    }

}


function main () {

   let syntaxLevel = new SyntaxLevel1("(2+3)*4")

   let node = syntaxLevel.astParse()

    // console.log(node)
    console.log("(2+3)*4=",node.getValue())

    let syntaxLevel2 = new SyntaxLevel1("3*4+2")

    console.log("3*4+2=",syntaxLevel2.astParse().getValue())

    let syntaxLevel3 = new SyntaxLevel1("3*4")

    console.log("3*4=",syntaxLevel3.astParse().getValue())

    let syntaxLevel4 = new SyntaxLevel1("2+3+4")

    console.log("2+3+4=",syntaxLevel4.astParse().getValue())

    let syntaxLevel5 = new SyntaxLevel1("3*4 *4 +2 + 5 /6")

    console.log("3*4 *4 +2 + 5 /6=",syntaxLevel5.astParse().getValue())


    let syntaxLevel6 = new SyntaxLevel1("1>>1+2")

    console.log("1>>1+2=",syntaxLevel6.astParse().getValue())

}

main()