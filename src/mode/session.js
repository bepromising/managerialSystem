import { system, appConfig} from '../config';
import http from 'axios';
import {session} from '../vendor/utils';

export const  getAuthMenus = function(){
    let userSession = session('userInfo');
    return http({
        method:'post',
        url:system.API.userlistResourceAuth,
        data:{
            resourceType:1,
            userId:userSession.userId
        },
        transformResponse: [function (data) {
            return (JSON.parse(data)).result;
        }]
    });
};

export const getAuthResource = function(){
    let userResource= session('resource');
    if(!userResource){
        let userSession = session('userInfo');
        this.$http({
            method:'post',
            url:system.API.userlistResourceAuth,
        data:{
            userId:userSession.userId,
            resourceType:2
        }
        }).then(
            (response)=>{
                session('resource',data.result);
            },
            (error)=>{
                this.Message.error('请求失败，请稍候重试！');
            }
        );
    }
}

export const main = {

};

export const layout = {
    methods:{
        dropDownHandler(name){
            switch(name){
                case 'logout':
                    this.$Modal.confirm({
                        title:'系统提示',
                        content:'您是否要退出系统？',
                        onOk:()=>{
                            let userSession = this.$session('user');
                            sessionStorage.clear();
                            location.reload();
                        }
                    });
                break;
            }
        }
    },
    async created(){
        let userSession=this.$session('userInfo');
        if(!userSession){
            let userInfo=await this.$http({
                method:'post',
                url:system.API.userLogin
            });
            if(userInfo.data.success){
                this.$session('userInfo',userInfo.data.result);
                userSession=userInfo.data.result;
            }else{
                this.$Modal.error({
                    title:'系统提示',
                    content:'当前账户未授权！'
                });
            }
        }
        if(appConfig.buttonsAuth){
            getAuthResource();
        }
        this.$store.dispatch(system.action.getAuthMenus,{
            callback:(authMenus) => {
                this.$router.push(location.hash.replace('#',''));
                this.initLayout(authMenus);
            }
        });
    }
};

appRouter.beforeEach((to,from,next)=>{
    if(to.name === 'NotFound'){
        
    }else{
        next();
    }
});
