<template>
    <div class="container">
        <section class="filter box" style="background-color:#fff;">
            <li class="item">
                <i>客户名</i>
                <Input v-model="condition.userName" placeholder="输入客户名" class="fill" clearable/>
            </li>
            <li class="item">
                <i>订单号</i>
                <Input v-model="condition.orderId" placeholder="输入订单号" class="fill" clearable/>
            </li>
            <li class="item">
                <i>类型</i>
                <Select v-model="condition.commentType" transfer clearable class="year">
                    <Option v-for="(vo, k) in option.types" :key="k" :value="vo.value">{{vo.label}}</Option>
                </Select>
            </li>
            <li>
                <Button type="primary" shape="circle" icon="ios-search" @click="search"></Button>
            </li>
        </section>
        <section class="box" style="background-color:#fff;">
            <Table stripe :columns="table.columns" :data="table.data" :loading="table.loading"></Table>
            <Page class="page-wrap" :total="table.total" :current="table.current" :page-size="table.size" @on-change="changePage" show-total></Page>
        </section>
        <Modal v-model="formModal.show" width="600" closable @on-ok="save1" :ok-text="formModal.okText" :title="formModal.title">
            <Form ref="formModal" :model="formModal.fields" :label-width="120" style="width:94%" :rules="formModal.validate">
                <FormItem label="客户回复"  v-show="formModal.fields.commentType === '0'">
                    <!-- <Input type="textarea" :rows="5" placeholder="请反馈" v-model="formModal.fields.commentContent" /> -->
                    <span style="font-size: 18px;color:#666;">{{formModal.customerCommet}}</span>
                </FormItem>
                <FormItem label="反馈" prop="commentContent">
                    <Input type="textarea" :rows="5" placeholder="请反馈" v-model="formModal.fields.commentContent" />
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>
<script>
import { autoTest } from '../config';
import curd from '../mixin/curd';
import { Button, Icon } from 'iview';
import Comment from '../config/module/comment.js';
export default {
    name: 'replies',
    mixins: [curd],
    data() {
        return {
            condition: {
                commentType: '0'
            },
            option: {
                types: [
                    {
                        label: '客户评价',
                        value: '0'
                    },
                    {
                        label: '运营反馈',
                        value: '1'
                    }
                ]
            },
            curd: {
                searchUrl: Comment.list,
                readUrl: Comment.get,
                createUrl: Comment.save,
                deleteUrl: Comment.delete,
                updateUrl: Comment.update
            },
            table: {
                columns: [
                    { type: 'index', title: '序号', width: 80, align: 'center' },
                    { title: '订单号', key: 'orderId',align:'center' },
                    { title: '时间', key: 'createDt',align:'center' },
                    {
                        type: 'action',
                        title: '操作',
                        align: 'center',
                        width: 300,
                        render: (h, { row }) => {
                            return (<div>
                                <Button type="primary" size="small" shape="circle" icon="md-create" onClick={() => {
                                    this.read(row, 'commentId',this.changeOption);
                                }}></Button>
                                <Button style="margin:0 8px;" size="small" shape="circle" type="error" icon="md-close" onClick={() => {
                                    this.delete(row, 'commentId');
                                }}></Button>
                            </div>);
                        }
                    }
                ]
            },
            formModal: {
                title: '编辑',
                okText: '新增反馈',
                fields: {
                    commentContent: null
                },
                validate: {
                    commentContent: [{required: true, message: '不能为空', trigger: 'blur'}],
                }
            }
        }
    },
    methods: {
        changeOption () {
            let type = this.formModal.fields.commentType;
            if (type === '0') {
                this.formModal.title = '查看';
                this.formModal.okText = '新增反馈';
                this.formModal.customerCommet = this.formModal.fields.commentContent;
                this.formModal.fields.commentContent = '';
                this.formModal.edit = false;
            } else  {
                this.formModal.title = '更新';
                this.formModal.okText = '更新反馈';
                this.formModal.edit = true;
            }
        },
        save1(callback) {
            this.$refs.formModal.validate((valid) => {
                if (valid) {
                    let message = this.formModal.edit ? '保存成功' : '新增成功';
                    let {orderId, commentContent} = this.formModal.fields;
                    this.$http({
                        method: 'post',
                        url: this.formModal.edit ? this.curd.updateUrl : this.curd.createUrl,
                        data: {
                            orderId, commentContent
                        }
                    }).then(
                        ({ data }) => {
                            if (data.success) {
                                this.$Message.success(message);
                                this.formModal.show = false;
                                this.search();
                                if(callback){
                                    callback();
                                }
                            } else {
                                this.$Modal.error({
                                    title: '系统提示',
                                    content: data.error.message
                                });
                            }
                        },
                        (error) => {
                            this.$Message.error('请求失败，请稍候重试！');
                        }
                    );
                } else {
                    this.$Message.error('请检查是否存在字段未通过验证！');
                }
            });
        },
        
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
</style>


