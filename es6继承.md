# es6的继承

## es6的继承与es5继承实现的区别

> 子类必须在constructor方法中调用super方法，否则新建实例时会报错。这是因为子类自己的this对象，必须先通过父类的构造函数完成塑造，得到与父类同样的实例属性和方法，然后再对其进行加工，加上子类自己的实例属性和方法。如果不调用super方法，子类就得不到this对象。

> ES5 的继承，实质是先创造子类的实例对象this，然后再将父类的方法添加到this上面（Parent.apply(this)）。ES6 的继承机制完全不同，实质是先将父类实例对象的属性和方法，加到this上面（所以必须先调用super方法），然后再用子类的构造函数修改this。正是因为这个原因，才需要在使用this关键字之前先调用super来执行父类的构造函数

es6的继承不仅会继承实例属性、prototype上的属性，还会继承父类的静态方法和静态属性

```
    class A {
        static a = 100
        static hello() {
            console.log('hello world');
        }
        constructor() {
            this.a = 10000
        }

        say() {
            console.log('hello')
        }
    }

    class B extends A {
    }

    B.hello()  // hello world  静态方法
    B.a  // 100  静态属性
    let b = new B();
    b.a  // 10000  实例属性
    b.say()  // hello prototype上的方法

```

## super使用的注意点

1. super必须在this关键字之前使用，不然会报错，具体原因前面有解释
2. super作为函数调用时只能出现在构造函数内
3. super作为对象时，在普通方法中，指向父类的原型对象；在静态方法中，指向父类
    ```
        class A {
            p() {
                return 2;
            }
        }

        class B extends A {
            constructor() {
                super();
                console.log(super.p()); // 2
                // 此处super.p()等价于super.prototype.p()
            }
        }
    ```
4. 这里需要注意，由于super指向父类的原型对象，所以定义在父类实例上的方法或属性，是无法通过super调用的
   ```
        class A {
            constructor() {
                this.p = 2;
            }
        }

        class B extends A {
            get m() {
                return super.p;
            }
        }

        let b = new B();
        b.m // undefined
   ```
5. 在子类普通方法中通过super调用父类的方法时，方法内部的this指向当前的子类实例
   ```
    class A {
        constructor() {
            this.x = 1;
        }
        print() {
            console.log(this.x);
        }
    }

    class B extends A {
        constructor() {
            super();
            this.x = 2;
        }
        m() {
            super.print(); 
            // 相当于调用了super.print.call(this)，所以print中的this指向的是子类实例
        }
    }

    let b = new B();
    b.m() // 2
   ```
6. 由于this指向子类实例，所以如果通过super对某个属性赋值，这时super就是this，赋值的属性会变成子类实例的属性
   ```
    class A {
        constructor() {
            this.x = 1;
        }
    }

    class B extends A {
        constructor() {
            super();
            this.x = 2;
            super.x = 3;  // 相当于是this.x = 3
            console.log(super.x); 
            // undefined 相当于是A.prototype.x
            console.log(this.x); // 3
        }
    }

   ```
7. 如果super作为对象，用在静态方法之中，这时super将指向父类，而不是父类的原型对象
   ```
    class Parent {
        static myMethod(msg) {
            console.log('static', msg);
        }

        myMethod(msg) {
            console.log('instance', msg);
        }
    }

    class Child extends Parent {
        static myMethod(msg) {
            super.myMethod(msg);
        }

        myMethod(msg) {
            super.myMethod(msg);
        }
    }

    Child.myMethod(1); // static 1

    var child = new Child();
    child.myMethod(2); // instance 2
   ```

8. 在子类的静态方法中通过super调用父类的方法时，方法内部的this指向当前的子类，而不是子类的实例
   ```
    class A {
        constructor() {
            this.x = 1;
        }
        static print() {
            console.log(this.x);
        }
    }

    class B extends A {
        constructor() {
            super();
            this.x = 2;
        }
        static m() {
            super.print();
        }
    }

    B.x = 3;
    B.m() // 3
   ```

## 类的 prototype 属性和__proto__属性

Class 作为构造函数的语法糖，同时有prototype属性和__proto__属性，因此同时存在两条继承链。

1. 子类的__proto__属性，表示构造函数的继承，总是指向父类。

2. 子类prototype属性的__proto__属性，表示方法的继承，总是指向父类的prototype属性。
   ```
    class A {
    }

    class B extends A {
    }

    B.__proto__ === A // true
    B.prototype.__proto__ === A.prototype // true
    let b = new B()
    b.__proto__ === B.prototype  // true
   ```

## 继承原生构造函数

```
    function MyArray() {
        Array.apply(this, arguments);
    }

    MyArray.prototype = Object.create(Array.prototype, {
        constructor: {
            value: MyArray,
            writable: true,
            configurable: true,
            enumerable: true
        }
    });
    var colors = new MyArray();
    colors[0] = "red";
    colors.length  // 0

    colors.length = 0;
    colors[0]  // "red"
```
之所以会发生这种情况，是因为子类无法获得原生构造函数的内部属性，通过Array.apply()或者分配给原型对象都不行。原生构造函数会忽略apply方法传入的this，也就是说，原生构造函数的this无法绑定，导致拿不到内部属性。

ES5 是先新建子类的实例对象this，再将父类的属性添加到子类上，由于父类的内部属性无法获取，导致无法继承原生的构造函数。比如，Array构造函数有一个内部属性[[DefineOwnProperty]]，用来定义新属性时，更新length属性，这个内部属性无法在子类获取，导致子类的length属性行为不正常。

但是在es6中可以实现原生构造函数的继承

```
    class MyArray extends Array {
        constructor(...args) {
            super(...args);
        }
    }

    var arr = new MyArray();
    arr[0] = 12;
    arr.length // 1

    arr.length = 0;
    arr[0] // undefined
```