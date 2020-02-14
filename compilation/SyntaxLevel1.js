/**
 * Created by yinhe on 2020/2/11.
 */

const LexerLevel = require("./LexerLevel1")
const AstNode = require("./ast/AstNode")
const BinaryAstNode = require("./ast/BinaryAstNode")
const PrimaryAstNode = require("./ast/PrimaryAstNode")
const AssignmentAstNode = require("./ast/AssignmentAstNode")
const DeclarationAstNode = require("./ast/DeclarationAstNode")

const stack = require("./Stack")


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
 *   var a =1;
 *   var b = 2;
 *   a = b +3;
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
        // 涉及多个语句, 先初始化一个根节点
        let node = new AstNode("Program", "");
        let nextToken = this.lexerLevel.tokenPeek()
        while(nextToken) {

            // console.log("=====2",nextToken)
            // 1
            let cv = this.variable();
            // console.log("====3.1" ,cv)
            if(!cv) {
                cv = this.assignment()
            }
            // console.log("====3.2" ,cv)
            // 2
            if(!cv) {
                cv = this.bitwiseShift()
            }

            if(cv) {
                node.addChild(cv)
            } else {
                throw Error("not support current expression!")
            }

            nextToken = this.lexerLevel.tokenPeek()
        }


       return node
    }

    /**
     * v0.0.3
     * 新增运行方法, 用于解析ast获取到对应的结果
     */
    exe() {
        let n = this.astParse()
        console
        return n.getValue();
    }


    /**
     * v0.0.3
     * 变量声明语句
     *
     * 简化语法如下
     * VariableStatement :
     *      var VariableDeclaration ;
     *
     * VariableDeclaration:
     *      Identifier Initialiser(opt)
     *
     * Initialiser:
     *      = AssignmentExpression
     *
     */
    variable() {

        let node = null;
        let nextToken = this.lexerLevel.tokenPeek()
        let tempToken = nextToken;
        if(nextToken && nextToken.type === this.lexerLevel.DfaState.Var) {
            node = new DeclarationAstNode("Declaration")
            this.lexerLevel.tokenRead();
            nextToken = this.lexerLevel.tokenPeek()
            if(nextToken && nextToken.type === this.lexerLevel.DfaState.Identifier) {
                // 表示var + 标识符
                let childId = new PrimaryAstNode(nextToken.type, nextToken.value)
                this.lexerLevel.tokenRead();
                node.addLeftChild(childId)
                // 检查是否有表达式
                nextToken = this.lexerLevel.tokenPeek()
                if(nextToken && nextToken.type === this.lexerLevel.DfaState.Assignment) {
                    this.lexerLevel.tokenRead();
                    let childInit = this.assignment();
                    if(childInit) {
                        node.addRightChild(childInit)
                    } else {
                        throw Error("no assignment expression after Assignment ")
                    }
                }
                nextToken = this.lexerLevel.tokenPeek()
                if(nextToken && nextToken.type === this.lexerLevel.DfaState.SemiColon) {
                    this.lexerLevel.tokenRead();
                }
            } else {
                throw Error("no Identifier after Var ")
            }
        }
        return node;
    }

    /**
     * v0.0.3
     * 赋值语句
     * 简化语法如下
     * AssignmentExpression :
     *      ShiftExpression
     *      PrimaryExpression = AssignmentExpression
     *
     */
    assignment() {

        let child = this.bitwiseShift();
        let node = child;

        let nextToken = this.lexerLevel.tokenPeek()
        let tempToken = null;
        if(nextToken && nextToken.type === this.lexerLevel.DfaState.Assignment) {
            this.lexerLevel.tokenRead();
            // 预测是一个赋值语句
            node = new AssignmentAstNode("Assignment")
            let childRight = this.bitwiseShift();
            if(childRight) {
                node.addLeftChild(child)
                node.addRightChild(childRight)
                // 判断最后一个;
                nextToken = this.lexerLevel.tokenPeek();
                if(nextToken && nextToken.type === this.lexerLevel.DfaState.SemiColon) {
                    this.lexerLevel.tokenRead(); // 读取出分号
                } else {
                    throw Error("lost SemiColon in the end of assignment expression")
                }
            } else {
                throw Error("error assignment expression")
            }
        }

        // if(nextToken && nextToken.type === this.lexerLevel.DfaState.Identifier) {
        //     // 定义一个Identifier类型节点
        //     // child = this.bitwiseShift();
        //     tempToken = nextToken;
        //     nextToken = this.lexerLevel.tokenPeek();
        //     if(nextToken && nextToken.type === this.lexerLevel.DfaState.Assignment) {
        //         this.lexerLevel.tokenRead();
        //         // 预测是一个赋值语句
        //         node = new AssignmentAstNode("Assignment")
        //         let childRight = this.bitwiseShift();
        //         if(childRight) {
        //             node.addLeftChild(child)
        //             node.addRightChild(child)
        //             // 判断最后一个;
        //             nextToken = this.lexerLevel.tokenPeek();
        //             if(nextToken && nextToken.type === this.lexerLevel.DfaState.SemiColon) {
        //                 this.lexerLevel.tokenRead(); // 读取出分号
        //             } else {
        //                 throw Error("lost SemiColon in the end of assignment expression")
        //             }
        //         } else {
        //             throw Error("error assignment expression")
        //         }
        //     } else {
        //         node =  child ; // TODO
        //     }
        // }

        return node;

    }



    /**
     * v0.0.2
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

   let syntaxLevel = new SyntaxLevel1(`
   var a =2;
   var b = 3;
   a = a * b + 3;
   
   `)

   console.log( syntaxLevel.exe())

    // 测试异常
    let syntaxLevel2 = new SyntaxLevel1(`
   var a =2;
   var b = 3;
   a = a * c + 3;
   `)
    console.log( syntaxLevel2.exe())
}

main()