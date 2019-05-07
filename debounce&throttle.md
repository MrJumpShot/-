# 防抖(debounce)和节流(throttle)

> 防抖使用场景  
>> 当出现用户不断下拉刷新时，仅在用户最后一次下拉后的一段时间后再发送请求  
>> 搜索引擎在用户输入最后一个内容的一段时间之后再发出请求
>> 当出现用户不断`resize`浏览器时
---
> 节流的使用场景  
>> 监听`scroll`事件时
---

## 1. 防抖代码实现

    function debounce1(fn, wait) {
        let timer;
        return function() {
            let args = arguments;
            if(timer) {
                clearTimeout(timer)
            }
            timer = setTimeout(() => {
                fn(args);
            }, wait)
        }
    }

    function debounce2(fn, wait) {
        let timer;
        return function() {
            let args = arguments;
            let callNow = !timer;
            // 若存在定时器则clear
            if(timer) {
                clearTimeout(timer);
            }
            // 需设置定时器将定时器置为null，不然定时器一直非null
            timer = setTimeout(() => {
                timer = null;
            }, wait)
            if(callNow) {
                fn(args);
            }
        }
    }

## 2. 节流代码实现

// 时间戳的写法 不同的pre取值可以实现立即执行或是延迟执行

    function throttle1(fn, wait) {
        let pre = Date.now();
        return function() {
            let args = arguments;
            let now = Date.now();
            if(now - pre >= wait) {
                fn(args);
                pre = now;
            }
        }
    }

// 定时器的写法

    function throttle2(fn, wait) {
        let timer;
        return function() {
            let args = arguments;
            let callNow = !timer;
            if(!timer) {
                timer = setTimeout(() => {
                    timer = null;
                }, wait)
            }
            if(callNow) {
                fn(args);
            }
        }
    }