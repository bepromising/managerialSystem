<template>
    <div class="container">
        <div class="flex-row frist-row">
            <section class="box chart">
                <h3>日报-图表</h3>
                <div class="tubiao" id="chart1"></div>
            </section>
            <section class="box list">
                <h3>
                    日报-列表
                    <DatePicker v-model="condition.day_time" type="date" placeholder="选择日期" @on-change="changeTable1Time" style="width: 200px;position: absolute;right: 10px;top: o;"></DatePicker>
                </h3>
                <Table stripe :columns="table1.columns" border :data="table1.data" :loading="table1.loading" style="height: 440px;"></Table>
            </section>
        </div>
        <div class="flex-row frist-row">
            <section class="box chart">
                <h3>月报-图表
                </h3>
                <div class="tubiao" id="chart2"></div>
            </section>
            <section class="box list">
                <h3>月报-列表
                    <DatePicker v-model="condition.month_time" type="month" placeholder="选择日期" @on-change="changeTable2Time" style="width: 200px;position: absolute;right: 10px;top: o;"></DatePicker>
                </h3>
                <Table stripe :columns="table2.columns" border :data="table2.data" :loading="table2.loading" style="height: 440px;"></Table>
            </section>
        </div>
    </div>
</template>

<script>
    import { allAjax } from '../vendor/utils/index';
    import Stat from '../config/module/stat.js';
    // import {format} from '../vendor/utils/time.js';
    import echarts from 'echarts';

    export default {
        name: 'analysis',
        data () {
            return {
                condition: {
                    day_time: null,
                    month_time: null
                },
                chart1: null,
                table1: {
                    columns: [
                        {title: '商品名', key: 'goodsName', align: 'center'},
                        {title: '销量', key: 'saleCount', align: 'center'},
                        {title: '销售总额', key: 'saleAmount', align: 'center'},
                    ],
                    data: [],
                    size: 10,
                    current: 1,
                    total: 0,
                    loading:false
                },
                table2: {
                    columns: [
                        {title: '商品名', key: 'goodsName', align: 'center'},
                        {title: '销量', key: 'saleCount', align: 'center'},
                        {title: '销售总额', key: 'saleAmount', align: 'center'},
                    ],
                    data: [],
                    size: 10,
                    current: 1,
                    total: 0,
                    loading:false
                },
            }
        },
        methods: {
            changeTable1Time (value) {
                this.condition.day_time = value;
                this.searchDay(value, value);
            },
            changeTable2Time (value) {
                this.condition.month_time = value;
                let arr = value.split('-'), year = arr[0];
                let isRunNian = !(year % 100) ? ( !(year % 400) ? true : false ) : ( !(year % 4) ? true : false ); // 判断是否为闰年

                let finalDate_list = { 
                    '01': 31,
                    '02': isRunNian ? 29 : 28,
                    '03': 31,
                    '04': 30,
                    '05': 31,
                    '06': 30,
                    '07': 31,
                    '08': 31,
                    '09': 30,
                    '10': 31,
                    '11': 30,
                    '12': 31
                };

                let endDate = `${arr[0]}-${arr[1]}-${finalDate_list[arr[1]]}`,
                    startDate = `${arr[0]}-${arr[1]}-01`;
                

                this.searchMonth(startDate, endDate);
            },
            searchDay (startDate = null, endDate = null) {
                this.$http({
                    url: Stat.goodsStat,
                    method: 'POST',
                    data: {
                        endDate: endDate,
                        startDate: startDate,
                        paginationFlag: false
                    }
                }).then( ({data}) => {
                    if (data.success) {
                        Object.assign(this.table1, {
                            data: data.result.list,
                            total: data.result.total
                        });

                        let config = {
                            chart1: data.result.list
                        };
                        
                        this.changeEcharts(config)
                    } else {
                        this.$Modal.error({
                            title: '系统提示',
                            content: data.error.message
                        });
                    }
                }, (error) => {
                    this.$Message.error('请求失败，请稍候重试！');
                })
            },
            searchMonth (startDate = null, endDate = null) {
                this.$http({
                    url: Stat.goodsStat,
                    method: 'POST',
                    data: {
                        endDate: endDate,
                        startDate: startDate,
                        paginationFlag: false
                    }
                }).then( ({data}) => {
                    if (data.success) {
                        Object.assign(this.table2, {
                            data: data.result.list,
                            total: data.result.total
                        });
                        
                        let config = {
                            chart2: data.result.list
                        };
                        
                        this.changeEcharts(config)
                    } else {
                        this.$Modal.error({
                            title: '系统提示',
                            content: data.error.message
                        });
                    }
                }, (error) => {
                    this.$Message.error('请求失败，请稍候重试！');
                })
            },
            changeEcharts (data) {
                let config = {};

                if (data.chart1) {
                    if (this.chart1) this.chart1.clear();

                    let seriesData = [];

                    for(let i = 0; i < data.chart1.length; i++) {
                        seriesData.push({name: data.chart1[i].goodsName, value: data.chart1[i].saleCount})
                    }

                    config.chart1 = {
                        tooltip : {
                            trigger: 'item',
                            formatter: "{b} : {c}人 ({d}%)"
                        },
                        series: [{
                            type:'pie',
                            radius : '60%',
                            center: ['50%', '50%'],
                            data: seriesData
                        }]
                    }
                    if (!this.chart1) {
                        this.chart1 = echarts.init(document.getElementById('chart1'));
                    }
				    this.chart1.setOption(config.chart1)
                }

                if (data.chart2) {
                    let arr = [];

                    if (this.chart2) this.chart2.clear();

                    for(let i = 0; i < data.chart2.length; i++) {
                        arr.push({name: data.chart2[i].goodsName, value: data.chart2[i].saleAmount})
                    }

                    config.chart2 = {
                        tooltip : {
                            trigger: 'item',
                            formatter: "{b} : {c}人 ({d}%)"
                        },
                        series: [{
                            type:'pie',
                            radius : '60%',
                            center: ['50%', '50%'],
                            data: arr
                        }]
                    }

                    if (!this.chart2) this.chart2 = echarts.init(document.getElementById('chart2'));
				    this.chart2.setOption(config.chart2)
                }
            }
        },
        mounted () {
            let time = new Date(),
                year = time.getFullYear(),
                month = time.getMonth() + 1,
                date = time.getDate(),
                data = `${year}-${month}-${date}`;

            this.changeTable1Time(data);
            this.changeTable2Time(`${year}-${month}`);
        }
    }
</script>


<style lang="less" scoped>
    .box { box-sizing: border-box;padding: 10px;border-radius: 12px;box-shadow: 0 0 4px #ccc;margin-top: 20px;};
    .container {
        width: 100%; background: #f2f2f2;padding: 0 10px 60px 10px;
        .frist-row { justify-content: space-around; }
        .chart { width: 44%; height: 500px; background-color: #fff;}
        .list { width: 54%; height: 500px; background-color: #fff; }
        h3 {text-align: center; font-size: 16px;padding-bottom: 20px;position: relative; }
        .tubiao {height: 418px;}
    }
</style>

