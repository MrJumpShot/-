# useEffect使用指南

本文是阅读[A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)之后的个人总结，建议拜读原文


## 理解hooks工作机制

可以这样说，在使用了useState或是useEffect这样的hooks之后，每次组件在render的时候都生成了一份本次render的state、function、effects，这些与之前或是之后的render里面的内容都是没有关系的。而对于class component来说，state是一种引用的形式。这就造成了二者在一些表现上的不同。

来看下面这样一段代码：

```
    function Counter() {
        const [count, setCount] = useState(0);

        function handleAlertClick() {
            setTimeout(() => {
            alert('You clicked on: ' + count);
            }, 3000);
        }
        // 多次点击click me按钮，然后点击一下show alert按钮，然后又快速点击多次click me按钮，alert出来的count是点击该按钮时的count还是最新的count？？
        // 实验表明，显示的是点击时的按钮，这就意味着handleAlertClick这个函数capture了被点击时的那个count，这也就是说每一轮的count都是不一样的
        return (
            <div>
                <p>You clicked {count} times</p>
                <button onClick={() => setCount(count + 1)}>
                    Click me
                </button>
                <button onClick={handleAlertClick}>
                    Show alert
                </button>
            </div>
        );
    }
```

再看这样一段代码：

```
    function Counter() {
        const [count, setCount] = useState(0);

        useEffect(() => {
            setTimeout(() => {
                console.log(count)
            }, 3000)
        })
        // 在3秒内快速点击5次按钮，控制台打出的结果是什么样的？
        // 0 1 2 3 4 5
        return (
            <div>
                <p>You clicked {count} times</p>
                <button onClick={() => setCount(count + 1)}>
                    Click me
                </button>
            </div>
        );
    }
```

把上述代码改成class component的形式：

```
    class Example extends React.Component{

        constructor(props) {
            super(props);
                this.state = {
                count: 0,
            }
        }

        componentDidUpdate() {
            setTimeout(() => {
                console.log(this.state.count)
            }, 3000)
        }

        add = () => {
            const {count} = this.state;
            this.setState({count: count + 1})
        }

        // 同样的操作，打印出的结果是 5 5 5 5 5

        render() {
            return (
                <div>
                    <button onClick={this.add}>click me</button>
                </div>
            )
        }
    }
```
对于class component里面的表现，我们可以通过闭包来改变，之所以如此是因为class component里面的state随着render是发生变化的，而useEffect里面即使使用props.count也不会有问题，因为useEffect里面的所有东西都是每次render独立的

```
    componentDidUpdate() {
        // 在class component中必须每次把count取出来
        const { count } = this.state;
        setTimeout(() => {
            console.log(count)
        }, 3000)
    }
```

```
    function Example(props) {
        useEffect(() => {
            setTimeout(() => {
            console.log(props.counter);
            }, 1000);
        });
        // 在useEffect中不需要先把count从props里面取出来，每次依然是独立的
    }
```

可以发现，尽管useEffect里面的函数延迟执行了，但是打出的count依然是当时render里面的count，这也说明了其实每次render都是独立的，里面有独立的state、effects、function

```
    // During first render
    function Counter() {
        const count = 0; // Returned by useState()
        // ...
        <p>You clicked {count} times</p>
        // ...
    }

    // After a click, our function is called again
    function Counter() {
        const count = 1; // Returned by useState()
        // ...
        <p>You clicked {count} times</p>
        // ...
    }

    // After another click, our function is called again
    function Counter() {
        const count = 2; // Returned by useState()
        // ...
        <p>You clicked {count} times</p>
        // ...
    }
```

下面这段话是精髓：

> Inside any particular render, props and state forever stay the same. But if props and state are isolated between renders, so are any values using them (including the event handlers). They also “belong” to a particular render. So even async functions inside an event handler will “see” the same count value.


## useEffect的一些注意点

来看官方文档里面关于useEffect清除工作的示例：

```
    function Example(props) {
        useEffect(() => {
            ChatAPI.subscribeToFriendStatus(props.id,       handleStatusChange);
            return () => {
                ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
            };
        });
    }
```
如果props从{id: 10}变化为{id: 20}那么react是怎么样来渲染组件、怎么样做清除工作的呢？

