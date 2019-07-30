# children && childNodes

## children（HTMLCollection）

children返回的是一个元素的子元素，只包括元素节点，不包含文本节点、注释节点

```
    <script>
    window.onload = function(){
        var oUl = document.getElementsByTagName('ul')[0];
        console.log(oUl.children.length) // 2
    }
    </script>
    <body>
        <ul> i am text node
            <li></li> i am text node too
            <li></li><!--this is note-->
        </ul>
    </body>

```

## childNodes(Nodelist)

childNodes返回的是所有子节点的一个集合，包括元素节点、文本节点、注释节点（如果一段文本被一个注释所分开，那么这里就有三个节点：文本节点、注释节点、文本节点）

```
    <script>
    window.onload = function(){
        var oUl = document.getElementsByTagName('ul')[0];
        console.log(oUl.childNodes.length) // 2
    }
    </script>
    <body>
        <ul> i am text node
            <li></li> i am text node too
            <li></li><!--this is note-->
        </ul>
    </body>

```

## 补充

关于nodeType：

元素节点：nodeType === 1
属性节点：nodeType === 2
文本节点：nodeType === 3
注释节点：nodeType === 8
文档节点(document)：nodeType === 9

关于HTMLCollection和NodeList：

> 主要区别是，NodeList可以包含各种类型的节点，HTMLCollection只能包含 HTML 元素节点。

### NodeList

NodeList的成员可以是任意类型的节点

NodeList可以是动态的（element.childNodes）也可以是静态的(document.querySeletorAll())

> 所谓动态指的是这个集合是动态的，如果动态添加子元素，那么这个集合也会发生变化

NodeList有length，forEach方法，keys()，values()等，是一个类数组

### HTMLCollection

HTMLCollection是一个节点对象的集合，只能包含元素节点（element），不能包含其他类型的节点。它的返回值是一个类似数组的对象，但是与NodeList接口不同，HTMLCollection没有forEach方法，只能使用for循环遍历。

返回HTMLCollection实例的，主要是一些Document对象的集合属性，比如document.links、document.forms、document.images等。

以及document.getElementsByTagName(),document.getElementsByClassName(),element.children()等

HTMLCollection实例都是动态集合，节点的变化会实时反映在集合中
