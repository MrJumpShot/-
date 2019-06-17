# setState的一些理解（源码还需要再研究研究）

> 引用一下Dan关于setState的说法：The key to understanding this is that no matter how many setState() calls in how many components you do inside a React event handler, they will produce only a single re-render at the end of the event. This is crucial for good performance in large applications because if Child and Parent each call setState() when handling a click event, you don't want to re-render the Child twice.
setState() calls happen inside a React event handler. Therefore they are always flushed together at the end of the event (and you don't see the intermediate state).

解释一下就是：在 React 中，如果调用 setState 会立刻更新 state 并且 re-render，但如果处理更新的 handler 函数是绑定在”事件处理“，例如 onClick、onChange、onKeyDown 等等，这时这些 setState 的执行最后只会触发一次 re-render，而不是每次执行 setState 后 re-render、然后才进行到下一次 setState 接着再度 re-render。这是为了性能表现的设计，试想如果每次事件发生、比如 onClick 或是 onKeyDown，触发 eventHandler，parents component 和 child component 都 call setState，child component 就会 re-render 两次，可能会出现性能问题。

所以react的setState原本是一个同步的操作，但是react对于任务的批处理导致有些情况下会出现像异步表现的情况，一般的，出现在生命周期内或是react合成事件（onClick、onKeyDown）内的setState 都是会被批处理的，表现出来的就是setState就像一个异步操作一样，但是在原生的事件回调（addEventListener绑定的事件）或是setTimeout或setInterval等异步回调里面展现的就是同步的效果，一个回调里面的多个setState会被同步执行


```
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        }
    }
    componentDidMount() {
        this.ref.btn1.addEventListener('click', () => {
            this.change()
        })
    }

    change = () => {
        this.setState({
            count: this.state.count + 1
        })
        console.log(this.state.count) // 1
        this.setState({
            count: this.state.count + 1
        })
        console.log(this.state.count) // 2
        this.setState({
            count: this.state.count + 1
        })
        console.log(this.state.count) // 3
    }

```

同样的，在setTimeout和setInterval中也有相似的表现。

```
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        }
    }
    componentDidMount() {
        this.inter = setInterval(() => {
        this.setState({
            count: this.state.count + 1
        })
        console.log(this.state.count) // 1
        this.setState({
            count: this.state.count + 1
        })
        console.log(this.state.count) // 2
        this.setState({
            count: this.state.count + 1
        })
        console.log(this.state.count) // 3
        this.setState(pre => {
            return {
            count: pre.count + 2
            }
        })
        console.log(this.state.count)
        }, 2000); // 5
     }

```

如果上述的代码改为：

```
    componentDidMount() {
        for ( let i = 0; i < 100; i++ ) {
            this.setState( { num: this.state.count + 1 } );
            console.log( this.state.count );    // 会输出什么？
        }
    }

    render() {
        const { count } = this.state;

        return <div>{ count }</div>
    }
    // 结果是每次循环都打印出旧值 0
    // 渲染在页面上的是 1
```

最后来看这样一段代码，再加深一下理解：

```
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        }
    }
    componentDidMount() {
    
        this.setState({count: this.state.count + 1}, () => {
            console.log(this.state.count)
        })
        this.setState({count: this.state.count + 1}, () => {
            console.log(this.state.count)
        })
        this.setState({count: this.state.count + 1}, () => {
            console.log(this.state.count)
        })
        // 前面三个console的结果是一致的，都是2，他们虽然调用了三次，但是他们被batch了，所以相当于只触发了一次setState
        this.setState(pre => {
            return {count: pre.count+1}
        })
        console.log(this.state.count)   // 此处的console最早触发，同步的代码，打印出的结果为1，虽然在上面有一个函数为入参的setState，但是并不意味这这个setState是同步调用的，最前面的三个调用虽然有第二个参数，但改变不了他们将被batch的命运，第二个回调函数参数的作用只是确保了这个回调函数里面得到的state是最新的，因为他们是在setState之后触发的回调，所以得到新的state是可以理解的
        setTimeout(() => {
            this.setState({count: this.state.count+1})
            console.log(this.state.count)
            // 此处的console最晚触发，打印出的是3，setTimeout调度的异步操作晚于其他的setState
        })
    }
```

## 总结

我们常说的`setState`的“异步”并不是说内部由异步代码实现，其实本身执行的过程和代码都是同步的，只是合成事件和生命周期钩子函数的调用顺序在更新之前，导致在合成事件和钩子函数中没法立马拿到更新后的值，形式了所谓的“异步”，当然可以通过第二个参数 `setState(partialState, callback)` 中的`callback`拿到更新后的结果。但是在原生事件和`setTimeout`中`setState`的调用是同步执行的

> 注意：在合成事件和生命周期内的异步调用`setState`（比如`ajax`和`setTimeout`内），也是会同步更新`this.setState`。


React的事件系统和生命周期事务前后的钩子对isBatchingUpdates做了修改，其实就是在事务的前置pre内调用了batchedUpdates方法修改了变量为true，然后在后置钩子又置为false，然后发起真正的更新检测，而事务中异步方法运行时候，由于JavaScript的异步机制，异步方法（setTimeout等）其中的setState运行时候，同步的代码已经走完，后置钩子已经把isBatchingUpdates设为false，所以此时的setState会直接进入非批量更新模式，表现在我们看来成为了同步SetState。

尝试在描述一下：整个React的每个生命周期和合成事件都处在一个大的事务当中。原生绑定事件和setTimeout异步的函数没有进入React的事务当中，或者是当他们执行时，刚刚的事务已经结束了，后置钩子触发了，close了。（大家可以想一想分别是哪一种情况）。
