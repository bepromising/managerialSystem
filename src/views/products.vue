<template>
    <div class="container">
        <section class="filter box" style="background-color:#fff;">
            <li class="item">
                <i>商品名称</i>
                <Input v-model="condition.goodsName" placeholder="输入商品名称" class="fill" clearable/>
            </li>
            <li class="item">
                <i>商品类型</i>
                <Select v-model="condition.goodsType" class="fill" clearable transfer placeholder="请选择">
                    <Option v-for="(type, index) in goodsTypes" :key="index" :value="type.value">{{type.label}}</Option>
                </Select>
            </li>
            <li>
                <Button type="primary" shape="circle" icon="ios-search" @click="search"></Button>
                <Button type="info" style="margin-left:5px;" shape="circle" icon="md-add" @click="addGood"></Button>
            </li>
        </section>
        <section class="box" style="background-color:#fff;">
            <Table stripe :columns="table.columns" :data="table.data" :loading="table.loading"></Table>
            <Page class="page-wrap" :total="table.total" :current="table.current" :page-size="table.size" @on-change="changePage" show-total></Page>
        </section>
        <Modal v-model="formModal.show" width="600" :title="formModal.title" closable @on-ok="save(getCommonProducts)">
            <Form ref="formModal" :model="formModal.fields" :label-width="120" style="width:94%" :rules="formModal.validate">
                <FormItem label="商品名称" prop="goodsName">
                    <Input v-model="formModal.fields.goodsName" placeholder="请输入商品名称"/>
                </FormItem>
                <FormItem label="商品库存" prop="goodsStock">
                    <Input v-model="formModal.fields.goodsStock" placeholder="请输入商品库存" />
                </FormItem>
                <!-- <FormItem label="预警库存" prop="warnStock">
                    <Input number v-model="formModal.fields.warnStock" placeholder="多少商品库存时预警" />
                </FormItem> -->
                <FormItem label="商品价格" prop="goodsPrice">
                    <Input number v-model="formModal.fields.goodsPrice" placeholder="请输入商品价格" />
                </FormItem>
                <!-- <FormItem label="市场价格" prop="marketPrice">
                    <Input number v-model="formModal.fields.marketPrice" placeholder="该商品市场价格是多少，可填" />
                </FormItem> -->
                <FormItem label="商品单位" prop="goodsUnit">
                    <Input v-model="formModal.fields.goodsUnit" placeholder="请输入 斤、两、条..." />
                </FormItem>
                <FormItem label="商品描述" prop="goodsDesc">
                    <Input v-model="formModal.fields.goodsDesc" placeholder="请输入" />
                </FormItem>
                <FormItem label="商品类型" prop="goodsType">
                    <Select v-model="formModal.fields.goodsType" clearable transfer placeholder="请选择">
                        <Option v-for="(type, index) in goodsTypes" :key="index" :value="type.value">{{type.label}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="商品类别" v-show="formModal.fields.goodsType === '0'">
                    <Cascader :data="formModal.classTypes" v-model="formModal.selectedClass" trigger="hover" filterable @on-change="changeClassType"></Cascader>
                </FormItem>
                <FormItem label="优惠描述" prop="discountDesc" v-show="formModal.fields.goodsType === '1'">
                    <Input v-model="formModal.fields.discountDesc" placeholder="请输入" />
                </FormItem>
                <FormItem label="套餐商品" v-show="formModal.fields.goodsType === '1'">
                    <Select v-model="formModal.couponGoods" filterable multiple transfer placeholder="请选择" @on-change="changeCouponProducts">
                        <Option v-for="(type, index) in formModal.couponGoodList" :key="index" :value="type.value">{{type.label}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="上架标识" prop="saleFlag">
                    <Select v-model="formModal.fields.saleFlag" clearable transfer placeholder="请选择">
                        <Option v-for="(flag, index) in flag_arr" :key="index" :value="flag.value">{{flag.label}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="热门标识" prop="hotFlag">
                    <Select v-model="formModal.fields.hotFlag" clearable transfer placeholder="请选择">
                        <Option v-for="(flag, index) in flag_arr" :key="index" :value="flag.value">{{flag.label}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="新品标识" prop="newFlag">
                    <Select v-model="formModal.fields.newFlag" clearable transfer placeholder="请选择">
                        <Option v-for="(flag, index) in flag_arr" :key="index" :value="flag.value">{{flag.label}}</Option>
                    </Select>
                </FormItem>
                <div class="flex-row" style="height: 60px;margin-bottom: 15px;">
                    <div class="shangchuan">文件</div>
                    <div class="demo-upload-list" v-for="(img, k) in formModal.goodsImgList" :key="k">
                        <img :src="img"/>
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-eye-outline" @click.native="viewImg(img)"></Icon>
                            <Icon type="ios-trash-outline" @click.native="removeImg(k)"></Icon>
                        </div>
                    </div>
                    <div>
                        <Upload
                            ref="upload"
                            :show-upload-list="false"
                            :format="['jpg','jpeg','png','mp4','avi']"
                            type="drag"
                            :action="upLoadUrl"
                            :on-success="upLoad"
                            :on-error="upLoad"
                            :headers="upLoadHeader"
                            :max-size="20480"
                            multiple
                            style="display: inline-block;width:58px;">
                            <div style="width: 58px;height:58px;line-height: 58px;">
                                <Icon type="ios-cloud-upload" size="20"></Icon>
                            </div>
                        </Upload>
                    </div>
                </div>
                <!-- <FormItem label="备注" prop="remark">
                    <Input type="textarea" number v-model="formModal.fields.remark" placeholder="备注" />
                </FormItem> -->
            </Form>
        </Modal>
        <Modal title="预览图片" v-model="formModal.showImg">
            <img :src="formModal.showImgUrl" style="width: 100%">
        </Modal>
    </div>
</template>
<script>
import { autoTest } from '../config';
import curd from '../mixin/curd';
import { Button, Icon } from 'iview';
import Goods from '../config/module/goods.js';
import Class from '../config/module/classification.js';
import {goods_types} from '../config/module/options.js';
import { appConfig } from '../config/index.js';
export default {
    name: 'products',
    mixins: [curd],
    data() {
        return {
            goodsTypes: goods_types,
            flag_arr: [
                {
                    label: '是',
                    value: '1'
                },
                {
                    label: '否',
                    value: '0'
                }
            ],
            upLoadUrl: appConfig.baseUrl + '/fileInfo/upload.do',
            upLoadHeader: {
                'Access-Control-Expose-Headers': 'x-shiro-authorization',
                'x-shiro-authorization': this.$session('user').token,
            },
            condition: {
                productName: null,
                goodsType: null
            },
            curd: {
                searchUrl: Goods.list,
                readUrl: Goods.get,
                createUrl: Goods.save,
                deleteUrl: Goods.delete,
                updateUrl: Goods.update
            },
            table: {
                columns: [
                    { type: 'index', title: '序号', width: 80, align: 'center' },
                    { title: '名称', key: 'goodsName', align: 'center'},
                    { title: '价格(元)', key: 'goodsPrice' , align: 'center'},
                    { title: '类型', key: 'goodsTypeValue', align: 'center' },
                    { title: '库存', key: 'goodsStock' , align: 'center'},
                    { title: '上架标识', key: 'saleFlag', align: 'center', render: ((h,{row}) => {
                        let obj = {'0': '否', '1': '是'}
                        return(<div>{obj[row.saleFlag]}</div>)
                    })},
                    {
                        type: 'action',
                        title: '操作',
                        align: 'center',
                        width: 150,
                        render: (h, { row }) => {
                            return (<div>
                                <Button type="primary" size="small" shape="circle" icon="md-create" onClick={() => {
                                    this.edit1(row, 'goodsId');
                                }}></Button>
                                <Button style="margin:0 8px;" size="small" shape="circle" type="error" icon="md-close" onClick={() => {
                                    this.delete(row, 'goodsId');
                                }}></Button>
                            </div>);
                        }
                    }
                ]
            },
            formModal: {
                showImg: false,
                showImgUrl: null,
                validate: {
                    goodsName:[{required:true,trigger:'blur',message: '不能为空'}],
                    goodsPrice:[{required:true,trigger:'blur',message: '不能为空',type: 'number'}],
                },
                goodsImgList: [],
                classTypes: [],
                selectedClass: [],
                couponGoods: [],
                couponGoodList: [],
                fields: {
                    goodsStock: null,
                    goodsName: null,
                    discountDesc: null,
                    goodsPrice: null,
                    fileIds: [],
                    packagesGoodsList: [],
                    goodsUnit: null,
                    goodsType: null,
                    marketPrice: null,
                    hotFlag: null,
                    newFlag: null,
                    saleFlag: null
                }
            }
        }
    },
    methods: {
        addGood(defaultValue = {}) {
            this.$refs.formModal.resetFields();
            if(Object.prototype.toString.call(defaultValue)=='[object Object]'){
                for (let key in defaultValue) {
                    this.formModal.fields[key] = defaultValue[key];
                }
            }
            
            this.formModal.fields.fileIds = [];
            this.formModal.couponGoods = [];
            this.formModal.goodsImgList = [];
            this.formModal.selectedClass = [];
            Object.assign(this.formModal, {
                edit: false,
                show: true,
                title: '新增'
            });
        },
        changeCouponProducts (value) {
            this.formModal.couponGoods = value;
            this.formModal.fields.packagesGoodsList = [];
            if (value) {
                value.forEach(vo => {
                    this.formModal.fields.packagesGoodsList.push({subGoodsId: vo});
                });
            }
        },
        changeClassType (value) {
            this.formModal.fields.firstClassId = value[0];
            this.formModal.fields.secondClassId = value[1];
        },
        viewImg (img) {
            this.formModal.showImg = true;
            this.formModal.showImgUrl = img;
        },
        removeImg (k) {
            this.formModal.goodsImgList.splice(k,1);
            this.formModal.fields.fileIds.splice(k,1);
        },
        upLoad (data) {
            if (data.success) {
                this.formModal.fields.fileIds.push(data.result.fileId);
                this.formModal.goodsImgList.push(data.result.fileAccessUrl);
                return this.$Message.success('上传成功！');
            }
            return this.$Message.error('上传失败！');
        },
        edit1 (row, idName = 'id',callback) {
            this.$http({
                method: 'post',
                url: this.curd.readUrl,
                data: {
                    [idName]: row[idName]
                }
            }).then(
                ({ data }) => {
                    if (data.success) {
                        Object.assign(this.formModal, {
                            edit: true,
                            show: true,
                            title: '编辑',
                            fields: data.result
                        });
                        this.formModal.selectedClass = [data.result.firstClassId, data.result.secondClassId];
                        this.formModal.fields.fileIds = [];
                        this.formModal.goodsImgList = [];
                        this.formModal.couponGoods = [];


                        for (let i = 0; i < this.formModal.fields.fileInfoList.length; i++) {
                            this.formModal.fields.fileIds.push(this.formModal.fields.fileInfoList[i].fileId);
                            this.formModal.goodsImgList.push(this.formModal.fields.fileInfoList[i].fileAccessUrl);
                        }

                        if (this.formModal.fields.subGoodsList) {
                            for (let j = 0; j < this.formModal.fields.subGoodsList.length; j++) {
                                this.formModal.couponGoods.push(this.formModal.fields.subGoodsList[j].goodsId);
                            }
                        }

                        this.formModal.fields.fileInfoList = null;
                        this.formModal.fields.subGoodsList = null;
                    } else {
                        this.$Modal.error({ title: '系统提示', content: data.error.message });
                    }
                },
                (error) => {
                    this.$Message.error('请求失败，请稍候重试！');
                }
            );
        },
        transformData (nodes, pid = '0', parentId = 'parentId', defaultId = 'id') {
            let finalNodes = [],
                tempNode;
            for (let i = 0, len = nodes.length; i < len; i++) {
                if (nodes[i][parentId] == pid) {
                    let _node = {label: nodes[i].className,value: nodes[i].classId};
                    tempNode = this.transformData(nodes, nodes[i].classId, parentId);
                    if (tempNode.length > 0) {
                        _node.children = tempNode;
                    }
                    finalNodes.push(_node);
                } else {
                    continue;
                }
            }
            return finalNodes; 
        },
        getAllClass () {
            this.$http({
                method: 'post',
                url: Class.list,
                data: {
                    paginationFlag: false
                }
            }).then(
                ({ data }) => {
                    if (data.success) {
                        this.formModal.classTypes = this.transformData(data.result.list, '0', 'parentId');
                    } else {
                        this.$Modal.error({ title: '系统提示', content: data.error.message });
                    }
                },
                (error) => {
                    this.$Message.error('请求失败，请稍候重试！');
                }
            );
        },
        getCommonProducts () {
            this.$http({
                method: 'post',
                url: this.curd.searchUrl,
                data: {
                    goodsType: '0',
                    paginationFlag: false
                }
            }).then(
                ({ data }) => {
                    if (data.success) {
                        data.result.list.forEach( vo => {
                            this.formModal.couponGoodList.push({label: vo.goodsName, value: vo.goodsId,})
                        })
                    } else {
                        this.$Modal.error({ title: '系统提示', content: data.error.message });
                    }
                },
                (error) => {
                    this.$Message.error('请求失败，请稍候重试！');
                }
            );
        }
    },
    created() {
        this.search();
        this.getAllClass();
        this.getCommonProducts();
    }
}
</script>

<style lang="less" scoped>
    .box { box-sizing: border-box;padding: 20px;border-radius: 12px;box-shadow: 0 0 4px #ccc;margin-top: 20px;};
    .container {
        width: 100%;height: 100%;overflow:hidden;background: #f2f2f2;padding: 0 20px 20px 20px;
    }

    .flex-row { display: flex; flex-direction: row;}

    .upload-list{
        display: inline-block;width: 60px;height: 60px;text-align: center;line-height: 60px;border: 1px solid transparent;border-radius: 4px;overflow: hidden;background: #fff;position: relative;box-shadow: 0 1px 1px rgba(0,0,0,.2);margin-right: 4px;
        img {width: 100%; height: 100%;}
    }

    .shangchuan {width: 120px;text-align: right;box-sizing: border-box; padding-right: 12px;}

    .demo-upload-list{
        display: inline-block;
        width: 60px;
        height: 60px;
        text-align: center;
        line-height: 60px;
        border: 1px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        background: #fff;
        position: relative;
        box-shadow: 0 1px 1px rgba(0,0,0,.2);
        margin-right: 4px;
    }

    .demo-upload-list img{
        width: 100%;
        height: 100%;
    }

    .demo-upload-list-cover{
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,.6);
    }
    .demo-upload-list:hover .demo-upload-list-cover{
        display: block;
    }
    .demo-upload-list-cover i{
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        margin: 0 2px;
    }
</style>