按照惯性思维，我们可能觉得应该是先清理之前一次render注册的事件，然后render组件，然后再注册本次render的事件

```
    React cleans up the effect for {id: 10}.
    React renders UI for {id: 20}.
    React runs the effect for {id: 20}.
```
但实际上react并不是这样工作的，而是像下面这样，因为react总是在浏览器paint之后再去做effects相关的事情，无论是useEffect还是他返回的函数，而且清理函数也和其他函数一样能够capture当前的props和state，尽管在他执行时已经是新的组件render好了

```
    React renders UI for {id: 20}.
    The browser paints. We see the UI for {id: 20} on the screen.
    React cleans up the effect for {id: 10}.
    React runs the effect for {id: 20}.
```

清理函数就像闭包一样直接把他所属的render的props和state消费，然后在需要执行的时候使用这些值

```
    // First render, props are {id: 10}
    function Example() {
        // ...
        useEffect(
            // Effect from first render
            () => {
                ChatAPI.subscribeToFriendStatus(10, handleStatusChange);
                // Cleanup for effect from first render
                return () => {
                    ChatAPI.unsubscribeFromFriendStatus(10, handleStatusChange);
                };
            }
        );
        // ...
        }

    // Next render, props are {id: 20}
    function Example() {
        // ...
        useEffect(
            // Effect from second render
            () => {
                ChatAPI.subscribeToFriendStatus(20, handleStatusChange);
                // Cleanup for effect from second render
                return () => {
                    ChatAPI.unsubscribeFromFriendStatus(20, handleStatusChange);
                };
            }
        );
        // ...
    }
```

## 忘记lifecycle的观念，拥抱synchronization

在class component里面，lifecycle是我们做一切的基础，但是在使用react-hooks的时候，请忘记lifecycle，尽管useEffect函数很多时候达到了相似的效果

但从根本上来讲，react-hooks的作用是一种同步的作用，同步函数hooks函数内的内容与外部的props以及state，所以才会在每次render之后执行useEffect里面的函数，这时可以获取到当前render结束后的props和state，来保持一种同步

但正是由于useEffect里面的内容在每次render结束后都会执行，可能有时候内部的内容并没有发生变化，这时就会产生冗余的render，这时候就需要引入依赖，由写程序的人来告诉react我这个useEffect依赖了外部的那些参数，只有这些参数发生变化的时候才去执行我里面的函数。

因为react自己不知道什么时候useEffect里面的函数其实没有发生变化。

```
     useEffect(() => {
        document.title = 'Hello, ' + name;
    }, [name]); // Our deps
```

上面这段代码相当于告诉react，我这个effect的依赖项是name这个变量，只有当name发生变化的时候才去执行里面的函数

而且这个比较是浅比较，如果state是一个对象，那么对象只要指向不发生变化，那么就不会执行effect里面的函数

譬如：
```
    function Example() {
        const [count, setCount] = useState({a: 12});

        useEffect(() => {
            console.log('effect');
            return () => {
                console.log('clean')
            }
        }, [count])

        function handleClick() {
            count.a++;
            setCount(count)
        }

        // 点击按钮时发现屏幕显示的值不发生变化，而且effect里面的函数也没有执行，所以进行的是浅比较，这点类似于pureComponent

        return (
            <div>
                <p>You clicked {count.a} times</p>
                <button onClick={handleClick}>
                    Click me
                </button>
            </div>
        );
    }
```

### 关于dependency数组

如果强行欺骗react来达到跳过某些渲染之后的effect函数的话，那么可能会出现一些意想不到的后果：


如下代码，我们想模拟一个定时器，在第一次渲染之后挂载，在组件卸载的时候取消这个定时器，那么这好像和把dependency数组设为[]的功能很像，但是如果这样做的话，结果是定时器只加一次。

```
    function Counter() {
        const [count, setCount] = useState(0);

        useEffect(() => {
            const id = setInterval(() => {
                setCount(count + 1);
            }, 1000);
            // 定时器只加一次的原因在于虽然setInterval函数里面的函数每秒都会执行一次，但是count值始终是初始的0，因为这个函数绑定了第一轮render之后的count值，
            return () => clearInterval(id);
        }, []);

        return <h1>{count}</h1>;
    }
```

