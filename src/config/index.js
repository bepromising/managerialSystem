import system from './module/system';
const appConfig = {
    //token表示前后端完全分离，使用token的形式
    //nocheck前端不对登录状态进行判断，可在使用后端session或者demo完全不验证的场合
    mode:'token',
    ajaxTimeout: 60,
    title: '综合管理系统',
    //仅在token模式中生效
    token: {
        // 1提示过期并跳转至登录页面
        // 2在过期时间前tokenRefreshLimit秒前调用接口applyTokenUrl刷新token
        // 3在过期时间前tokenRefreshLimit秒前调用接口refreshTokenUrl延长token过期时间
        mode: 1,
        refreshLimit: 60,
        invailCode: ['10000', 'shsoft_identify_02_010002'],
        url:process.env.VUE_APP_URL+'/shsoft-identify-server/'
    },
    baseUrl: 'https://meishijiapeisong.club/backend',
    //目前只有基于单点登录的session模式才有
    buttonsAuth:false,
    tabs: {
        enabled: true,
        max: 10,
        //0不作任何提示
        //1每次新增窗口警告
        //2确认框形式，让用户选择新开还是覆盖
        //3直接覆盖
        type: 1
    }
};
export { 
    system, 
    appConfig 
};
