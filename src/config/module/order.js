'use strict'

import { appConfig } from '../index.js';

const API = {
    cancel: appConfig.baseUrl + '/order/cancel.do',
    get: appConfig.baseUrl + '/order/get.do',
    confirm: appConfig.baseUrl + '/order/confirm.do',
    list: appConfig.baseUrl + '/order/list.do',
    deliver: appConfig.baseUrl + '/order/deliver.do',
}

export default API