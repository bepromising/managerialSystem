<template>
    <div class="container">
        <section class="filter box" style="background-color:#fff;">
            <li class="item">
                <i>状态</i>
                <Select v-model="condition.discountState" transfer placeholder="请选择" class="year">
                    <Option v-for="(vo,k) in option.states" :key="k" :value="vo.value">{{vo.label}}</Option>
                </Select>
            </li>
            <li class="item">
                <i>优惠类型</i>
                <Select v-model="condition.discountType" transfer placeholder="请选择" class="dateRange">
                    <Option v-for="(vo,k) in option.types" :key="k" :value="vo.value">{{vo.label}}</Option>
                </Select>
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
        <Modal v-model="formModal.show" width="600" closable @on-ok="save1" :title="formModal.title">
            <Form ref="formModal" :model="formModal.fields" :label-width="120" style="width:94%" :rules="formModal.validate">
                <FormItem label="优惠策略" prop="discountType">
                    <Select v-model="formModal.fields.discountType" transfer placeholder="请选择">
                        <Option v-for="(vo,k) in option.types" :key="k" :value="vo.value">{{vo.label}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="选择商品" prop="goodsId">
                    <Select v-model="formModal.fields.goodsId" transfer placeholder="选择要优惠的商品" filterable>
                        <Option v-for="(vo,k) in option.allProducts" :key="k" :value="vo.value">{{vo.label}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="会员等级" prop="userLevel">
                    <Select v-model="formModal.fields.userLevel" transfer placeholder="选择要优惠的商品" filterable>
                        <Option v-for="(vo,k) in option.levels" :key="k" :value="vo.value">{{vo.label}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="状态" prop="discountState">
                    <Select v-model="formModal.fields.discountState" transfer placeholder="请选择">
                        <Option v-for="(vo,k) in option.states" :key="k" :value="vo.value">{{vo.label}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="结束日期" v-show="formModal.fields.discountType === '1'">
                    <DatePicker type="date" :value="formModal.date" placeholder="选日期" @on-change="changeDate($event)" style="width: 100%;" transfer></DatePicker>
                </FormItem>
                <FormItem label="结束时间" v-show="formModal.fields.discountType === '1'">
                    <TimePicker type="time" v-model="formModal.time" placeholder="选择时间" style="width: 100%;" transfer></TimePicker>
                </FormItem>
                <FormItem label="优惠价格" prop="discountPrice">
                    <Input number placeholder="请输入优惠价格，单位：元" v-model="formModal.fields.discountPrice" />
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>
<script>
import curd from '../mixin/curd';
import { Button, Icon } from 'iview';
import Discount from '../config/module/discount.js';
import Goods from '../config/module/goods.js';
import Level from '../config/module/level.js';
export default {
    name: 'discount',
    mixins: [curd],
    data() {
        return {
            option: {
                states: [
                    {
                        label: '启用',
                        value: '1'
                    },
                    {
                        label: '禁用',
                        value: '0'
                    }
                ],
                types: [
                    {
                        label: '限时优惠策略',
                        value: '1'
                    },
                    {
                        label: '等级折扣策略',
                        value: '0'
                    }
                ],
                allProducts: [],
                levels: []
            },
            curd: {
                searchUrl: Discount.list,
                readUrl: Discount.get,
                updateUrl: Discount.update,
                deleteUrl: Discount.delete
            },
            table: {
                columns: [
                    { type: 'index', title: '序号', width: 80, align: 'center' },
                    { key: 'userLevelValue', title: '会员等级', align: 'center' },
                    { key: 'goodsName', title: '优惠商品', align: 'center' },
                    { title: '优惠策略', key: 'discountType',align:'center',render:(h,{row}) => {
                        let types = ['等级折扣策略', '限时优惠策略'];
                        return(<div>{types[row.discountType]}</div>)
                    } },
                    { title: '优惠状态', key: 'discountState',align:'center',render:(h,{row}) => {
                        let states = ['禁用', '启用'];
                        return(<div>{states[row.discountState]}</div>)}
                    },
                    {
                        type: 'action',
                        title: '操作',
                        align: 'center',
                        width: 300,
                        render: (h, { row }) => {
                            return (<div>
                                <Button type="primary" size="small" shape="circle" icon="md-create" onClick={() => {
                                    this.edit(row, 'discountId',this.editCB);
                                }}></Button>
                                <Button style="margin:0 8px;" size="small" shape="circle" type="error" icon="md-close" onClick={() => {
                                    this.delete(row, 'discountId');
                                }}></Button>
                            </div>);
                        }
                    }
                ]
            },
            formModal: {
                time: null,
                date: null,
                fields: {
                    discountState: null,
                    discountPrice: null,
                    goodsId: null,
                    discountType: null,
                    userLevel: null
                },
                validate: {
                    discountState: [{required: true, message: '不能为空', trigger: 'blur'}],
                    goodsId: [{required: true, message: '不能为空', trigger: 'change'}],
                    userLevel: [{required: true, message: '不能为空', trigger: 'change'}],
                }
            }
        }
    },
    methods: {
        changeDate (value) {
            this.formModal.date = value;
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
                            this.option.allProducts.push({label:vo.goodsName,value: vo.goodsId});
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
        editCB () {
            let arr = this.formModal.fields.discountExpireDt.split(' ');
            this.formModal.date = arr[0];
            this.formModal.time = arr[1];
        },
        save1 () {
            this.$refs.formModal.validate((valid) => {
                if (valid) {
                    console.log(this.formModal.edit);
                    let url;
                    if (this.formModal.edit) {
                        url = this.curd.updateUrl;
                    } else {
                        url = this.formModal.fields.discountType === '1' ? Discount.saveDiscount : Discount.saveLevel;
                    }
                        console.log(url);
                    let message = this.formModal.edit ? '保存成功' : '新增成功';
                    if (this.formModal.fields.discountType === '1') {
                        if (this.formModal.date || this.formModal.time) {
                            this.formModal.fields.discountExpireDt = this.formModal.date + ' ' + this.formModal.time;
                        } else {
                            return this.$Message.error('请选择结束时间！');
                        }
                    }
                    let data = {
                        discountState: this.formModal.fields.discountState,
                        discountPrice: this.formModal.fields.discountPrice,
                        goodsId: this.formModal.fields.goodsId,
                        userLevel: this.formModal.fields.userLevel,
                        discountExpireDt: this.formModal.fields.discountExpireDt
                    }
                    this.$http({
                        method: 'post',
                        url,
                        data
                    }).then(
                        ({ data }) => {
                            if (data.success) {
                                this.$Message.success(message);
                                this.formModal.show = false;
                                this.search();
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
        getLevel () {
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
                            this.option.levels.push({label:vo.levelValue,value: vo.levelId});
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
    created() {
        this.search();
        this.getAllProducts();
        this.getLevel();
    }
}
</script>

<style lang="less" scoped>
    .box { box-sizing: border-box;padding: 20px;border-radius: 12px;box-shadow: 0 0 4px #ccc;margin-top: 20px;};
    .container {
        width: 100%;height: 100%;overflow:hidden;background: #f2f2f2;padding: 0 20px 20px 20px;
    }
</style>


