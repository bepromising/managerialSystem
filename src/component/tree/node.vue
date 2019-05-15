<template>
    <collapse-transition>
        <ul :class="classes">
            <li>
                <div :draggable="moveable ? true : false" @dragstart="dragstart($event,data.id)" @drop="drop($event,data)" @dragover="dragover">
                <template v-if="isFolder">
                    <span class="ico" :class="arrowClasses" @click="handleExpand">
                        <Icon v-if="showArrow" type="md-arrow-dropright" size="16" class="ico"></Icon>
                        <Icon v-if="showLoading" type="ios-loading" class="ivu-load-loop"></Icon>
                    </span>
                    <Icon :type="data.icon||'md-folder'" size="16" class="ico"></Icon>
                </template>
                <template v-else>
                    <Icon :type="data.icon||'md-document'" size="16" class="ico"></Icon>
                </template>
                <Checkbox
                        v-if="showCheckbox"
                        :value="data.checked"
                        :indeterminate="data.indeterminate"
                        :disabled="data.disabled || data.disableCheckbox"
                        @click.native.prevent="handleCheck"></Checkbox>
                <Render v-if="data.render" :render="data.render" :data="data" :node="node"></Render>
                <Render v-else-if="isParentRender" :render="parentRender" :data="data" :node="node"></Render>
                <span v-else :class="titleClasses" @click="handleSelect" @contextmenu.prevent="contextMenu">{{ data.title }}</span>
                </div>
                <Tree-node
                        v-if="data.expand"
                        v-for="(item, i) in data.children"
                        :key="i"
                        :data="item"
                        :multiple="multiple"
                        :moveable="moveable"
                        :show-checkbox="showCheckbox">
                </Tree-node>
            </li>
        </ul>
    </collapse-transition>
</template>
<script>
    import {Icon,Checkbox} from 'iview';
    import Render from './render';
    import CollapseTransition from './collapseTransition';
    import Emitter from './emitter';
    import { findComponentUpward } from './functions';

    const prefixCls = 'ivu-tree';

    export default {
        name: 'TreeNode',
        mixins: [ Emitter ],
        components: { Checkbox, Icon, CollapseTransition, Render },
        props: {
            data: {
                type: Object,
                default () {
                    return {};
                }
            },
            multiple: {
                type: Boolean,
                default: false
            },
            showCheckbox: {
                type: Boolean,
                default: false
            },
            moveable:{
                type:Boolean,
                default:false
            }
        },
        data () {
            return {
                prefixCls: prefixCls,
                rightMenu:{
                    show:false,
                    style:{}
                },
                moveData:{
                    slient:false,
                    current:null
                }
            };
        },
        computed: {
            classes () {
                return [
                    `${prefixCls}-children`
                ];
            },
            selectedCls () {
                return [
                    {
                        [`${prefixCls}-node-selected`]: this.data.selected
                    }
                ];
            },
            arrowClasses () {
                return [
                    `${prefixCls}-arrow`,
                    {
                        [`${prefixCls}-arrow-disabled`]: this.data.disabled,
                        [`${prefixCls}-arrow-open`]: this.data.expand
                    }
                ];
            },
            titleClasses () {
                return [
                    `${prefixCls}-title`,
                    {
                        [`${prefixCls}-title-selected`]: this.data.selected
                    }
                ];
            },
            showArrow () {
                return (this.data.children && this.data.children.length) || ('loading' in this.data && !this.data.loading);
            },
            showLoading () {
                return 'loading' in this.data && this.data.loading;
            },
            isParentRender () {
                const Tree = findComponentUpward(this, 'Tree');
                return Tree && Tree.render;
            },
            parentRender () {
                const Tree = findComponentUpward(this, 'Tree');
                if (Tree && Tree.render) {
                    return Tree.render;
                } else {
                    return null;
                }
            },
            node () {
                const Tree = findComponentUpward(this, 'Tree');
                if (Tree) {
                    // 将所有的 node（即flatState）和当前 node 都传递
                    return [Tree.flatState, Tree.flatState.find(item => item.nodeKey === this.data.nodeKey)];
                } else {
                    return [];
                }
            },
            isFolder: function () {
                return parseInt(this.data.isFolder)===1||(this.data.children &&
                    this.data.children.length);
            }
        },
        methods: {
            handleExpand () {
                const item = this.data;
                if (item.disabled) return;

                // async loading
                if (item.children.length === 0) {
                    const tree = findComponentUpward(this, 'Tree');
                    if (tree && tree.loadData) {
                        this.$set(this.data, 'loading', true);
                        tree.loadData(item, children => {
                            this.$set(this.data, 'loading', false);
                            if (children.length) {
                                this.$set(this.data, 'children', children);
                                this.$nextTick(() => this.handleExpand());
                            }
                        });
                        return;
                    }
                }

                if (item.children && item.children.length) {
                    this.$set(this.data, 'expand', !this.data.expand);
                    this.dispatch('Tree', 'toggle-expand', this.data);
                }
            },
            handleSelect () {
                if (this.data.disabled) return;
                this.dispatch('Tree', 'on-selected', this.data.nodeKey);
            },
            handleCheck () {
                if (this.data.disabled) return;
                const changes = {
                    checked: !this.data.checked && !this.data.indeterminate,
                    nodeKey: this.data.nodeKey
                };
                this.dispatch('Tree', 'on-check', changes);
            },
            contextMenu(event){
                this.dispatch('Tree','right-click',{
                    target:event,
                    node:this.data
                });
            },
            dragstart(event,id){
                event.dataTransfer.setData('current',id);
            },
            drop(event,node){
                let current=event.dataTransfer.getData('current'),
                isFolder=parseInt(node.isFolder)===1;
                if(!this.moveData.slient && isFolder){
                    this.$Modal.confirm({
                        title:'系统提示',
                        onOk:()=>{
                            this.dispatch('Tree','move-node',{
                                to:node.id,
                                current:current
                            });
                        },
                        render:(h)=>{
                            return (
                                <div class="modal-content">
                                    您是否确定要移动此节点至<b>{node.name}</b>？
                                    <div class="move-confirm-tip" onClick={(event)=>{
                                        let input=event.target.tagName==='DIV'?event.target.querySelector('input[type="checkbox"]'):event.target;
                                        this.moveData.slient=input.checked;
                                    }}>
                                        <input type="checkbox" checked={this.moveData.slient}></input> 不再提示
                                    </div>
                                </div>
                            );
                        }
                    });
                }else if(isFolder){
                    this.dispatch('Tree','move-node',{
                        to:node.id,
                        current:current
                    });
                }
            },
            dragover(event){
                if(this.moveable){
                    event.preventDefault();
                }
            }
        },
    };
</script>
<style lang="scss">
    $ico-width: 16px;
    .move-confirm-tip{
        padding:20px 0 0;color: #999;
        input[type="checkbox"]{position: relative;top: 2px;}
    }
    .ivu-tree {
        -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;
        .ico { color: $main-color; width: $ico-width; line-height: 16px; float: left; text-align: center; display: block; height: 16px; }
        .placeHolder { display: block; width: $ico-width+2; height: 16px; }
        ul li { line-height: 16px; }
        .ivu-checkbox-wrapper { margin-right: 0; margin-left: 4px; }
        .ivu-checkbox-input { display: block; float: left; }
    }
    .modal-content{
        padding:15px 0 0;
        b{font-size: 14px;color: #f00;}
        }

</style>