如果写成下面这样的形式的话：

```
    function Counter() {
        const [count, setCount] = useState(0);

        setInterval(() => {
            setCount(count + 1);
        }, 1000);
        // 造成的后果就是能一直更新count，但是每一轮循环都会执行上面这行代码，定时器越来越多，然后，就卡死啦，而且每个定时器都会执行一遍，那么屏幕上的数字每秒都会在跳，可以试试看
        return <h1>{count}</h1>;
    }

```

所以通过设置dependency数组来欺骗react达到自己不可告人的目的的话，很容易出现bug，而且还不容易发现，所以还是老老实实的不要骗人

要让计时器正确工作的话，第一种方法是把dependency数组正确设置[count]，但这显然不是最好的方法，因为每一轮都会设置计时器，清除计时器。但至少定时器work了。

还有一种方法是利用functional updater，这时候你也可以不用设置dependency

```
    useEffect(() => {
        const id = setInterval(() => {
            setCount(preCount => preCount + 1);
            // 此时setCount里面的函数的入参是前一次render之后的count值，所以这样的情况下计时器可以work
        }, 1000);
        return () => clearInterval(id);
    }, []);
```


## 其他hooks

### useContext

使用方法：

```
    const value = useContext(myContext);
```
当最近的一个myContext.Provider更新的时候，这个hook就会导致当前组件发生更新

### useReducer

```
    
    function reducer(state, action) {
        switch (action.type) {
            case 'increment':
                return {count: state.count + 1};
            case 'decrement':
                return {count: state.count - 1};
            default:
                throw new Error();
        }
    }

    function Counter() {
        const [state, dispatch] = useReducer(reducer, {count: 100});

        // 如果此处不传入一个initialState: {count: 100}的话，那么默认initialState就是undefined，那么后面的取值就会报错
        return (
            <>
                Count: {state.count}
                <button onClick={() => dispatch({type: 'increment'})}>+</button>
                <button onClick={() => dispatch({type: 'decrement'})}>-</button>
            </>
        );
    }
```

使用dispatch以后，判断是否重新render是通过Object.is来判断的，每次render之后返回的dispatch其实都是不变的，所以之前定时器的例子最好的解决方案就是利用useReducer来实现：

```
    function Counter() {
        const [state, dispatch] = useReducer(reducer, initialState);
        const { count, step } = state;

        useEffect(() => {
            const id = setInterval(() => {
            dispatch({ type: 'tick' });
            }, 1000);
            return () => clearInterval(id);
        }, [dispatch]);
        // 现在useEffect不依赖count，依赖的是dispatch，而dispatch在每次render之后都是不变的，所以就不会每次render之后都清除计时器再重新设置计时器
        // 其实这里把dependency数组设为[]也是完全一样的

        return (
            <>
            <h1>{count}</h1>
            <input value={step} onChange={e => {
                dispatch({
                    type: 'step',
                    step: Number(e.target.value)
                });
            }} />
            </>
        );
    }

    const initialState = {
        count: 0,
        step: 1,
    };

    function reducer(state, action) {
        const { count, step } = state;
        if (action.type === 'tick') {
            return { count: count + step, step };
        } else if (action.type === 'step') {
            return { count, step: action.step };
        } else {
            throw new Error();
        }
    }


```

### useCallback

```
    const memoizedCallback = useCallback(
        () => {
            doSomething(a, b);
        },
        [a, b],
    );
    // 返回的memoizedCallback只有当a、b发生变化时才会变化，可以把这样一个memoizedCallback作为dependency数组的内容给useEffect
```

我们来看一个useEffect的dependency数组含有函数的情况：

