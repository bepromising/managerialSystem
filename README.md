## 前言
> 项目底层维护由陈健豪负责，不再引入jquery之类的第三方库，如果需要引入第三方的库和组件需要先跟陈健豪讨论，避免影响整个工程的性能。例如想使用简单的日期格式化的功能引入一个moment，moment中其实好多功能是我们用不上的，vendor/helper.js已经将一些常用的功能封装到里面。  

此前端工程经过一些真实项目的检验，为了能做得更加通用，现将针对具体场景的逻辑提取，分别是：src/main.js、src/store/modules/system.js、src/views/Layout.vue，此项目的设计之初满足了目前所遇到的场景分别是：            
1.token:使用token进行前后端完全分离，登录状态的维护在前端       
2.sesssion:几乎前后端完全分离，但登录状态使用后端session的形式       
3.demo:用于原型开发，完全不需要判断         
将三种情况对应的存在差异的逻辑分别对应src/mode下的token.js、session.js、demo.js，根据实际情况修改对应文件的逻辑代码即可。           

采用此前端工程之前首先明确应用场景，针对上述的三种场景的修改方式如下：  
1.token：对src/main.js、src/store/modules/system.js、src/views/Layout.vue中引入mode部分改成token，也就是import xxx from 'xx/mode/token'。           
2.session：main.js、src/store/modules/system.js、src/views/Layout.vue中引入mode部分改成session，也就是import xxx from 'xx/mode/session'，并将session.js中的getAuthMenus并确保返回的数据只有一层的菜单数组，具体可以参考public/static/data/authMenu.json。由于采用了session的方式，跟前后端完全分离的开发方式显然是冲突的，可采用如下方式进行调试：      
- 2.1新建一个index.html，放在本地或者服务器上，代码如下：               

```html 
<!DOCTYPE html>
<html>

<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=no">
	<meta name="renderer" content="webkit">
	<link rel="icon" href="/favicon.ico">
	<title>sh-admin</title>
<link as="script" href="http://location:3000/static/js/app.js" rel="preload"></head>

<body>
	<noscript>
		<strong>We're sorry but sh-admin doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
	</noscript>
	<div id="app" style="height:100%;">
		<router-view></router-view>
	</div>
<script type="text/javascript" src="http://location:3000/static/js/app.js"></script></body>

</html>
```             
- 2.2 npm start启动本地开发环境     
- 2.3 访问服务器页面，代码的热更新可能不起效，需手动刷新页面                    

3.demo:main.js、src/store/modules/system.js、src/views/Layout.vue中引入mode部分改成demo，也就是import xxx from 'xx/mode/demo'，菜单数据自行到public/static/data/authMenu.json中修改。

## git workflow         
鉴于我们采用前后端分离开发的形式。一个项目往往会产生两套工程，后续建立git项目时，可使用在同一个项目中建立前端和后端两个工程，分别使用frontend和backend两个文件夹，这样方便管理者看到我们的项目是一个整体，但是会产生前后端项目代码提交产生干预，基于上述的问题，需要实现的功能是：        
1.管理者看到项目是一个整体并且能区分前后端工程，并且能用版本的形式看到项目的推进。        
2.前后端开发过程互相隔离，互相看不到对方的代码提交信息，免去了过滤提交信息的麻烦。              
3.确保大多数人使用1或2个分支进行开发，降低分支对开发的影响。                
基于上述的需求，对git workflow提出了修改，具体实现细节如下：            

- git的项目由管理员创建，初始状态下，需建立2个文件（frontend、backend），5个分支(master、frontend、backend、frontend-dev、backend-dev)      
- 开发人员clone项目之后需切换至对应的-dev分支(前端切换到frontend-dev，后端切换至backend-dev)        
- 根据实际情况再自行讨论是否再开分支        
- 对于大多数人来说，只会涉及到1或2个分支                

