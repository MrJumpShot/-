# shell排序（希尔排序）

希尔排序其实就是对插入排序的一种优化算法，先是大间隔地对数组进行插入排序，逐渐减小插入排序的间隔，使得数组总体上逐渐趋向于顺序，最后再进行直接的插入排序，由于此时数组已经基本顺序了，所以最后一个直接插入排序的时间复杂度很低。

希尔排序的时间复杂度为O(nlogn)

希尔排序是不稳定的，在进行大间隔的插入排序时可能会导致相同元素之间的位置发生变化。


## 朴素的希尔排序

根据希尔排序的精神直接写出的代码，比较冗长，
步长的选取有不同的策略

```
    void shellsort_original(int ary[],int len){
	
        //算法开始
        for(int i =len / 2; i != 0;i = i/2){//步长确定
            for (int j =0;j < i;++j)
            {
                for (int k = i + j;k < len;k = k + i)
                {
                    if (ary[k] < ary[k - i])
                    {
                        int l = k - i;
                        int tmp = ary[k];
                        while (ary[l] > tmp&&l >= 0)
                        {
                            ary[l+i] = ary[l];
                            l -= i;
                        }
                        ary[l+i] = tmp;
                    }
                    
                }
            }
        }
        //算法结束
    
    }
```

## 优化后的希尔排序（只是代码上的优化，复杂度并没有优化）

```
    void shellsort_improved(int ary[],int len)
    {
        for(int i =len / 2; i != 0;i = i/2){//i为步长
            for(int j = 1 + i; j < len;++j){
                if (ary[j] < ary[j - i])
                    {
                        int l = j - i;
                        int tmp = ary[j];
                        while (ary[l] > tmp&&l >= 0)
                        {
                            ary[l+i] = ary[l];
                            l -= i;
                        }
                        ary[l+i] = tmp;
                    }
            }
        
        
        }
    }

```