```
    function Counter() {
        const [count, setCount] = useState(0);
        const [a, setA] = useState(100);

        const fn = useCallback(() => {
            console.log('callback', a)
        }, [a])
        // 可知fn是依赖于a的，只有当a发生变化的时候fn才会变化，否则每轮render的fn都是同一个

        const f1 = () => {
            console.log('f1')
        }
        // 对于f1，每轮循环都有独自的f1，所以相当于一直在变化，如果useEffect依赖于f1的话，每次render之后都会执行

        useEffect(() => {
            console.log('this is effect')
        }, [f1])
        // 当dependency数组里面是f1时，不管更新count还是a，都会执行里面的函数，打印出this is effect
        // 当dependency数组里面是fn时，只有更新a时才会执行该函数
        return (
            <>
                Count: {count}
                <button onClick={() => setCount(count + 1)}>+</button>
                <button onClick={() => setCount(count - 1)}>-</button>
                <br />
                <button onClick={() => setA(a + 1)}>+</button>
                <button onClick={() => setA(a - 1)}>-</button>
            </>
        );
    }

```


### useMemo

```
    const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

### useRef

```
    const refContainer = useRef(initialValue);
```

注意：useRef返回相当于一个{current: ...}的plain object，但是和正常这样每轮render之后直接显式创建的区别在于，每轮render之后的useRef返回的plain object都是同一个，只是里面的current发生变化

而且，当里面的current发生变化的时候并不会引起render

## 补充

dependency数组里面写函数作为dependency的情景：

```
    function SearchResults() {
        const [query, setQuery] = useState('react');

        // Imagine this function is also long
        function getFetchUrl() {
            return 'https://hn.algolia.com/api/v1/search?query=' + query;
        }
        // 对于这样一个组件，如果我们改变了query，按理来说应该要重新拉取数据，但是这种写法里面就无法实现，除非在useEffect的dependency数组里面添加一个query，但是这样是很不明显的，因为useEffect里面的函数只写了一个fetchData，并没有看到query的身影，所以query很容易被忽略，而一旦忽略就会带来bug，所以简单的解决方法就是把fetchData这个函数作为dependency写进useEffect的dependency数组，但是这样也会带来问题，就是每次render之后，无论这次render是否改变了query，都会导致fetchData这个函数发生变化（因为每次render之后函数都是不同的），都会重新拉取数据，这是我们不想要的结果

        // Imagine this function is also long
        async function fetchData() {
            const result = await axios(getFetchUrl());
            setData(result.data);
        }

        useEffect(() => {
            fetchData();
        }, []);

        // ...
    }
```

第一次改进，把函数直接写进dependency数组里面：

```
    function SearchResults() {
        // 🔴 Re-triggers all effects on every render
        function getFetchUrl(query) {
            return 'https://hn.algolia.com/api/v1/search?query=' + query;
        }

        useEffect(() => {
            const url = getFetchUrl('react');
            // ... Fetch data and do something ...
        }, [getFetchUrl]); // 🚧 Deps are correct but they change too often

        useEffect(() => {
            const url = getFetchUrl('redux');
            // ... Fetch data and do something ...
        }, [getFetchUrl]); // 🚧 Deps are correct but they change too often

        // ...
    }
```
上面这种写法的问题就是useEffect里面的函数调用过于频繁，再次利用useCallback进行改造：

```
    function SearchResults() {
        const [query, setQuery] = useState('react');

        // ✅ Preserves identity until query changes
        const getFetchUrl = useCallback(() => {
            return 'https://hn.algolia.com/api/v1/search?query=' + query;
        }, [query]);  // ✅ Callback deps are OK
        // 只有当query发生变化的时候getFetchUrl才会变化
        useEffect(() => {
            const url = getFetchUrl();
            // ... Fetch data and do something ...
        }, [getFetchUrl]); // ✅ Effect deps are OK

        // ...
    }
```

useCallback本质上是添加了一层依赖检查。它以另一种方式解决了问题 - 我们使函数本身只在需要的时候才改变，而不是去掉对函数的依赖

实际上，函数在effect里面也是一种数据流，而在class component中则不是


### 关于竞态



```
    function Article({ id }) {
        const [article, setArticle] = useState(null);

        useEffect(() => {
            let didCancel = false;
            // 利用didCancel这个变量来解决竞态问题，如果本次render之后的请求到下次render之后才返回，那么这次render之后的didCancel以及在清理函数里面被设置为true了，就不会继续执行
            async function fetchData() {
                const article = await API.fetchArticle(id);
                if (!didCancel) {
                    setArticle(article);
                }
            }

            fetchData();

            return () => {
                didCancel = true;
            };
        }, [id]);

        // ...
    }
```


