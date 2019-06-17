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