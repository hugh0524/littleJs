/**
 * Created by yinhe on 2020/3/14.
 */

const SyntaxLevel2 = require("../SyntaxLevel2")

function test () {
    // 关闭log
    console.log = function() {

    }

    // 测试正常解析
    let syntaxLevel = new SyntaxLevel2(`
      for(;;){}
   `)
    console.info("test----", syntaxLevel.astParse().showStructure())

    // 测试error
    try{
        let syntaxLevel1 = new SyntaxLevel2(`
             for(;){}
        `)
        console.info("test----Error", syntaxLevel1.astParse().showStructure())
    }catch(e){
        console.error("test----Error1", e)
    }

    // 测试计算
    let syntaxLevel2 = new SyntaxLevel2(`
        var a = 0;
        var b = 1;
         for(;a<3;a=a+1){
            b = b+a
         }
         b
     `)

     console.info("test-val1: 4 == ", syntaxLevel2.exe())

    // 测试continue
    let syntaxLevel3 = new SyntaxLevel2(`
        var a = 0;
        var b = 1;
         for(;a<3;a=a+1){
            if(a == 1){
                continue;
            }
            b = b+a
         }
         b
     `)

    console.info("test-val2: 3 == ", syntaxLevel3.exe())

    // 测试 break
    let syntaxLevel4 = new SyntaxLevel2(`
        var a = 0;
        var b = 1;
         for(;a<3;a=a+1){
            if(a == 1){
                break;
            }
            b = b+a
         }
         b
     `)

    // console.info("test-val2: 4 == ", syntaxLevel3.astParse().showStructure())
    console.info("test-val3: 1 == ", syntaxLevel4.exe())

    // 测试var
    let syntaxLevel5 = new SyntaxLevel2(`
        var b = 1;
         for(var a = 0;a<3;a=a+1){
          
            b = b+a
         }
         b
     `)

    // console.info("test-val2: 4 == ", syntaxLevel5.astParse().showStructure())
    console.info("test-val4: 4 == ", syntaxLevel5.exe())

}

test()