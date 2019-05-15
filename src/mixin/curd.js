import { resetObject } from '../vendor/utils/object';
import {downloadFileByBlob} from '../vendor/utils/index';
export default {
    data() {
        return {
            curd: {
                searchUrl: null,
                readUrl: null,
                createUrl: null,
                updateUrl: null,
                deleteUrl: null
            },
            condition: {

            },
            ownButtons: {

            },
            table: {
                columns: [],
                data: [],
                size: 10,
                current: 1,
                total: 0,
                loading:true
            },
            formModal: {
                edit: false,
                show: false,
                title: null,
            }
        };
    },
    methods: {
        search() {
            this.$http({
                method: 'post',
                url: this.curd.searchUrl,
                data: this.condition
            }).then(
                ({ data }) => {
                    if (data.success) {
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
        add(defaultValue = {}) {
            this.$refs.formModal.resetFields();
            if(Object.prototype.toString.call(defaultValue)=='[object Object]'){
                for (let key in defaultValue) {
                    this.formModal.fields[key] = defaultValue[key];
                }
            }
            Object.assign(this.formModal, {
                edit: false,
                show: true,
                title: '新增'
            });
        },
        edit(row, idName = 'id',callback) {
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
                        if(callback){
                            callback();
                        }
                    } else {
                        this.$Modal.error({ title: '系统提示', content: data.error.message });
                    }
                },
                (error) => {
                    this.$Message.error('请求失败，请稍候重试！');
                }
            );
        },
        delete(row, idName = 'id',callback) {
            this.$Modal.confirm({
                title: '系统提示',
                content: '确定要删除此记录？',
                onOk: () => {
                    this.$http({
                        method: 'post',
                        url: this.curd.deleteUrl,
                        data: {
                            [idName]: row[idName]
                        }
                    }).then(
                        ({ data }) => {
                            if (data.success) {
                                this.$Message.success('成功删除记录！');
                                if(callback){
                                    callback();
                                }
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
                }
            });
        },
        save(callback) {
            this.$refs.formModal.validate((valid) => {
                if (valid) {
                    let message = this.formModal.edit ? '保存成功' : '新增成功';
                    this.$http({
                        method: 'post',
                        url: this.formModal.edit ? this.curd.updateUrl : this.curd.createUrl,
                        data: this.formModal.fields
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
        changePage(index) {
            this.condition.pageNum=index;
            this.search();
        },
        resetFilter() {
            resetObject(this.table.search);
        },
        reset(form='formModal') {
            this.$refs[form].resetFields();
        },
        exportFile(){
            downloadFileByBlob.apply(this, [{
                url: this.curd.exportUrl,
                data:this.condition,
                fileName:'Api.csv'
            }]);
        },
        findOwnButtons() {
            if (appConfig.buttonsAuth) {
                let menu = this.$session('authMenus'),
                    resource = this.$session('resource'),
                    currentMenu = menu.find(vo => vo.url === this.$route.path),
                    currentResource = resource.filter(vo => vo.parentId === currentMenu.id),
                    _ownBtns = {};
                if (currentResource.length > 0) {
                    currentResource.forEach(vo => {
                        let code = vo.code.split('_').pop();
                        _ownBtns[code] = true;
                    });
                }
                this.$set(this, 'ownButtons', _ownBtns);
            }
        },
        read (row, idName = 'id', callback) {
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
                            edit: false,
                            show: true,
                            title: '查看',
                            fields: data.result
                        });
                        if(callback){
                            callback();
                        }
                    } else {
                        this.$Modal.error({ title: '系统提示', content: data.error.message });
                    }
                },
                (error) => {
                    this.$Message.error('请求失败，请稍候重试！');
                }
            );
        }
    }
}