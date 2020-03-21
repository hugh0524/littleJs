/**
 * Created by yinhe on 2020/3/14.
 */

const SyntaxLevel2 = require("../SyntaxLevel2")

function test () {
    // 关闭log
    console.log = function() {

    }
    

    let syntaxLevel = new SyntaxLevel2(`
       var b=1;
       var a = 1;
      while(a <5){
        b = b+a;
        a = a+1;
      }
      b
   `)


    // console.info("test----", syntaxLevel.astParse().showStructure())

    console.info("test-val1: 11 == ", syntaxLevel.exe())

    // 测试 continue
    let syntaxLevel2 = new SyntaxLevel2(`
       var b=1;
       var a = 1;
      while(a <5){
        if(a == 3){
            a = a+1;
            continue;
        }
        b = b+a;
        a = a+1;
      }
      b
   `)
    console.info("test-val2: 8 == ", syntaxLevel2.exe())

    // 测试 break
    let syntaxLevel3 = new SyntaxLevel2(`
       var b=1;
       var a = 1;
      while(a <5){
        if(a == 3){
            break;
        }
        b = b+a;
        a = a+1;
      }
      b
   `)
    console.info("test-val3: 4 == ", syntaxLevel3.exe())
}

test()