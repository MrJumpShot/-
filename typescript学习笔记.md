# typescript学习笔记

> `typescript`文档来来回回看了也有三四遍了，但是每次看完都没有做一些实践，时间一久就全都忘了，有必要将一些重点和容易遗忘的知识点做一些记录。


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
  > 2. 将这个对象赋值给一个另一个变量： 因为 `squareOptions`不会经过额外属性检查，所以编译器不会报错。
  ```
  let squareOptions = { colour: "red", width: 100 };
  let mySquare = createSquare(squareOptions);
  ```
  > 3. 最佳的方式是能够添加一个字符串索引签名，前提是你能够确定这个对象可能具有某些做为特殊用途使用的额外属性。 如果 `SquareConfig`带有上面定义的类型的`color`和`width`属性，并且还会带有任意数量的其它属性，

  ```
  interface SquareConfig {
    color?: string;
    width?: number;
    [propName: string]: any;
  }
  ```

  2. 关于类接口
  > 1. 接口描述了类的公共部分，而不是公共和私有两部分。 它不会帮你检查类是否具有某些私有成员。
  > 2. 当你操作类和接口的时候，你要知道类是具有两个类型的：静态部分的类型和实例的类型。 你会注意到，当你用构造器签名去定义一个接口并试图定义一个类去实现这个接口时会得到一个错误：
  ```
  interface ClockConstructor {
      new (hour: number, minute: number);
  }

  class Clock implements ClockConstructor {
      currentTime: Date;
      constructor(h: number, m: number) { }
  } 
  ```
  `typescript`会去检查在实例部分是否实现了`new (hour: number, minute: number);`这部分内容，结果发现没有，则会报错，对于`constructor`的实现并不会进行检查

  ```
  interface ClockConstructor {
      new (hour: number, minute: number) : ClockInterface;
  }
  interface ClockInterface {
      tick();
  }

  function createClock(ctor: ClockConstructor, hour: number, minute: number): ClockInterface {
      return new ctor(hour, minute);
  }

  class DigitalClock implements ClockInterface {
      constructor(h: number, m: number) { }
      tick() {
          console.log("beep beep");
      }
  }
  class AnalogClock implements ClockInterface {
      constructor(h: number, m: number) { }
      tick() {
          console.log("tick tock");
      }
  }

  let digital = createClock(DigitalClock, 12, 17);
  let analog = createClock(AnalogClock, 7, 32);
  ```
  这段代码中利用函数的参数需要满足`ClockConstructor`这个接口来进行静态的构造器的检查。

  3. 关于类
  ```
  class Greeter {
      greeting: string; // 默认修饰符为public
      constructor(message: string) {
          this.greeting = message;
      }
      greet() {
          return "Hello, " + this.greeting;
      }
  }

  let greeter = new Greeter("world");
  ```
  上述代码编译后得到:
  ```
  var Greeter = /** @class */ (function () {
      function Greeter(message) {
          this.greeting = message;
      }
      Greeter.prototype.greet = function () {
          return "Hello, " + this.greeting;
      };
      return Greeter;
  }());
  var greeter = new Greeter("world");
  ```
  
  > TypeScript使用的是结构性类型系统。 当我们比较两种不同的类型时，并不在乎它们从何处而来，如果所有成员的类型都是兼容的，我们就认为它们的类型是兼容的。
  然而，当我们比较带有 private或 protected成员的类型的时候，情况就不同了。 如果其中一个类型里包含一个 private成员，那么只有当另外一个类型中也存在这样一个 private成员， 并且它们都是来自同一处声明时，我们才认为这两个类型是兼容的。 对于 protected成员也使用这个规则。

  ```
    class Animal {
        private name: string;
        constructor(theName: string) { this.name = theName; }
    }

    class Rhino extends Animal {
        constructor() { super("Rhino"); }
    }

    class Employee {
        private name: string;
        constructor(theName: string) { this.name = theName; }
    }

    let animal = new Animal("Goat");
    let rhino = new Rhino();
    let employee = new Employee("Bob");

    animal = rhino;
    animal = employee; // 错误: Animal 与 Employee 不兼容.
```

> 构造函数也可以被标记成 protected。 这意味着这个类不能在包含它的类外被实例化，但是能被继承。比如，
```
  class Person {
    protected name: string;
    protected constructor(theName: string) { this.name = theName; }
}

// Employee 能够继承 Person
class Employee extends Person {
    private department: string;

    constructor(name: string, department: string) {
        super(name);
        this.department = department;
    }

    public getElevatorPitch() {
        return `Hello, my name is ${this.name} and I work in ${this.department}.`;
    }
}

let howard = new Employee("Howard", "Sales");
let john = new Person("John"); // 错误: 'Person' 的构造函数是被保护的.
```
> 类实例之间相互赋值的条件：
1. 当没有private和protected修饰符时，相互间的赋值类似于对象的赋值
2. 当有上述修饰符时只能父子类的实例之间相互赋值

> 类可以当做接口来使用

```
  class Point {
      x: number;
      y: number;
  }

  interface Point3d extends Point {
      z: number;
  }

  let point3d: Point3d = {x: 1, y: 2, z: 3};
```

