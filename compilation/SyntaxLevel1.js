/**
 * Created by yinhe on 2020/2/11.
 */

const LexerLevel = require("./LexerLevel1")

/**
 * Ast 节点对象
 * @param type
 * @param value
 * @constructor
 */
function AstNode (type, value) {
    this.type = type;
    this.value = value || '';
    this.children = []
    this.parent = null
}

AstNode.prototype.addChild = function(child) {
    this.children.push(child)
    child.parent = this;
}

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
        // 先直接用加法表达式测算
       return this.additive()
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
     * 左递归解决同Multiplicative描述
     *
     */
    additive() {
        let tokens = this.tokens;
        let child = this.multiplicative();
        let node = child;

        let nextToken = this.lexerLevel.tokenPeek()
        if(child && nextToken) {
            if(nextToken.type === this.lexerLevel.DfaState.Plus || nextToken.type === this.lexerLevel.DfaState.Minus) {
                nextToken = this.lexerLevel.tokenRead();
                // 判断右侧是否是一个乘法表达式
                let childRight = this.additive();
                if(childRight) {
                    // 构建一个加法表达式 AstNode
                    node = new AstNode("Additive", nextToken.value);
                    node.addChild(child)
                    node.addChild(childRight)
                } else {
                    throw Error("error Additive Expression")
                }
            }
        }
        return node
    }

    /**
     * 乘除语法
     * Multiplicative Operators
     * 简化乘法语法如下
     * MultiplicativeExpression :
     *      PrimaryExpression
     *      MultiplicativeExpression * PrimaryExpression
     *      MultiplicativeExpression / PrimaryExpression
     *
     * 由于暂时解决左递归,所以编码时对上述文法做了调整
     * MultiplicativeExpression * PrimaryExpression -》PrimaryExpression * MultiplicativeExpression
     *
     * 遗留了结合性的问题!!
     *
     * 
     */
    multiplicative() {
        let tokens = this.tokens;
        // 先判断是否符合基本表达式, 如果符合基本表达式, 暂时就已经找到了一个叶子节点(TOKEN)
        let child = this.primary();
        let node = child;

        let nextToken = this.lexerLevel.tokenPeek()
        if(child && nextToken) {
            if(nextToken.type === this.lexerLevel.DfaState.Star || nextToken.type === this.lexerLevel.DfaState.Slash) {
                nextToken = this.lexerLevel.tokenRead();
                // 表示右侧必有一个字面量或者 表达式对应  MultiplicativeExpression *(/) PrimaryExpression
                let childRight = this.multiplicative();
                if(childRight) {
                    // 构建一个乘法表达式 AstNode
                    node = new AstNode("Multiplicative", nextToken.value);
                    node.addChild(child)
                    node.addChild(childRight)
                } else {
                    throw Error("error Multiplicative Expression")
                }
            }
        }

        return node;

    }


    /**
     * primary Expressions
     * 针对最基本的预计, 我们设定文法规则如下, 只处理标识符 和 Number类型的字面量
     * PrimaryExpression :
     *      Identifier
     *      Literal 
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
                node = new AstNode(this.lexerLevel.DfaState.Identifier, nextToken.value);
            } else if(nextToken.type === this.lexerLevel.DfaState.Num) {
                nextToken = this.lexerLevel.tokenRead();
                node = new AstNode(this.lexerLevel.DfaState.Num, nextToken.value);
            }
            // 其他默认先不处理
        }

        return node

    }

}


function main () {

   let syntaxLevel = new SyntaxLevel1("2+3*4")

   console.log(syntaxLevel.astParse())

    let syntaxLevel2 = new SyntaxLevel1("3*4+2")

    console.log(syntaxLevel2.astParse())

    let syntaxLevel3 = new SyntaxLevel1("3*4")

    console.log(syntaxLevel3.astParse())

    // 遗留问题:  结合性有误
    let syntaxLevel4 = new SyntaxLevel1("2+3+4")

    console.log(syntaxLevel4.astParse())

    let syntaxLevel5 = new SyntaxLevel1("3*4 *4")

    console.log(syntaxLevel5.astParse())


}

main()