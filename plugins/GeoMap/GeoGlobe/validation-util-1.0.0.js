//验证工具类
var Validation = {

    /**
     * 判断val是否是正数的数值
     */
    isNum : function(val){
        // 正负的数： /^(0|[1-9]\d*)$|^(-(0|[1-9]\d*))$|^(0|[1-9]\d*)\.(\d+)$|^(-(0|[1-9]\d*)\.(\d+))$/
        // 正数
        var patrn = /^(0|[1-9]\d*)$|^(0|[1-9]\d*)\.(\d+)$/;
        if (!patrn.exec(val)) {
            return false;
        }
        return true;
    },
	
    /**
     * 判断val是否是数值
     */
    isPNNum : function(val){
        // 正负的数： /^(0|[1-9]\d*)$|^(-(0|[1-9]\d*))$|^(0|[1-9]\d*)\.(\d+)$|^(-(0|[1-9]\d*)\.(\d+))$/
        var patrn =  /^(0|[1-9]\d*)$|^(-(0|[1-9]\d*))$|^(0|[1-9]\d*)\.(\d+)$|^(-(0|[1-9]\d*)\.(\d+))$/;
        if (!patrn.exec(val)) {
            return false;
        }
        return true;
    },
	
    /*
     * 限制表单输入长度
     */
    limitFormLength : function(value,len){
    	len = len?len:18;
        var re = /[\u4E00-\u9FA5]/g; //测试中文字符的正则
        if (re.test(value)) //使用正则判断是否存在中文
        {
        
            var lengths = value.match(re).length * 2 + (value.length - value.match(re).length);
            if (lengths > len) {
				return false;
            }
			return true;
        }
        else {
        	if (value.length > len) {
				return false;
            }
			return true;
        }
    },
	
	/*
	 * 高义
	 * 2011-4-25
	 * 截取浮点型位数
	 * floatNum ：{float} - 将要被截取的浮点数
	 * num :{Integer} - 从左边第一个数字开始，要截取多少位
	 * return  {float}
	 */
	interceptFloat : function(floatNum,num) {
			var floatString = floatNum.toString();
			var subFloat = floatString.substr(0,num);
			var lastNum = parseFloat(subFloat);
			return lastNum;
	}
	
}

