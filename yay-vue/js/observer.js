class Observer {
    constructor(data) {
        this.data = data;
        this.walk(data);
    }

    walk(data) {
        const keys = Object.keys(data);
        keys.forEach(key => {
            this.defineReactive(data, key, data[key]);
        })
    }

    defineReactive(data, key, val) {
        this.observe(data);
        let dep = new Dep();
        Object.defineProperty(
            data, key, {
                enumerable: true,
                configurable: true,
                get() {
                    if(Dep.target) {
                        dep.addSub(Dep.target);
                    }
                    return val;
                },
                set(newVal) {
                    if(newVal !== val) {
                        dep.notify();
                        val = newVal;
                    }
                    
                }
            }
        )
    }

    observe(data) {
        if(!data || typeof data !== 'object') {
            return;
        }
    }
}

class Dep {
    constructor() {
        this.subs = [];
    }

    addSub(sub) {
        this.subs.push(sub);
    }

    notify() {
        this.subs.forEach(sub => {
            sub.update();
        })
    }
}


Dep.target = null;