下面对每个分支的功能进行说明：          
1.master(protected)作为一个稳定版本（大版本）的发布分支，只有程碑的阶段才能合并到master，而且只允许项目管理员进行合并操作。         
2.frontend/backend(protected)，下简称production分支，从master中创建，作为稳定版本的发布分支，供最终用户使用的版本发布分支，如果在production分支中发现需要紧急修复的问题，则在production下创建一个hotfix的分支，修复完需删除，若不紧急则在-dev中修复等待下次版本发布才合并, production目前也只允许管理员才能进行合并操作，其他人可以通过merge request请求合并，待管理员审核后才能合并。          
3.frontend-dev/backend-dev（下简称dev分支），从对应的production中创建，作为常规版本的发布分支，供内部测试的版本发布分支，只有在某些功能完善后才能合并，只有在需要有常规版本发布时候才能合并，所有项目成员都能进行合并操作。         
4.功能分支（所有的功能分支都是并行的，从develop中创建并且只跟develop交互），功能分支原则上不做限制，根据实际的项目采用不同的功能分支建立方案，目前想到的两种方式比较可行：      
A.每位成员自建一个新的分支，每位成员各自在自己的分支中开发。期间如果B需要调用A的功能或代码，A先在develop中合并自己的分支，然后B再从develop中pull A提交的代码。      
B.就一个短期的开发目标建立一个临时的分支，所有的成员在此分支中开发，当开发任务完成后，再将临时分支并入develop分支，然后删除临时分支。                  


PS：master、frontend、backend是不允许直接提交代码的，如果不小心在这3个分支中修改了代码并执行了commit操作，可使用以下操作，撤销本地的提交：
git reset --soft <提交前的版本hash值，需在git.dgbigdata.com中自行查找>，自己保存自己的代码后，使用git revert还原，再切换分支，将刚保存的代码并入，再正常提交代码即可。          

