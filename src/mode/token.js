import { appConfig, system } from '../config';
import { session } from '../vendor/utils';
import User from '../config/module/user.js';
import appRouter from '../router';

export const getAuthMenus = function (config) {
    let userSession = session('user');
    return config.http({
        method: 'post',
        url: User.listResourceAuth,
        data: {
            userId: userSession.userId,
            resourceType: '1'
        },
        transformResponse: [function (data) {
            return (JSON.parse(data)).result;
        }]

    });
};

export const main = {
    beforeCreate() {
        let that = this;
        this.$http.defaults.transformResponse = [function (data) {
            try {
                let responseJson = JSON.parse(data);
                if (responseJson.success === false) {
                    //token无效返回的错误码
                    if (appConfig.token.invailCode.indexOf(responseJson.error.code) > -1) {
                        switch (appConfig.token.mode) {
                            case 1:
                                that.$Modal.error({
                                    title: '系统提示',
                                    content: '登录过期，请重新登陆！',
                                    onOk: () => {
                                        window.sessionStorage.clear();
                                        that.$router.push('/login');
                                    }
                                });
                                break;
                        }
                    }
                }
                return responseJson;
            } catch (e) {
                return data;
            }
        }];

    }
};

export const layout = {
    methods: {
        dropDownHandler(name) {
            switch (name) {
                case 'logout':
                    this.$Modal.confirm({
                        title: '系统提示',
                        content: '您是否要退出系统？',
                        onOk: () => {
                            let userSession = this.$session('user');
                            this.$http({
                                method: 'post',
                                url: User.logout,
                            });
                            sessionStorage.clear();
                            location.reload();
                        }
                    });
                    break;
            }
        }
    },
    created() {
        let _this = this;
        let userSession = this.$session('user');

        if(userSession){
            Object.assign(_this.$http.defaults.headers.post, {
                'Access-Control-Expose-Headers': 'x-shiro-authorization',
                'x-shiro-authorization': userSession.token,
            });
        }

        this.$store.dispatch(system.action.getAuthMenus, {
            http: _this.$http,
            callback: (authMenus) => {
                if (authMenus.length === 0) {
                    this.$Modal.error({
                        title: '系统提示',
                        content: '当前账户未授权，请联系管理员！'
                    });
                }
                
                _this.initLayout(authMenus);
                let currentRouter = _this.$router.currentRoute;
                if (currentRouter.path === '/') {
                    let firstMenu = null;
                    for (let i = 0, len = authMenus.length; i < len; i++) {
                        if (authMenus[i].url && !firstMenu) {
                            firstMenu = authMenus[i].url;
                            break;
                        }
                    }
                    if (firstMenu) {
                        _this.$router.push(firstMenu);
                    }
                }else{
                    _this.$router.push(currentRouter.path);
                }
            }
        });
    }
};

appRouter.beforeEach((to,from,next) => {
    if(to.name === 'NotFound'){
        next();
    }else if(to.matched[0].name === 'Layout'){
        if(session('user')){
            next();
        }else{
            next('/login');
        }
    }else{
        next();
    }
});



