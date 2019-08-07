# PureComponent和Component

在react使用中相信大家一定碰到或者使用过Component和PureComponent，但是这两者具体有什么区别，实现这种区别的原理是什么？(拼多多一面的时候被问了这个问题......)

## 区别

PureComponent通过prop和state的浅比较来实现shouldComponentUpdate，某些情况下可以用PureComponent提升性能

所以其实就是PureComponent在内部写好了shouldComponentUpdate这个函数，具体的写法如下：

```
    if (this._compositeType === CompositeTypes.PureClass) {
        shouldUpdate = !shallowEqual(prevProps, nextProps) || ! shallowEqual(inst.state, nextState);
    }
    // 所做的事情就是对props和state与之前的值进行一次浅比较，如果浅比较发现前后都没有变化，那么就不触发update，否则触发update
```

相比于PureComponent组件，Component组件的shouldComponentUpdate是默认返回true的，也就是说每一次setState，无论这次setState是否真的改变了状态都会触发update，或者只要父组件重新render了，传下来的props即使不发生变化（甚至没有传props进子组件）那子组件也会重新update一次，这在很多情况下显然是多余的更新，所以说PureComponent在一些情况下可以提升性能，但是使用时也有一些注意点，不然容易产生bug

来看一下Component组件的任性render：

```
    class Child extends React.Component {
        constructor(props) {
            super(props);
        }

        render() {
            console.log('child render')
            return <div>hahahah</div>
        }
    }

    class IndexPage extends React.Component{
        constructor() {
            super();
            this.state = {
                arr: [1]
            };
            console.log('constructor');
        }
        changeState = () => {
            const { arr } = this.state;
            arr.push('@')
            // 这里实际上arr的指向并没有发生变化，但是setState之后还是会触发update，因为IndexPage是继承自Component组件的，只要setState就会update，（如果现在改成继承自PureComponent，那么在shouldComponentUpdate里面的判断就会返回false，那么就不会触发update，那么子组件也不会update了）
            this.setState({
                arr
            })
        };
        render() {
            console.log('render');
            return (
                <div>
                    <button onClick={this.changeState}>点击</button>
                    <div>{this.state.arr.toString()}</div>
                    // 我们可以发现，点击按钮之后展示的内容一致在发生变化
                    <Child />
                    // 父组件没有传入props进入Child组件，但是只要父组件重新render了，因为子组件是继承自Component的，所以默认shouldComponentUpdate返回true，所以也会无脑render，即使和原来一模一样，（如果把子组件改成继承自PureComponent，那么即使父组件update，子组件也不会update，因为并没有传入props到子组件，在子组件的shouldComponentUpdate里面的判断会返回false）
                </div>
            );
        }
    }

```


## 注意点

所以在使用PureComponent时需要有些注意点：

1. 在state里面使用复杂类型的时候，如数组，避免直接对数组进行操作而忘记改变指向，这时即使数组实际内容发生了变化也不会update，像上面例子里面那样对数组的操作
   ```
        const { arr } = this.state;
        arr.push('@');
        this.setState({
            arr
        })
        // 这种做法只会触发Component的update而不会触发PureComponent的update，实际上，不管在哪找写法里面都不推荐直接对state里面的内容进行操作，正确的做法应该是下面这样
        const { arr } = this.state;
        const newArr = [...arr];
        newArr.push('@');
        this.setState({
            arr: newArr
        })

   ```

2. 对于基本数据类型来说，值发生变化PureComponent就会update，对于复杂数据类型要指向发生变化

```
    class Example extends React.PureComponent {
        constructor(props) {
            super(props);
            this.state = {
                isShow: false,
            }
        }

        handleClick = () => {
            this.setState({
                isShow: true
            })
        }

        render() {
            console.log('render');
            // 第一次组件初始化render的时候会打印一次render
            // 第一次点击按钮触发事件会触发一次render
            // 后续再点击按钮就不会触发render了，因为后续的isShow的值始终是true，setState也没有发生变化
            // 如果把组件改成继承自Component的话，那么所有的点击都会触发render
            return ....
        }

    }
```