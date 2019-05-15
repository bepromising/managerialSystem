import { system} from '../config';
import http from 'axios';
import appRouter from '../router';

export const  getAuthMenus = function(){
    return http({
        method:'get',
        url:'static/data/authMenu.json',
        transformResponse: [function (data) {
            return JSON.parse(data);
        }]
    });
};

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
                            sessionStorage.clear();
                            location.reload();
                        }
                    });
                break;
            }
        }
    },
    created(){
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