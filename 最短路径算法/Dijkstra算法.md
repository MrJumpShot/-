# Dijkstra算法

`Dijkstra`算法的本质就是松弛，根据原始的数据得到起点到各个点的直接距离，从中选出距离最小的点来松弛其他的距离，依次进行下去，直至进行了`n-1`次松弛之后结束

`Dijkstra`算法的缺点在于无法解决存在负权边的问题，

`dijkstra`算法基于贪心，贪心算法中最重要的一部分就是贪心策略，贪心算法对不对，就是贪心策略的正确不正确，在这个算法中，贪心策略就是，去寻找点`i`，满足`min(d[i]) i∈B`，满足这个条件的点`i`，必定是无法被继续松弛的点（如果存在负权边，那么这个就不成立了），如果说要松弛点`i`，那么必定通过`A`中或者`B`中的点进行更新，若通过`B`中的点`j`进行更新那么松弛之后的路径为`d[j] + a[j][i]` 由于`d[i]`已经是最小了，因此`d[j]+a[j][i]>d[i]` 因此不可能是通过`B`中的点进行松弛，若通过`A`中的点`m`进行松弛，由于`m`是点集`A`中的点，因此点`m`一定松弛过点`i`，重复的松弛没有意义的。因此，我们找到的点`i`，现在的`d[i]`，一定是从源点到点`i`路径最小的点了，因此，该算法的正确性是可以保证的。


## 代码实现：

```
    int lowcost[maxSize] = {0};
    // lowcost数组是用来记录起点到各个点的最小距离的，在松弛过程中会不断调整
    int visited[maxSize] = {0};
    // visited数组来记录各个点是否已经被采用来作为松弛的中间点，一个点只有一次作为松弛的中间点的机会
    int graph[maxSize][maxSize] = {0}
    // graph数组记录各个节点之间的直接距离，用于初始化lowcost数组以及松弛的作用
    void Dij(int start)
    {
        for(int i = 0; i < n; i++)
            lowcost[i] = graph[start][i];
        lowcost[start]=0;
        // 起点设为已访问
        visited[start]=1;

        // 设置和起点的最小距离，以及该点的id
        int minVal = INT_MAX;
        int minId;
        // 需要进行n-1次的松弛
        for(int i = 0; i < n - 1; i++)
        {
            minVal = INT_MAX;
            for(int j = 0; j < n; j++)
            {
                if(lowcost[j] < minVal && !visited[j])
                {
                    minVal = lowcost[j];
                    minId = j;
                }
            }
            // 找到距离最小的点之后，置为已访问，并以该点为中间点来进行松弛
            visited[minId] = 1;
            // 松弛的过程
            for(int k = 0;k < n; k++)
            {
                if(!visited[k])
                lowcost[k] = min(lowcost[k], minVal + graph[minId][k]);
                // 此处若还需要答应最短路径的具体路径，则还需要一个pre数组来保存是哪个节点松弛了自己，那么在最短路径中松弛了自己的节点就应该出现在自己之前
                // 即此处如果被松弛成功就需要设置 pre[k] = minId;
            }
        }
    }


    
```