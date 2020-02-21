# v0.0.6
是时候完善词法解析了

> v0.0.5 不支持赋值表达式, 未实现memberExpression计算

# 功能
1. 正则解析词法
2. 完善原始类型支持 (支持Number, String, Boolean)
3. 支持this关键字
   - call 调用: this指向调用者, 并传入作用域
   - constructor 调用: this指向新创建的空对象
   - this指向判断逻辑如下:
    当控制进入功能对象F中包含的功能代码的执行上下文，thisArg判断将执行以下步骤：
     1. 如果功能代码是严格代码，请将ThisBinding设置为thisArg。
     2. 如果thisArg为null或未定义，则将ThisBinding设置为全局对象。
     3. 如果Type（thisArg）不是Object，则将ThisBinding设置为ToObject（thisArg）。
     4. 否则将ThisBinding设置为thisArg。

# test
运行SyntaxLevel2.js 内置main方法即可

## demo1
```
 function a(b,c){

        this.j = 1;
        this.k = b+c;
      }

      var d = new a(4,2);
      d;
```
输出 `{j:1,k: 6}`

```
 function a(b,c){

        this.j = 1;
        this.k = b+c;
      }

      var d = new a(true,2);
      d;
```
输出 `{j:1,k: 3}`

```
 function a(b,c){

        this.j = 1;
        this.k = b+c;
      }

      var d = new a(1,'2');
      d;
```
输出 `{j:1,k: 12}`


## demo2
```
function a(b,c){

        this.j = 1;
        this.k = b+c;
      }

      var d = a(4,2);
      this;
```
输出: `{a: function, d: undefined, j: 1, k: 6}`


