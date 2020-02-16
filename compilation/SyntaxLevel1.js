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
const ReturnStatementAstNode = require("./ast/ReturnStatementAstNode")
const FunctionDeclarationAstNode = require("./ast/FunctionDeclarationAstNode")
const ProgramAstNode = require("./ast/ProgramAstNode")
const MemberAstNode = require("./ast/MemberAstNode")
const NewAstNode = require("./ast/NewAstNode")
const CallAstNode = require("./ast/CallAstNode")

const stack = require("./Stack")


/**
 * 简单语法解析器
 *
 * 语法规则基于指定的文法, 所以需要先确定文法规则(详见对应的表达式处理方法)
 *
 *
 * 遗留问题
 * 1. 多分号`;`处理
 *
 *
 * 解析如下语法:
 *   a.b.c(1,2)
 *   function a() {}
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
     * v0.0.4 ShiftExpression -> RelationalExpression
     * v0.0.5 RelationalExpression -> lowestExpression
     */
    astParse() {
        // 涉及多个语句, 先初始化一个根节点
        let node = new ProgramAstNode();
        let nextToken = this.lexerLevel.tokenPeek()
        while(nextToken) {
            console.log("init=====", nextToken)

            // v0.0.5 暂时处理下分号
            if(nextToken.type === this.lexerLevel.DfaState.SemiColon) {
                this.lexerLevel.tokenRead()
                nextToken = this.lexerLevel.tokenPeek()
                continue;
            }
            
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

            // if(!cv) {
            //     cv = this.newExpression()
            // }
            //
            // if(!cv) {
            //     cv = this.callExpression()
            // }

            if(!cv) {
                cv = this.functionStatement();
            }

            // if(!cv) {
            //     cv = this.assignment()
            //     // console.log("====3", cv)
            // }


            if(!cv) {
                cv = this.lowestExpression()
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
     * v0.0.5
     * 支持function
     *
     * function定义 和 function表达式
     * 
     * FunctionDeclaration :
     *      function Identifier ( FormalParameterList(opt) ) { FunctionBody }
     * FunctionExpression :
            function Identifier(opt) ( FormalParameterList(opt) ) { FunctionBody }
     * FormalParameterList :
     *      Identifier
     *      FormalParameterList , Identifier
     * FunctionBody :
     *      SourceElements(opt)
     * SourceElement :
     *      Statement
     *      FunctionDeclaration
     *
     */
    functionStatement() {
        let node = null;
        let nextToken = this.lexerLevel.tokenPeek()
        console.log("function====4.0", nextToken)
        // 判断出Function
        if(nextToken && nextToken.type === this.lexerLevel.DfaState.Function) {
            this.lexerLevel.tokenRead()
            node = new FunctionDeclarationAstNode("Function", 'function');
            nextToken = this.lexerLevel.tokenPeek()
            console.log("function====4.1", nextToken)
            if(nextToken && nextToken.type === this.lexerLevel.DfaState.Identifier) {
                let id =  new AstNode(this.lexerLevel.DfaState.Identifier, nextToken.value)
                this.lexerLevel.tokenRead()
                node.addId(id)
                nextToken = this.lexerLevel.tokenPeek()
                console.log("function====4.2", nextToken)
            }
            console.log("function====4.3", nextToken)
            if(nextToken && nextToken.type === this.lexerLevel.DfaState.LeftParen) {
                // this.lexerLevel.tokenRead()
                // // 进入参数判断, 遇到 `)` 前, 按`,`分割参数
                // let nextParam = this.lexerLevel.tokenPeek()
                // while(nextParam && nextParam.type != this.lexerLevel.DfaState.RightParen) {
                //     if(nextParam.type !== this.lexerLevel.DfaState.Identifier) {
                //         throw Error("function param must be Identifier")
                //     }
                //     let pNode = new AstNode(this.lexerLevel.DfaState.Identifier, nextParam.value)
                //     node.addParams(pNode)
                //     this.lexerLevel.tokenRead()
                //     // 判断分隔符
                //     nextParam = this.lexerLevel.tokenPeek()
                //     if(nextParam && nextParam.type === this.lexerLevel.DfaState.Comma) {
                //         // 消耗掉 `,`
                //         this.lexerLevel.tokenRead()
                //     }
                //     nextParam = this.lexerLevel.tokenPeek()
                // }
                // if(nextParam && nextParam.type === this.lexerLevel.DfaState.RightParen) {
                //     this.lexerLevel.tokenRead()
                // }
                let params = this.arguments();
                for(let i= 0; i<params.length; i++) {
                    node.addParams(params[i])
                }
            } else {
                throw Error("function  must has Params block")
            }

            // 进入代码块判断
            nextToken = this.lexerLevel.tokenPeek()
            console.log("function====4.4", nextToken)
            if(nextToken && nextToken.type === this.lexerLevel.DfaState.LeftBrace) {
                let block = this.functionBodyBlock()
                if(block) {
                    node.addBody(block)
                } else {
                    throw Error("function must has body block")
                }
            } else {
                throw Error("function must has body block")
            }

        }
        
        return node
    }

    /**
     * v0.0.5
     * 处理函数体
     *
     * 语法如下
     *  FunctionBody :
     *      {
     *          Statements
     *          FunctionDeclarations
     *       }
     *
     *
     */
    functionBodyBlock() {
        let node = null;
        let nextToken = this.lexerLevel.tokenPeek()
        console.log("function body===0", nextToken, this.lexerLevel.tokens)
        if(nextToken && nextToken.type === this.lexerLevel.DfaState.LeftBrace) {
            node = new BlockAstNode("Block", "")
            this.lexerLevel.tokenRead();
            nextToken = this.lexerLevel.tokenPeek()
            console.log("function body===1", nextToken)
            // todo 异常判断
            while(nextToken && nextToken.type !== this.lexerLevel.DfaState.RightBrace){
                console.log("function body===2", nextToken)
                let child = this.statement();
                if(!child) {
                   child = this.functionStatement()
                }
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
        return node;
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
                let childTest = this.lowestExpression();
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
     * v0.0.5
     * 支持return语句
     * todo 换行判断暂不处理
     * ReturnStatement :
     *    return ;
     *    return [no LineTerminator here] Expression ;
     *
     */
    returnStatement() {
        let node = null;
        let nextToken = this.lexerLevel.tokenPeek()
        // 判断出Return
        if(nextToken && nextToken.type === this.lexerLevel.DfaState.Return) {
            // 构建一个return Ast node
            node = new ReturnStatementAstNode(this.lexerLevel.DfaState.Return, "return")
            this.lexerLevel.tokenRead()
            // 判断后面的表达式  todo 换行判断
            let child = this.lowestExpression();
            if(child) {
                node.addExpression(child)
            }
            // 判断下一个分号
            nextToken = this.lexerLevel.tokenPeek()
            if(nextToken && nextToken.type === this.lexerLevel.DfaState.SemiColon) {
                this.lexerLevel.tokenRead(); // 取出;
            }
        }

        return node
    }

    /**
     * v0.0.4  暂时只支持其中部分语句
     * v0.0.5 新增returnStatement处理
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
            node = this.returnStatement()
        }
        // if(!node) {
        //     node = this.assignment()
        // }
        if(!node) {
            // todo
            node = this.lowestExpression()
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
     * v0.0.5  fix  待完善
     *         TODO 暂时不处理函数赋值的情况
     *
     *
     * 赋值语句
     * 简化语法如下
     * AssignmentExpression :
     *      RelationalExpression
     *      LeftHandSideExpression = AssignmentExpression
     *
     */
    assignment() {

        let child = this.relational();
        let node = child;

        let nextToken = this.lexerLevel.tokenPeek()
        let tempToken = null;
        console.log("assignment===0", nextToken, child && child.showStructure())
        if(nextToken && nextToken.type === this.lexerLevel.DfaState.Assignment) {
            this.lexerLevel.tokenRead();
            console.log("assignment===1", this.lexerLevel.tokenPeek())
            // 预测是一个赋值语句
            node = new AssignmentAstNode("Assignment")
            let childRight = this.relational();
            if(childRight) {
                node.addLeftChild(child)
                node.addRightChild(childRight)
                // 判断最后一个;
                nextToken = this.lexerLevel.tokenPeek();
                console.log("assignment===2", nextToken)
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
     * v0.0.5
     * 暂时使用该表达式标识 最低优先级
     */
    lowestExpression() {
        return this.assignment()
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
     * v0.0.2使用循环改写,消除左递归
     * v0.0.5 新增leftHandSideExpression
     *      primary -> leftHandSideExpression
     *
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
        let child = this.leftHandSideExpression();
        let node = child;

        if(child) {
            while(true) {
                let nextToken = this.lexerLevel.tokenPeek()
                if(nextToken && (nextToken.type === this.lexerLevel.DfaState.Star || nextToken.type === this.lexerLevel.DfaState.Slash)) {
                    nextToken = this.lexerLevel.tokenRead();
                    // 左侧满足MultiplicativeExpression ,检查右侧是否满足PrimaryExpression
                    let childRight = this.leftHandSideExpression();
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
     * v0.0.5
     *  func()
     *
     * CallExpression :
     *     MemberExpression Arguments
     *     CallExpression Arguments
     *     CallExpression [ Expression ]
     *     CallExpression . IdentifierName
     *
     */
    callExpression() {

        let pos = this.lexerLevel.tokenSignPos()
        let child = this.memberExpression();
        let node = null;
        if(child) {
            console.log("call====0", child.showStructure(), pos)
            let ca = this.arguments();
            console.log("call====1", ca)
            if(ca) {
                // 符合Call
                node = new CallAstNode("callExpression", '');
                node.addCallee(child)
                node.addArguments(ca)
                child = node;
                while(true) {
                    let child2 = this.arguments();
                    if(child2) {
                        node = new CallAstNode("callExpression", '');
                        node.addCallee(child)
                        node.addArguments(child2)
                        child = node
                    } else {
                        // 判断 是否是[] 或者 .
                        let nextToken = this.lexerLevel.tokenPeek()
                        if(nextToken && (nextToken.type === this.lexerLevel.DfaState.LeftBracket || nextToken.type === this.lexerLevel.DfaState.Dot)) {
                            node = new MemberAstNode("Member", '', nextToken.type === this.lexerLevel.DfaState.LeftBracket?true: false);
                            node.addObject(child)
                            console.log("call===3", this.lexerLevel.tokenPeek())
                            this.lexerLevel.tokenRead()
                            console.log("call===3.1", this.lexerLevel.tokenPeek())
                            // 判断表达式
                            let exp = this.lowestExpression()
                            if(!exp) {
                                throw Error('error MemberExpress')
                            } else {
                                node.addProperty(exp)
                            }

                            nextToken = this.lexerLevel.tokenPeek()
                            if(nextToken && nextToken.type === this.lexerLevel.DfaState.RightBracket) {
                                this.lexerLevel.tokenRead()
                                nextToken = this.lexerLevel.tokenPeek()
                            }
                            child = node;
                        } else {
                            break;
                        }
                    }
                }
            } else {
                // TODO
                // throw Error("lost argument in call expression")
                // rePush tokens
                this.lexerLevel.tokenRePushByPos(pos)
            }
        }
        return node;
    }

    /**
     * v0.0.5
     * new 关键字
     *  
     *  NewExpression : 
     *      MemberExpression
     *      new NewExpression
     *
     */
    newExpression() {
        let node = null;
        let nextToken = this.lexerLevel.tokenPeek()
        console.log("new====0", nextToken)
        if(nextToken && nextToken.type === this.lexerLevel.DfaState.New) {
            node = this.memberExpression();

        } else {
            // TODO
            // node = this.memberExpression();
        }
        // console.log("new====1", nextToken)
        // if(!child && nextToken) {
        //     if(nextToken.type === this.lexerLevel.DfaState.New) {
        //         this.lexerLevel.tokenRead()
        //         node = new NewAstNode("newExpression", '')
        //         //
        //         child = this.memberExpression()
        //         if(child) {
        //             node.addCallee(child)
        //         } else {
        //             throw Error("lost member expression after 'new'")
        //         }
        //     }
        // }
        return node;
       
    }

    /**
     * v0.0.5
     * memberExpression
     *
     * MemberExpression :
     *      PrimaryExpression
     *      FunctionExpression
     *      MemberExpression [ Expression ]
     *      MemberExpression . IdentifierName
     *      new MemberExpression Arguments   // TODO
     *
     */
    memberExpression() {
        let child = this.primary();
        if(!child) {
            child = this.functionStatement()
        }
        let node = child;
        console.log("member====3.0", child)
        let nextToken = this.lexerLevel.tokenPeek()
        console.log("member====3.1", nextToken)
        if(child) {
            while(true) {
                if(nextToken && (nextToken.type === this.lexerLevel.DfaState.LeftBracket || nextToken.type === this.lexerLevel.DfaState.Dot)) {
                    let mtype = nextToken.type
                    node = new MemberAstNode("Member", '', nextToken.type === this.lexerLevel.DfaState.LeftBracket?true: false);
                    node.addObject(child)
                    console.log("member===3.2", this.lexerLevel.tokenPeek())
                    this.lexerLevel.tokenRead()
                    console.log("member===3.3", this.lexerLevel.tokenPeek())
                    // 判断表达式
                    let exp = null
                    if(mtype === this.lexerLevel.DfaState.Dot) {
                        // v0.0.5
                        exp = this.primary()
                    } else {
                        exp = this.lowestExpression()
                    }
                    if(!exp) {
                        throw Error('error MemberExpress')
                    } else {
                        node.addProperty(exp)
                    }

                    nextToken = this.lexerLevel.tokenPeek()
                    if(nextToken && nextToken.type === this.lexerLevel.DfaState.RightBracket) {
                        this.lexerLevel.tokenRead()
                        nextToken = this.lexerLevel.tokenPeek()
                    }
                    child = node;
                }else {
                    break;
                }

            }

        } else {
            // 判断new 标识符
            if(nextToken && nextToken.type === this.lexerLevel.DfaState.New) {
                //
                node = new NewAstNode("newExpression", '')
                this.lexerLevel.tokenRead()
                child = this.memberExpression();
                if(child) {
                    node.addCallee(child)
                    let args = this.arguments();
                    if(args) {
                        node.addArguments(args)
                    } else {
                        throw Error("lost args in new Expression")
                    }
                } else {
                    throw Error("error new Expression")
                }
            }
        }

        return node;
    }

    /**
     * v0.0.5
     * 参数处理
     */
    arguments() {
        let node = null;
        let nextToken = this.lexerLevel.tokenPeek()
        console.log("arguments====0", nextToken)
        if(nextToken && nextToken.type === this.lexerLevel.DfaState.LeftParen) {
            node = []
            this.lexerLevel.tokenRead()
            // 进入参数判断, 遇到 `)` 前, 按`,`分割参数
            let nextParam = this.lexerLevel.tokenPeek()
            while(nextParam && nextParam.type != this.lexerLevel.DfaState.RightParen) {
                console.log("arguments====1", nextParam)
                // v0.0.5 TODO 待分类判断
                // if(nextParam.type !== this.lexerLevel.DfaState.Identifier) {
                //     throw Error("function param must be Identifier")
                // }
                // let pNode = new AstNode(this.lexerLevel.DfaState.Identifier, nextParam.value)
                let pNode = this.primary();
                node.push(pNode)
                // this.lexerLevel.tokenRead()
                // 判断分隔符
                nextParam = this.lexerLevel.tokenPeek()
                if(nextParam && nextParam.type === this.lexerLevel.DfaState.Comma) {
                    // 消耗掉 `,`
                    this.lexerLevel.tokenRead()
                }
                nextParam = this.lexerLevel.tokenPeek()
                console.log("arguments====2", nextParam)
            }
            if(nextParam && nextParam.type === this.lexerLevel.DfaState.RightParen) {
                this.lexerLevel.tokenRead()
            }
        }
        return node
    }


    /**
     * LeftHandSideExpression :
     *      NewExpression
     *      CallExpression
     */
    leftHandSideExpression() {
        console.log("Left====0")
        let node = this.newExpression()
        console.log("Left====1", !!node)
        if(!node) {
            node = this.callExpression()
        }
        console.log("Left====2", !!node)
        // TODO
        if(!node) {
            node = this.primary()
        }
        console.log("Left====3", !!node)
        return node
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
        console.log("primary====0", nextToken)
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
                //
                nextToken = this.lexerLevel.tokenRead();
                console.log("primary====0.1", nextToken)
                // 检测下一个表达式
                node = this.lowestExpression();
                if(node) {
                    nextToken = this.lexerLevel.tokenPeek();
                    console.log("primary====0.2", nextToken)
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

/**
 *
 */
function main () {

   let syntaxLevel = new SyntaxLevel1(`
      a = b+1;
   `)
   console.log("test1----", syntaxLevel.astParse().showStructure())

    let syntaxLevel4 = new SyntaxLevel1(`
      function a(b, c) {
        b = c+1;
        return b+1
      }
   `)
    console.log("test4----", syntaxLevel4.astParse().showStructure())

   //  let syntaxLevel2 = new SyntaxLevel1(`
   //    a.b.c
   // `)
   //  console.log("test2----", syntaxLevel2.astParse().showStructure())

    let syntaxLevel3 = new SyntaxLevel1(`
      a.b.c(1,2)
   `)
    console.log("test3----", syntaxLevel3.astParse().showStructure())

    let syntaxLevel5 = new SyntaxLevel1(`
      new a();
   `)
    console.log("test5----", syntaxLevel5.astParse().showStructure())



    let syntaxLevel6 = new SyntaxLevel1(`
      function a(b,c){
        return b+c
      }
      
      var d = new a(4,2);
      d+2
   `)
    console.log("test6----", syntaxLevel6.exe())


}

main()