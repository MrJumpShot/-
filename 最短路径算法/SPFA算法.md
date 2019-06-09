# SPFA算法

## 适用范围：
给定的图存在负权边，这时类似`Dijkstra`等算法便没有了用武之地，而`Bellman-Ford`算法的复杂度又过高，`SPFA`算法便派上用场了。 我们约定有向加权图`G`不存在负权回路，即最短路径一定存在。

## 算法思想：
我们用数组d记录每个结点的最短路径估计值，用邻接表来存储图G。我们采取的方法是动态逼近法：设立一个先进先出的队列用来保存待优化的结点，优化时每次取出队首结点u，并且用u点当前的最短路径估计值对离开u点所指向的结点v进行松弛操作，如果v点的最短路径估计值有所调整，且v点不在当前的队列中，就将v点放入队尾。这样不断从队列中取出结点来进行松弛操作，直至队列空为止

与Dijkstra算法的区别在于Dijkstra算法中所有的点只能一次作为松弛的中间点，而SPFA算法中可以多次进入松弛队列，只要这个点的dist发生了变化且暂时不在松弛队列中。
## 实现方法：

建立一个队列，初始时队列里只有起始点，再建立一个数组记录起始点到所有点的最短路径（该数组的初始值要赋为极大值，该点到他本身的路径赋为0）。然后执行松弛操作，用队列里有的点作为起始点去刷新到所有点的最短路，如果刷新成功且被刷新点不在队列中则把该点加入到队列最后。重复执行直到队列为空。

## 注意：
SPFA无法处理存在负权环路的问题，但是负权环路是可以在计算过程中判断的，如果一个节点的入队列次数大于等于节点数量，那么就是存在负权环路

## 代码

```
    #include <iostream>    
    #include <queue>
    #include <stack>

    using namespace std;

    int  matrix[100][100]; // 邻接矩阵
    bool visited[100];     // 标记数组
    int  dist[100];        // 源点到顶点 i 的最短距离
    int  path[100];        // 记录最短路的路径
    int  enqueue_num[100]; // 记录入队次数
    int  vertex_num;       // 顶点数
    int  edge_num;         // 边数
    int  source;           // 源点

    bool SPFA()
    {
        memset(visited, 0, sizeof(visited));
        memset(enqueue_num, 0, sizeof(enqueue_num));
        for (int i = 0; i < vertex_num; i++)
        {
            dist[i] = INT_MAX;
            path[i] = source;
        }

        queue<int> Q;
        Q.push(source);
        dist[source] = 0;
        visited[source] = 1;
        enqueue_num[source]++;

        while (!Q.empty())
        {
            int u = Q.front();
            Q.pop();
            visited[u] = 0;

            for (int v = 0; v < vertex_num; v++)
            {
                if (matrix[u][v] != INT_MAX)  // u 与 v 直接邻接
                {
                    if (dist[u] + matrix[u][v] < dist[v])
                    {
                        dist[v] = dist[u] + matrix[u][v];
                        path[v] = u;

                        if (!visited[v])
                        {
                            Q.push(v);
                            enqueue_num[v]++;
                            if (enqueue_num[v] >= vertex_num)
                                return false;
                            visited[v] = 1;
                        }
                    }
                }
            }
        } // while (!Q.empty())

        return true;
    }

    void Print()
    {
        for (int i = 0; i < vertex_num; i++)
        {
            if (i != source)
            {
                int p = i;
                stack<int> s;
                cout << "顶点 " << source << " 到顶点 " << p << " 的最短路径是： ";

                while (source != p)  // 路径顺序是逆向的，所以先保存到栈
                {
                    s.push(p);
                    p = path[p];
                }

                cout << source;
                while (!s.empty())  // 依次从栈中取出的才是正序路径
                {
                    cout << "--" << s.top();
                    s.pop();
                }
                cout << "    最短路径长度是：" << dist[i] << endl;
            }
        }
    }

    int main()
    {

        cout << "请输入图的顶点数，边数，源点：";
        cin >> vertex_num >> edge_num >> source;

        for (int i = 0; i < vertex_num; i++)
            for (int j = 0; j < vertex_num; j++)
                matrix[i][j] = (i != j) ? INT_MAX : 0;  // 初始化 matrix 数组

        cout << "请输入" << edge_num << "条边的信息：\n";
        int u, v, w;
        for (int i = 0; i < edge_num; i++)
        {
            cin >> u >> v >> w;
            matrix[u][v] = w;
        }

        if (SPFA())
            Print();
        else
            cout << "Sorry,it have negative circle!\n";

        return 0;
    }
```