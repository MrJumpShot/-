# es5实现继承

> new方法的缺陷在于每个实例的属性都是独立的，无法共享，像一些函数的属性我们是希望共享的，所以就有了prototype的出现

> 在设计继承的时候我们希望达到的效果是实例属性都是各种独自拥有的，但是放在prototype上的属性是需要共享的，在后面评判各种继承方式的优缺点也是会参考这两点的


## 六种方式：

### 1、原型链继承

    // 原型链继承 子类的原型指向父类的实例
    // 由于原型链继承共享属性实例属性的缺点，属于引用类型传值，引用副本实例属性的修改必然会引起其他副本实例属性的修改，所以不常使用；
    // 另一个缺点在于不能向父类构造函数随时传递参数，很不灵活
    function SuperType() {
        this.colors = ['red', 'blue', 'green'];
    }

    function SubType() {}
    SubType.prototype = new SuperType();
    let instance1 = new SubType();
    instance1.colors.push('black');
    console.log(instance1.colors);
    let instance2 = new SubType();
    console.log(instance2.colors);



### 2、借用构造函数继承

    // 借用构造函数继承, 在执行Child构造函数的时候，子类的实例各自得到一份构造函数的副本，属于值传递，所以子类之间的属性修改是互不相关的；
    // 缺点：单独使用无法达到函数复用，因为每一个函数和属性都需要在构造函数中定义，没法复用，即没有父类prototype上的函数，只有不能共用的实例属性
    // 而且instanceof操作无法确定子类实例和父类之间的关系，因为子类的prototype和父类无关
    function Parent() {
        this.colors = ['red', 'blue', 'green'];
    }

    function Child() {
        Parent.call(this);
    }

    let instance3 = new Child();
    instance3.colors.push('white');
    console.log(instance3.colors);

    let instance4 = new Child();
    console.log(instance4.colors);



### 3、组合式继承

把父类的一个实例设为子类的prototype，然后在子类的构造函数内调用父类的构造函数，调用这样父类的实例属性出现了两个地方，调用父类构造函数的时候实现了子类实例对子类prototype上父类实例属性的覆盖，达到了较好的效果，既能传参，也可以实现是否共享的控制，唯一的问题在于调用了两次父类的构造函数，父类的实例属性在子类prototype上浪费了

    // 组合继承模式 常用 原型链继承+构造函数继承
    // 原型链继承共享属性(属性方法和属性)， 构造函数继承父类构造函数的实例属性
    // 缺点: 调用了两次父类构造函数，生成了两份实例，一个子类实例，一个父类实例，父类实例作为prototype使用
    function Person(name, age) {
        this.name = name;
        this.age = age;
        this.action = ['speak', 'run', 'eat'];
        console.log('我被调用了');
    }
    Person.prototype.say = function () {
        console.log(`my name is ${this.name} and I am ${this.age} years old!`);
    };

    function Student(name, age, score) {
        Person.call(this, name, age);  // 借用构造函数, 第一次调用父类构造函数
        this.score = score;
    }

    Student.prototype = new Person();  // 原型链继承, 第二次调用父类构造函数
    Student.prototype.constructor = Student;  // 将实例的原型上的构造函数指定为当前子类的构造函数
    Student.prototype.showScore = function () {
        console.log(`my score is ${this.score}`);
    };

    let xiaoming = new Student('xiaoming', 23, '88');
    xiaoming.action.push('panio');
    console.log(xiaoming.action);
    xiaoming.say();
    xiaoming.showScore();

    let xiaohua = new Student('xiaohua', 24, '99');
    console.log(xiaohua.action);
    xiaohua.say();
    xiaohua.showScore();


### 4、原型式继承

利用一个空对象作为中介，将某个对象直接赋值给空对象构造函数的原型。

    function object(obj){
        function F(){}
        F.prototype = obj;
        return new F();
    }

