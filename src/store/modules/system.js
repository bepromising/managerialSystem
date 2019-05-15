import { system, appConfig } from './../../config';
import { session } from './../../vendor/utils';
import { getAuthMenus } from '../../mode/token.js';
import appRouter, { replaceRouter } from '../../router';
export default {
    state: {
        tokenTimer: null,
        needAdjust: false,
        loading: false,
        menuState: true,
        authMenus: []
    },
    actions: {
        [system.action.getAuthMenus]: async function ({ commit }, config = {}) {
            let authMenus = null;
            if (!authMenus) {
                let result = await getAuthMenus(config);
                if (result.data.length > 0) {
                    authMenus = result.data;
                    session('authMenus', authMenus)
                } else {
                    authMenus = [];
                }
            }
            if (authMenus.length > 0) {
                commit(system.mutation.initRouter, authMenus);
            }
            if (config.callback) {
                config.callback(authMenus);
            }
        }
    },
    mutations: {
        [system.mutation.switchLoading](state, payload) {
            state.loading = payload.loading;
        },
        [system.mutation.switchMenu](state, payload) {
            state.menuState = payload;
        },
        [system.mutation.initRouter](state, payload) {
            if (payload.length === 0 || state.authMenus.length > 0) {
                return false;
            }
            let addRouters = [];
            payload.forEach(vo => {
                if (vo.resourceUrl) {
                    addRouters.push({
                        path: vo.resourceUrl,
                        name: vo.resourceUrl.replace(/^\//, '').replace('/', '-'),
                        component: () => import(`@/views/${vo.resourceUrl.replace(/^\//, '')}.vue`),
                        meta: { keepAlive: true }
                    });
                }
            });
            addRouters.push({
                path: '/*',
                name: 'NotFound',
                component: () => import('@/views/NotFound.vue')
            });
            state.authMenus = addRouters.map(vo => vo);
            let layoutRouter = appRouter.options.routes.find(vo => vo.name === 'Layout');
            layoutRouter.path = '/';
            layoutRouter.children = addRouters;
            replaceRouter(appRouter.options.routes);
        }
    }
};
