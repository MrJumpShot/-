// 假设使用1，5，11面值的纸币去兑换任意面值的纸币，
// 此时如果使用贪心算法是会出错的，所以要用DP
// 采用递推加上memo的方法实现DP
const cal = (num) => {
    let arr = [0];
    for(let i = 1; i <= num; i++) {
        let cost = Infinity;
        if(i >= 1) {
            cost = Math.min(cost, arr[i-1] + 1)
        }
        if(i >= 5) {
            cost = Math.min(cost, arr[i-5] + 1);
        }
        if(i >= 11) {
            cost = Math.min(cost, arr[i-11] + 1) 
        }
        arr[i] = cost;
    }
    return (arr[num]);
}

console.log(cal(15));
// 如果使用贪心算法计算得到的将是5
// 但是实际的答案应该是3
// DP可以避免贪心带来的后续问题
// 我们想计算f(n)则只需要知道f(n-1),f(n-5),f(n-11)的大小，只需要取这三个值的最小值加1即可，


// 计算最长递增子序列问题

// 动态规划计算最长回文子串




