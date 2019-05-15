import coordtransform from 'coordtransform';
let loadedScripts = [];
const importBaiduMap = async function (config, callback) {
    await new Promise((resolve, reject) => {
        if (loadedScripts.includes('baiduMap')) {
            resolve();
        } else {
            window.BMap_loadScriptTime = new Date().getTime();
            let script = document.createElement('script');
            script.src =
                'http://api.map.baidu.com/getscript?v=2.0&ak=1b216a2956131233230294d4c8328d6c&t=' +
                window.BMap_loadScriptTime + new Date().getTime();
            window.BMap_loadScriptTime;
            document.body.appendChild(script);
            script.onload = function () {
                loadedScripts.push('baiduMap');
                resolve(window.BMap);
            };
        }
    });
    if (config.hotMap) {
        let hotScript =
            'http://api.map.baidu.com/library/Heatmap/2.0/src/Heatmap.js';
        if (!loadedScripts.includes(hotScript)) {
            await new Promise((resolve, reject) => {
                let script = document.createElement('script');
                script.src = hotScript;
                document.body.appendChild(script);
                script.onload = function (event) {
                    loadedScripts.push(event.target.src);
                    resolve();
                };
            });
        }
    }
    let dgMapData = null;
    if (config.dgMapData) {
        await import('./mapData/dongguanForBaiduMap.json').then(json => {
            dgMapData = json;
        });
    }
    if (callback) {
        callback(dgMapData);
    }
    // 百度地图API功能
};

//百度地图坐标系转西安80坐标系
const bd09ToWgs84 = function (coord) {
    if (Array.isArray(coord) && typeof coord[0] === 'object') {
        return coord.map(vo => {
            let temp = [];
            if (Array.isArray(vo)) {
                temp.coordtransform.bd09togcj02(...vo);
            } else {
                temp = coordtransform.bd09togcj02(coord.lng, coord.lat);
            }
            return coordtransform.gcj02towgs84(...temp);
        });
    } else {
        if (Object.prototype.toString.call(coord) == '[object Object]') {
            let temp = coordtransform.bd09togcj02(coord.lng, coord.lat);
            return coordtransform.gcj02towgs84(...temp);
        } else {
            let temp = coordtransform.bd09togcj02(...coord);
            return coordtransform.gcj02towgs84(...temp);
        }
    }
};
//西安80转百度地图坐标系
const wgs84ToBd09 = function (coord) {
    if (Array.isArray(coord) && typeof coord[0] === 'object') {
        return coord.map(vo => {
            let temp = [];
            if (Array.isArray(vo)) {
                temp.coordtransform.wgs84togcj02(...vo);
            } else {
                temp = coordtransform.wgs84togcj02(coord.lng, coord.lat);
            }
            return coordtransform.gcj02tobd09(...temp);
        });
    } else {
        if (Object.prototype.toString.call(coord) == '[object Object]') {
            let temp = coordtransform.wgs84togcj02(coord.lng, coord.lat);
            return coordtransform.gcj02tobd09(...temp);
        } else {
            let temp = coordtransform.wgs84togcj02(...coord);
            return coordtransform.gcj02tobd09(...temp);
        }
    }
};
export {
    importBaiduMap,
    bd09ToWgs84,
    wgs84ToBd09
};