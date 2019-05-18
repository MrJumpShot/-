# why virtual DOM

> `virtual DOM` 最大的特点是将页面的状态抽象为 `JS` 对象的形式，配合不同的渲染工具，使跨平台渲染成为可能。如 `React` 就借助 `virtual DOM` 实现了服务端渲染、浏览器渲染和移动端渲染等功能。

> 此外，在进行页面更新的时候，借助`virtual DOM`，`DOM` 元素的改变可以在内存中进行比较，再结合框架的事务机制将多次比较的结果合并后一次性更新到页面，从而有效地减少页面渲染的次数，提高渲染效率。


## diff算法简化版
```
function diff(oldVDom, newVDom) {
    // 新建 node
    if (oldVDom == undefined) {
        return {
            type: nodePatchTypes.CREATE,
            vdom: newVDom
        }
    }

    // 删除 node
    if (newVDom == undefined) {
        return {
            type: nodePatchTypes.REMOVE
        }
    }

    // 替换 node
    if (
        typeof oldVDom !== typeof newVDom ||
        ((typeof oldVDom === 'string' || typeof oldVDom === 'number') && oldVDom !== newVDom) ||
        oldVDom.tag !== newVDom.tag
    ) {
       return {
           type: nodePatchTypes.REPLACE,
           vdom: newVDom
       } 
    }

    // 更新 node
    if (oldVDom.tag) {
        // 比较 props 的变化
        const propsDiff = diffProps(oldVDom, newVDom);

        // 比较 children 的变化
        const childrenDiff = diffChildren(oldVDom, newVDom);
        
        // 如果 props 或者 children 有变化，才需要更新
        if (propsDiff.length > 0 || childrenDiff.some( patchObj => (patchObj !== undefined) )) {
            return {
                type: nodePatchTypes.UPDATE,
                props: propsDiff,
                children: childrenDiff
            }   
        }
        
    }
}

// 比较 props 的变化
function diffProps(oldVDom, newVDom) {
    const patches = [];

    const allProps = {...oldVDom.props, ...newVDom.props};

    // 获取新旧所有属性名后，再逐一判断新旧属性值
    Object.keys(allProps).forEach((key) => {
            const oldValue = oldVDom.props[key];
            const newValue = newVDom.props[key];

            // 删除属性
            if (newValue == undefined) {
                patches.push({
                    type: propPatchTypes.REMOVE,
                    key
                });
            } 
            // 更新属性
            else if (oldValue == undefined || oldValue !== newValue) {
                patches.push({
                    type: propPatchTypes.UPDATE,
                    key,
                    value: newValue
                });
            }
        }
    )

    return patches;
}

// 比较 children 的变化
function diffChildren(oldVDom, newVDom) {
    const patches = [];
    
    // 获取子元素最大长度
    const childLength = Math.max(oldVDom.children.length, newVDom.children.length);

    // 遍历并diff子元素
    for (let i = 0; i < childLength; i++) {
        patches.push(diff(oldVDom.children[i], newVDom.children[i]));
    }

    return patches;
}
```

> 通过diff函数计算出新旧virtual DOM之间的区别，并得到一个patch对象，接下来就利用该patch对象对原来的DOM树进行修改

```
// 给 DOM 打个补丁
function patch(parent, patchObj, index=0) {
    // 此处的parent就是DOM挂载的根节点
    if (!patchObj) {
        return;
    }

    // 新建元素
    if (patchObj.type === nodePatchTypes.CREATE) {
        return parent.appendChild(createElement(patchObj.vdom));
    }

    const element = parent.childNodes[index];

    // 删除元素
    if (patchObj.type === nodePatchTypes.REMOVE) {
        return parent.removeChild(element);
    }

    // 替换元素
    if (patchObj.type === nodePatchTypes.REPLACE) {
        return parent.replaceChild(createElement(patchObj.vdom), element);
    }

    // 更新元素
    if (patchObj.type === nodePatchTypes.UPDATE) {
        const {props, children} = patchObj;

        // 更新属性
        patchProps(element, props);

        // 更新子元素
        children.forEach( (patchObj, i) => {
            // 更新子元素时，需要将子元素的序号传入
            patch(element, patchObj, i)
        });
    }
}

// 更新属性
function patchProps(element, props) {
    if (!props) {
        return;
    }

    props.forEach( patchObj => {
        // 删除属性
        if (patchObj.type === propPatchTypes.REMOVE) {
            element.removeAttribute(patchObj.key);
        } 
        // 更新或新建属性
        else if (patchObj.type === propPatchTypes.UPDATE) {
            element.setAttribute(patchObj.key, patchObj.value);
        }
    })
}

```

> 在上述的思路中是先生成新的`virtual DOM`对象，然后与旧的`virtual DOM`对象对比生成一个`patch`对象，再根据`patch`对象去更新`DOM`树，但是在上述过程中，生成`patch`对象这一步是多余的，可以直接用新的`virtual DOM`对象去和`DOM`树进行对比并更新；

