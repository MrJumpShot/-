# diff算法

## vue的diff算法

> vue中的diff算法是当数据发生变化时，通知数据的订阅者调用patch方法来给真实的DOM打补丁。

```
    function patch (oldVnode, vnode) {
        // some code
        if (sameVnode(oldVnode, vnode)) {
            patchVnode(oldVnode, vnode)
        } else {
            const oEl = oldVnode.el // 当前oldVnode对应的真实元素节点
            let parentEle = api.parentNode(oEl)  // 父元素
            createEle(vnode)  // 根据Vnode生成新元素
            // createEle(vnode)会为vnode创建它的真实dom，令vnode.el =真实dom
            if (parentEle !== null) {
                api.insertBefore(parentEle, vnode.el, api.nextSibling(oEl)) // 将新元素添加进父元素
                api.removeChild(parentEle, oldVnode.el)  // 移除以前的旧元素节点
                oldVnode = null
            }
        }
        // some code 
        return vnode
        // 返回的这个vnode赋值给oldvnode，此时变化的是vnode中的el
    }

```

> patch方法先是比较新旧的Vnode，看看二者是否还是同一个Vnode，若是的话进行下一层级的比较，若不是同一个了，则直接删掉旧的Vnode，插入新的Vnode

> vue的Vnode的形式：
```
    // body下的 <div id="v" class="classA"><div> 对应的 oldVnode 就是

    {
        el:  div  //对真实的节点的引用，本例中就是document.querySelector('#id.classA')
        tagName: 'DIV',   //节点的标签
        sel: 'div#v.classA'  //节点的选择器
        data: null,       // 一个存储节点属性的对象，对应节点的el[prop]属性，例如onclick , style
        children: [], //存储子节点的数组，每个子节点也是vnode结构
        text: null,    //如果是文本节点，对应文本节点的textContent，否则为null，所以只有文本节点才有这个属性
    }
```

> 需要注意的是，el属性引用的是此 virtual dom对应的真实dom，patch的vnode参数的el最初是null，因为patch之前它还没有对应的真实dom。

```
    function sameVnode(oldVnode, vnode){
        return vnode.key === oldVnode.key && vnode.sel === oldVnode.sel
    }
    //两个vnode的key和sel相同才去比较它们，比如p和span，div.classA和div.classB都被认为是不同结构而不去比较它们。
```

> 关于patchVnode函数的实现

```
    patchVnode (oldVnode, vnode) {
        const el = vnode.el = oldVnode.el
        let i, oldCh = oldVnode.children, ch = vnode.children
        // 他们的引用一致，可以认为没有变化。
        if (oldVnode === vnode) return
        // 如果都是文本节点，则比较文本内容前后是否发生变化
        if (oldVnode.text !== null && vnode.text !== null && oldVnode.text !== vnode.text) {
            api.setTextContent(el, vnode.text)
        }else {
            updateEle(el, vnode, oldVnode)
            // 两个节点都有子节点，而且它们不一样，这样我们会调用updateChildren函数比较子节点，这是diff的核心，
            if (oldCh && ch && oldCh !== ch) {
                updateChildren(el, oldCh, ch)
            }else if (ch){
                createEle(vnode) //create el's children dom
            }else if (oldCh){
                api.removeChildren(el)
            }
        }
    }
```

```
    updateChildren (parentElm, oldCh, newCh) {
        let oldStartIdx = 0, newStartIdx = 0
        let oldEndIdx = oldCh.length - 1
        let oldStartVnode = oldCh[0]
        let oldEndVnode = oldCh[oldEndIdx]
        let newEndIdx = newCh.length - 1
        let newStartVnode = newCh[0]
        let newEndVnode = newCh[newEndIdx]
        let oldKeyToIdx
        let idxInOld
        let elmToMove
        let before
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                // 下面四个判断的作用就是把四个index移到不是null的位置
                if (oldStartVnode == null) {   //对于vnode.key的比较，会把oldVnode = null
                    oldStartVnode = oldCh[++oldStartIdx] 
                }else if (oldEndVnode == null) {
                    oldEndVnode = oldCh[--oldEndIdx]
                }else if (newStartVnode == null) {
                    newStartVnode = newCh[++newStartIdx]
                }else if (newEndVnode == null) {
                    newEndVnode = newCh[--newEndIdx]
                // 接下来的四个判断是将oldCh和newCh的前后index分别比较，判断是否值得patch，值得patch的话就patch一下并塞到相应的位置，至于为什么要这样的比较策略，暂时还不清楚。。。。。
                }else if (sameVnode(oldStartVnode, newStartVnode)) {
                    patchVnode(oldStartVnode, newStartVnode)
                    oldStartVnode = oldCh[++oldStartIdx]
                    newStartVnode = newCh[++newStartIdx]
                }else if (sameVnode(oldEndVnode, newEndVnode)) {
                    patchVnode(oldEndVnode, newEndVnode)
                    oldEndVnode = oldCh[--oldEndIdx]
                    newEndVnode = newCh[--newEndIdx]
                }else if (sameVnode(oldStartVnode, newEndVnode)) {
                    patchVnode(oldStartVnode, newEndVnode)
                    api.insertBefore(parentElm, oldStartVnode.el, api.nextSibling(oldEndVnode.el))
                    oldStartVnode = oldCh[++oldStartIdx]
                    newEndVnode = newCh[--newEndIdx]
                }else if (sameVnode(oldEndVnode, newStartVnode)) {
                    patchVnode(oldEndVnode, newStartVnode)
                    api.insertBefore(parentElm, oldEndVnode.el, oldStartVnode.el)
                    oldEndVnode = oldCh[--oldEndIdx]
                    newStartVnode = newCh[++newStartIdx]
                }else {
                // 使用key时的比较
                    if (oldKeyToIdx === undefined) {
                        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx) // 有key生成index表
                    }
                    idxInOld = oldKeyToIdx[newStartVnode.key]
                    if (!idxInOld) {
                        api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
                        newStartVnode = newCh[++newStartIdx]
                    }
                    else {
                        elmToMove = oldCh[idxInOld]
                        // 若二者的sel属性不一样则直接新建一个新的节点插进父节点的相应位置（判断是否值得patch）
                        if (elmToMove.sel !== newStartVnode.sel) {
                            api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
                        }else {
                            // 若二者的sel属性一样则先把旧节点patch一下再塞到相应的位置上
                            patchVnode(elmToMove, newStartVnode)
                            oldCh[idxInOld] = null
                            api.insertBefore(parentElm, elmToMove.el, oldStartVnode.el)
                        }
                        newStartVnode = newCh[++newStartIdx]
                    }
                }
            }
            // 下面的代码是遍历比较结束之后进行的操作，若是oldCh有多余的，则删除所有的多余节点，若newCh有多余的，则将这些多余的插入
            if (oldStartIdx > oldEndIdx) {
                before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].el
                addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx)
            }else if (newStartIdx > newEndIdx) {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
            }
    }
```

### 设置key和不设置key的区别：
> 不设key，newCh和oldCh只会进行头尾两端的相互比较，设key后，除了头尾两端的比较外，还会从用key生成的对象oldKeyToIdx中查找匹配的节点，所以为节点设置key可以更高效的利用dom。







## 总结

1. 尽量不要跨层级的修改dom

2. 设置key可以最大化的利用节点

3. 不要盲目相信diff的效率，在必要时可以手工优化
