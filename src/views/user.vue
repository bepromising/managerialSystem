
<template>
    <div class="container">
        <section class="filter box" style="background-color:#fff;">
            <li class="item">
                <i>姓名</i>
                <Input v-model="condition.userName" placeholder="输入姓名" class="fill" clearable/>
            </li>
            <li class="item">
                <i>账号</i>
                <Input v-model="condition.userAcct" placeholder="输入账号" class="fill" clearable/>
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
                <FormItem label="昵称" prop="userName">
                    <Input v-model="formModal.fields.userName" placeholder="请输入姓名"/>
                </FormItem>
                <FormItem label="账号" prop="userAcct">
                    <Input v-model="formModal.fields.userAcct" placeholder="请输入账号"/>
                </FormItem>
                <FormItem label="密码" prop="userPwd">
                    <Input v-model="formModal.fields.userPwd" placeholder="请输入密码" type="password"/>
                </FormItem>
                <FormItem label="用户状态" prop="userState" placeholder="请选择" v-show="formModal.edit">
                    <Select v-model="formModal.fields.userState" clearable translate>
                        <Option v-for="(vo, k) in state_arr" :key="k" :value="vo.value">{{ vo.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="用户类型" prop="userType" placeholder="请选择" v-show="formModal.edit">
                    <Select v-model="formModal.fields.userType" clearable translate>
                        <Option v-for="(vo, k) in type_arr" :key="k" :value="vo.value">{{ vo.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="会员等级" prop="userLevel" clearable placeholder="请选择" v-show="formModal.edit">
                    <Select v-model="formModal.fields.userLevel" clearable translate>
                        <Option v-for="(vo, k) in levels" :key="k" :value="vo.value">{{ vo.label }}</Option>
                    </Select>
                </FormItem>
                <!-- <FormItem label="备注" prop="remark" placeholder="备注">
                    <Input type="textarea" autosize v-model="formModal.fields.remark" />
                </FormItem> -->
            </Form>
        </Modal>
        <Modal
            v-model="roleGroupModal.show"
            :title="roleGroupModal.title"
            :closable="false">
            <Tree ref="roleTree" style="margin: 50px" :data="roleGroupModal.data" multiple show-checkbox @on-check-change="selectChange"></Tree>
            <div slot="footer">
                <Button type="success" @click="saveGroupModal" :disabled="!roleGroupModal.isChecked">保存</Button>
                <Button @click="back">返回</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import curd from '../mixin/curd.js';
    import { user_state, user_types } from '../config/module/options';
    import API from '../config/module/user.js';
    import Tree from '../component/tree/tree.vue';
    import Group from '../config/module/group.js';
    import Level from '../config/module/level.js';
     import { Button, Icon } from 'iview';

    export default {
        mixins: [curd],
        name: "user",
        components: { Tree },
        data () {
            return {
                levels: [],
                state_arr: user_state,
                type_arr: user_types,
                curd: {
                    searchUrl: API.list,
                    readUrl: API.get,
                    createUrl: API.save,
                    updateUrl: API.update,
                    deleteUrl: API.delete
                },
                table: {
                    columns:[
                        { type: 'index', title: '序号', width: 80, align: 'center' },
                        { key: 'userName', title: '姓名', align: 'center' },
                        { key: 'userAcct', title: '账号', align: 'center' },
                        { key: 'userTypeValue', title: '用户类型', align: 'center' },
                        { key: 'userLevelValue', title: '会员等级', align: 'center' },
                        { key: 'userStateValue', title: '状态', align: 'center' },
                        { type: 'action', width:350,title: '操作', align: 'center', render: (h, {row}) => {
                            let style = {marginRight: '5px'},
                                deleteStyle = parseInt(row.state) === 0 ? style : {
                                    ...style,
                                    display: 'none'
                                };
                            return (<div>
                                <Button type="primary" size="small" shape="circle" icon="md-create" onClick={() => {
                                    this.edit(row, 'userId');
                                }}>编辑</Button>
                                <Button style="margin:0 8px;" size="small" shape="circle" type="error" icon="md-close" onClick={() => {
                                    this.delete(row, 'userId');
                                }}>删除</Button>
                                <Button type='success' size='small' shape="circle" style={style} onClick={() => {
                                    this.showModal(row, '0');
                                }}>设置角色</Button>
                                <Button type='warning' size='small' shape="circle" style={style} onClick={() => {
                                    this.showOrders(row);
                                }}>消费记录</Button>
                            </div>);
                        } },
                    ]
                },
                formModal: {
                    fields: {
                        userName: null,
                        userAcct: null,
                        userState: null,
                        userTypeValue: null,
                        userType: null,
                        userStateValue: null
                    },
                    validate: {
                        // userName: [{required: true, message: '不能为空', trigger: 'blur'}],
                        // userAcct: [{required: true, message: '不能为空', trigger: 'blur'}],
                        // passwd: [{required: true, message: '不能为空', trigger: 'blur'}],
                    }
                },
                roleGroupModal: {
                    show: false,
                    title: null,
                    api: {
                        list: Group.listUserGroup,
                        save: Group.saveUserGroup
                    },
                    fields: {
                        userId: null,
                        groupType: null
                    },
                    data: [],
                    selectNodes: [],
                    isChecked: false
                }
            }
        },
        watch: {
            'formModal.fields.userType': function () {
                if (this.formModal.fields.userType === '1') {
                    this.formModal.fields.userTypeValue = '运营人员';
                } else {
                    this.formModal.fields.userTypeValue = '普通用户';
                }
            },
            'formModal.fields.userState': function () {
                if (this.formModal.fields.userState === '1') {
                    this.formModal.fields.userStateValue = '启用';
                } else {
                    this.formModal.fields.userStateValue = '停用';
                }
            }
        },
        methods: {
            showOrders (row) {
                this.$router.push({ 
                    name: 'orders',
                    params: {
                        userId: row.userId
                    }
                });
            },
            saveGroupModal () {
                let data = {
                    userId: this.roleGroupModal.fields.userId,
                    groupType: this.roleGroupModal.fields.groupType,
                };

                data.groupIds = this.roleGroupModal.selectNodes.map(item => item.groupId );

                this.$http({
                    method: 'post',
                    url: this.roleGroupModal.api.save,
                    data: data
                }).then( ({data}) => {
                    if (data.success) {
                        Object.assign(this.roleGroupModal, {
                            show: false,
                            title: null,
                            selectNodes: [],
                            data: [],
                            isChecked: false
                        });
                        this.$Message.success('保存成功！');
                    } else {
                        this.$Message.error('提交失败!' + data.error.errorMessage);
                    }
                });
            },
            back () {
                this.roleGroupModal.show = false;
                this.roleGroupModal.isChecked = false;
            },
            selectChange (data) {
                this.roleGroupModal.isChecked = true;
                this.roleGroupModal.selectNodes = data;
            },
            showModal(row, type) {
                this.$http({
                    method: 'post',
                    url: this.roleGroupModal.api.list,
                    data: {
                        userId: row.userId, type
                    }
                })
                .then(({data}) => {
                    if (data.success && data.result.length > 0) {
                        this.roleGroupModal.fields.userId = row.userId;
                        this.roleGroupModal.fields.groupType = type;
                        Object.assign(this.roleGroupModal, {
                            show: true,
                            title: type === '0'? '设置角色' : '设置部门',
                            data: data.result,
                            selectNodes: [],
                            isChecked: false
                        })

                        for (let i = 0; i < this.roleGroupModal.data.length; i++) {
                            this.roleGroupModal.data[i].id = this.roleGroupModal.data[i].groupId;
                            this.roleGroupModal.data[i].name = this.roleGroupModal.data[i].groupName;
                        }
                    } else {
                        if (data.error.errorMessage) return this.$Message.error(data.error.errorMessage);
                        this.$Message.info('暂无数据!');
                    }
                }).catch(function (error) {
                    console.log(error);
                });
            },
            getLevels () {
                this.$http({
                    method: 'post',
                    url: Level.list,
                    data: {
                        paginationFlag: false,
                        levelState: '1'
                    }
                }).then(
                    ({ data }) => {
                        if (data.success) {
                            data.result.list.map(vo => {
                                this.levels.push({label:vo.levelValue,value: vo.levelId});
                            });
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
        created () {
            this.search();
            this.getLevels();
        }
    }
</script>


<style lang="less" scoped>
    .box { box-sizing: border-box;padding: 20px;border-radius: 12px;box-shadow: 0 0 4px #ccc;margin-top: 20px;};
    .container {
        width: 100%;height: 100%;overflow:hidden;background: #f2f2f2;padding: 0 20px 20px 20px;
    }
</style>

