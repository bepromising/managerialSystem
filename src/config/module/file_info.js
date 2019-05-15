'use strict'

import { appConfig } from '../index.js';

const API = {
    batchUpload: appConfig.baseUrl + '/fileInfo/batchUpload.do', // 批量上传
    upload: appConfig.baseUrl + '/fileInfo/upload.do',
}

export default API