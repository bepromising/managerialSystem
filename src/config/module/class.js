'use strict'

import { appConfig } from '../index.js';

const API = {
    delete: appConfig.baseUrl + '/class/delete.do',
    get: appConfig.baseUrl + '/class/get.do',
    save: appConfig.baseUrl + '/class/save.do',
    list: appConfig.baseUrl + '/class/list.do',
    update: appConfig.baseUrl + '/class/update.do',
}

export default API