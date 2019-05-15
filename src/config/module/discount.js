'use strict'

import { appConfig } from '../index.js';

const API = {
    saveDiscount: appConfig.baseUrl + '/discount/saveDiscount.do',
    saveLevel: appConfig.baseUrl + '/discount/saveLevel.do',
    delete: appConfig.baseUrl + '/discount/delete.do',
    update: appConfig.baseUrl + '/discount/update.do',
    get: appConfig.baseUrl + '/discount/get.do',
    list: appConfig.baseUrl + '/discount/list.do'
};

export default API