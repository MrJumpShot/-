# render prop

## Problem
借用`react`官网的例子，当我们需要一个`<Mouse>`组件的时候，我们直接去实现它，我们初始的目标是为了实现一个移动鼠标同时可以显示鼠标位置，通过封装可以实现，如下：
```
    class Mouse extends React.Component {
        constructor(props) {
            super(props);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.state = { x: 0, y: 0 };
        }

        handleMouseMove(event) {
            this.setState({
                x: event.clientX,
                y: event.clientY
            });
        }

        render() {
            return (
            <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>

                {/* ...但我们如何渲染 <p> 以外的东西? */}
                <p>The current mouse position is ({this.state.x}, {this.state.y})</p>
            </div>
            );
        }
    }

    class MouseTracker extends React.Component {
        render() {
            return (
            <div>
                <h1>移动鼠标!</h1>
                <Mouse />
            </div>
            );
        }
    }
```

但是实现了上面的`<MouseTracker>`组件后，需求又变了，我们需要实现的不只是显示鼠标位置了，同时需要在该位置上显示一个`<Cat>`组件，这意味着我们需要再次却封装一个新的组件`<MouseWithCat>`，在这个组件里面包含了`<Cat position={x: this.state.x, y: this.state.y} />`，其目的就是为了`<Cat>`组件可以使用`<Mouse>`组件内部的状态，但是这就需要我们必须去再次封装一个新的组件，如果最后需要的有各式各样的要求，针对每一个要求都去实现一个新的组件，而且这些组件都充斥着大量重复的代码，这样的工作是无意义的，且会带来代码的冗长。

```
    // 这里我们实现了<MouseWithCat>，那如果我们还需要<MouseWithDog>呢？是不是还要再把这一套代码再写一遍？这明显是重复的工作
    class MouseWithCat extends React.Component {
        constructor(props) {
            super(props);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.state = { x: 0, y: 0 };
        }

        handleMouseMove(event) {
            this.setState({
            x: event.clientX,
            y: event.clientY
            });
        }

        render() {
            return (
            <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>

                {/*
                我们可以在这里换掉 <p> 的 <Cat>   ......
                但是接着我们需要创建一个单独的 <MouseWithSomethingElse>
                每次我们需要使用它时，<MouseWithCat> 是不是真的可以重复使用.
                */}
                <Cat mouse={this.state} />
            </div>
            );
        }
    }

```

## Solution （render props)
我们可以提供一个带有函数 `prop` 的 `<Mouse>` 组件，它能够动态决定什么需要渲染的，而不是将 `<Cat>` 或是 `<Dog>` 硬编码到 `<Mouse>` 组件里，并有效地改变它的渲染结果，这样就避免了大量重复的代码

```
    // 首先修改<Mouse>组件的代码，在最后render的内容区域留一块用来render将要传进来的内容
    class Cat extends React.Component {
        render() {
            const mouse = this.props.mouse;
            return (
            <img src="/cat.jpg" style={{ position: 'absolute', left: mouse.x, top: mouse.y }} />
            );
        }
        }

        class Mouse extends React.Component {
        constructor(props) {
            super(props);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.state = { x: 0, y: 0 };
        }

        handleMouseMove(event) {
            this.setState({
            x: event.clientX,
            y: event.clientY
            });
        }

        render() {
            return (
            <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>

                {/*
                Instead of providing a static representation of what <Mouse> renders,
                use the `render` prop to dynamically determine what to render.
                */}
                {this.props.render(this.state)}
            </div>
            );
        }
        }

        class MouseTracker extends React.Component {
        render() {
            return (
            <div>
                <h1>移动鼠标!</h1>
                // 使用时就在<Mouse>组件上设一个函数形式的prop，当然这个属性名字可以随便取，只要和前面对应上就OK，特殊情况，把这个的名字设为children的时候，可以写成这样的形式
                <Mouse>
                    {
                        mouse => (<Cat mouse={mouse} />)
                    }
                </Mouse>
                // 上下两种情况对于prop是children的情况是等价的
                <Mouse render={mouse => (<Cat mouse={mouse} />)}/>
            </div>
            );
        }
    }

```