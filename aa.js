const reverse = arr => {
    let indexArr = [];
    let len = arr.length;
    for(let i = 0; i < len; i++) {
        if(arr[i] === ' ') {
            indexArr.push(i);
        }
    }
    let indexArrLen = indexArr.length;
    if(!indexArrLen) return arr;
    indexArr.unshift(-1);
    indexArr.push(len);
    let ans = [];
    for(let i = indexArrLen; i >= 0; i--) {
        for(let j = indexArr[i] + 1; j < indexArr[i+1]; j++) {
            ans.push(arr[j]);
        }
        ans.push(' ');
    }
    ans.pop();
    return ans;
}

let test = ['n', 'i', 'c', 'e', ' ', 's', 'o', ' ', 'i', 's', ' ', 'h', 'e', ];

let result = reverse(test);

console.log(result)