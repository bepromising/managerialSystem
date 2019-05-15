import Vue from 'vue';
import router from './router';
import store from './store';
import iView from 'iview';
import './pollyfill';
import http from 'axios';
import { session } from './vendor/utils';
import {serialize} from './vendor/utils/object';
import './style/iview-theme.less';
import './style/reset.scss';
import './style/vue-transition-animate.scss';

import { main } from './mode/token.js';

Vue.use(iView);
Vue.config.productionTip = false;

if (!Vue.prototype.$session) {
    Vue.prototype.$session = session;
}


if (!Vue.prototype.$http) {
    http.defaults.headers.post['Content-Type'] = 'application/json';
    http.defaults.baseURL = process.env.VUE_APP_URL;
    http.defaults.transformRequest = [function (data, headers) {
        let contentType = headers['Content-Type'] || headers.post['Content-Type'],
            responseData;
        switch (contentType) {
            case 'application/json':
                responseData = serialize(data, 'json');
                break;
            case 'application/x-www-form-urlencoded':
                responseData = serialize(data)
                break;
            default:
                responseData = data;
                break;
        }
        return responseData;
    }];
    Vue.prototype.$http = http;
}




new Vue({
    el: '#app',
    router,
    store,
    mixins: [main]
});
