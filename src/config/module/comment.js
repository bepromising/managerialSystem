'use strict'

import { appConfig } from '../index.js';

const API = {
    delete: appConfig.baseUrl + '/comment/delete.do',
    get: appConfig.baseUrl + '/comment/get.do',
    save: appConfig.baseUrl + '/comment/save.do',
    list: appConfig.baseUrl + '/comment/list.do',
    update: appConfig.baseUrl + '/comment/update.do',
}

export default API