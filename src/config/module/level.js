'use strict'

import { appConfig } from '../index.js';

const API = {
    save: appConfig.baseUrl + '/level/save.do',
    delete: appConfig.baseUrl + '/level/delete.do',
    update: appConfig.baseUrl + '/level/update.do',
    get: appConfig.baseUrl + '/level/get.do',
    list: appConfig.baseUrl + '/level/list.do'
};

export default API