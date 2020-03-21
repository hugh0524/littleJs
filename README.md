# v0.0.7
支持function的prototype

prototype是一个内置属性, 词法分析上只是一个普通的标识符

当我们使用`.` 或者`[]` 访问对象属性时
执行如下调用:
1. 调用GetOwnProperty: 获取自身属性
2. 调用GetProperty内部方法: 如自身属性获取不到,查询prototype原型上的属性 (循环查找原型链上的属性)
3. 调用Get内部方法

模拟栈和堆存放数据

1. 新增while语句支持
2. 新增for语句支持
3. 新增break,continue





# test
运行 test 目录下的测试用例即可

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


