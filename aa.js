console.log('script start')

    async function async1() {
        await async2()
        console.log('1111')
        await async3()
        console.log('222')
        await async4()
        console.log('async1 end')
    }

    async function async2() {
        console.log('async2 end')
    }
    async function async3() {
        console.log('async3 end')
    }
    async function async4() {
        console.log('async4 end')
    }
    async1()

    setTimeout(function() {
        console.log('setTimeout')
    }, 0)

    new Promise(resolve => {
        console.log('Promise')
        resolve()
    }).then(() => {
        console.log('promise1')
    }).then(() => {
        console.log('promise2')
    }).then(() => {
        console.log('promise3')
    }).then(() => {
        console.log('promise4')
    }).then(() => {
        console.log('promise5')
    }).then(() => {
        console.log('promise6')
    }).then(() => {
        console.log('promise7')
    }).then(() => {
        console.log('promise8')
    }).then(() => {
        console.log('promise9')
    }).then(() => {
        console.log('promise10')
    })

    console.log('script end')