object()对传入其中的对象执行了一次浅复制，将构造函数F的原型直接指向传入的对象。之所以要这样创造一个空对象，就是为了看后续继续添加属性的过程不会污染原来的对象

    var person = {
        name: "Nicholas",
        friends: ["Shelby", "Court", "Van"]
    };

    var anotherPerson = object(person);
    anotherPerson.name = "Greg";
    anotherPerson.friends.push("Rob");

    var yetAnotherPerson = object(person);
    yetAnotherPerson.name = "Linda";
    yetAnotherPerson.friends.push("Barbie");

    alert(person.friends);   //"Shelby,Court,Van,Rob,Barbie"

缺点：

原型链继承多个实例的引用类型属性指向相同，存在篡改的可能。
无法传递参数

另外，ES5中存在Object.create()的方法，能够代替上面的object方法，因为object方法其本质就是一个浅复制的过程。

个人认为这种继承方式很不好，每次继承都直接返回一个对象，要继续在对象上面扩展，麻烦，下面这种写法或许更好
```
    function extend(Child, Parent) {
　　　　var F = function(){};
　　　　F.prototype = Parent.prototype;
　　　　Child.prototype = new F();
　　　　Child.prototype.constructor = Child;
　　}
    // extend函数做的就是创造一个空对象作为Child的prototype，该空对象的__proto__又指向Parent
```

### 5、寄生式继承
核心：在原型式继承的基础上，增强对象，返回的也直接是一个对象，所以寄生式继承就相当于一个工厂函数，里面对被继承的对象进行加强，丢进去要继承的对象，出来一个已经加强过的新对象

    function createAnother(original){
        var clone = object(original); // 通过调用 object() 函数创建一个新对象
        clone.sayHi = function(){  // 以某种方式来增强对象
            alert("hi");
        };
        return clone; // 返回这个对象
    }

函数的主要作用是为构造函数新增属性和方法，以增强函数

    var person = {
        name: "Nicholas",
        friends: ["Shelby", "Court", "Van"]
    };
    var anotherPerson = createAnother(person);
    anotherPerson.sayHi(); //"hi"
缺点（同原型式继承）：

原型链继承多个实例的引用类型属性指向相同，存在篡改的可能。
无法传递参数

### 6、寄生组合式继承
    // 最好的方法，最理想的方法 寄生组合式继承
    // 解决了两次调用父类构造函数问题
    function Person_1(name, age) {
        this.name = name;
        this.age = age;
        this.action = ['speak', 'run', 'eat'];
        console.log('我被调用了');
    }
    Person_1.prototype.say = function () {
        console.log(`my name is ${this.name} and I am ${this.age} years old!`);
    };

    function Student_1(name, age, score) {
        Person_1.call(this, name, age);  // 借用构造函数, 第一次调用父类构造函数
        this.score = score;
    }

    Student_1.prototype = Object.create(Person_1.prototype);
    Student_1.prototype.constructor  = Student_1;
    Student_1.prototype.showScore = function () {
        console.log(`my score is ${this.score}`);
    };

    let xiaoming_1 = new Student('xiaoming_1', 23, '78');
    xiaoming_1.action.push('panio');
    console.log(xiaoming_1.action);
    xiaoming_1.say();
    xiaoming_1.showScore();

    let xiaohua_1 = new Student('xiaohua_1', 24, '89');
    console.log(xiaohua_1.action);
    xiaohua_1.say();
    xiaohua_1.showScore();


### 补充es6的extends继承

extends继承的核心代码如下，其实现和上述的寄生组合式继承方式一样
    function _inherits(subType, superType) {
    
        // 创建对象，创建父类原型的一个副本
        // 增强对象，弥补因重写原型而失去的默认的constructor 属性
        // 指定对象，将新创建的对象赋值给子类的原型
        subType.prototype = Object.create(superType && superType.prototype, {
            constructor: {
                value: subType,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        
        if (superType) {
            Object.setPrototypeOf 
                ? Object.setPrototypeOf(subType, superType) 
                : subType.__proto__ = superType;
        }
    }