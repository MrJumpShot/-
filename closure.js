let arr = [];
for(var i = 0; i < 10; i++) {
    var temp = i + 1;
    arr.push(function() {
        console.log(temp)
    })
}

arr.forEach(f => f())