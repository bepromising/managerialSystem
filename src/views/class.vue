<template>
    <div class="container" style="margin-bottom:50px;overflow:auto;">
        <!-- <section class="filter box" style="background-color:#fff;">
            <li class="item">
                <i>分类名称</i>
                <Input v-model="condition.className" placeholder="输入名称" class="fill" clearable/>
            </li>
            <li>
                <Button type="primary" shape="circle" icon="ios-search" @click="search"></Button>
                <Button type="info" style="margin-left:5px;" shape="circle" icon="md-add" @click="add"></Button>
            </li>
        </section> -->
        <section class="box" style="background-color:#fff;">
            <Button type="info" style="margin-left:5px;margin-bottom: 20px;" shape="circle" icon="md-add" @click="add">新增分类</Button>
            <zk-table stripe :columns="table.columns" :data="tree" border tree-type :is-fold="false" :selection-type="false" :show-index="false" :expand-type="false">
                <template slot="action" scope="scope">
                    <Button type="primary" size="small" shape="circle" icon="md-create" @click="edit(scope.row, 'classId')"></Button>
                    <Button style="margin:0 8px;" size="small" shape="circle" type="error" icon="md-close" @click="delete(scope.row, 'classId')"></Button>
                </template>
            </zk-table>
            <!-- <Page class="page-wrap" :total="table.total" :current="table.current" :page-size="table.size" @on-change="changePage" show-total></Page> -->
        </section>
        <Modal v-model="formModal.show" width="600" :title="formModal.title" closable @on-ok="save">
            <Form ref="formModal" :model="formModal.fields" :label-width="120" style="width:94%" :rules="formModal.validate">
                <FormItem label="分类名称" prop="className">
                    <Input v-model="formModal.fields.className" placeholder="请输入名称"/>
                </FormItem>
                <FormItem label="类型" prop="classType">
                    <Select class="towns" v-model="formModal.fields.classType" clearable transfer placeholder="请选择项目状态">
                        <Option v-for="(item, j) in option.types" :key="j" :value="item.value">{{item.label}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="父ID" prop="parentId">
                    <Input v-model="formModal.fields.parentId" placeholder="请输入名称"/>
                </FormItem>
                <div class="flex-row">
                    <div class="shangchuan">图片</div>
                    <div v-if="formModal.fields.classIconFileId" class="demo-upload-list">
                        <img :src="formModal.fields.classIcon" class="adImg"/>
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-eye-outline" @click.native="formModal.showImg = true"></Icon>
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
            <img :src="formModal.fields.classIcon" style="width: 100%">
        </Modal>
    </div>
</template>
<script>
import { autoTest } from '../config';
import curd from '../mixin/curd';
import { Button, Icon } from 'iview';
import { class_sates, class_types } from '../config/module/options.js';
import Class from '../config/module/classification.js';
import { appConfig } from '../config/index.js';
import ZkTable from 'vue-table-with-tree-grid'
import { parseTreeNode } from '../vendor/utils/transform.js';
export default {
    name: 'class',
    mixins: [curd],
    components: {
        ZkTable
    },
    data() {
        return {
            tree: [],
            upLoadUrl: appConfig.baseUrl + '/fileInfo/upload.do',
            upLoadHeader: {
                'Access-Control-Expose-Headers': 'x-shiro-authorization',
                'x-shiro-authorization': this.$session('user').token,
            },
            option: {
                sates: class_sates,
                types: class_types,
                
            },
            condition: {
                className: null,
                classState: null,
                classType: null,
                paginationFlag: false
            },
            curd: {
                searchUrl: Class.list,
                readUrl: Class.get,
                createUrl: Class.save,
                deleteUrl: Class.delete,
                updateUrl: Class.update
            },
            table: {
                columns: [
                    { label: '类别名称', prop: 'className',align: 'left', headerAlign: 'center'},
                    { label: '类别Id', prop: 'classId',align: 'center',headerAlign: 'center'},
                    {
                        label: '操作',
                        align: 'center',
                        headerAlign: 'center',
                        width: 300,
                        type: 'template',
                        template: 'action',
                    }
                ]
            },
            formModal: {
                validate: {
                    className:[
                        {required:true,trigger:'blur',message: '不能为空'}
                    ]
                },
                fields: {
                    parentId: null,
                    className: null,
                    classType: null,
                    classIconFileId: null,
                    classIcon: null
                },
                showImg: false
            }
        }
    },
    watch: {
        'table.data': function () {
            this.tree = parseTreeNode(this.table.data, '0', 'parentId', 'classId');
        }
    },
    methods: {
        toOne () {
            this.$router.push({path: '/login'});
        },
        upLoad (data) {
            if (data.success) {
                Object.assign(this.formModal.fields, {
                    classIconFileId: data.result.fileId,
                    classIcon: data.result.fileAccessUrl
                });
                return this.$Message.success('上传成功！');
            }
            return this.$Message.error('上传失败！');
        },
        removeImg () {
            Object.assign(this.formModal.fields, {
                classIconFileId: null,
                classIcon: null
            });
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


