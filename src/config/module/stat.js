'use strict'

import { appConfig } from '../index.js';

const API = {
    goodsStat: appConfig.baseUrl + '/stat/goodsStat.do',
}

export default API