'use strict'

import { appConfig } from '../index.js';

const API = {
    delete: appConfig.baseUrl + '/cookbook/delete.do',
    get: appConfig.baseUrl + '/cookbook/get.do',
    save: appConfig.baseUrl + '/cookbook/save.do',
    list: appConfig.baseUrl + '/cookbook/list.do',
    update: appConfig.baseUrl + '/cookbook/update.do',
}

export default API