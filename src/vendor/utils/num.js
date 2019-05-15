const doubleFormat = function(num, length){
    return num.toString().length < length ? '0' + num.toString() : num;
};
const random = function (min, max) {
    let range = max * 100 - min * 100,
        rand = Math.random(),
        num = min * 100 + Math.round(rand * range);
    return Math.round(num) / 100;
};
export {
    doubleFormat,
    random
}
