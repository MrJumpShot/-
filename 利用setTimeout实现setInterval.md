# 利用setTimeout实现setInterval

```
let interval = (...args) => (fn, wait) => {
	let timer;
	let next = () => {
		fn(...args);
		timer = setTimeout(next, wait)
	}
	setTimeout(next, wait)

	return () => {
		clearTimeout(timer);
	}
}
```