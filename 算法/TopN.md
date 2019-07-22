# TopN问题

## 问题描述：
从n个数字中找出前N大的这N个数字（n > N），譬如要从10000个数字里找出前1000大的数字

1. 愚蠢的解法：排序后取前N个数字

2. 采用分治的策略：
   * 随机选一个数 t，然后对整个数组进行 partition ，会得到两部分，前一部分的数都大于 t ，后一部分的数都小于 t 
   * 如果说前一部分总数大于 1000 个，那就继续在前一部分进行 partition 寻找。如果前一部分的数小于 1000 个，那就在后一部分再进行 partition ，寻找剩下的数。

    关于时间复杂度：首先，partition 的过程，时间是 o(n)。我们在进行第一次 partition 的时候需要花费 n ，第二次 partition 的时候，数据量减半了，所以只要花费 n/2，同理第三次的时候只要花费n/4，以此类推。而n + n/2 + n/4 + ...显然是小于 2n 的，所以这个方法的渐进时间只有 o(n)

3. 采用小顶堆的方法：（只需要读取一遍数据，但是在维护小顶堆的时候需要进行调整，每一次调整堆的时间复杂度是O(logN)，所以总的时间复杂度应该是O(nlogN)，比分治法复杂度稍高，但是对内存的占用较小，分治法需要一次把所有数据都放进内存，而小顶堆只需要维护一个数量为N的堆即可）
   
具体的实现方法是：
* 首先读入前N个数字并建立起小顶堆
* 然后依次读入剩下的数字，如果该数字比小顶堆的堆顶还要小的话就直接抛弃，如果比小顶堆的堆顶要大就取代堆顶，然后进行调整小顶堆
* 读完所有的数据之后，剩下的小顶堆就是答案，还是排好序的答案

代码实现如下：
   
   public class TopN {

        // 父节点
        private int parent(int n) {
            return (n - 1) / 2;
        }

        // 左孩子
        private int left(int n) {
            return 2 * n + 1;
        }

        // 右孩子
        private int right(int n) {
            return 2 * n + 2;
        }

        // 构建堆
        private void buildHeap(int n, int[] data) {
            for(int i = 1; i < n; i++) {
                int t = i;
                // 调整堆
                while(t != 0 && data[parent(t)] > data[t]) {
                    int temp = data[t];
                    data[t] = data[parent(t)];
                    data[parent(t)] = temp;
                    t = parent(t);
                }
            }
        }

        // 调整data[i]
        private void adjust(int i, int n, int[] data) {
            if(data[i] <= data[0]) {
                return;
            }
            // 置换堆顶
            int temp = data[i];
            data[i] = data[0];
            data[0] = temp;
            // 调整堆顶
            int t = 0;
            while( (left(t) < n && data[t] > data[left(t)])
                || (right(t) < n && data[t] > data[right(t)]) ) {
                if(right(t) < n && data[right(t)] < data[left(t)]) {
                    // 右孩子更小，置换右孩子
                    temp = data[t];
                    data[t] = data[right(t)];
                    data[right(t)] = temp;
                    t = right(t);
                } else {
                    // 否则置换左孩子
                    temp = data[t];
                    data[t] = data[left(t)];
                    data[left(t)] = temp;
                    t = left(t);
                }
            }
        }

        // 寻找topN，该方法改变data，将topN排到最前面
        public void findTopN(int n, int[] data) {
            // 先构建n个数的小顶堆
            buildHeap(n, data);
            // n往后的数进行调整
            for(int i = n; i < data.length; i++) {
                adjust(i, n, data);
            }
        }

        // 打印数组
        public void print(int[] data) {
            for(int i = 0; i < data.length; i++) {
                System.out.print(data[i] + " ");
            }
            System.out.println();
        }

    }

    
