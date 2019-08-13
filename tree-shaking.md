# tree-shaking

## commonJS不支持tree-shaking

原因在于commonJS是动态引入的，编译的时候不知道引入的是什么模块，只有执行的时候才知道

```
    var myDynamicModule;

    if (condition) {
        myDynamicModule = require("foo");
    } else {
        myDynamicModule = require("bar");
    }
    // 无法确定引入的是哪个模块，所以无法tree-shaking
```

同样的，如果es6模块不在顶层import也无法进行tree-shaking

```
    if (condition) {
        import foo from "foo";
    } else {
        import bar from "bar";
    }
```

commonJS模块在引入的时候要先执行一遍模块才可以得到该模块导出的对象，然后才能在这个对象上获取方法属性，这就意味着只有执行的时候才可以得到方法，自然不支持tree-shaking

```
    // CommonJS模块
    let { stat, exists, readFile } = require('fs');

    // 等同于
    let _fs = require('fs'); // 这一步其实是执行了fs模块
    let stat = _fs.stat;
    let exists = _fs.exists;
    let readfile = _fs.readfile;
```