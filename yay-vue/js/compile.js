class Compile {
    constructor(el, vm) {
        this.el = el;
        this.vm = vm;
        this.fragment = null;
        this.init();
    }

    init() {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compileElement(this.fragment);
            this.el.appendChild(this.el);
        } else {
            throw('DOM 节点不存在');
        }
    }

    nodeToFragment(el) {
        const fragment = null;
        let child = el.firstChild;
        while(child) {
            fragment.appendChild(child);
            child = el.firstChild;
        }

        return fragment;
    }

    compileElement(el) {
        let childNodes = el.childNodes;
        [...childNodes].forEach(node => {
            const reg = /\{\{\s*(.*)\s*\}\}/;
            const text = node.textContent;

            if(this.isNodeElement(node)) {
                this.compileNode(node);
            } else if(this.isTextNode(node) && reg.test(text)) {
                this.compileText(node, reg.exec(text)[1]);
            }

            if(node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        })
    }

    compileNode(node) {
        let nodeAttrs = node.attributes;
        [...nodeAttrs].forEach(attr => {
            let attrName = attr.name
            if(this.isDirective(attrName)) {
                let name = attrName.substring(2);
                let val = attr.value;

                if(this.isEventDirective(name)) {
                    this.compileEvent(node, this.vm, name, val);
                } else {
                    this.compileModel(node, this.vm, name, val);
                }

                node.removeAttribute(attrName);
            }
        })
    }

    isDirective(attr) {
        return attr.startsWith('v-');
    }

    isEventDirective(attr) {
        return attr.startsWith('on');
    }

    compileEvent(node, vm, name, val) {
        let eventType = name.split(':')[1];
        let cb = this.vm.methods[name];
        if(eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);
        }
    }

    compileModel(node, vm, name, val) {
        let val = vm[name];
        this.modelUpdater(node, val);
        
        new Watcher(vm, name, (value) => {
            this.modelUpdater(node, value);
        })

        node.addEventListener('input', (e) => {
            let newVal = e.target.value;
            if(newVal !== val) {
                this.vm.data[name] = newVal;
                val = newVal;
            }
        })  
    }

    compileText(node, name) {
        const initText = this.vm.data[name];

        this.updateText(node, initText);
        new Watcher(this.vm, name, (value) => {
            this.updateText(node, value);
        })
    }

    modelUpdater(node, val) {
        node.value = typeof val === undefined ? '' : val;
    }

    updateText(node, val) {
        node.textContent = typeof val === undefined ? '' : val;
    }

    isNodeElement (node) {
        return node.nodeType == 1;
    }

    isTextNode(node) {
        return node.nodeType == 3;
    }
}