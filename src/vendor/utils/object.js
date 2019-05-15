//重置对象内的属性
const resetObject = function (target, resetValue, except) {
    resetValue = resetValue || null;
    except = except || [];
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }
    for (var key in target) {
        if (except.indexOf(key) === -1) {
            target[key] = Array.isArray(target[key]) ? [] : resetValue;
        }
    }
    return target;
};
//基于tartget中的key，从source中取出并赋值给tartget，从过量的数据source取出小量的数据对target进行赋值
const setValue = function(target, source) {
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }
    for (var key in target) {
        target[key] = source[key];
    }
    return target;
};

const serialize = function(obj, type = 'form') {
    let result = type === 'form' ? [] : {};
    for (let key in obj) {
        if (obj[key] !== null && obj[key] !== '') {
            let value = obj[key];
            if (type === 'form') {
                result.push(
                    encodeURIComponent(key) + '=' + encodeURIComponent(value)
                );
            } else {
                result[key] = value;
            }
        }
    }
    return type === 'form' ? result.join('&') : JSON.stringify(result);
};

/**
 * 使用递归深度克隆object，能克隆function值
 * @param {object} source 来源
 * @param {object} output 输出，不需要传入，仅供递归时调用
 */
const deepClone = function (source, output) {
    output = output || {};
    for (var i in source) {
        if (source.hasOwnProperty(i)) {
            if (typeof source[i] === 'object') {
                output[i] = Object.prototype.toString.call(source[i]) === '[object Array]' ? [] : {};
                deepClone(source[i], output[i]);
            } else {
                output[i] = source[i];
            }
        }
    }
    return output;
};

export {
    resetObject,
    setValue,
    serialize,
    deepClone
};