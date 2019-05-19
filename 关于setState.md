# 关于setState

```
    class Example extends React.Component {
    constructor() {
        super();
        this.state = {
        val: 0
        };
    }
    
    componentDidMount() {
        this.setState({val: this.state.val + 1});
        console.log(this.state.val);    // 第 1 次 log 0

        this.setState({val: this.state.val + 1});
        console.log(this.state.val);    // 第 2 次 log 0

        // 注意上述两次的setState都被batch起来，当执行的时候相当于都取了this.state.val，都指向了val = 0，所以看似执行了两次setState，实际上效果只是一次setState。

        setTimeout(() => {
        this.setState({val: this.state.val + 1});
        console.log(this.state.val);  // 第 3 次 log 2
        // 此时的setState里面取得的this.state.val = 1

        this.setState({val: this.state.val + 1});
        console.log(this.state.val);  // 第 4 次 log 3
        // 此时的setState里面取得的this.state.val = 1
        }, 0);
    }

    render() {
        return null;
    }
};

```

```
    function enqueueUpdate(component) {
        // ...

        if (!batchingStrategy.isBatchingUpdates) {
            batchingStrategy.batchedUpdates(enqueueUpdate, component);
            return;
        }

        dirtyComponents.push(component);
    }
```
> 若 isBatchingUpdates 为 true，则把当前组件（即调用了 setState 的组件）放入 dirtyComponents 数组中；否则 batchUpdate 所有队列中的更新。


* batchingStrategy
```
    var batchingStrategy = {
        isBatchingUpdates: false,

        batchedUpdates: function(callback, a, b, c, d, e) {
            // ...
            batchingStrategy.isBatchingUpdates = true;
            // transition 事务
            transaction.perform(callback, null, a, b, c, d, e);
        }
    };
```

> 很明显，在 componentDidMount 中直接调用的两次 setState，其调用栈更加复杂；而 setTimeout 中调用的两次 setState，调用栈则简单很多。让我们重点看看第一类 setState 的调用栈，有没有发现什么熟悉的身影？没错，就是batchedUpdates 方法，原来早在 setState 调用前，已经处于 batchedUpdates 执行的 transaction 中！

> 那这次 batchedUpdate 方法，又是谁调用的呢？让我们往前再追溯一层，原来是 ReactMount.js 中的_renderNewRootComponent 方法。也就是说，整个将 React 组件渲染到 DOM 中的过程就处于一个大的 Transaction 中。

> 接下来的解释就顺理成章了，因为在 componentDidMount 中调用 setState 时，batchingStrategy 的 isBatchingUpdates 已经被设为 true，所以两次 setState 的结果并没有立即生效，而是被放进了 dirtyComponents 中。这也解释了两次打印this.state.val 都是 0 的原因，新的 state 还没有被应用到组件中。

> 再反观 setTimeout 中的两次 setState，因为没有前置的 batchedUpdate 调用，所以 batchingStrategy 的 isBatchingUpdates 标志位是 false，也就导致了新的 state 马上生效，没有走到 dirtyComponents 分支。也就是，setTimeout 中第一次 setState 时，this.state.val 为 1，而 setState 完成后打印时 this.state.val 变成了 2。第二次 setState 同理。