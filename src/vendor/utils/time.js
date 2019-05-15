import { doubleFormat } from './num';
const secondToHour = function (seconds) {
	return seconds > 0 ? Math.round(seconds / 60.0) : 0;
};
const format = function (format, time) {
	let timeStyle = {
		yyyy: function (d) {
			return d.getFullYear();
		},
		yy: function (d) {
			return d
				.getFullYear()
				.toString()
				.substr(2, 2);
		},
		MM: function (d) {
			return doubleFormat(d.getMonth() + 1, 2);
		},
		M: function (d) {
			return d.getMonth() + 1;
		},
		dd: function (d) {
			return doubleFormat(d.getDate(), 2);
		},
		d: function (d) {
			return doubleFormat(d.getDate(), 2);
		},
		hh: function (d) {
			return doubleFormat(d.getHours(), 2);
		},
		mm: function (d) {
			return doubleFormat(d.getMinutes(), 2);
		},
		ss: function (d) {
			return doubleFormat(d.getSeconds(), 2);
		},
		ms: function (d) {
			return doubleFormat(d.getMilliseconds(), 4);
		}
	};
	time = new Date(time) || new Date();
	for (let k in timeStyle) {
		if (eval('/(' + k + ')/g').test(format)) {
			format = format.replace(RegExp.$1, timeStyle[k](time));
		}
	}
	return format;
}
const dateFormat = function (time) {
	return format('yyyy-MM-dd', time);
};
const dateTimeFomat = function (time) {
	return format('yyyy-MM-dd hh:mm:ss');
};

/**
     * 根据月份获取当前季度
     * @param {String} time 日期字符串，若不传入则使用当前时间
     */
const getCurrentQuater = function (time) {
	let currengDate = time ? new Date(time) : new Date(),
		month = currengDate.getMonth(),
		quaters = ['第一季', '第二季', '第三季度', '第四季度'];
	return quaters[Math.floor(month / 3)];
};
/**
 * 获取上一季度,如果withYear为true则年也一并返回
 * @param {Boolean} withYear是否连同year一并返回，如果为true则返回Object
 * @param {String} time 日期字符串，若不传入则使用当前时间
 */
const getPrevQuater = function (withYear = true, time) {
	let currengDate = time ? new Date(time) : new Date(),
		month = currengDate.getMonth(),
		quaters = ['第一季', '第二季', '第三季度', '第四季度'],
		index = Math.floor(month / 3);
	let returnTime = {};
	if (index > 0) {
		returnTime.year = currengDate.getFullYear().toString();
		returnTime.quater = quaters[index - 1];
	} else {
		returnTime.year = (currengDate.getFullYear() - 1).toString();
		returnTime.quater = quaters[3];
	}
	return withYear ? returnTime : returnTime.year;
};
/**
 * 获取上一个月的时间
 * @param {String} returnType [stirng|object]如果是string则返回2018-01这种格式，如果object则返回object
 * @param {String} time 日期字符串，若不传入则使用当前时间
 */
const getPrevMonth = function (returnType = 'string', time) {
	let currengDate = time ? new Date(time) : new Date(),
		month = currengDate.getMonth(),
		year = currengDate.getFullYear();
	if (month === 0) {
		year = year - 1;
		month = 12;
	}
	if (returnType === 'string') {
		return [year, doubleFormat(month, 2)].join('-');
	} else {
		return {
			year: year.toString(),
			month: month.toString()
		};
	}
}

export {
	format,
	dateFormat,
	dateTimeFomat,
	secondToHour,
	getCurrentQuater,
	getPrevQuater,
	getPrevMonth
};