/**
 * Created by yinhe on 2020/2/18.
 */

let keyWords = [
    "break|else|new|var|let|case|finally|return|void|catch|for|switch|while|continue|function|this|with|default|if|throw|delete|in|try|do|instanceof|typeof", // 保留字
    "abstract|enum|int|short|boolean|export|interface|static|byte|extends|long|super|char|final|native|synchronized|class|float|package|throws|const|goto|private|transient|debugger|implements|protected|volatile|double|import|public", // 未来保留字
    "null|true|false", // null, boolean常量
]


let _key_maps = {}
keyWords.join("|").split("|").forEach(i => {
    _key_maps[i.toUpperCase()] = i;
})

let type = {
    "Identifier": "Identifier", // 标识符

    "KEYWORD": "keyWord", // 关键字
    "ReservedWord": "ReservedWord", // 保留字
    "FutureReservedWord": "FutureReservedWord", // 未来保留字
    "NULL": "null", // 空值常量,
    "BOOLEAN": 'boolean', // 布尔值常量
    "PUNCTUATORS": "Punctuators", // 标点符号
    "DOT": 'Dot', // .
    "Addition": "Addition", // 加法 + 
    "Subtraction": "Subtraction", //减法 -
    "Multiplication": "Multiplication", // 乘法 *
    "Division": "Division", // 除法 /
    "Remainder": "Remainder", // 取余 %
    "LeftShift": "LeftShift", // 左位移 <<
    "RightShift": "RightShift", // 右位移 >>
    "UnsignedRightShift": "UnsignedRightShift", // 无符号右移  >>>
    "LT": "LessThan", // <
    "LE": "LessThanOrEqual", // <=
    "GT": "GreaterThan", // >
    "GE": "GreaterThanOrEqual", // >=
    "EQ": "Equality", // ==
    "SEQ": "StrictEquals", // ===
    "NotEQ": "DoesNotEquals", // !==
    "SNotEQ": "StrictDoesNotEquals", // !===
    "AND": "AND", // &
    "OR": "OR", // |
    "XOR": "XOR", // ^
    "LogicalAND": "LogicalAND", // &&
    "LogicalOR": "LogicalOR", // ||
    "Conditional": "Conditional", // ? :
    "Comma": "Comma", // ,
    "Assignment": "Assignment", // =

    "LeftParen": "LeftParen", // (
    "RightParen": "RightParen", // )
    "LeftBrace": "LeftBrace", // {
    "RightBrace": "RightBrace", // }
    "LeftBracket": "LeftBracket", // [
    "RightBracket": "RightBracket", // ]
    "SemiColon": "SemiColon", //

    "Literal": "Literal", // 字面量
    "NumericLiteral": "NumericLiteral", // 数字字面量
    "BooleanLiteral": "BooleanLiteral", //
    "StringLiteral": "StringLiteral", // 字符串字面量

    ..._key_maps
}



let maps = {
    ".": type.DOT,
    "=": type.Assignment,
    "<": type.LT,
    "<=": type.LE,
    ">": type.GT,
    ">=": type.GE,
    "==": type.EQ,
    "===": type.SEQ,
    "!==": type.NotEQ,
    "!===": type.SNotEQ,
    "<<": type.LeftShift,
    ">>": type.RightShift,
    ">>>": type.UnsignedRightShift,

    "+": type.Addition,
    "-": type.Subtraction,
    "*": type.Multiplication,
    "/": type.Division,
    "%": type.Remainder,

    "&": type.AND,
    "|": type.OR,
    "^": type.XOR,
    "&&": type.LogicalAND,
    "||": type.LogicalOR,

    "(": type.LeftParen,
    ")": type.RightParen,
    "[": type.LeftBracket,
    "]": type.RightBracket,
    "{": type.LeftBrace,
    "}": type.RightBrace,

    ";": type.SemiColon,
    ",": type.Comma,

    ..._key_maps
}

module.exports = {
    keyWords,
    type,
    maps
}