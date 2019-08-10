var bb = [1];
function change(bb) {
    bb = [3]
    console.log(bb, 'inner1')
    bb[0] = 2;
    console.log(bb, 'inner2')
}
change(bb)
console.log(bb, 'outer')