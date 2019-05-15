'use strict'

import { appConfig } from '../index.js';

const API = {
    delete: appConfig.baseUrl + '/goods/delete.do',
    get: appConfig.baseUrl + '/goods/get.do',
    save: appConfig.baseUrl + '/goods/save.do',
    list: appConfig.baseUrl + '/goods/list.do',
    update: appConfig.baseUrl + '/goods/update.do',
}

export default API