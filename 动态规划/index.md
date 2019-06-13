# 动态规划的总结

## 概念
1. 无后效性：
   
    一旦`f(n)`确定，“我们如何凑出`f(n)`”就再也用不着了。要求出`f(15)`，只需要知道`f(14)`,`f(10)`,`f(4)`的值，而`f(14)`,`f(10)`,`f(4)`是如何算出来的，对之后的问题没有影响。“未来与过去无关”，这就是无后效性。（严格定义：如果给定某一阶段的状态，则在这一阶段以后过程的发展不受这阶段以前各段状态的影响。）
    
    
2. 最优子结构：
   
    回顾我们对`f(n)`的定义：我们记“凑出`n`所需的最少钞票数量”为`f(n)`.`f(n)`的定义就已经蕴含了“最优”。利用`w=14,10,4`的最优解，我们即可算出`w=15`的最优解。　　大问题的最优解可以由小问题的最优解推出，这个性质叫做“最优子结构性质”。

3. 有重叠子问题：即子问题之间是不独立的，一个子问题在下一阶段决策中可能被多次使用到。（该性质并不是动态规划适用的必要条件，但是如果没有这条性质，动态规划算法同其他算法相比就不具备优势）
    
引入概念之后，我们如何判断一个问题能否使用`DP`解决呢？能将大问题拆成几个小问题，且满足无后效性、最优子结构性质。

首先根据最优子结构将原问题拆分为无后效性的子问题，通过解决子问题来解决原问题


## DP为什么会快？

无论是`DP`还是暴力，我们的算法都是在可能解空间内，寻找最优解。

来看钞票问题。暴力做法是枚举所有的可能解，这是最大的可能解空间。
`DP`是枚举有希望成为答案的解。这个空间比暴力的小得多。
也就是说：`DP`自带剪枝。
`DP`舍弃了一大堆不可能成为最优解的答案。譬如：`15 = 5+5+5` 被考虑了。`15 = 5+5+1+1+1+1+1` 从来没有考虑过，因为这不可能成为最优解。
从而我们可以得到`DP`的核心思想：尽量缩小可能解空间。在暴力算法中，可能解空间往往是指数级的大小；如果我们采用`DP`，那么有可能把解空间的大小降到多项式级。一般来说，解空间越小，寻找解就越快。这样就完成了优化。


## 典型问题

1. 最长回文子串：(最佳解法应该是manacher方法)

```
    string longestPalindrome(string s) {
        int m = s.size();
        if (m == 0) {
            return "";
        }
        vector<vector<int> > dp(m, vector<int>(m, 0));
        int start = 0;
        int length = 1;

        for (int i = 0; i < m; i++) {
            // 单个字符属于回文，例如 abcd
            dp[i][i] = 1;

            // 连续两个字符相同属于回文，例如 abb
            if (i < m - 1) {
                if (s[i] == s[i + 1]) {
                    dp[i][i + 1] = 1;
                    start = i;
                    length = 2;
                }
            }
        }

        for (int len = 2; len <= m; len++) {
            // 用len来遍历字符串的长度
            for (int i = 0; i < m - len; i++) {
                // i遍历起点，j遍历终点
                int j = i + len;
                // 扩展长度
                if (dp[i + 1][j - 1] == 1 && s[i] == s[j]) {
                    dp[i][j] = 1;

                    if (j - i + 1 > length) {
                        start = i;
                        length = j - i + 1;
                    }
                }
            }
        }

        return s.substr(start, length);
    }
```

2. 01背包问题：注意，背包问题都是无法通过贪心算法解决的
   
   ```
        // 背包容量为p，n个物品,第i个物品的价值为v(i)，重量为w(i)
        int f[n][p];
        for(int i = 0; i <= n; i++) {
            f[i][0] = 0;
        }
        for(int i = 0; i <= p; i++) {
            f[0][p] = 0;
        }
        for(int i = 1; i <= n; i++) {
            for(int j = 0; j <= p; j++) {
                if(j < w[i]) {
                    f[i][j] = f[i-1][j];
                } else {
                    f[i][j] = max(f[i-1][j] + f[i-1][j-w[i]] + v[i])
                }
                
            }
        }
    ```

    ```
        // 对上面的代码进行优化可以得到
        int f[p] = {0};
        for(int i = 1; i <= n; i++) {
            for(int j = p; j >= w[i]; j--) {
                f[j] = max(f[j-w[i]] + f[j]);
                // 利用一维数组进行空间上的优化，注意此时遍历的顺序要反过来，这样才能利用上一轮循环得到的结果。
            }
        }

    ```

3. 完全背包问题

    完全背包首先可以进行一轮筛选，如果有某个物品的质量比另一个的大，同时价值还比另一个的小，那么直接可以排除该物品

    但是完全背包问题不能使用贪心解法，可能无法得到最优解

    ```
        // 有n个物品，其价值问v[i],重量为w[i]，数量都是无限的，背包容量为p
        for(int i = 0; i <= n; i++) {
            for(int j = 0; j <= p; j++) {
                f[i][j] = f[i-1][j];
                for(int k = 1; k * w[i] <= j; k++) {
                    f[i][j] = max(f[i][j], f[i][j-k*w[i]] + k*v[i])
                }
            }
        }
    ```

    ```
        // 将上述代码优化成一维数组
        int f[p] = {0};
        for(int i = 0; i <= n; i++) {
            for(int j = w[i]; j <= p; j++) {
                f[j] = max(f[p-w[i]] + v[i], f[p]);
                // 此处遍历的顺序是自左向右的
            }
        }
    ```