```
function diff(newVDom, parent, index=0) {
    
    const element = parent.childNodes[index];

    // 新建node
    if (element == undefined) {
        parent.appendChild(createElement(newVDom));
        return;
    }

    // 删除node
    if (newVDom == undefined) {
        parent.removeChild(element);
        return;
    }

    // 替换node
    if (!isSameType(element, newVDom)) {
        parent.replaceChild(createElement(newVDom), element);
        return;
    }

    // 更新node
    if (element.nodeType === Node.ELEMENT_NODE) {
        // 比较props的变化
        diffProps(newVDom, element);

        // 比较children的变化
        diffChildren(newVDom, element);
    }
}

// 比较元素类型是否相同
function isSameType(element, newVDom) {
    const elmType = element.nodeType;
    const vdomType = typeof newVDom;

    // 当dom元素是文本节点的情况
    if (elmType === Node.TEXT_NODE && 
        (vdomType === 'string' || vdomType === 'number') &&
        element.nodeValue == newVDom
    ) {
       return true; 
    }

    // 当dom元素是普通节点的情况
    if (elmType === Node.ELEMENT_NODE && element.tagName.toLowerCase() == newVDom.tag) {
        return true;
    }

    return false;
}


//为了方便属性的比较，提高效率，我们将VD的props存在dom元素的__preprops_字段中：

const ATTR_KEY = '__preprops_';

// 创建dom元素
function createElement(vdom) {
    // 如果vdom是字符串或者数字类型，则创建文本节点，比如“Hello World”
    if (typeof vdom === 'string' || typeof vdom === 'number') {
        return doc.createTextNode(vdom);
    }

    const {tag, props, children} = vdom;

    // 1. 创建元素
    const element = doc.createElement(tag);

    // 2. 属性赋值
    setProps(element, props);

    // 3. 创建子元素
    children.map(createElement)
            .forEach(element.appendChild.bind(element));

    return element;
}

// 属性赋值
function setProps(element, props) {
     // 属性赋值
    element[ATTR_KEY] = props;

    for (let key in props) {
        element.setAttribute(key, props[key]);
    }
}

// 比较props的变化
function diffProps(newVDom, element) {
    let newProps = {...element[ATTR_KEY]};
    const allProps = {...newProps, ...newVDom.props};

    // 获取新旧所有属性名后，再逐一判断新旧属性值
    Object.keys(allProps).forEach((key) => {
            const oldValue = newProps[key];
            const newValue = newVDom.props[key];

            // 删除属性
            if (newValue == undefined) {
                element.removeAttribute(key);
                delete newProps[key];
            } 
            // 更新属性
            else if (oldValue == undefined || oldValue !== newValue) {
                element.setAttribute(key, newValue);
                newProps[key] = newValue;
            }
        }
    )

    // 属性重新赋值
    element[ATTR_KEY] = newProps;
}

```

> 上述代码在更新子节点的时候只是单纯的从前到后的对比新的`virtual DOM`和旧的`DOM`树，如果是针对末尾添加子节点的情况可以很好的处理，而对于子节点顺序发生变化的情况则会很不智能，这时候就需要有`key`;

```
function diffChildren(newVDom, parent) {
    // 有key的子元素
    const nodesWithKey = {};
    let nodesWithKeyCount = 0;

    // 没key的子元素
    const nodesWithoutKey = [];
    let nodesWithoutKeyCount = 0;

    const childNodes = parent.childNodes,
          nodeLength = childNodes.length;

    const vChildren = newVDom.children,
          vLength = vChildren.length;

    // 用于优化没key子元素的数组遍历
    let min = 0;

    // 将子元素分成有key和没key两组
    for (let i = 0; i < nodeLength; i++) {
        const child = childNodes[i],
              props = child[ATTR_KEY];

        if (props !== undefined && props.key !== undefined) {
            nodesWithKey[props.key] = child;
            nodesWithKeyCount++;
        } else {
            nodesWithoutKey[nodesWithoutKeyCount++] = child;
        }
    }

    // 遍历vdom的所有子元素
    for (let i = 0; i < vLength; i++) {
        const vChild = vChildren[i],
              vProps = vChild.props;
        let dom;

        vKey = vProps!== undefined ? vProps.key : undefined;
        // 根据key来查找对应元素
        if (vKey !== undefined) {
            if (nodesWithKeyCount && nodesWithKey[vKey] !== undefined) {
                dom = nodesWithKey[vKey];
                nodesWithKey[vKey] = undefined;
                nodesWithKeyCount--; 
            }
        } 
        // 如果没有key字段，则找一个类型相同的元素出来做比较
        else if (min < nodesWithoutKeyCount) {
            // 个人觉得此处的j = 0是不是应该改成j = min，这样min的存在才有优化的意义，相当于缩小了每次遍历的范围，而且对于顺序没有发生变化的情况优化更明显
            for (let j = 0; j < nodesWithoutKeyCount; j++) {
                const node = nodesWithoutKey[j];
                if (node !== undefined && isSameType(node, vChild)) {
                    dom = node;
                    nodesWithoutKey[j] = undefined;
                    if (j === min) min++;
                    if (j === nodesWithoutKeyCount - 1) nodesWithoutKeyCount--;
                    break;
                }
            }
        }

        // diff返回是否更新元素
        const isUpdate = diff(dom, vChild, parent);

        // 如果是更新元素，且不是同一个dom元素，则移动到原先的dom元素之前
        if (isUpdate) {
            const originChild = childNodes[i];
            if (originChild !== dom) {
                parent.insertBefore(dom, originChild);
            }
        }
    }

    // 清理剩下的未使用的dom元素
    if (nodesWithKeyCount) {
       for (key in nodesWithKey) {
           const node = nodesWithKey[key];
           if (node !== undefined) {
               node.parentNode.removeChild(node);
           }
       } 
    }
    // 清理剩下的未使用的dom元素
    while (min <= nodesWithoutKeyCount) {
        const node = nodesWithoutKey[nodesWithoutKeyCount--];
        if ( node !== undefined) {
            node.parentNode.removeChild(node);
        }
    }
}
```