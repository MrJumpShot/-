# React中的element、component、instance

## element的实质

在React中无论是class形式（render函数）还是function形式（return的内容）的组件，最后返回的jsx其实质是React.createElement函数的结果，而React.createElement函数返回的结果是一个对象树，我们可以称之为元素描述树，通过组件之间的组合搭配得到一颗较为完整的元素描述树。最后一步操作是ReactDOM.render(element, root)，该过程是向DOM树里面渲染react元素，根据React提供的元素描述树渲染出DOM节点并插入root节点，从这里我们可以发现element其实就基本就可以解释为Virtual DOM，是利用js对象的形式来描述一个DOM节点，描述一棵树。

## 使用element的原因：

element的出现是为了解决面向对象的UI编程的痛点，以往着这样的编程需要编程者自己组织子元素，具体如何组织就是在model里面的data发生变化时，需要去判断页面上展示哪些内容，如何展示，同时需要手动地去操作DOM节点实现DOM树的变化。

而现在可以通过元素描述树来表示。当然这一切的实现都是基于React框架的基础，React内部的diff算法替我们做好了一切操作，也就是说element起作用的基础就是diff算法。

我们在写React时一般是采用jsx的形式，这时返回的其实就是元素描述树，组织起来就是一颗virtual DOM tree，当setState的时候，React得到一颗新的virtual DOM tree，此时调用diff算法计算得到新的virtual DOM tree与旧树之间的差异，并根据计算出来的差异对DOM树进行patch操作，这样就得到了一棵全新的DOM tree，页面也就得到了需要展示的新内容。在这个过程中，不需要React使用者去做任何DOM节点的操作，只需要管理好数据变化即可，UI编程变得优美。

React之所以这样做，一方面是使React用户尽量少地写代码，由框架来替用户完成那些操作，另一方面，element tree是js对象树，对它的操作是很轻量级的，不像对真实DOM树的操作那样重，采用element之后大大提升了操作了效率。

```
    // React.render的内容其实就是一棵元素描述树，也就数一棵virtual DOM tree
    ReactDOM.render({
        type: Form,
        props: {
            isSubmitted: false,
            buttonText: 'OK!'
        }
    }, document.getElementById('root'))
```

## component

component是我们编写出来的自定义组件，React可以通过React.createElement函数来得到一个元素描述树。

## instance

instance是组件的实例，但是注意function形式的component没有实例，也没有生命周期，无法在function形式的component内部使用this，也无法在这个component的属性里面写ref属性

## 补充：
由于传统的UI编程返回的直接就是DOM对象，而在服务端是不存在DOM的，所以进行前后端同构不方便，但是在react中返回的是一个对象形式的element，也就是virtual DOM，这种对象在前后端都是可以共用的，这也为前后端同构提供有力的工具

