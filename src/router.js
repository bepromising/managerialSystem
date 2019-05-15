import Vue from 'vue';
import Router from 'vue-router';
import {appConfig} from './config';
import {session} from './vendor/utils';

Vue.use(Router);



let appRouter = new Router({
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('./views/Login.vue')
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('./views/Register.vue')
        },
        {
            path:'/*',
            name: 'Layout',
            component: () => import('./views/Layout.vue'),
            children: []
        }
    ]
});


// if(appConfig.mode === 'token'){
//     appRouter.beforeEach((to, from, next) => {
//         if(to.matched[0].name === 'Layout'){
//             if(session('user')){
//                 next();
//             }else{
//                 next('/login');
//             }
//         }else{
//             next();
//         }
//     });
// }
appRouter.afterEach(currentRoute => {
    if(currentRoute.meta){
        if(currentRoute.meta.title){
            document.title = currentRoute.meta.title;
        }else if(currentRoute.meta.subTitle){
            document.title = appConfig.title + currentRoute.meta.subTitle;
        }else{
            document.title = appConfig.title;
        }
    }
});

export const replaceRouter = function(data){
    appRouter.matcher = new Router({
        routes: data
    });
};

export default appRouter;
