/**
 * @file 基于国土地图进行封装，主要简化调用国土地图必传的一系列相同的参数
 * @author 陈健豪
 */

import {importScripts} from '../vendors/helper';
export default class GeoMap {
   constructor(mapConfig={},config={}){
       this.mapConfig=Object.assign({},{
           dpi:96,//DOTS_PER_INCH
           zoom:10,
           scales:'2.958293554545656E8,1.479146777272828E8,7.39573388636414E7,3.69786694318207E7,1.848933471591035E7,9244667.357955175,4622333.678977588,2311166.839488794,1155583.419744397,577791.7098721985,288895.85493609926,144447.92746804963,72223.96373402482,36111.98186701241,18055.990933506204,9027.995466753102,4513.997733376551,2256.998866688275',
           layer:{
               name:'东莞市安全生产监督管理局地图',//mapWMTSLayer_Name
               url:'http://t0.tianditu.com/vec_c/wmts',//mapWMTSLayer_Url
               layer:'vec', //mapWMTSLayer_LayerIdentifier
               matrixSet:'c', //mapWMTSLayer_MatrixSet
               style:'default', //mapWMTSLayer_StyleIdentifier
               /*resolutions:'',*/
               //maxResolution :scales[0],//最大分辨率  
               //minResolution :scales[scales.length-1],//最小分辨率
               zoomOffset:1, //mapWMTSLayer_ZoomOffset
               titleFullExtent:'-180.0,-90.0,180.0,90.0', //mapWMTSLayer_TileFullExtent
               format:'tiles', //mapWMTSLayer_Format
           },
           anno:{
               name:'东莞市安全生产监督管理局矢量注记底图', //mapWMTSAnno_Name
               url:'http://t0.tianditu.com/cva_c/wmts', //mapWMTSAnno_Url
               layer:'cva',//mapWMTSAnno_LayerIdentifier
               matrixSet:'c', //mapWMTSAnno_MatrixSet
               style:'default', //mapWMTSAnno_StyleIdentifier
               //maxResolution :scales[0],//最大分辨率  
               //minResolution :scales[scales.length-1],//最小分辨率
               zoomOffset:1, //mapWMTSAnno_ZoomOffset
               titleFullExtent:'-180.0,-90.0,180.0,90.0', //mapWMTSAnno_TileFullExtent
               format:'tiles', //mapWMTSAnno_Format
           }
       },mapConfig);
       this.tipBox=null;
       this.vectorLayer=null;
       this.markerLayer=null;
       this.markers=[];
       this.navigation=null;
       this.config=Object.assign({
           zoomWheelEnabled:true
       },config);
       return this;
   }
   parseScale(){
       let resolutions = [];  
       let scaleArr = this.mapConfig.scales.split(',');  
       for(var i = 0, j = scaleArr.length; i < j;i++) {  
           resolutions.push(this.map.pyramid.getResolutionForScale(parseFloat(scaleArr[i])));  
       }
       let computedConfig={
           resolutions,
           maxResolution:resolutions[0],
           minResolution:resolutions[resolutions.length -1]
       };
       Object.assign(this.mapConfig.layer,computedConfig);  
       Object.assign(this.mapConfig.anno,computedConfig);  
   }
   parsePoint(point){
       let resultPoint=[];
       if(typeof point === 'string'){
           resultPoint=point.split(',');
       }else if(Object.prototype.toString.call(point)==='[object Object]'){
           resultPoint=[point.lng,point.lat];
       }else{
           resultPoint=point;
       }
       return resultPoint;
   }
   /**
    * 
    * @param {Function} callback 回调中的this是指向GeoMap的实例，可以使用this调用下面的所有方法
    */
   load(callback){
       let _this=this;
       importScripts(['OpenLayers/OpenLayers-min.js', 'GeoGlobeJS.min.js'],function(){
           /* let controls=[];
           if(_this.config.hasOwnProperty('zoomWheelEnabled')){
               _this.navigation=new Geo.View2D.Control.GeoPanZoom();
               controls.push(_this.navigation);
           } */
           Geo.setDPI(_this.mapConfig.dpi);
           _this.map=new Geo.View2D.Map(_this.mapConfig.mapId);
           _this.parseScale();
           let layer=new Geo.View2D.Layer.WMTS(_this.mapConfig.layer),
           anno=new Geo.View2D.Layer.WMTS(_this.mapConfig.anno);
           let vectorLayer = new Geo.View2D.Layer.Vector('cusomVectorLayer'); 
           _this.vectorLayer=vectorLayer;
           _this.map.addLayers([layer,anno,vectorLayer]);
           let {point}=_this.mapConfig,
           resultPoint=_this.parsePoint(point);
           _this.map.setCenter(
               new Geo.LonLat(...resultPoint), _this.mapConfig.zoom
           );
           if(callback){
               callback.apply(_this);
           }
       },{
           basePath: 'static/plugins/GeoGlobe/'
       });
   }

