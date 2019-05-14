class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm;
        this.key = key;
        this.cb = cb;
        this.val = this.get();
    }

    update() {
        let oldVal = this.val;
        let newVal = this.vm.data[this.key];
        if(oldVal !== newVal) {
            this.val = newVal;
            this.cb.call(this.vm, newVal);
        }
    }

    get() {
        Dep.target = this;
        let val = this.vm.data[this.key];
        Dep.target = null;
        return val;
    }
}