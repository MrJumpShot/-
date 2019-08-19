# CSS实现正方形

> 父级宽高不定，子级元素要宽高都是父级元素宽度的一半，即一个正方形

## 1. 利用padding来实现

```
    .parent {
        width: 200px;
        height: 400px;
        display: flex;
        jsutify-content: center;
        align-items: center;
        background: aqua;
    }
    .child {
        width: 50%;
        // height: 50%; 面试的时候一开始回答了这个，难受，搞混了margin-top，padding-top和height的区别，前两者是都相对与父级的宽度，最后一个是相对于父级的高度
        height: 0;
        padding-top: 50%; // padding有颜色，而且计算起来是根据父级的宽度来计算的
        background: red;
    }

```

## 2. 利用伪类来实现

```
    .parent {
        width: 200px;
        height: 400px;
        background: red;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .child {
        /* height: 0; 不能设置高度为0了，这样高度撑不开 */ 
        width: 50%;
        background: yellow;
        overflow: hidden; /* 这里主要是形成一个BFC块，不然child会随着伪类一起向下，就不能实现伪类撑开child的效果了 */
    }
    .child:after {
        content: '';
        display: block;
        margin-top: 100%;  /*  这里实现撑开child，margin-top也是相对于父级的宽度 */
    }

```


## 3. 使用vw和vh作为单位