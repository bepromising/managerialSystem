'use strict'

import { appConfig } from '../index.js';

const API = {
    delete: appConfig.baseUrl + '/goods/delete.do',
    get: appConfig.baseUrl + '/goods/get.do',
    save: appConfig.baseUrl + '/goods/save.do',
    tree: appConfig.baseUrl + '/goods/tree.do',
    update: appConfig.baseUrl + '/goods/update.do',
}

export default API