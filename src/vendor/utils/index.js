import {appConfig} from '../../config';
/**
 *
 * @param {Array} ajaxList 每一个就是一个axios的构造对象
 * @param {Function} http 需要传入的axios对象
 * @param {*} options
 */
const allAjax = async function(ajaxList, http, options) {
    options = { each: 4, delay: 0, dataOnly: true, ...options };
    let response = [],
        eachConfig = options.common || { method: 'post' };
    while (ajaxList.length > 0) {
        let requests = ajaxList.splice(0, options.each).map(item => {
            return http({
                ...eachConfig,
                ...item
            });
        });
        response = response.concat(await http.all(requests));
        if (options.delay > 0) {
            await new Promise((resolve, reject) => {
                window.setTimeout(() => {
                    resolve();
                }, options.delay);
            });
        }
    }
    return options.dataOnly === true
        ? response.map(item => item.data)
        : response;
};

/**
 * 统一的session设置和获取，同时传入key和value表示设置session，传入key表示获取session
 * @param {String} key session的key
 * @param {String} value session的value
 * @param {Boolean} parse
 * @returns {*}
 */
const session = function(key, value = null, parse = true) {
    let sessionKey = 'shSoft-' + key;
    if (key && value) {
        if (parse) {
            window.sessionStorage.setItem(sessionKey, JSON.stringify(value));
        } else {
            window.sessionStorage.setItem(sessionKey, value);
        }
    } else {
        let sessionVal = window.sessionStorage.getItem(sessionKey);
        return parse ? JSON.parse(sessionVal) : sessionVal;
    }
};


const downloadFileByForm = function(url, option) {
    let userSession = session('user');
    option = {
        method: 'post',
        ...option
    };
    let app = document.querySelector('#app'),
        form = null;
    if (!app.querySelector('#hide-frame')) {
        let newIframe = document.createElement('iframe');
        newIframe.setAttribute('name', 'hide-frame');
        newIframe.setAttribute('id', 'hide-frame');
        newIframe.className = 'hide-frame';
        app.appendChild(newIframe);
        form = document.createElement('form');
        form.setAttribute('enctype', 'multipart/form-data');
        form.setAttribute('id', 'hide-form');
        form.setAttribute('target', 'hide-frame');
        app.appendChild(form);
    } else {
        form = app.querySelector('#hide-form');
        form.innerHTML = '';
    }
    form.setAttribute('action', appConfig.baseUrl + url);
    form.setAttribute('method', option.method);
    if (appConfig.mode === 'token' && !option.data.hasOwnProperty('Access-Control-Expose-Headers')) {
        Object.assign(option.data, {
            'Access-Control-Expose-Headers': userSession.authKey,
            'x-shsoft-auth-token': userSession.token,
            'x-shsoft-auth-user': userSession.userId
        });
    }
    for (let key in option.data) {
        if (option.data[key] !== null && option.data[key] !== '') {
            let input = document.createElement('input');
            input.setAttribute('name', key);
            input.setAttribute('type', 'hidden');
            input.setAttribute('value', option.data[key]);
            form.appendChild(input);
        }
    }
    form.submit();
};

const downloadFileByBlob = function(config) {
    import('file-saver').then(fileSaver => {
        let { url, data } = config;
        if (!config.fileName) {
            config.fileName = Date.now();
        }
        if (window.Blob) {
            this.$http({
                method: 'post',
                url: url,
                responseType: 'blob',
                headers: {
                    post: {
                        'Content-Type': 'application/json'
                    }
                },
                data: {
                    args: data
                }
            }).then(
                response => {
                    let blob = new Blob([response.data], {
                        type: 'application/vnd.ms-excel;charset=utf-8'
                    });
                    //application/vnd.openxmlformats-officedocument.spreadsheetml.sheet是xlsx类型
                    fileSaver.saveAs(blob, `${config.fileName}.xls`);
                },
                error => {
                    this.$Message.error('请求失败，请稍候重试！');
                }
            );
        } else {
            this.$Modal.error({
                title: '系统提示',
                content: '当前浏览器不支持此模块的导出！'
            });
        }
    });
};


const newTab = function(url){
    window.localStorage.setItem('sh_cross_session',session('user',null,false));
    let a = document.createElement('a');
    a.className = 'hide-frame';
    a.setAttribute('target','_blank');
    a.setAttribute('href',url);
    document.querySelector('#app').appendChild(a);
    a.click();
    document.querySelector('#app').removeChild(a);
};

const getUrlParams = function(key) {
    let finalParams = {};
    if (location.hash) {
        let _params = location.hash.replace(/#\/?/, '').split('&');
        _params.forEach(vo => {
            let _tmp = vo.split('=');
            finalParams[_tmp[0]] = _tmp[1];
        });
        return key ? finalParams[key] : finalParams;
    } else {
        return false;
    }
};

export {
    allAjax,
    session,
    newTab,
    getUrlParams,
    downloadFileByForm,
    downloadFileByBlob
};
