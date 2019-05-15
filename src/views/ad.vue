<template>
    <div class="container">
        <section class="filter box" style="background-color:#fff;">
            <li class="item">
                <i>广告标题</i>
                <Input v-model="condition.adTitle" placeholder="请输入" class="fill" clearable/>
            </li>
            <li>
                <Button type="primary" shape="circle" icon="ios-search" @click="search"></Button>
                <Button type="info" style="margin-left:5px;" shape="circle" icon="md-add" @click="add"></Button>
            </li>
        </section>
        <section class="box" style="background-color:#fff;">
            <Table stripe :columns="table.columns" :data="table.data" :loading="table.loading"></Table>
            <Page class="page-wrap" :total="table.total" :current="table.current" :page-size="table.size" @on-change="changePage" show-total></Page>
        </section>
        <Modal v-model="formModal.show" width="600" :title="formModal.title" closable @on-ok="save">
            <Form ref="formModal" :model="formModal.fields" :label-width="120" style="width:94%" :rules="formModal.validate">
                <FormItem label="广告标题" prop="adTitle">
                    <Input v-model="formModal.fields.adTitle" placeholder="请输入"/>
                </FormItem>
                <!-- <FormItem label="状态" prop="adState">
                    <Select class="towns" v-model="formModal.fields.adState" clearable transfer placeholder="请选择状态">
                        <Option v-for="(item, j) in option.sates" :key="j" :value="item.value">{{item.label}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="类型" prop="adType">
                    <Select class="towns" v-model="formModal.fields.adType" clearable transfer placeholder="请选择项目状态">
                        <Option v-for="(item, j) in option.types" :key="j" :value="item.value">{{item.label}}</Option>
                    </Select>
                </FormItem> -->
                <FormItem label="内容" prop="adContent">
                    <Input v-model="formModal.fields.adContent" type="textarea" :autosize="{minRows: 5}" placeholder="请输入内容"/>
                </FormItem>
                <FormItem label="关联的商品" prop="goodsId">
                    <Select v-model="formModal.fields.goodsId" transfer placeholder="选择商品" filterable>
                        <Option v-for="(vo,k) in allProducts" :key="k" :value="vo.value">{{vo.label}}</Option>
                    </Select>
                </FormItem>
                <!-- <FormItem label="图片跳转路径" prop="adRedirectUrl">
                    <Input v-model="formModal.fields.adRedirectUrl" placeholder="请输入路径"/>
                </FormItem> -->
                <div class="flex-row">
                    <div class="shangchuan">图片</div>
                    <div v-if="formModal.fields.adImg" class="demo-upload-list">
                        <img :src="formModal.fields.adImg" class="adImg"/>
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-eye-outline" @click.native="viewImg()"></Icon>
                            <Icon type="ios-trash-outline" @click.native="removeImg()"></Icon>
                        </div>
                    </div>
                    <div v-else>
                        <Upload
                            ref="upload"
                            :show-upload-list="false"
                            :format="['jpg','jpeg','png','mp4']"
                            type="drag"
                            :action="upLoadUrl"
                            :on-success="upLoad"
                            :on-error="upLoad"
                            :headers="upLoadHeader"
                            :before-upload="handleBeforeUpload"
                            style="display: inline-block;width:58px;">
                            <div style="width: 58px;height:58px;line-height: 58px;">
                                <Icon type="ios-cloud-upload" size="20"></Icon>
                            </div>
                        </Upload>
                    </div>
                </div>
            </Form>
        </Modal>
        <Modal title="预览图片" v-model="formModal.showImg">
            <img :src="formModal.fields.adImg" style="width: 100%">
        </Modal>
    </div>
</template>
<script>
import { autoTest } from '../config';
import curd from '../mixin/curd';
import { Button, Icon } from 'iview';
import AD from '../config/module/ad.js';
import Goods from '../config/module/goods.js';
import {appConfig} from '../config/index.js';
export default {
    name: 'products',
    mixins: [curd],
    data() {
        return {
            upLoadUrl: appConfig.baseUrl + '/fileInfo/upload.do',
            upLoadHeader: {
                'Access-Control-Expose-Headers': 'x-shiro-authorization',
                'x-shiro-authorization': this.$session('user').token,
            },
            allProducts: [],
            condition: {
                adTitle: null
            },
            curd: {
                searchUrl: AD.list,
                readUrl: AD.get,
                createUrl: AD.save,
                deleteUrl: AD.delete,
                updateUrl: AD.update
            },
            table: {
                columns: [
                    { title: '广告标题', key: 'adTitle',align: 'center'},
                    {
                        type: 'action',
                        title: '操作',
                        align: 'center',
                        width: 300,
                        render: (h, { row }) => {
                            let isCurrent = row.project_id === this.currentProId;
                            return (<div>
                                <Button type="primary" size="small" shape="circle" icon="md-create" onClick={() => {
                                    this.edit(row, 'adId');
                                }}></Button>
                                <Button style="margin:0 8px;" size="small" shape="circle" type="error" icon="md-close" onClick={() => {
                                    this.delete(row, 'adId');
                                }}></Button>
                            </div>);
                        }
                    }
                ]
            },
            formModal: {
                validate: {
                    adTitle:[
                        {required:true,trigger:'blur',message: '不能为空'}
                    ]
                },
                fields: {
                    adTitle: null,
                    adImg: null,
                    adImgFileId: null,
                    adRedirectUrl: null,
                    adContent: null
                },
                showImg: false,
                imgPercentage:100,
                showImgProgress: false
            }
        }
    },
    methods: {
        handleBeforeUpload () {
            this.formModal.showImgProgress = true;
        },
        viewImg () {
            this.formModal.showImg = true;
        },
        removeImg () {
            this.formModal.fields.adImg = null;
            this.formModal.fields.adImgFileId = null;
        },
        upLoad (data) {
            if (data.success) {
                Object.assign(this.formModal.fields, {
                    adImgFileId: data.result.fileId,
                    adImg: data.result.fileAccessUrl
                });
                return this.$Message.success('上传成功！');
            }
            return this.$Message.error('上传失败！');
        },
        getAllProducts () {
            this.$http({
                method: 'post',
                url: Goods.list,
                data: {
                    goodsType: '0',
                    paginationFlag: false
                }
            }).then(
                ({ data }) => {
                    if (data.success) {
                        data.result.list.map(vo => {
                            this.allProducts.push({label:vo.goodsName,value: vo.goodsId});
                        });
                    } else {
                        this.$Modal.error({ title: '系统提示', content: data.error.message });
                    }
                },
                (error) => {
                    this.$Message.error('请求失败，请稍候重试！');
                }
            );
        },
    },
    created() {
        this.search();
        this.getAllProducts();
    }
}
</script>

<style lang="less" scoped>
    .box { box-sizing: border-box;padding: 20px;border-radius: 12px;box-shadow: 0 0 4px #ccc;margin-top: 20px;};
    .container {
        width: 100%;height: 100%;overflow:hidden;background: #f2f2f2;padding: 0 20px 20px 20px;
    }
    .shangchuan {width: 120px;text-align: right;box-sizing: border-box; padding-right: 12px;}

    // .adImg { width: 58px; height: 58px;padding-right: 20px;}

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


