function add (num) {
    var count = num;
    var _b = function(l){
        count += l;
        return _b
    }
    _b.valueOf = function(){
        return count
    }
    return _b
}
var c = add(1)(2)(3);
console.log(c == 6) 