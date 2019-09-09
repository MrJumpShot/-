1. 方法重载：方法名相同，参数列表不同，与返回值类型和修饰符无关

2. 自增自减运算符能自动的强制类型转换
   ```
        short a = 10;
        a = a + 10;  // error

        a++; // OK
        a += 10; // OK
   ```

3. 局部变量和成员变量
   
   * 成员变量是在类的方法外部的变量，在创建类的实例对象时储存在堆内存里面的
   * 局部变量是在方法参数列表或者在方法内部声明的变量，是调用方法时在栈内存储存的

4. 多态实现的前提：
        
   * 继承
   * 重写
   * 父类引用指向子类实例

   注意：如果父类中没有某种方法的实现，而子类中有，也是无法实现多态的，需要方法在父类和子类中同时存在而且是子类对父类方法的重写，对于成员变量，不涉及重写

   ```
        class Father {
                String name = "father";
        }

        class Son extends Father {
                String name = "son";
                public eat() {
                        System.out.println("eat");
                }
        }

        class Test {
                public static void main(String[] args) {
                        Father f = new Son();
                        f.eat(); // 此时是会报错的，因为父类没有实现eat方法
                        f.name; // father
                        Son s = new Son();
                        s.name; // son
                }
        }
   ```