   /**
    * 在地图上增加标点，可以批量操作
    * @param {Object} markerConfig 
    * @param {Array} markerConfig.size 图标的全局大小，默认24*24
    * @param {String} markerConfig.icon 图标的全局使用图片，默认使用红色的marker图片
    * @param {Boolean} markerConfig.showName 是否显示名字，默认false不显示
    * @param {Array|Point(String|Object|Array)} markerConfig.data 坐标数据，如果是单个坐标则传入坐标即可， size和icon均使用全局的，如果是多个则传入[{point:point,size:[24,24],icon:'xxxx.png'},...]如果当前标点没设置则使用全局的配置，point是必传
    * @returns this
    */
   addMarker(markerConfig){
       let finalConfig=Object.assign({
           size:[24,24],
           icon:'static/imgs/marker.png',
           showName:false,
           animation:1
       },markerConfig),
       _this=this;
       if(!this.markerLayer){
           this.markerLayer=new Geo.View2D.Layer.GeoMarkers(markerConfig.title);
           this.map.addLayer(this.markerLayer);
       }
       if(this.markers.length > 0){
           this.markers.forEach(vo=>{
               this.markerLayer.removeMarker(vo);
           });
           this.markers=[];
       }
       
       let markersPoint=[];
       if(!Array.isArray(markerConfig.data)){
           markersPoint=[{
               size:finalConfig.size,
               icon:finalConfig.icon,
               point:this.parsePoint(markerConfig.data)
           }];
       }else{
           markersPoint=markerConfig.data.map(vo=>{
               let returnConfig={};
               if(Object.prototype.toString.call(vo)==='[object Object]'){
                   returnConfig={
                       size:vo.size||finalConfig.size,
                       icon:vo.icon||finalConfig.icon,
                       point:this.parsePoint(vo.point)
                   }
               }else{
                   returnConfig={
                       size:finalConfig.size,
                       icon:finalConfig.icon,
                       point:this.parsePoint(vo)
                   }
               }
               if(vo.name||vo.title){
                   returnConfig.name=vo.name;
               }
               return returnConfig;
           });
       }
       let animationMap=[
           Geo.GeoMarker.ANIMATION_DROP,
           Geo.GeoMarker.ANIMATION_BOUNCE
       ];
       let tagSize=new Geo.Size(200,24),
       showName=finalConfig.showName?'':'visibility: hidden;';
       markersPoint.forEach(vo=>{
           let point=new Geo.LonLat(...vo.point),
           size= new Geo.Size(...vo.size),
           icon=new Geo.View2D.Icon(vo.icon,size),
           marker=new Geo.GeoMarker(point,icon,new Geo.View2D.MarkerTag(`<div style="text-align:center;padding-top:10px;${showName}">${vo.name}</div>`,tagSize));
           let evt=new Geo.Events();
           if(finalConfig.animation){
               marker.setAnimation(animationMap[finalConfig.animation-1]);
           }
           marker.events.register('click', marker, function(evt) {
               if(markerConfig.handler){
                   markerConfig.handler.apply(_this,[{
                       name:this.tag.html.replace(/<[^>]+>/g,''),
                       point:[this.lonlat.lon,this.lonlat.lat]
                   }]);
               }
               OpenLayers.Event.stop(evt);
           });
           this.markerLayer.addMarker(marker);
           this.markers.push(marker);
       });
       return this;
   } 
   /* //EPSG:4610就是西安80格式
   convertPoint(point,format='EPSG:4610'){
       let proj4Point=new proj4.toPoint(point),
       sourcePro=new proj4.Proj(format);
       let resultPoint=proj4.transform(sourcePro,this.projectConfig.target,point);
       return [resultPoint.x,resultPoint.y];
   } */

   removeMarkers(){
       if(this.markers.length > 0){
           this.markers.forEach(vo=>{
               this.markerLayer.removeMarker(vo);
           });
           this.markers=[];
       }
   }

   removeNavigation(){
       this.map.removeControl(this.navigation);
       this.navigation=null;
   }

   addNavigation(){
       this.navigation=new Geo.View2D.Control.GeoPanZoom();
       this.map.addControl(this.navigation);
   }
   
   /**
    * 
    * @param {Object} tipConfig 提示框的参数，包含如下参数：
    * @param {String|Array|Object} tipConfig.point 坐标数据，支持三种类型String:'113.43,23.33',Array:[113.4327568,23.33]，Object:{lat:113.4327568,lng:'23.33'}
    * @param {String} tipConfig.content 提示框的内容，可以使用HTML
    * @param {String} tipConfig.title (可选 ) 提示框的标题
    * @param {Array} tipConfig.size (可选 ) 提示框的大小，[width,height]，单位是像素，不传则使用默认 160x140
    * @param {Function} (可选 ) tipConfig.close 关闭提示框执行的回调
    */
   showTipBox(tipConfig){
       let _this=this;
       Geo.View2D.Popup.FramedCloud.prototype.autoSize = false;
       let size=tipConfig.size||[160,60],
       title=tipConfig.title?`<div class="title">${tipConfig.title}</div>`:'';
       if(this.tipBox){
           _this.map.removePopup(_this.tipBox);
       }
       this.tipBox=new Geo.View2D.Popup.FramedCloud(
           'sh-tipBox',
           new Geo.LonLat(this.parsePoint(tipConfig.point)),
           new Geo.Size(...size),
           `<section class="GeoMap">
               ${title}
               <div class="content">${tipConfig.content}</div>
           </section>`,
           null,
           true,
           function(){
               _this.map.removePopup(_this.tipBox);
               if(tipConfig.close){
                   tipConfig.close.apply(_this);
               }
           }
       );
       this.map.addPopup(this.tipBox);
   }

   markArea(areaConfig){
       let areaLayer = new Geo.View2D.Layer.GeoThematicLayer(areaConfig.title, { 
           gmlUrl: areaConfig.dataUrl, 
           styleUrl: areaConfig.styleUrl 
       }); 
       areaLayer.events.register('click',areaConfig,function(event){
           OpenLayers.Event.stop(event);
       })
       this.map.addLayer(areaLayer); 
   }

}