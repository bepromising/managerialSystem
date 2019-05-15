
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            var len = o.length >>> 0;
            if (len === 0) {
                return false;
            }
            var n = fromIndex | 0;
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            while (k < len) {
                if (o[k] === searchElement) {
                    return true;
                }
                k++;
            }

            return false;
        }
    });
}



if (!Array.prototype.difference) {
    Array.prototype.difference = function (compare, by, mode) {
        let result = {
            add: [],
            remove: []
        };
        this.forEach((vo, index) => {
            if (!compare.find(item => item[by] === vo[by])) {
                result.remove.push(index);
            }
        });
        compare.forEach(vo => {
            if (!this.find(item => item[by] === vo[by])) {
                result.add.push(vo);
            }
        });
        let returnData;
        switch (mode) {
            case 'all':
                returnData = result;
                break;
            case 'remove':
                returnData = result['remove'];
                break;
            default:
                returnData = result['add'];
                break;
        }
        return returnData;
    };
}

if (!Array.prototype.sum) {
    Array.prototype.sum = function () {
        let sum = 0,temp;
        this.forEach((vo) => {
            switch (typeof vo) {
                case 'number':
                    sum += vo;
                    break;
                default:
                    temp = parseFloat(vo);
                    if (temp) {
                        sum += temp;
                    }
                    break;
            }
        });
        return sum;
    };
}

if (!Array.prototype.fill) {
    Object.defineProperty(Array.prototype, 'fill', {
        value: function (value) {
            if (this == null) {
                throw new TypeError('this is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            var start = arguments[1];
            var relativeStart = start >> 0;
            var k = relativeStart < 0 ?
                Math.max(len + relativeStart, 0) :
                Math.min(relativeStart, len);

            var end = arguments[2];
            var relativeEnd = end === undefined ?
                len : end >> 0;

            var final = relativeEnd < 0 ?
                Math.max(len + relativeEnd, 0) :
                Math.min(relativeEnd, len);

            while (k < final) {
                O[k] = value;
                k++;
            }

            return O;
        }
    });
}

if (!Array.prototype.update) {
    Array.prototype.update = function (newVal, options) {
        let _config = {
            key: 'id',
            updatePK: null,
            action: null
        };
        if (options) {
            for (let key in options) {
                _config[key] = options[key];
            }
        }
        if (!_config.updatePK) {
            if (!Array.isArray(newVal)) {
                var _index = this.findIndex(vo => vo[_config.key] === newVal[_config.key]);
                if (_index > -1) {
                    if (_config.action === 'remove') {
                        this.splice(_index, 1);
                    } else {
                        //this[_index]=newVal;
                        this.splice(_index, 1, newVal);
                    }
                } else {
                    this.push(newVal);
                }
            } else {
                this.forEach((vo, index) => {
                    if (!newVal.find(item => item[_config.key] === vo[_config.key])) {
                        this.splice(index, 1);
                    }
                });
                newVal.forEach(vo => {
                    if (!this.find(item => item[_config.key] === vo[_config.key])) {
                        this.push(vo);
                    }
                });
            }
        } else {
            let updateIndex = this.findIndex(item => item[_config.key] === _config.updatePK),
                updateItem = newVal.find(item => item[_config.key] === _config.updatePK);
            if (updateIndex && updateItem) {
                this.splice(updateIndex, 1, updateItem);
            }
        }

    };
}

if (!Array.prototype.toUrlParmas) {
    Array.prototype.toUrlParmas = function (name) {
        let results = {};
        this.forEach((vo, index) => {
            for (let key in vo) {
                results[`${name}[${index}].${key}`] = vo[key];
            }
        });
        return results;
    };
}
