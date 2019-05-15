/**
 * @file 基于echarts4封装模块
 * @author 陈健豪
 * @param {Number} var
 * @param {String} var
 * @returns {String}
 */

import { deepClone } from '../vendor/utils/object';
import echarts from 'echarts';
export default class BddiaEcharts {
	constructor(globalConfigs) {
		//全局配置
		this.color = [
			"#2ec7c9",
			"#b6a2de",
			"#5ab1ef",
			"#ffb980",
			"#d87a80",
			"#8d98b3",
			"#e5cf0d",
			"#97b552",
			"#95706d",
			"#dc69aa",
			"#07a2a4",
			"#9a7fd1",
			"#588dd5",
			"#f5994e",
			"#c05050",
			"#59678c",
			"#c9ab00",
			"#7eb00a",
			"#6f5553",
			"#c14089"
		];
		this.globalConfigs = {
			theme: false,
			map: false,
			common: {
				title: {
					left: 'center'
				},
				legend: {
					bottom: 10
				}
			}
		};
		for (let key in globalConfigs) {
			if (key === 'finished') {
				this.finishCallBack = globalConfigs[key];
				continue;
			}
			if (key === 'common') {
				for (let key2 in globalConfigs.common) {
					if (!this.globalConfigs.common[key2] || Object.prototype.toString.call(globalConfigs[key2]) !== '[object Object]') {
						this.globalConfigs.common[key2] = globalConfigs.common[key2];
					} else {
						Object.assign(this.globalConfigs.common[key2], globalConfigs.common[key2]);
					}
				}
			} else {
				//默认配置中不存在或者在配置只有一层则直接采用外部的数值
				if (!this.globalConfigs[key] || Object.prototype.toString.call(globalConfigs[key]) !== '[object Object]') {
					this.globalConfigs[key] = globalConfigs[key];
				} else {
					Object.assign(this.globalConfigs[key], globalConfigs[key]);
				}
			}
		}
		this.echartsConfig = null;
		this.charts = {};
		this.theme = null;
		this.mapData = null;
		this.finished = false;
		this.total = 0;

	}

	createEcharts(chartId, config) {
		if (this.theme && !this.charts[chartId]) {
			this.charts[chartId] = echarts.init(document.getElementById(chartId), 'customTheme');
		} else {
			if (!this.charts[chartId]) {
				this.charts[chartId] = echarts.init(document.getElementById(chartId));
			}
		}
		this.charts[chartId].on('finished', () => {
			if (!this.finished && Object.keys(this.charts).length === this.total) {
				if (this.finishCallBack) {
					this.finishCallBack(this.charts);
				}
				if (this.instanceCallback) {
					this.instanceCallback(this.charts);
				}
				this.finished = true;
			}
		});
		let common = deepClone(this.globalConfigs.common);
		for (let key in common) {
			if (!config[key]) {
				config[key] = common[key];
			} else if (Object.prototype.toString.call(config[key]) === '[object Object]') {
				config[key] = Object.assign({}, common[key], config[key]);
			}
		}
		this.charts[chartId].setOption(config);
	}
    /**
     * 批量生成echarts的函数
     * @param {Object} config key是对应dom的ID，value是echarts的生成配置，详情请看createEcharts
     * @returns {No}
     */
	async load(config) {
		if (this.globalConfigs.theme && !this.theme) {
			await import(/* webpackChunkName: "theme" */`./echartsTheme/${this.globalConfigs.theme}.json`).then(theme => {
				this.theme = theme;
				echarts.registerTheme('customTheme', theme);
			});
		} else if (this.globalConfigs.theme === false) {
			this.globalConfigs.common.color = this.color;
		}
		if (this.globalConfigs.map && !this.map) {
			await import(/* webpackChunkName: "dongguan" */`./mapData/${this.globalConfigs.map}.json`).then(geoJson => {
				this.map = geoJson;
				echarts.registerMap(this.globalConfigs.map, geoJson);
			});
		}
		this.finished = false;
		let total = 0;
		for (let key in config) {
			if (this.charts[key]) {
				this.charts[key].clear();
			}
			this.createEcharts(key, config[key]);
			total++;
		}
		this.total = total;
		window.addEventListener('resize', () => {
			this.resize();
		}, false);
		return this;
	}

	clear() {
		for (let key in this.charts) {
			this.charts[key].clear();
		}
		return this;
	}


	getInstanceAfterFinish(callback) {
		this.instanceCallback = callback;
	}

	resize() {
		for (let key in this.charts) {
			this.charts[key].resize();
		}
		return this;
	}

	getColor(index) {
		return index ? this.color[index] : this.color;
	}

	getEchart() {
		return echarts;
	}

	dispose() {
		for (let key in this.charts) {
			this.charts[key].dispose();
		}
	}

};
