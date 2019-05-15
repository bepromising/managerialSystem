<template>
    <div class="container">
        <section class="filter box" style="background-color:#fff;">
            <li class="item">
                <i>菜谱名称</i>
                <Input v-model="condition.cookbookName" placeholder="输入商品名称" class="fill" clearable/>
            </li>
            <li>
                <Button type="primary" shape="circle" icon="ios-search" @click="search"></Button>
                <Button type="info" style="margin-left:5px;" shape="circle" icon="md-add" @click="addFoodBook"></Button>
            </li>
        </section>
        <section class="box" style="background-color:#fff;">
            <Table stripe :columns="table.columns" :data="table.data" :loading="table.loading"></Table>
            <Page class="page-wrap" :total="table.total" :current="table.current" :page-size="table.size" @on-change="changePage" show-total></Page>
        </section>
        <Modal v-model="formModal.show" :refs="formModal" width="600" :title="formModal.title" closable @on-ok="save">
            <Form ref="formModal" :model="formModal.fields" :label-width="120" style="width:94%" :rules="formModal.validate">
                <FormItem label="菜谱名称" prop="cookbookName">
                    <Input v-model="formModal.fields.cookbookName" placeholder="请输入商品名称"/>
                </FormItem>
                <FormItem label="菜谱描述" prop="cookbookDesc">
                    <Input v-model="formModal.fields.cookbookDesc" placeholder="请输入商品库存" />
                </FormItem>
                <div class="flex-row" style="height: 60px;margin-bottom: 15px;">
                    <div class="shangchuan">上传图片</div>
                    <div class="demo-upload-list" v-if="formModal.fields.cookbookImg">
                        <img :src="formModal.fields.cookbookImg"/>
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-eye-outline" @click.native="viewImg(img)"></Icon>
                            <Icon type="ios-trash-outline" @click.native="removeImg(k)"></Icon>
                        </div>
                    </div>
                    <div v-else>
                        <Upload
                            ref="upload"
                            :show-upload-list="false"
                            :format="['jpg','jpeg','png']"
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
                <div class="flex-row" style="height: 60px;margin-bottom: 15px;">
                    <div class="shangchuan">上传视频</div>
                    <div class="demo-upload-list" v-if="formModal.fields.cookbookVideo">
                        <video :src="formModal.fields.cookbookVideo" controls="controls" />
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-eye-outline" @click.native="viewVideo(img)"></Icon>
                            <Icon type="ios-trash-outline" @click.native="removeVideo(k)"></Icon>
                        </div>
                    </div>
                    <div v-else>
                        <Upload
                            ref="upload"
                            :show-upload-list="false"
                            :format="['mp4','avi']"
                            type="drag"
                            :action="upLoadUrl"
                            :on-success="upLoadVideo"
                            :on-error="upLoadVideo"
                            :headers="upLoadHeader"
                            multiple
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
            <img :src="formModal.fields.cookbookImg" style="width: 100%">
        </Modal>
        <Modal title="预览视频" v-model="formModal.showVideo" width="700" style="text-align:center">
            <video :src="formModal.fields.cookbookVideo" controls="controls" />
        </Modal>
    </div>
</template>
<script>
import curd from '../mixin/curd';
import { Button, Icon } from 'iview';
import foodbook from '../config/module/foodbook.js';
import { appConfig } from '../config/index.js';
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
            condition: {
                cookbookName: null
            },
            curd: {
                searchUrl: foodbook.list,
                readUrl: foodbook.get,
                createUrl: foodbook.save,
                deleteUrl: foodbook.delete,
                updateUrl: foodbook.update
            },
            table: {
                columns: [
                    { type: 'index', title: '序号', width: 80, align: 'center' },
                    { title: '菜谱名称', key: 'cookbookName', align: 'center'},
                    { title: '菜谱描述', key: 'cookbookDesc' , align: 'center'},
                    {
                        type: 'action',
                        title: '操作',
                        align: 'center',
                        width: 150,
                        render: (h, { row }) => {
                            return (<div>
                                <Button type="primary" size="small" shape="circle" icon="md-create" onClick={() => {
                                    this.edit(row, 'cookbookId');
                                }}></Button>
                                <Button style="margin:0 8px;" size="small" shape="circle" type="error" icon="md-close" onClick={() => {
                                    this.delete(row, 'cookbookId');
                                }}></Button>
                            </div>);
                        }
                    }
                ]
            },
            formModal: {
                showImg: false,
                showVideo: false,
                showImgUrl: null,
                validate: {
                    cookbookName:[{required:true,trigger:'blur',message: '不能为空'}],
                },
                fields: {
                    cookbookName: null,
                    cookbookImg: null,
                    cookbookVideo: null,
                    cookbookImgFileId: null,
                    cookbookVideoFileId: null,
                    cookbookDesc: null
                }
            }
        }
    },
    methods: {
        addFoodBook (defaultValue = {}) {
            this.$refs.formModal.resetFields();
            if(Object.prototype.toString.call(defaultValue)=='[object Object]'){
                for (let key in defaultValue) {
                    this.formModal.fields[key] = defaultValue[key];
                }
            }
            this.removeImg();
            this.removeVideo();
            Object.assign(this.formModal, {
                edit: false,
                show: true,
                title: '新增'
            });
        },
        viewImg () {
            this.formModal.showImg = true;
        },
        viewVideo () {
            this.formModal.showVideo = true;
        },
        removeImg (k) {
            this.formModal.fields.cookbookImg = null;
            this.formModal.fields.cookbookImgFileId = null;
        },
        removeVideo (k) {
            this.formModal.fields.cookbookVideo = null;
            this.formModal.fields.cookbookVideoFileId = null;
        },
        upLoad (data) {
            if (data.success) {
                this.formModal.fields.cookbookImgFileId = data.result.fileId;
                this.formModal.fields.cookbookImg = data.result.fileAccessUrl;
                return this.$Message.success('上传成功！');
            }
            return this.$Message.error('上传失败！');
        },
        upLoadVideo (data) {
            if (data.success) {
                this.formModal.fields.cookbookVideoFileId = data.result.fileId;
                this.formModal.fields.cookbookVideo = data.result.fileAccessUrl;
                return this.$Message.success('上传成功！');
            }
            return this.$Message.error('上传失败！');
        }
    },
    created() {
        this.search();
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


