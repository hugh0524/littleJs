# v0.0.6 demo for json parse

JSON 词法
```
JSONWhiteSpace ::
    <TAB>
    <CR>
    <LF>
    <SP>

JSONString ::
    " JSONStringCharactersopt "

JSONStringCharacters ::
    JSONStringCharacter JSONStringCharacters(opt)

JSONStringCharacter ::
    SourceCharacter but not one of " or \ \ JSONEscapeSequence

JSONEscapeSequence ::
    JSONEscapeCharacter
    UnicodeEscapeSequence JSONEscapeCharacter :: one of "/\bfnrt or U+0000 through U+001F

JSONNumber ::
    -opt DecimalIntegerLiteral JSONFractionopt ExponentPartopt

 JSONFraction ::
    . DecimalDigits

JSONNullLiteral ::
    NullLiteral

JSONBooleanLiteral ::
    BooleanLiteral

```

JSON 文法如下

```

JSONText :
    JSONValue

JSONValue :
    JSONNullLiteral
    JSONBooleanLiteral
    JSONObject
    JSONArray
    JSONString
    JSONNumber

JSONObject :
    {}
    { JSONMemberList }

JSONMember :
    JSONString : JSONValue

JSONMemberList :
    JSONMember
    JSONMemberList , JSONMember

JSONArray :
    []
    [ JSONElementList ]

JSONElementList :
    JSONValue
    JSONElementList ,JSONValue
```


## test

运行 demo_json 下 SyntaxForJson 内置main方法