关于git工作的涉及到的操作可参考[《Git基本命令和GitFlow工作流》](https://www.cnblogs.com/myqianlan/p/4195994.html)           


对于多工程项目下，frontend和backend不好区分的问题，ide是有相应的解决方案的：        
1.idea：选中相应的工程，按下shift+f6可增加项目的别名最终显示backend[your alias]       
2.vscode：需保存当前的工作区，然后修改工作区.code-workspace文件配置                 

```json 
{
	"folders": [
		{
            "name":"text-analysis",//手动增加name，项目名会使用name展示
			"path": "frontend"
		}
	]
	"settings": {}
}
```



## 项目架构        
> 1.底层基于vue-cli3开发。        
> 2.所采用的技术：vue2 + vue-router3 + vuex3 + echart4 + axios + iview + scss + 百度地图      

## 开发环境        
node.js + vscode + chrome/firefox/IE11 + git + postman + FileZilla Client

## 可用命令        
> npm start ：运行开发环境，并在浏览器中打开首页  
> npm dev/serve：运行开发环境  
> npm build ：打包项目  
> npm test:uint ： 单元测试  
> npm test:e2e： 端对端测试  

## node.js版本       
node.js版本一般不要用最新的版本，使用recommended for most users的版本    

## npm install过程中卡住或者报错：             
大概是因为chromedriver装不上（需翻墙），解决方法配置npm或yarn的chromedriver源           
- 设置npm config set chromedriver_cdnurl=http://cdn.npm.taobao.org/dist/chromedriver      
- 设置yarn config set "chromedriver_cdnurl" "https://npm.taobao.org/mirrors/chromedriver          

## 打包路径替换问题         
此版本已经正确处理路径，打包后无需再重新手动替换路径，前提是正确配置.env.development和.env.production，只需配置VUE_APP_URL，服务器如果放在请求服务器的根目录设置成“/”即可，此版本static目录改成public，也是跟原来版本一样直接复制替换的，为了保证打包后文件的有序放置，需在public目录下建一个static的文件夹     
         

## 关键交互元素需指定ID(确保同一个view中ID的唯一性)      
为了满足自动化测试的需求，对按钮、输入框、table、echart容器等指定ID，方便编写自动化测试脚本人员进行脚本编写，以下指定几个关键的命名供参考：
- 搜索按钮 search，如果有多个按钮则使用searchXxxx（不容易命名可以使用数字）的方式来区分
- 导出按钮 export，如果有多个按钮则使用exportXxxx（不容易命名可以使用数字）的方式来区分        
- 表格展示区域 table，如果有多个则使用tableXxxx（不容易命名可以使用数字）的方式来区分      
- echarts容器 chart1、chart2数字的方式进行区分      
- input和select组件均使用v-model相同的字段，如果不会重复直接使用字段名则可，如v-model="search.name" id设置name则可，如果重复的话则使用search-name               

## 系统管理     
目前系统管理没整合进来，系统管理需要跟后端配合和确定使用哪一版的系统管理比较合适            

## echarts  
### 1.基于echarts4的封装             
vendor/BddiaEcharts.js基于echarts4的封装，下面所述的所有代码模板均使用此组件，具体使用方法是：        
```javascript
import BddiaEcharts from '../src/vendor/BddiaEcharts';
export default{
    created(){
        this.$echart=new BddiaEcharts({
            theme:'overview',//是否使用主题，true会动态vendor/echartsTheme.json，默认是false
            map:'dongguan',//是否加载vendor/mapData/xxxx.json，目前只有dongguan.json这个数据，dongguanForBaiMap.json是经过转换供百度地图使用        
            common:{//设置全局的配置，配置项跟echarts官网的一致，无转换过程

            },
            finished:function(charts){
                //完成渲染执行的回调，charts是所有echarts实例
            }
        });
    },
    mounted(){
        //以下只是展示当前实例所具备的方法：            
        this.$echart.load({
            //chart1是dom的id，chart1Config是原生的echarts配置信息
            chart1:chart1Config
        });
        //完成渲染执行的回调，charts是所有echarts实例
        this.$echart.getInstanceAfterFinish(function(charts){

        });
        //批量调用clear()，具体参考echarts的实例方法clear()
        this.$echart.clear();
        //批量调用resize()，一般不需要主动调用，已经绑定在window.onresize
        this.$echart.resize();
        //获取echarts的变量，方便调用echarts原生的方法
        this.$echart.getEchart();

    }
}
```         
### 2.多个echarts同时展示的页面最好使用以下代码模板，此模板需每个调用的文件都需要复制相同的代码修改    
```html         
<template>
    <div style="position:relative;">
        <div id="chart1" v-show="available.chart1"></div>
        <div class="noData" class="!available.chart1"></div>
    </div>
</template>
```  
```javascript
import { mapState } from 'vuex';        
import BddiaEcharts from '../../vendor/BddiaEcharts';
export default {
    data(){
        return {
            $echarts:null,
            available:{}
        }
    },
    created(){
        this.$echart=new BddiaEcharts();
    },
    computed: {
        ...mapState({
            needResize: state => state.system.menuState
        })
    },
    watch: {
        needResize() {
            window.setTimeout(() => {
                this.$echart.resize();
            }, 800);
        }
    },
    mounted(){
        this.loadData();
    }
    methods:{
        loadData(condition){
            condition = condition || {
                chart1: true,
                table1:true
            };
            let ajaxList={
                chart1:{
                    url:IAnalysis.API.securityExpertType,
                    data:{}
                },
                table1:{
                    url:IAnalysis.API.securityExpertDetail,
                    data:{}
                }
            },
            needAjax = [],
            ajaxMap = {};
            let count = 0;
            if(Object.keys(this.available).length===0){
                let available={};
                for(let key in ajaxList){
                    available[key]=false;
                }
                this.$set(this,'available',available);
            }
            for(let key in condition){
                if(condition[key]){
                    ajaxMap[count++]=key;
                    needAjax.push(ajaxList[key]);
                }
            }
            allAjax(needAjax,this.$http,{
                common:{
                    method:'post'
                }
            }).then(response=>{
                let chartData={};
                response.forEach((vo,index)=>{
                    let _index=ajaxMap[index];
                    if(vo.success&&vo.result.page.list.length > 0){
                        this.available[_index]=true;
                        let list=vo.result.page.list;
                        if(_index.indexOf('table')===-1){
                            chartData[_index]=list;
                        }else{
                            //key包含table字符串的，会将分页信息也写入到chartData中
                            chartData[_index]=vo.result.page;
                        }
                    }else{
                        this.available[_index]=false;
                    }
                });
                this.loadCharts(chartData);
            });
        },
        loadCharts(data){
            let chartConfig={};
            if(data.chart1){
                chartConfig.chart1={
                    
                };
            }
            if(data.table1){
                Object.assign(this.table,{
                    data:data.table1.list,
                    total:data.table1.total
                });
            }
            this.$echart.load(chartConfig);
        }
    }
}
```
上述代码如果有部分数据需要更新只需调用this.loadData({chart1:true})即可，可以根据不同的传参实现部分更新      
### 3.基于上述代码重新封装成mixin，实现部分代码统一封装在mixin，调用相应的组件只需引用少量代码   
在具体的echarts容器因为需要展示没数据的状态，具体的html代码参考     

```html         
<template>
    <div style="position:relative;">
        <div id="chart1" v-show="echartsRuntime.available.chart1"></div>
        <div class="noData" class="!echartsRuntime.available.chart1"></div>
    </div>
</template>
```  

系统中有众多的echarts展示，每个页面中都有重复的代码，现将能分离逻辑分离到mixin/echartsFn.js中。        
具体使用方法：          
```javascript 
import echartsFn from '../../mixin/echartsFn'; 
export default{
    data(){
        return {
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
                //需要单独设置数据状态时，需使用此变量，如切换时间后只需更新chart1的数据，则将this.currentCondition={chart1:true}
                currentCondition:null,
                //所有ajax请求的定义(注意key与initCondition、currentCondition的对应关系),涉及到this的赋值需，在created中进行配置
                ajaxList:{

                },
                theme:'overview',//可选，传入则使用对应的主题
                map:'dongguan',//可选，传入则使用对应的地图数据
                common:{},//可选，传入则使用全局的echarts配置信息
                loading:true,//可选，是否开启加载数据时使用loading效果
                delay:100, //可选，延时加载echarts，防止容器未加载完成出错的可能性
                data:{},//可选，如果存在此值则将echarts数据缓存至此变量
            }
        }
    },
    mixin:[echartsFn],
    methods:{
        //此方法必须定义一样的名字，因为echartsFn中loadData会调用此方法，此方法根据具体的业务编写
        loadComponents(data){
            let chartConfig={};
            if(data.chart1){
                chartConfig.chart1={
                    ...
                }
            }
            if(data.chart2){
                chartConfig.chart2={
                    ...
                }
            }
            if(data.table){
                //跟echarts无关的table数据请另外处理
            }
            //this.$echarts在minxin中定义
            this.$echarts.load(chartConfig);
        }
    },
    created(){
        //值得注意的是data需使用this的数据，必须完整传入对象，如果使用data:{year:this.search.year}，当year数据更新，此data的数据无法更新，应完整传入整个对象
        this.echartsConfig.ajaxList={
            chart1:{
                url:overview.API.licenseHazards,
                data:this.search
            },
            chart2:{
                url:overview.API.licenseByMonth,
                data:this.search
            },
            map:{
                url:overview.API.licenseByMap,
                data:this.search
            },
            info2:{
                url:overview.API.licenseCount,
                data:this.search
            },
            chart3:{
                url:overview.API.licenseByAvgTime,
                data:this.search
            },
            chart4:{
                url:overview.API.licenseRiskpoint,
                data:this.search
            },
            chart5:{
                url:overview.API.indexLicense,
                data:this.search
            }
        };
    },
    mounted(){
        //此方法来自mixin/echartsFn.js，需要更新具体的哪个数据，传入{chart1:true}即可，不传入则按this.echartsConfig.initCondition的条件来更新，其他需要更新数据的地方同样可以调用此函数
        this.loadData();
    }
}      
``` 
echarts东莞地图的使用可以参考http://echarts.baidu.com/examples/editor.html?c=map-HK         

## ajax URL配置
系统中所有的ajax请求地址都按模块放在src/config/module/xxxx.js中。这样做为了方便维护请求地址和团队开发的过程中其他成员都能通过ide的代码提示功能清楚知道系统中所有的请求地址。   
通过设置环境变量的VUE_APP_URL设置对应的环境的请求的baseUrl      
.env.production对应打包后           
.evn.develop对应开发            

```javascript
const API{
   getUser: 'user/getUser'
};
export{
    API
};
```
需要请求接口的组件使用 import {module} from '../config.js'，请求使用以下方式调用：     
```javascript
http({
    url:module.API.getUser
});
```     
所有请求如未跟后端协商均使用post请求        
如果需要向后端传入JSON字符数据的情况，需设置axios中headers的Content-Type具体代码是：
```javascript
headers: {
    post:{
        'Content-Type': 'application/json'
    }
}
```    
Content-Type必须是大小写一致，虽然也是支持直接在headers中传入Content-Type，但是建议统一使用axios的方式，在method（通常是post）下进行配置。            
需要需要使用axios请求工程内的json数据（存放在static/data中），需要使用绝对路径，可以使用appConfig.staticData作为json数据的绝对路径前缀，但值得注意的是如果打包之后存放的地方不是根目录的话，需修改appConfig.staticData。
vendor/helper.js封装了一个allAjax的方法，简化了并发ajax请求的操作。             

## curd     
基于B包的业务逻辑，将curd逻辑封装成mixin/curd，引用相应的mixin即可          
具体使用代码如下：      
```html     
<template>
    <section>
        <ul class="filter">
            <li>
                <i>项目名称</i>
                <Input v-model="condition.project_name" placeholder="请输入项目名称" class="fill"></Input>
            </li>
            <li>
                <Button type="primary" shape="circle" icon="ios-search" @click="search"></Button>
                <Button type="info" style="margin-left:5px;" shape="circle" icon="md-add" @click="add({status:1})"></Button>
            </li>
        </ul>
        <Table stripe :columns="table.columns" :data="table.data" :loading="table.loading"></Table>
        <Page class="page-wrap" :total="table.total" :current="table.current" :page-size="table.size" @on-change="changePage" show-total></Page>
        <Modal v-model="formModal.show" width="800" :title="formModal.title" closable @on-ok="save">
            <Form ref="formModal" :model="formModal.fields" :label-width="120" style="width:94%" :rules="formModal.validate">
                <FormItem label="项目名称" prop="project_name">
                    <Input v-model="formModal.fields.project_name"></Input>
                </FormItem>
                <FormItem label="状态" prop="status">
                    <RadioGroup v-model="formModal.fields.status">
                        <Radio v-for="vo in statusMap" :label="vo.value" :key="vo.value">{{vo.label}}</Radio>
                    </RadioGroup>
                </FormItem>
            </Form>
        </Modal>
    </section>
</template>
<script>
import { autoTest } from '../../config';
import { allAjax } from '../../vendor/utils';
import curd from '../../mixin/curd';
import { Button, Icon } from 'iview';
export default {
    name: 'Projects',
    mixins: [curd],
    data() {
        return {
            condition: {
                project_name: null
            },
            curd: {
                searchUrl: autoTest.API.projects,
                readUrl: autoTest.API.project,
                createUrl: autoTest.API.createProject,
                deleteUrl: autoTest.API.deleteProject,
                updateUrl: autoTest.API.updateProject
            },
            table: {
                columns: [
                    { type: 'index', title: '序号', width: 80, align: 'center' },
                    { title: '项目名称', key: 'project_name' },
                    {
                        title: '状态',
                        key: 'status',
                        align: 'center',
                        width: 150,
                        render: (h, { row }) => {
                            let status = autoTest.MAP.status.find(vo => vo.value === row.status);
                            return (
                                <span>{status.label}</span>
                            );
                        }
                    },
                    {
                        type: 'action',
                        title: '操作',
                        align: 'center',
                        width: 300,
                        render: (h, { row }) => {
                            let isCurrent = row.project_id === this.currentProId;
                            return (<div>
                                <Button type="primary" size="small" shape="circle" icon="md-create" onClick={() => {
                                    this.edit(row, 'project_id');
                                }}></Button>
                                <Button style="margin:0 8px;" size="small" shape="circle" type="error" icon="md-close" onClick={() => {
                                    this.delete(row, 'project_id');
                                }}></Button>
                                <Icon type={isCurrent ? 'md-checkmark-circle' : 'ios-checkmark-circle-outline'} size="28" class="projectCheck" nativeOnClick={() => {
                                    this.switchProject(row.project_id);
                                }} />
                            </div>);
                        }
                    }
                ]
            },
            formModal: {
                validate: {
                    project_name:[
                        {required:true,trigger:'blur'}
                    ]
                },
                fields: {
                    project_name: null,
                    status: 1
                }
            }
        }
    },
    methods: {
        
    },
    created() {
        this.search();
    }
}
</script>
```          


## 地图     
### 百度地图
百度地图没有封装，只是封装了引入百度地图和引入东莞地图数据，具体使用方式如下：
```javascript
import {importBaiduMap} from '../vendor/helper';
importBaiduMap({
    //可选，如果为true则加载热力图组件
    hotMap?:boolean,
    //可选，如果为true则加载vendor/mapData/dongguanForBaiduMap.json
    dgMapData?:boolean
},callback);      
```

### 国土地图
考虑到国土地图不常用，项目不需要使用的话，可直接删除plugins/GeoMap整个文件夹，目前未整合到源文件中，需要用参考如下方法：        
- 1.将plugins/GeoMap/GeoGlobe文件夹复制至public/static/plugins/GeoGlobe         
- 2.将plugins/GeoMap/GeoMap.js复制至src/vendor/GeoMap.js下          
- 3.具体使用代码如下：                  

```javascript                    
import GeoMap from '../vendors/GeoMap';         
new GeoMap({
    mapId:'map',
    zoom:13,
    point:[113.56806983484715, 22.954889475359675]
},{}).load(function(){
     _this.$map=this;
     _this.loadIndexData('showMapChemical');
 });
```



## 开发规范
- 可复用的组件放在component中，页面组件（不可复用的）放在views中   
css均使用scss，尽量使用主色,vue-cli3已经实现了全局注入配置文件，所以无需再重复引入_setting.scss，对scss不熟悉，可以按原生的css编写方式，但是使用主色的时候请用变量，相近的颜色可以调用darken，lighten等这些颜色参数来生成。主要方便主色调需要修改的情况下，修改_setting.scss一个变量就可以达到所有都变化的效果。

- 单页应用，随着页面切换就相当于不断动态加载代码的过程，有以下值得注意事项：  
1.组件内样式，最好都使用scoped，不然容易跟其他定义相同名字的组件互相冲突，差生不可预期的效果。  
2.事件处理应尽量使用vue的方式绑定事件。如一定要使用dom原生的事件处理和组件如echarts的事件，需在destroy的生命周期中对事进行解绑，以免出现事件叠加的情况。  
3.vuex只适用在不刷新的情况，刷新之后vuex数据会被清空。              
4.window.sessionStorage不支持夸标签的，如果需要新开标签请使用带token的链接进行身份验证       

- 需要使用window.sessionStorage的情况下，请使用helper/session这个封装方法，session(key,value,serialize)，第三个参数serialize这个参数一般无需传入，一般使用JSON来做序列化，简单说明一下使用方法：       
session(key):获取指定key值的session，并调用JSON.parse将存入session中的json string解析 
session(key,value)：将value数值使用JSON.stringify解析成字符串后，使用key值存入session中         
- sessionStorage是单标签的，如果需要在新开的页面中保持sessionStorage请使用vendor/helper.js/newTab新开标签       

## static or assets         
两个文件夹均可以存放图片，区别在于static只是简单的复制，而assets则是通过webpack处理。基本可以使用以下准则来区分该存放在哪个文件夹：如果图片较少（10K以下）应放在assets文件夹下，大文件则放在static。项目中尽量使用iview中的字体图标，如果需要使用外部的图片作为图标，先到http://www.iconfont.cn/下载svg格式的图标。

## jsx    
table组件或者其他需要使用render函数的场景中，应使用jsx来提高代码可读性，此系统已经可以支持jsx，具体的使用请参考：https://github.com/vuejs/babel-plugin-transform-vue-jsx#usage      
提供一个例子，值得注意的是jsx中使用的iview组件需要单独                  
```javascript 
import {} from 'iview';
```      

这样引入
```javascript   
render:(h, params) => {
    let style = { marginRight: '5px' },
    deleteStyle =parseInt(params.row.state) === 0 ? style : { ...style, display: 'none' },
    { row } = params;
    return (
        <div>
            <Button type='primary' size='small' style={style} onClick={() => {
                this.updateUser(row);
            }}>更改信息/状态</Button>
            <Button type='success' size='small' style={style} onClick={() => {
                this.setRole(row);
            }}>设置角色</Button>
            <Button type='warning' size='small' style={style} onClick={() => {
                this.changePassword(row);
            }}>修改密码</Button>
            <Button type='error' size='small' style={deleteStyle} onClick={() => {
                this.delete(row);
            }}>删除</Button>
        </div>
    );
```

## 文件上传和下载          
上传组件由于需要兼容IE9，不采用iview的上传组件，采用此组件https://github.com/lian-yue/vue-upload-component           
涉及到导出文件的接口，可以直接调用src/vendor/helper中的downloadFileByForm          

```javascript
//url是接口地址  options.data是接口所需的参数
downloadFileByForm(url,{
    method:'post',//默认是post，所以在非post请求才需要传入method
    data:{}
});
```

## tree组件   
早在此项目开展之初iview和element-ui两个的tree组件都相当难用，而且也不支持自定义菜单图标，所以此项目基于iview的tree组件做了一些功能扩展。      
1.数据的简化，只需一层数据即可，注意数据中需要用有id,name,parentId这三个字段，不存在上级的情况下parentId需为null（主要是跟后端对接的时候会使用），icon是新增的字段，值为字符串具体的值是iview的图标名称，isFolder是定义此节点是文件夹还是子节点， 1为文件夹 0为子节点     
2.右键菜单功能，传入editable即可开启右键编辑菜单功能，右键菜单中有如下回调，所有的回调的参数都是当前节点数据：    
2.1 on-add-node：当增加文件夹/子节点时触发   
2.2 on-edit-node：当编辑节点时触发   
2.3 on-remove-node：当删除节点并且点击确认时触发   

3.移动节点，传入moveable即可开启，移动节点会触发on-move-node事件，函数的参数是父子关系已修正的被移动节点。        
具体的实现可以看系统管理/菜单管理模块，此模块使用了上述所有的功能       
4.firstParent初始解析的层次，默认'0'。
5.expandWhenParent，为true时，当点击节点是父节点，则展开当前节点。

```html
//展示树组件所有的自定义的API，iview具备的不展示           
<Tree 
editable        
moveable        
expandWhenParent        
firstParent="1"
@on-add-node="fn"            
@on-edit-node="fn"      
@on-remove-node="fn"        
></Tree>
```



## 路由定义     
路由的定义规则如下：      
已经实现根据权限动态加载路由的功能，在layout中的嵌套文件无需定义路由，但是仍需按一定的规则定义：     
1.文件路径：文件路径采用moduleName/viewName的形式定义，view文件命名方式采用驼峰式命名     
2.路由的路径需在菜单管理中定义，定义的规则是/moduleName/viewName     


## vue 的data数据划分模块，但不要超过三层  
例如表单中所有的数据均存放在data.form下，这样做的好处在于方便维护，而且能方便使用Object系自定义封装方法方便操作数据。     

## 前端跟后端交互部分的变量命名最好跟后端一致，避免使用映射的方式，主要好处是：   
减少代码的编写量，只需在data声明之初使用跟后端一致的命名，同时使用一个键值划分数据，避免都当后端有请求数据需要更新的时候(主要针对object这种数据类型)只需要调用原生的Object.assign()或者使用封装过的Object.setValue快捷赋值          
## Object自定义封装方法        
Object.reset(target,resetValue,except)：将target的数据遍历如果except传入则排除except数组中所包含的键值，设置成resetValue默认是null    
Object.setValue(target,source)：变量target（通常是vue data中的数据）的key，使用source的数据（通常是后端请求的，会比target键值多）中key对应的value值覆盖target的数值      

## 数组的更新        
vue中整个数组的更新会引起整个组件的重新渲染，如树的添加、删除、更新等操作对树的数据进行重新赋值会使树失去展开选中等操作状态，最理想的情况下是单个更新。       
为了提高开发效率，封装了一个Array.prototype.update(newVal{Array|Object},options{Object@default{key:'id',updatePK:null}})的方法，用于向服务器中请求全新的数据，跟当前的数据对比进行差异化更新，此方法可适用在单个数据更新和批量数据的更新。      
此方法适合[{id:1,name:'菜单1'},...]这种单层的数据，默认使用id来比较。 以下说明使用targetData原数据，newValue表示新数据，默认是id主键（如果数据主键是其他请使用options.key设置）：        

批量增加、批量删除targetData.update(newValue{Array})     
从批量数据更新其中一个：targetData.update(newValue{Array},{updatePK:1});

单个增加、单个更新：targetData.update(newValue{Object});   
单个删除：tartgetData.update(newValue{Object},{action:'remove'});

## 树菜单的解析       
需要组装成如下无限级的树状结构   
```javascript
[
    {
        id:'1',
        name:'一级菜单',
        children:[
            {
                id:'11',
                name:'二级菜单1',
                children:[...]
            },
            {
                id:'12',
                name:'二级菜单2',
                children:[...]
            }
        ]
    }
]
```             

可以调用src/vendor/helper.js/parseTreeNyMap来解析，这是一个通用的方法，具体的参数如下：   
parseTreeNyMap(Array@nodeData,Object@options);       
@param Array nodeData:一组带有parentKey（通常是parentId）来表明从属关系的数据    
@param Oject options：一系列自定义的参数，用于自定义解析过程的字段，具体参数如下：
@param Oject options.parentKey:自定义的表明从属关系的字段，默认是parentId        
@param Oject options.childrenKey:自定义的子节点的key值，默认是children  
@param Oject options.map：定义解析后的映射关系和所涉及的字段，key为解析后数据的键值，value为解析前数据的键值      
例如上述例子的原始数据是：
```javascript   
[
    {id:'1',parentId:null,title:'一级菜单'},
    {id:'11',parentId:'1',title:'二级菜单1'},
    {id:'12',parentId:'1',title:'二级菜单2'}
]
``` 
可以这样调用      
```javascript
import {parseTreeNyMap} from './helper';
let nodes=parseTreeNyMap(data,{
    map:{
        id:'id',
        name:'title'
    }
})
```  
## loading效果        
对于数据加载较慢的页面需要增加loading效果，整个工程中已经内置了一个loading效果，需要使用以下方式调用       
1.引入system mutation
```javascript
import {system} from './src/config';
//如果只是只是使用一次可以直接这样使用，trne时是显示loading， false是不显示loading，如果多次调用可以使用vuex的方式简化            
this.$store.commit(system.mutation.switchLoading, {loading: true});
```



   






