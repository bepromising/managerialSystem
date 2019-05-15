<template>
    <div class="container">
        <section class="filter box" style="background-color:#fff;">
            <li class="item">
                <i>等级名</i>
                <Input v-model="condition.levelValue" placeholder="输入" class="fill" clearable/>
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
        <Modal v-model="formModal.show" width="600" closable @on-ok="save" :title="formModal.title">
            <Form ref="formModal" :model="formModal.fields" :label-width="120" style="width:94%" :rules="formModal.validate">
                <FormItem label="等级名" prop="levelValue">
                    <Input placeholder="请输入" v-model="formModal.fields.levelValue" />
                </FormItem>
                <FormItem label="会员等级Id" prop="levelId">
                    <Input placeholder="会员等级1就填1，会员等级2就填2，以此类推" v-model="formModal.fields.levelId" :readonly="formModal.edit" />
                </FormItem>
                <!-- <FormItem label="状态" prop="levelState">
                    <Select v-model="formModal.fields.levelState" transfer placeholder="请选择">
                        <Option v-for="(vo,k) in option.states" :key="k" :value="vo.value">{{vo.label}}</Option>
                    </Select>
                </FormItem> -->
                <FormItem label="等级优惠折扣" prop="defaultDiscount">
                    <Input number placeholder="请输入折扣，例如 9折就填 0.9" v-model="formModal.fields.defaultDiscount" />
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>
<script>
import curd from '../mixin/curd';
import { Button, Icon } from 'iview';
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
              ]  
            },
            curd: {
                searchUrl: Level.list,
                readUrl: Level.get,
                createUrl: Level.save,
                deleteUrl: Level.delete,
                updateUrl: Level.update
            },
            table: {
                columns: [
                    { type: 'index', title: '序号', width: 80, align: 'center' },
                    { title: '等级名', key: 'levelValue',align:'center' },
                    { title: '等级优惠折扣', key: 'defaultDiscount',align:'center' },
                    {
                        type: 'action',
                        title: '操作',
                        align: 'center',
                        width: 300,
                        render: (h, { row }) => {
                            return (<div>
                                <Button type="primary" size="small" shape="circle" icon="md-create" onClick={() => {
                                    this.edit(row, 'levelId');
                                }}></Button>
                            </div>);
                        }
                    }
                ]
            },
            formModal: {
                fields: {
                    levelValue: null,
                    defaultDiscount: null,
                    levelId: null,
                    // levelState: null
                },
                validate: {
                    levelValue: [{required: true, message: '不能为空', trigger: 'blur'}],
                    levelId: [{required: true, message: '不能为空', trigger: 'blur'}],
                    // levelState: [{required: true, message: '不能为空', trigger: 'change'}],
                }
            }
        }
    },
    methods: {
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


