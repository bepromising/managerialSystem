import BddiaEcharts  from '../vendor/BddiaEcharts';
import {allAjax} from '../vendor/utils';
import {system} from '../config';
import {mapState} from 'vuex';
export default{
    data(){
        return {
            $echarts:null,
            /* //这个数据在使用此minxin的地方定义
            echartsConfig:{
                //初始状态加载的数据
                initCondition:{
                    chart1:true,
                    chart2:true,
                    map:true,
                    info2:true,
                    chart3:true,
                    info3:false,
                    chart4:true,
                    chart5:true
                },
                //所有ajax请求的定义
                ajaxList:{

                },
                theme:'overview',//传入则使用对应的主题
                map:'dongguan',//传入则使用对应的地图数据
                common:{},//传入则使用全局的echarts配置信息
                loading:true,//是否开启加载数据时使用loading效果
                delay:100, //延时加载echarts，防止容器未加载完成出错的可能性
                data:{},//如果存在此值则将echarts数据缓存至此变量
            }, */
            echartsRuntime:{
                available:{}
            }
        };
    },
    watch:{
        needResize() {
            window.setTimeout(() => {
                this.$echarts.resize();
            }, 800);
        }
    },
    computed:{
        ...mapState({
            needResize: state => state.system.menuState
        })
    },
    methods:{
        loadData(condition){
            condition=condition||this.echartsConfig.initCondition;
            let ajaxList=this.echartsConfig.ajaxList,
            needAjax=[],
            ajaxMap={};
            let count=0;
            if(Object.keys(this.echartsRuntime.available).length===0){
                let available={};
                for(let key in ajaxList){
                    available[key]=false;
                }
                this.$set(this.echartsRuntime,'available',available);
            }
            for(let key in condition){
                if(condition[key]){
                    ajaxMap[count++]=key;
                    needAjax.push(ajaxList[key]);
                }
            }
            if(this.echartsConfig.loading && needAjax.length > 0){
                this.$store.commit(system.mutation.switchLoading,{loading: true});
            }
            allAjax(needAjax,this.$http,{
                common:{
                    method:'post'
                }
            }).then(response=>{
                let chartData={};
                response.forEach((vo,index)=>{
                    let _index=ajaxMap[index];
                    if(vo.success && vo.result.page.list.length > 0){
                        this.echartsRuntime.available[_index]=true;
                        if(_index.indexOf('table') > -1){
                            chartData[_index]=vo.result;
                        }else if(_index.indexOf('info') > -1){
                            chartData[_index]=Array.isArray(vo.result.page.list)?vo.result.page.list[0]:vo.result.page.list;
                        }
                    }else{
                        this.echartsRuntime.available[_index]=false;
                        if(_index.indexOf('table') > -1){
                            chartData[_index]=null;
                        }else if(_index.indexOf('info') > -1){
                            chartData[_index]=null;
                        }
                    }
                });
                if(this.echartsConfig.data){
                    this.echartsConfig.data=chartData;
                }
                let delay=this.echartsConfig.delay && this.echartsConfig.delay > 0 ? this.echartsConfig.delay :100;
                window.setTimeout(()=>{
                    this.loadComponents(chartData);
                    this.$store.commit(system.mutation.switchLoading,{loading: false});
                },delay);
            });
        }
    },
    created(){
        let echartsConfig={};
        ['theme','map','common','finished'].forEach(vo=>{
            if(this.echartsConfig[vo]){
                echartsConfig[vo]=this.echartsConfig[vo];
            }
        });
        this.$echarts=new BddiaEcharts(echartsConfig);
    },
}