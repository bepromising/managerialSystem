<template>
    <div class="container">
        <section class="filter box" style="background-color:#fff;">
            <li class="item">
                <i>订单号</i>
                <Input v-model="condition.orderId" placeholder="输入订单号" class="fill" clearable/>
            </li>
            <li class="item">
                <i>订单状态</i>
                <Select v-model="condition.orderState" placeholder="输入选择" class="dateRange" clearable transfer>
                    <Option v-for="(vo, k) in options.orderTypes" :key="k" :value="vo.value">{{vo.label}}</Option>
                </Select>
            </li>
            <li>
                <Button type="primary" shape="circle" icon="ios-search" @click="searchData"></Button>
            </li>
        </section>
        <section class="box" style="background-color:#fff;">
            <Table stripe :columns="table.columns" :data="table.data" :loading="table.loading"></Table>
            <Page class="page-wrap" :total="table.total" :current="table.current" :page-size="table.size" @on-change="changePage" show-total></Page>
        </section>
        <Modal v-model="formModal.show" width="900" :title="formModal.title" closable @on-ok="save">
            <Form ref="formModal" :model="formModal.fields" :label-width="120" style="width:94%" :rules="formModal.validate">
                <FormItem label="订单号" prop="orderId">
                    <Input v-model="formModal.fields.orderId" />
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>
<script>
import curd from '../mixin/curd';
import { Button, Icon } from 'iview';
import Order from '../config/module/order.js';
import {order_types} from '../config/module/options.js';

export default {
    name: 'orders',
    mixins: [curd],
    data() {
        return {
            options: {
                orderTypes: order_types
            },
            condition: {
                orderId: null,
                month: null
            },
            curd: {
                searchUrl: Order.list,
                readUrl: Order.get,
                deleteUrl: Order.cancel,
                confirm: Order.confirm,
                deliver: Order.deliver,
            },
            table: {
                columns: [
                    // { type: 'index', title: '序号', width: 80, align: 'center' },
                    { title: '订单号', key: 'orderId',align: 'center' },
                    { title: '状态', key: 'orderType' ,align: 'center'},
                    { title: '创建时间', key: 'createDt',align: 'center' },
                    { title: '支付时间', key: 'payDt',align: 'center' },
                    { title: '金额（元）', key: 'orderFee',align: 'center' },
                    {
                        type: 'action',
                        title: '操作',
                        align: 'center',
                        render: (h, { row }) => {
                            let orderState = row.orderState;
                            return (<div>
                                <Button style="margin:0 8px;"
                                    v-show={orderState !== '99'}
                                    type="error"  size="small" shape="circle" onClick={() => {
                                    this.cancel(row, 'orderId');
                                }}>取消订单</Button>
                                <Button style="margin:0 8px;" v-show={orderState === '2'}  size="small" shape="circle" type="warning" onClick={() => {
                                    this.deliver(row, 'orderId');
                                }}>发货</Button>
                                <Button style="margin:0 8px;" v-show={orderState === '1'} size="small" shape="circle" type="success" onClick={() => {
                                    this.confirm(row, 'orderId');
                                }}>确认订单</Button>
                            </div>);
                        }
                    }
                ]
            },
            formModal: {
                edit: false,
                validate: {
                    orderId:[
                        {required:true,trigger:'blur'}
                    ]
                },
                fields: {
                    orderId: null,
                    address: null,
                    man: null,
                    phone: null
                },
                statusArr: ['未付款', '已关闭', '已完成']
            }
        }
    },
    methods: {
        confirm (row, idName = 'id') {
            this.$http({
                method: 'post',
                url: this.curd.confirm,
                data: {
                    [idName]: row[idName]
                }
            }).then(
                ({ data }) => {
                    if (data.success) {
                        this.searchData();
                    } else {
                        this.$Modal.error({ title: '系统提示', content: data.error.message });
                    }
                },
                (error) => {
                    this.$Message.error('请求失败，请稍候重试！');
                }
            );
        },
        cancel (row, idName = 'id') {
            this.$http({
                method: 'post',
                url: this.curd.deleteUrl,
                data: {
                    [idName]: row[idName]
                }
            }).then(
                ({ data }) => {
                    if (data.success) {
                        this.searchData();
                    } else {
                        this.$Modal.error({ title: '系统提示', content: data.error.message });
                    }
                },
                (error) => {
                    this.$Message.error('请求失败，请稍候重试！');
                }
            );
        },
        deliver (row, idName = 'id') {
            this.$http({
                method: 'post',
                url: this.curd.deliver,
                data: {
                    [idName]: row[idName]
                }
            }).then(
                ({ data }) => {
                    if (data.success) {
                        this.searchData();
                    } else {
                        this.$Modal.error({ title: '系统提示', content: data.error.message });
                    }
                },
                (error) => {
                    this.$Message.error('请求失败，请稍候重试！');
                }
            );
        },
        searchData() {
            this.$http({
                method: 'post',
                url: this.curd.searchUrl,
                data: this.condition
            }).then(
                ({ data }) => {
                    if (data.success) {
                        this.condition.userId = null;
                        Object.assign(this.table, {
                            data: data.result.list,
                            total: data.result.total
                        });
                    } else {
                        Object.assign(this.table, {
                            data: [],
                            total: 0
                        });
                        this.$Modal.error({ title: '系统提示', content: data.error.message });
                    }
                },
                (error) => {
                    this.$Message.error('请求失败，请稍候重试！');
                }
            ).finally(()=>{
                this.table.loading=false;
            });
        },
    },
    created() {
        let userId = this.$route.params.userId;
        if (userId) this.condition.userId = userId;
        this.searchData();
    }
}
</script>

<style lang="less" scoped>
    .box { box-sizing: border-box;padding: 20px;border-radius: 12px;box-shadow: 0 0 4px #ccc;margin-top: 20px;};
    .container {
        width: 100%;height: 100%;overflow:hidden;background: #f2f2f2;padding: 0 20px 20px 20px;
    }
    .product { 
        height: 70px; background-color: #f2f2f2; font-size: 14px; box-sizing: border-box; padding: 4px; border-bottom: 1px solid #ccc; justify-content: space-between;
        .image {
            height: 100%; width: 62px; 
            & > img {width: 100%; height: 100%;}
        }
        p { padding-right: 4px; border-right: 1px solid #ccc;line-height: 28px;height: 100%; width: 280px; overflow: hidden; text-overflow: ellipsis; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; }
        .msg { height: 100%; justify-content: center; align-items: center; padding: 0 10px; }
    }
</style>


