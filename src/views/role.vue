<template>
    <div class="container">
        <section class="filter box" style="background-color:#fff;">
            <li class="item">
                <i>角色名</i>
                <Input v-model="condition.groupName" placeholder="输入姓名" class="fill" clearable/>
            </li>
            <li class="item">
                <i>角色状态</i>
                <Select v-model="condition.groupState" class="dateRange" clearable translate>
                    <Option v-for="(vo, k) in status_arr" :key="k" :value="vo.value">{{ vo.label }}</Option>
                </Select>
            </li>
            <li class="item">
                <i>角色类型</i>
                <Select v-model="condition.groupType" class="dateRange" clearable translate>
                    <Option v-for="(vo, k) in type_arr" :key="k" :value="vo.value">{{ vo.label }}</Option>
                </Select>
            </li>
            <li class="item">
                <Button type="primary" shape="circle" icon="ios-search" @click="search"/>
                <Button type="info" style="margin-left:5px;" shape="circle" icon="md-add" @click="add" />
            </li>
        </section>
        <section class="box" style="background-color:#fff;">
            <Table stripe :columns="table.columns" :data="table.data" :loading="table.loading"></Table>
            <Page class="page-wrap" :total="table.total" :current="table.current" :page-size="table.size" @on-change="changePage" show-total></Page>
        </section>
        <Modal v-model="formModal.show" width="800" :title="formModal.title" closable @on-ok="save">
            <Form ref="formModal" :model="formModal.fields" :label-width="120" style="width:94%" :rules="formModal.validate">
                <FormItem label="角色名" prop="groupName">
                    <Input v-model="formModal.fields.groupName" placeholder="请输入姓名"/>
                </FormItem>
                <FormItem label="唯一码" prop="groupCode">
                    <Input v-model="formModal.fields.groupCode" placeholder="请输入姓名"/>
                </FormItem>
                <FormItem label="父ID" prop="parentId">
                    <Input v-model="formModal.fields.parentId" placeholder="请输入姓名"/>
                </FormItem>
                <FormItem label="角色类型" prop="groupType" placeholder="请选择用户类型">
                    <Select v-model="formModal.fields.groupType" clearable translate>
                        <Option v-for="(vo, k) in type_arr" :key="k" :value="vo.value">{{ vo.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="角色状态" prop="groupState" placeholder="请选择用户状态">
                    <Select v-model="formModal.fields.groupState" clearable translate>
                        <Option v-for="(vo, k) in status_arr" :key="k" :value="vo.value">{{ vo.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="是否有子节点" prop="childNodeFlag" placeholder="请选择">
                    <Select v-model="formModal.fields.childNodeFlag" clearable translate>
                        <Option v-for="(vo, k) in childNodeFlag_arr" :key="k" :value="vo.value">{{ vo.label }}</Option>
                    </Select>
                </FormItem>
                <!-- <FormItem label="备注" prop="remark" placeholder="备注">
                    <Input type="textarea" autosize v-model="formModal.fields.remark" />
                </FormItem> -->
            </Form>
        </Modal>
        <Modal
            v-model="resourceModal.show"
            :title="resourceModal.title"
            :closable="false">
            <Tree ref="resourceTree" style="margin: 50px" :data="resourceModal.data" multiple show-checkbox @on-check-change="checkedResources"></Tree>
            <div slot="footer" class="modal-footer">
                <Button type="success" @click="saveResource" :disabled="!resourceModal.isChecked">保存</Button>
                <Button type="primary" @click="back">返回</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import curd from '../mixin/curd.js';
    import { role_types, role_states, childNodeFlags } from '../config/module/options';
     import { Button, Icon } from 'iview';
     import Group from '../config/module/group';
     import Tree from '../component/tree/tree.vue';

    export default {
        mixins: [curd],
        name: "weekyReportList",
        components: { Tree },
        data () {
            return {
                type_arr: role_types,
                status_arr: role_states,
                childNodeFlag_arr: childNodeFlags,
                curd: {
                    searchUrl: Group.list,
                    readUrl: Group.get,
                    createUrl: Group.save,
                    updateUrl: Group.update,
                    deleteUrl: Group.delete
                },
                table: {
                    columns:[
                        { type: 'index', title: '序号', width: 80, align: 'center' },
                        { key: 'groupName', title: '姓名', align: 'center' },
                        { key: 'groupCode', title: '唯一码', align: 'center' },
                        { key: 'groupStateValue', title: '状态', align: 'center' },
                        { key: 'groupTypeValue', title: '类型', align: 'center' },
                        { type: 'action', title: '操作', align: 'center', render: (h, {row}) => {
                            let style = {marginRight: '5px'};
                                // deleteStyle =parseInt(row.type) === 0 ? style : {...style, display: 'none'};
                            return (<div>
                                <Button type="primary" size="small" shape="circle" icon="md-create" onClick={() => {
                                    this.edit(row,'groupId');
                                }}>编辑</Button>
                                <Button style="margin:0 8px;" size="small" shape="circle" type="error" icon="md-close" onClick={() => {
                                    this.delete(row, 'groupId');
                                }}>删除</Button>
                                 <Button type="success" size="small" style={style} onClick={() => {
                                    this.showResourceModal(row, '1');
                                }}
                                >
                                    资源授权
                                </Button>
                            </div>);
                        } },
                    ]
                },
                formModal: {
                    fields: {
                        groupName: null,
                        groupType: null,
                        groupState: null,
                        parentId: null,
                        groupCode: null,
                        childNodeFlag: null
                    },
                    validate: {
                        groupName: [{required: true, message: '不能为空', trigger: 'blur'}],
                        groupCode: [{required: true, message: '不能为空', trigger: 'blur'}],
                    }
                },
                resourceModal:{
                    show: false,
                    groupId: null,
                    title: null,
                    data: [],
                    resources: [],
                    isChecked: false,
                    api: {
                        list: Group.listGroupResource,
                        save: Group.saveGroupResource,
                    }
                },
            }
        },
        methods: {
            back () {
                this.resourceModal.show = false;
                this.resourceModal.isChecked = false;
            },
            checkedResources (data) {
                this.resourceModal.isChecked = true;
                this.resourceModal.resources = data;
            },
            showResourceModal(row, resourceType) {
                this.$http({
                    method: 'post',
                    url: this.resourceModal.api.list,
                    data: {
                        groupId: row.groupId,
                        // resourceType
                    }
                })
                .then(({data}) => {
                    if (data.success && data.result.length > 0) {
                        Object.assign(this.resourceModal, {
                            show: true,
                            title: '资源授权',
                            groupId: row.groupId,
                            isChecked: false,
                            data: data.result
                        });

                        for (let i = 0; i < this.resourceModal.data.length; i++) {
                            this.resourceModal.data[i].id = this.resourceModal.data[i].resourceId;
                            this.resourceModal.data[i].name = this.resourceModal.data[i].resourceName;
                        }
                    } else {
                        if (data.error.message) return this.$Message.error(data.error.message);
                        this.$Message.info('暂无数据!');
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
            },
            getResourceIds (data) {
                let arr = [];
                for (let i = 0; i< data.length; i++) {
                    arr.push(data[i].resourceId);                    
                }
                return arr;
            },
            saveResource() {
                let data = {};
                data.resourceIds = this.getResourceIds(this.resourceModal.resources);
                data.groupId = this.resourceModal.groupId;
                this.$http({
                    method: 'post',
                    url: this.resourceModal.api.save,
                    data: data
                }).then(({data}) => {
                    if (data.success) {
                        this.$Message.success('保存成功!');
                        Object.assign(this.resourceModal, {
                            show: false,
                            isChecked: false
                        });
                    } else {
                        this.$Message.error('保存失败!' + data.error.message);
                    }
                });
            },
        },
        created () {
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

