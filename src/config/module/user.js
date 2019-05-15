'use strict'

import { appConfig } from '../index.js';

const API = {
    delete: appConfig.baseUrl + '/user/delete.do',
    get: appConfig.baseUrl + '/user/get.do',
    save: appConfig.baseUrl + '/user/save.do',
    list: appConfig.baseUrl + '/user/list.do',
    update: appConfig.baseUrl + '/user/update.do',
    listGroupAuth: appConfig.baseUrl + '/user/listGroupAuth.do',
    listResourceAuth: appConfig.baseUrl + '/user/listResourceAuth.do',
    login: appConfig.baseUrl + '/user/login.do',
    logout: appConfig.baseUrl + '/user/logout.do',
}

export default API