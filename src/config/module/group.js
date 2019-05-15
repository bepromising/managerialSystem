'use strict'

import { appConfig } from '../index.js';

const API = {
    save: appConfig.baseUrl + '/group/save.do',
    delete: appConfig.baseUrl + '/group/delete.do',
    update: appConfig.baseUrl + '/group/update.do',
    get: appConfig.baseUrl + '/group/get.do',
    list: appConfig.baseUrl + '/group/list.do',
    listGroupUser: appConfig.baseUrl + '/group/listGroupUser.do',
    listGroupResource: appConfig.baseUrl + '/group/listGroupResource.do',
    listUserGroup: appConfig.baseUrl + '/group/listUserGroup.do',
    orgTree: appConfig.baseUrl + '/group/orgTree.do',
    saveGroupResource: appConfig.baseUrl + '/group/saveGroupResource.do',
    saveUserGroup: appConfig.baseUrl + '/group/saveUserGroup.do',
};

export default API