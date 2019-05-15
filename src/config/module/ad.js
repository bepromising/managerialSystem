'use strict'

import { appConfig } from '../index.js';

const API = {
    delete: appConfig.baseUrl + '/ad/delete.do',
    get: appConfig.baseUrl + '/ad/get.do',
    save: appConfig.baseUrl + '/ad/save.do',
    list: appConfig.baseUrl + '/ad/list.do',
    update: appConfig.baseUrl + '/ad/update.do',
}

export default API