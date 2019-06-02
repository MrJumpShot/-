# viewport与移动端布局

> 关于移动端布局，有三个`viewport`需要了解，这三个`viewport`的出现是为了解决网页完美适配移动端屏幕的问题

1. `layout viewport`：布局视图
   > `layout viewport`就是用于`css`布局的一个`viewport`，关于这个`viewport`，各家浏览器厂商会默认设置一个值，譬如 就设置了`980px`的默认值，所以默认的  的宽度就是`980px`，这也就是`html`的`width`(当然，此时若某一个子元素宽度超过这个宽度也可以强行撑大布局，但是`html`的宽度还是不变，其他子元素的布局还是按`html`的宽度进行布局，只有超出的那个特殊情况，例如在设置`width=device-width，initial-scale=1`时，本来应该是不会出现水平滚动条的，此时就按照屏幕完美显示，但是如果此时某一个`div`的宽度设为`500px`，那么就出现了水平滚动条，但是`html`还是`device-width`那么宽)

   > 当不设置`viewport`标签时，页面在移动端的显示就相当于此时`layout viewport`的宽度就是默认值（eg：`980px`），`visual viewport`的宽度应该是一个比`layout viewport`稍大的值（应该是只有在这种情况下`visual viewport`的值才会比`layout viewport`的值大，其他情况下`layout viewport`的值均大于等于`visual viewport`的大小）

   > `width=device-width`设置的就是`layout viewport`

2. `visual viewport`：可视视口

    > `visual viewport`首先与手机设备有关，其次，即使是同一台设备，其`visual viewport`也不是一成不变的，其宽度是等于`device-width/scale`的，也就是说缩放值越大，`visual viewport`宽度就越小，因为当放大时，一个逻辑像素对应的物理像素就多了，相当于此时改变的是`DPR`，而一屏的物理像素是固定的，那么一屏所表示的逻辑像素就减小了，也就是`visual viewport`宽度变小了。对于`initial-scale`的设置就是对`visual viewport`的设置

3. `ideal viewport`：理想视口，这个其实作用不大，当布局视口等于可视视口等于设备的宽度时就是理想视口了。





## 总结

1. 默认情况下 `layout viewport` 为 `980px`
2. `width=x`设置布局视口，`initial-scale=y` 设置视觉视口
3. 如果只设置 `layout viewport` 和 `visual viewport` 中的一个，那么另一个也是同样的宽度
4. `layout viewport` 的宽度始终大于等于 `visual viewport`(实践发现，当默认情况下，即不设置`viewport`时，`visual viewport`会略大于`layout viewport`)
5. 当同时设置`width`和`initial-scale`时，`layout viewport`的宽度取两者计算出来的较大值，而`visual viewport`的值就是通过`initial scale`计算出来的值，之所以前者取较大值就是因为`layout viewport`的宽度不小于`visual viewport`的宽度，即第四条总结


### 番外

> 做移动端适配时经常听到`1px`边框的问题，这是个什么梗？为什么是`1px`？为什么是边框？

> 设计师要的`1px`是一个物理像素，也就是所能设计出来的最细的线，而css中的`1px`是一个点，`dpr`为2的话，那么就是两个物理像素了，这就不是设计师要的细线了。

> 通常边框我们并不需要它随着屏幕越大而越粗，也就是不需要它自适应，所以不能用`rem`，只能用`px`，虽然苹果支持`0.5px`，但是有的安卓机不支持，`0.5px`可能就直接显示不出来而被忽略掉，所以还是写`1px`，那用什么办法，让设计师看到它想要的细线呢？（安卓机是看不出来的）

> 视口缩放`scale=0.5`就能满足要求，这样可以不用改动任何代码。视口缩放是最简单的方式（已经证明过了视口缩放不会影响`rem`元素大小）。

> 还有一种方式就是检测到支持细线的，给`html`元素加一个类名`hairlines`，然后在`css`里面适配写`0.5px`的边框，这也是淘宝最新的方案`flexible.js`，不过这种方式需要增加很多边框适配的`css`，所有细线效果都要重写为`0.5px`，有点麻烦。