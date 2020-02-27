/**
 * Created by yinhe on 2020/2/11.
 */

const LexerLevel = require("./LexerLevel1")
const AstNode = require("./ast/AstNode")
const BinaryAstNode = require("./ast/BinaryAstNode")
const PrimaryAstNode = require("./ast/PrimaryAstNode")
const AssignmentAstNode = require("./ast/AssignmentAstNode")
const DeclarationAstNode = require("./ast/DeclarationAstNode")
const IfStatementAstNode = require("./ast/IfStatementAstNode")
const BlockAstNode = require("./ast/BlockAstNode")

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
 *
 * if(a >2)
 *   if(a<4)
 *       a=3;
 *   else
 *     a=4;
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
     * v0.0.4 ShiftExpression -> RelationalExpression
     */
    astParse() {
        // 涉及多个语句, 先初始化一个根节点
        let node = new AstNode("Program", "");
        let nextToken = this.lexerLevel.tokenPeek()
        while(nextToken) {

            // console.log("====1", nextToken)
            let cv = this.variable();
            // console.log("====2", cv)

            /**
             * v0.0.4 新增if
             */
            if(!cv) {
                cv = this.ifStatement();
                // console.log("====4", cv)
            }

            if(!cv) {
                cv = this.assignment()
                // console.log("====3", cv)
            }


            if(!cv) {
                cv = this.relational()
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
        return n.getValue();
    }


    /**
     * v0.0.4
     * 
     * 语法如下
     * IfStatement :
     *     if ( Expression ) Statement else Statement 
     *     if ( Expression ) Statement
     *
     */
    ifStatement() {
        let node = null;
        
        let nextToken = this.lexerLevel.tokenPeek()
        // 预判进入If语句
        if(nextToken && nextToken.type === this.lexerLevel.DfaState.If) {
            this.lexerLevel.tokenRead();
            // 构建一个if Ast
            node = new IfStatementAstNode('ifStatement', 'if')
            nextToken = this.lexerLevel.tokenPeek()
            if(nextToken && nextToken.type === this.lexerLevel.DfaState.LeftParen) {
                this.lexerLevel.tokenRead();
                // test语句检查 TODO 暂时使用该 Expression
                let childTest = this.relational();
                if(childTest) {
                    node.addTest(childTest)
                    // 判断 )
                    nextToken = this.lexerLevel.tokenPeek()
                    if(nextToken && nextToken.type === this.lexerLevel.DfaState.RightParen) {
                        this.lexerLevel.tokenRead();
                        // 开始进入 statement区域判断
                        let child1 = this.statement();
                        if(child1) {
                            node.addConsequent(child1)
                        }else {
                            throw Error("lost consequent block in if statement")
                        }
                        // 判断else语句
                        nextToken = this.lexerLevel.tokenPeek()
                        if(nextToken && nextToken.type === this.lexerLevel.DfaState.Else) {
                            this.lexerLevel.tokenRead();
                            // 构建一个else代码块
                            let child2 = this.statement();
                            if(child2) {
                                node.addAlternate(child2)
                            }else {
                                throw Error("lost alternate block in if statement")
                            }
                        }
                    } else {
                        throw Error("lost rightParen in if test")
                    }
                } else {
                    throw Error("lost test expression in if statement")
                }

            } else {
                throw Error("lost leftParen in if test")
            }
        }
        return node;
    }


    /**
     * v0.0.4
     *
     * 代码块 以{开始, 以}结束
     * Block :
     *   { StatementList(opt) }
     *
     */
    block() {
        let node = null;
        let nextToken = this.lexerLevel.tokenPeek()
        if(nextToken && nextToken.type === this.lexerLevel.DfaState.LeftBrace) {
            node = new BlockAstNode("Block", "")
            this.lexerLevel.tokenRead();
            nextToken = this.lexerLevel.tokenPeek()
            // todo 异常判断
            while(nextToken && nextToken.type !== this.lexerLevel.DfaState.RightBrace){
                let child = this.statement();
                if(child) {
                    // 构建子级ast
                    node.addChild(child)
                }
                nextToken = this.lexerLevel.tokenPeek()
            }
            if(nextToken && nextToken.type === this.lexerLevel.DfaState.RightBrace) {
                this.lexerLevel.tokenRead();
            }
        }

        return node
    }

    /**
     * v0.0.4  暂时只支持其中部分语句
     *
     * Statement :
     *   Block
     *   VariableStatement
     *   EmptyStatement
     *   ExpressionStatement
     *   IfStatement
     *   IterationStatement
     *   ContinueStatement
     *   BreakStatement
     *   ReturnStatement
     *   WithStatement
     *   LabelledStatement
     *   SwitchStatement
     *   ThrowStatement
     *   TryStatement
     *   DebuggerStatement
     *
     */
    statement() {
        let node = this.block()
        if(!node) {
            node = this.variable()
        }
        if(!node) {
            node = this.ifStatement()
        }
        if(!node) {
            node = this.assignment()
        }
        if(!node) {
            // todo
            node = this.relational()
        }


        return node
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
     * v0.0.4  ShiftExpression -> RelationalExpression
     * 赋值语句
     * 简化语法如下
     * AssignmentExpression :
     *      RelationalExpression
     *      PrimaryExpression = AssignmentExpression
     *
     */
    assignment() {

        let child = this.relational();
        let node = child;

        let nextToken = this.lexerLevel.tokenPeek()
        let tempToken = null;
        if(nextToken && nextToken.type === this.lexerLevel.DfaState.Assignment) {
            this.lexerLevel.tokenRead();
            // 预测是一个赋值语句
            node = new AssignmentAstNode("Assignment")
            let childRight = this.relational();
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

        return node;

    }


    /**
     * v0.0.4
     * 为支持if等语句, 新增关系运算符操作
     * 关系运算符
     * 
     * 简化如下
     * RelationalExpression : 
     *     ShiftExpression
     *     RelationalExpression < ShiftExpression 
     *     RelationalExpression > ShiftExpression 
     *     RelationalExpression <= ShiftExpression 
     *     RelationalExpression >= ShiftExpression
     *    
     *
     */
    relational() {
        let child = this.bitwiseShift();
        let node = child;
        if(child ) {
            while(true) {
                let nextToken = this.lexerLevel.tokenPeek()
                if(nextToken && (nextToken.type === this.lexerLevel.DfaState.GT || nextToken.type === this.lexerLevel.DfaState.GE || nextToken.type === this.lexerLevel.DfaState.LE || nextToken.type === this.lexerLevel.DfaState.LT)) {
                    nextToken = this.lexerLevel.tokenRead();
                    let childRight = this.bitwiseShift();
                    if(childRight) {
                        // 构建一个加法表达式 AstNode
                        node = new BinaryAstNode("Relational", nextToken.value, nextToken.type);
                        node.addLeftChild(child)
                        node.addRightChild(childRight)
                        child = node;
                    } else {
                        throw Error("error relational Expression")
                    }
                } else {
                    break;
                }
            }
        }

        return node
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
                        node.addLeftChild(child)
                        node.addRightChild(childRight)
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
     * v0.0.4 修复ast left right赋值bug
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
                        node.addLeftChild(child)
                        node.addRightChild(childRight)
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
   if(a >2) {
    a = 3;
   }
   `)
   console.log("test1----", syntaxLevel.astParse())


    let syntaxLevel2 = new SyntaxLevel1(`
   if(a >2) {
    a = 3;
   }else {
    a=4;
   }
   `)
    console.log("test2----", syntaxLevel2.astParse())

    // 测试二义性
    let syntaxLevel3 = new SyntaxLevel1(`
   if(a >2) 
    if(a<4)
     a=3;
   else 
    a=4;
   
   `)
    console.log("test3----", syntaxLevel3.astParse())

    // 测试运行计算
    let syntaxLevel4 = new SyntaxLevel1(`
   var a = 5;
   if(a >2) 
    if(a<4)
     a=3;
   else 
    a=4;
   
   a= a+1;
   `)
    console.log("test4----", syntaxLevel4.exe())
}

main()