# immutable学习

## 什么是 Immutable Data 
> Immutable Data 就是一旦创建，就不能再被更改的数据。对 Immutable 对象的任何修改或添加删除操作都会返回一个新的 Immutable 对象。Immutable 实现的原理是 Persistent Data Structure（持久化数据结构），也就是使用旧数据创建新数据时，要保证旧数据同时可用且不变。同时为了避免 deepCopy 把所有节点都复制一遍带来的性能损耗，Immutable 使用了 Structural Sharing（结构共享），即如果对象树中一个节点发生变化，只修改这个节点和受它影响的父节点，其它节点则进行共享。

## Immutable 优点
1. Immutable 降低了 Mutable 带来的复杂度。
可变（Mutable）数据耦合了 Time 和 Value 的概念，造成了数据很难被回溯。
比如下面一段代码：
```
    function touchAndLog(touchFn) {
        let data = { key: 'value' };
        touchFn(data);
        console.log(data.key); // 猜猜会打印什么？
    }
```
> 在不查看 `touchFn` 的代码的情况下，因为不确定它对 `data` 做了什么，你是不可能知道会打印什么（这不是废话吗）。但如果 `data` 是 Immutable 的呢，你可以很肯定的知道打印的是 `value`。

2. 节省内存,
Immutable.js 使用了 Structure Sharing 会尽量复用内存。没有被引用的对象会被垃圾回收。
```
    import { Map} from 'immutable';
    let a = Map({
        select: 'users',
        filter: Map({ name: 'Cam' })
    })
    let b = a.set('select', 'people');

    a === b; // false

    a.get('filter') === b.get('filter'); // true
    上面 a 和 b 共享了没有变化的 `filter` 节点。
```
3. Undo/Redo，Copy/Paste，甚至时间旅行这些功能做起来小菜一碟。
因为每次数据都是不一样的，只要把这些数据放到一个数组里储存起来，想回退到哪里就拿出对应数据即可，很容易开发出撤销重做这种功能。

4. 并发安全.
传统的并发非常难做，因为要处理各种数据不一致问题，因此『聪明人』发明了各种锁来解决。但使用了 Immutable 之后，数据天生是不可变的，并发锁就不需要了。
然而现在并没什么卵用，因为 JavaScript 还是单线程运行的啊。但未来可能会加入，提前解决未来的问题不也挺好吗？

5. 拥抱函数式编程.
Immutable 本身就是函数式编程中的概念，纯函数式编程比面向对象更适用于前端开发。因为只要输入一致，输出必然一致，这样开发的组件更易于调试和组装。
像 ClojureScript，Elm 等函数式编程语言中的数据类型天生都是 Immutable 的，这也是为什么 ClojureScript 基于 React 的框架 --- Om 性能比 React 还要好的原因。

## 使用 Immutable 的缺点
1. 需要学习新的 API

2. 增加了资源文件大小

3. 容易与原生对象混淆

> 这点是我们使用 Immutable.js 过程中遇到最大的问题。写代码要做思维上的转变。
虽然 Immutable.js 尽量尝试把 API 设计的原生对象类似，有的时候还是很难区别到底是 Immutable 对象还是原生对象，容易混淆操作。
Immutable 中的 Map 和 List 虽对应原生 Object 和 Array，但操作非常不同，比如你要用 `map.get('key')` 而不是 `map.key`，`array.get(0)` 而不是 `array[0]`。另外 Immutable 每次修改都会返回新对象，也很容易忘记赋值。
当使用外部库的时候，一般需要使用原生对象，也很容易忘记转换。
下面给出一些办法来避免类似问题发生：
使用 Flow 或 TypeScript 这类有静态类型检查的工具
约定变量命名规则：如所有 Immutable 类型对象以 `$$` 开头。
使用 `Immutable.fromJS` 而不是 `Immutable.Map` 或 `Immutable.List` 来创建对象，这样可以避免 Immutable 和原生对象间的混用。

### 本文参考了[这篇文章](https://zhuanlan.zhihu.com/p/20295971)