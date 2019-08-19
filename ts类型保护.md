# typescript的类型保护


引入类型保护的原因是联合类型的存在


## 1. 交叉类型

```
    interface A {
        name: string;
    }
    interface B {
        age: number;
    }
    let a: A & B = {
        name: 'alex',
        age: 23,
    }
    // 这里的A & B就是一个交叉类型，所以a就必须同时包含A、B两种接口的所有字段，缺一不可
```


## 2. 联合类型

```
    interface A {
        name: string;
        weight: number;
    }
    interface B {
        age: number;
    }
    interface C {
        height: number;
    }
    let a: A | B | C = {
        name: 'alex',
        age: 23,
        height: 170
    }

    a.height; // Error Property 'height' does not exist on type 'A | B | C'. Property 'height' does not exist on type 'A'.
    // 这里的A | B | C就是一个联合类型，所以a必须包含其中一种类型的全部实现，还可以额外包括除该类型外的别的类型的任意成员的实现
    // 譬如上面的a实现了B和C，但是A只实现了部分，不会报错
    // 1. 如果只是单独完全实现了某一个接口，譬如a = { height： 170 }，这时a会被推断为C类型，然后在下面写a.height不会报错，因为C类型有这个字段
    // 1. 如果不止实现了一个接口，譬如上面代码所示，这时a会被推断为A | B | C类型，然后在下面写a.height会报错，因为无法判断是否有这个字段，如果取的是各个接口的公共字段就不会报错
```

像下面这样的使用也是会报错的：

```
    interface A {
        name: string;
        age: number;
    }
    interface B {
        name: string;
        height: number;
    }

    function fn(o: A | B) {
        if(o.name === 'alex') {
            // OK 这是公共字段，取值没问题
        }

        if(o.age === 23) {
            // error A | B上面没有age字段
        } 
    }

```

正是由于上面这种情况，才需要类型保护的出现

