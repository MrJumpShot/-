# typescript学习笔记

> typescript文档来来回回看了也有三四遍了，但是每次看完都没有做一些实践，时间一久就全都忘了，有必要将一些重点和容易遗忘的知识点做一些记录。


1. 对象字面量会被特殊对待而且会经过 额外属性检查，当将它们赋值给变量或作为参数传递的时候。 如果一个对象字面量存在任何“目标类型”不包含的属性时，你会得到一个错误。
  ```
  interface SquareConfig {
    color?: string;
    width?: number;
  }

  // error: 'colour' not expected in type 'SquareConfig'
  let mySquare = createSquare({ colour: "red", width: 100 });
  ```
  避开这些检查的方法有：
  > 1. 使用类型断言
  ```
  let mySquare = createSquare({ width: 100, opacity: 0.5 } as SquareConfig);
  ```
  > 2. 将这个对象赋值给一个另一个变量： 因为 squareOptions不会经过额外属性检查，所以编译器不会报错。
  ```
  let squareOptions = { colour: "red", width: 100 };
  let mySquare = createSquare(squareOptions);
  ```
  > 3. 最佳的方式是能够添加一个字符串索引签名，前提是你能够确定这个对象可能具有某些做为特殊用途使用的额外属性。 如果 SquareConfig带有上面定义的类型的color和width属性，并且还会带有任意数量的其它属性，

  ```
  interface SquareConfig {
    color?: string;
    width?: number;
    [propName: string]: any;
  }
  ```