4. 多重背包问题

    多重背包的解法类似于完全背包，就是k的限制条件比完全背包多了一条，因为多重背包的物品数量是有限的，
    也可以采用另一种解法，就是将多重背包转化为01背包的问题，就是把所有物品都看作是单独的，即使有些是完全相同的物品

    ```
        // 有n个物品，其价值问v[i],重量为w[i]，数量为c[i]，背包容量为p
        for(int i = 0; i <= n; i++) {
            for(int j = 0; j <= p; j++) {
                f[i][j] = f[i-1][j];
                // 这里多了一个判断条件
                for(int k = 1; k * w[i] <= j && k <= c[i]; k++) {
                    f[i][j] = max(f[i][j], f[i][j-k*w[i]] + k*v[i])
                }
            }
        }
    ```

    ```
        // 转化为01背包求解，构造一个新的v[i]和w[i],这时候的n = sum(c[i])
        // 此处可以稍作优化，即取一个物品的数量时，如果w[i]*c[i]超过了p就可以不取了
        int count = 0;
        int n = 0;
        for(int i = 0; i <= n; i++) {
            n += c[i];
            for(int j = 0; j <= c[i]; j++) {
                v_new[count] = v[i]
                w_new[count++] = w[i]
            }
        }
        int f[p] = {0};
        for(int i = 0; i <= n; i++) {
            for(int j = p; j >= w_new[i]; j--) {
                f[j] = max(f[p-w_new[i]] + v_new[i], f[p]);
                // 像01背包一样遍历
            }
        }
    ```


5. 最长公共子序列问题：

    ```
        // 传入一个二维vector是为了记录方向，方便最后打印路径
        int lcs(string str1, string str2, vector<vector<int>>& vec) {
            int len1 = str1.size();
            int len2 = str2.size();
            vector<vector<int>> c(len1 + 1, vector<int>(len2 + 1, 0));
            for (int i = 0; i <= len1; i++) {
                for (int j = 0; j <= len2; j++) {
                    if (i == 0 || j == 0) {
                        c[i][j] = 0;
                    }
                    else if (str1[i - 1] == str2[j - 1]) {
                        c[i][j] = c[i - 1][j - 1] + 1;
                        vec[i][j] = 0;
                        // 做下标记，回头打印时遇到vec[i][j] == 0的时候打印str1[i-1]就可
                    }
                    else if (c[i - 1][j] >= c[i][j - 1]){
                        c[i][j] = c[i - 1][j];
                        vec[i][j] = 1;
                        // 打印时遇到vec[i][j] == 1时就递归回去i-1，即原路返回
                    }
                    else{
                        c[i][j] = c[i][j - 1];
                        vec[i][j] = 2;
                    }
                }
            }

            return c[len1][len2];
        }

        void print_lcs(vector<vector<int>>& vec, string str, int i, int j)
        {
            if (i == 0 || j == 0)
            {
                return;
            }
            if (vec[i][j] == 0)
            {
                print_lcs(vec, str, i - 1, j - 1);
                printf("%c", str[i - 1]);
            }
            else if (vec[i][j] == 1)
            {
                print_lcs(vec, str, i - 1, j);
            }
            else
            {
                print_lcs(vec, str, i, j - 1);
            }
        }


    ```

6. 最长公共子串问题：
   
   ```
        // 最长公共子串的思路与最长公共子序列的相似，但是递推关系更为严格
        int lcs_2(string str1, string str2, vector<vector<int>>& vec) {
            int len1 = str1.size();
            int len2 = str2.size();
            int result = 0;     //记录最长公共子串长度
            vector<vector<int>> c(len1 + 1, vector<int>(len2 + 1, 0));
            for (int i = 0; i <= len1; i++) {
                for (int j = 0; j <= len2; j++) {
                    if (i == 0 || j == 0) {
                        c[i][j] = 0;
                    }
                    else if (str1[i - 1] == str2[j - 1]) {
                        c[i][j] = c[i - 1][j - 1] + 1;
                        vec[i][j] = 0;
                        result = c[i][j] > result ? c[i][j] : result;
                    }
                    else {
                        c[i][j] = 0;
                        // 只要str1[i - 1] != str2[j - 1]，那么以str1[i-1]和str2[j-1]结尾的子串不是公共子串了。
                    }
                }
            }
            return result;
        }

        void print_lcs(vector<vector<int>>& vec, string str, int i, int j)
        {
            if (i == 0 || j == 0)
            {
                return;
            }
            if (vec[i][j] == 0)
            {
                print_lcs(vec, str, i - 1, j - 1);
                printf("%c", str[i - 1]);
            }
            else if (vec[i][j] == 1)
            {
                print_lcs(vec, str, i - 1, j);
            }
            else
            {
                print_lcs(vec, str, i, j - 1);
            }
        }
   ```
