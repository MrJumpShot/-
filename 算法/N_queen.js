let count = 0;
let arr = [];
const N = 8;

const check = (row, col) => {
    for(let i = 0; i < row; i++) {
        if(arr[i] === col || Math.abs(row - i) === Math.abs(col - arr[i])) {
            return false;
        }
    }
    return true;
}

const findAns = (k) => {
    if(k === N) {
        count++;
        return;
    }
    for(let i = 0; i < N; i++) {
        if(check(k, i)) {
            // 通过check就进入下一行，如果一行所有的列check都不通过就回到了上一行，所谓的回溯
            arr[k] = i;
            findAns(k + 1);
        }
    }
}

findAns(0);
console.log(count)

// 复杂度更低的方法是通过二进制数的位操作来实现，每一行表示为一个二进制数，check某一列的时候就和之前所有的行进行异或操作，如果异或操作的结果都是0说明合法
