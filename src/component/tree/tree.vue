<template>
    <div :class="prefixCls">
        <Tree-node
            v-for="(item, i) in stateTree"
            :key="i"
            :data="item"
            visible
            :multiple="multiple"
            :show-checkbox="showCheckbox"
            :moveable="moveable"
            >
        </Tree-node>
        <div :class="[prefixCls + '-empty']" v-if="!stateTree.length">暂没数据</div>
        <div class="tree-contextMenu" v-if="rightMenu.show" :style="rightMenu.style">
            <a href="javascript:void(0)" @click="addNode(1)" v-if="parseInt(rightMenu.node.isFolder)===1 || rightMenu.node.children"><Icon type="plus-round"></Icon>新增文件夹</a>
            <a href="javascript:void(0)" @click="addNode(0)"><Icon type="md-add"></Icon>新增子节点</a>
            <a href="javascript:void(0)" @click="editNode"><Icon type="md-create"></Icon>编辑</a>
            <a href="javascript:void(0)" @click="removeNode" v-if="!rightMenu.node.children"><Icon type="md-close"></Icon>删除</a>
        </div>
        <div class="tree-menu-mask" v-if="rightMenu.show" @click="closeRightMenu" @contextmenu.prevent="closeRightMenu"></div>
    </div>
</template>
<script>
    import TreeNode from './node.vue';
    import Emitter from './emitter';

    const prefixCls = 'ivu-tree';
    const parseTreeNode = function (nodes, pid,parentKey='parentId') {
        let finalNodes = [], tempNode;
        for (let i = 0, len = nodes.length; i < len; i++) {
            if (nodes[i][parentKey] == pid) {
                let _node = {expand: false, checked: false, lock: false, title: nodes[i].name, ...nodes[i]};
                tempNode = parseTreeNode(nodes,nodes[i].id,parentKey);
                if (tempNode.length > 0) {
                    _node.children = tempNode;
                }
                finalNodes.push(_node);
            }else{
                continue;
            }
        }
        return finalNodes;
    };
    export default {
        name: 'Tree',
        mixins: [ Emitter ],
        components: { TreeNode },
        props: {
            data: {
                type: Array,
                default () {
                    return [];
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
            emptyText: {
                type: String
            },
            loadData: {
                type: Function
            },
            render: {
                type: Function
            },
            emptyText:{
                type:String,
                default:'暂没数据'
            },
            editable: {
                type: Boolean,
                default: false
            },
            moveable:{
                type:Boolean,
                default:false
            },
            firstParent:{
                type:[Number,String],
                default:'0'
            },
            expandWhenParent:{
                type:Boolean,
                default:false
            }
        },
        data () {
            return {
                prefixCls: prefixCls,
                stateTree: parseTreeNode(this.data,this.firstParent),
                flatState: [],
                updateByCheck:false,
                rightMenu:{
                    show:false,
                    style:{},
                    node:null
                }
            };
        },
        watch: {
            data: {
                deep: true,
                handler () {
                    this.stateTree = parseTreeNode(this.data,this.firstParent);
                    this.flatState = this.compileFlatState();
                    this.rebuildTree();
                }
            }
        },
        methods: {
            compileFlatState () { // so we have always a relation parent/children of each node
                let keyCounter = 0;
                const flatTree = [];
                function flattenChildren(node, parent) {
                    node.nodeKey = keyCounter++;
                    flatTree[node.nodeKey] = { node: node, nodeKey: node.nodeKey };
                    if (typeof parent != 'undefined') {
                        flatTree[node.nodeKey].parent = parent.nodeKey;
                        flatTree[parent.nodeKey].children.push(node.nodeKey);
                    }

                    if (node.children) {
                        flatTree[node.nodeKey].children = [];
                        node.children.forEach(child => flattenChildren(child, node));
                    }
                }
                this.stateTree.forEach(rootNode => {
                    flattenChildren(rootNode);
                });
                return flatTree;
            },
            updateTreeUp(nodeKey){
                const parentKey = this.flatState[nodeKey].parent;
                if (typeof parentKey == 'undefined') return;

                const node = this.flatState[nodeKey].node;
                const parent = this.flatState[parentKey].node;
                if (node.checked == parent.checked && node.indeterminate == parent.indeterminate) {
                    return;
                }

                if (node.checked == true) {
                    this.$set(parent, 'checked', parent.children.every(node => node.checked));
                    this.$set(parent, 'indeterminate', !parent.checked);
                } else {
                    this.$set(parent, 'checked', false);
                    this.$set(parent, 'indeterminate', parent.children.some(node => node.checked || node.indeterminate));
                }
                this.updateTreeUp(parentKey);
            },
            rebuildTree () { // only called when `data` prop changes
                const checkedNodes = this.getCheckedNodes();
                checkedNodes.forEach(node => {
                    if(this.updateByCheck===true){
                        this.updateTreeDown(node, {checked: true});
                        this.updateByCheck=false;
                    }
                    // propagate upwards
                    const parentKey = this.flatState[node.nodeKey].parent;
                    if (!parentKey && parentKey !== 0) return;
                    const parent = this.flatState[parentKey].node;
                    const childHasCheckSetter = typeof node.checked != 'undefined' && node.checked;
                    if (childHasCheckSetter && parent.checked != node.checked) {
                        this.updateTreeUp(node.nodeKey); // update tree upwards
                    }
                });
            },

            getSelectedNodes () {
                /* public API */
                return this.flatState.filter(obj => obj.node.selected).map(obj => obj.node);
            },
            getCheckedNodes () {
                /* public API */
                return this.flatState.filter(obj => obj.node.checked || obj.node.indeterminate).map(obj => obj.node);
            },
            updateTreeDown(node, changes = {}) {
                for (let key in changes) {
                    this.$set(node, key, changes[key]);
                }
                if (node.children) {
                    node.children.forEach(child => {
                        this.updateTreeDown(child, changes);
                    });
                }
            },
            handleSelect (nodeKey) {
                const node = this.flatState[nodeKey].node;
                if (!this.multiple){ // reset previously selected node
                    const currentSelectedKey = this.flatState.findIndex(obj => obj.node.selected);
                    if (currentSelectedKey >= 0 && currentSelectedKey !== nodeKey) this.$set(this.flatState[currentSelectedKey].node, 'selected', false);
                }
                if(this.expandWhenParent){
                    node.expand = true;
                }
                this.$set(node, 'selected', !node.selected);
                this.updatePropData();
                this.$emit('on-select-change', this.getSelectedNodes());
            },
            handleCheck({ checked, nodeKey }) {
                const node = this.flatState[nodeKey].node;
                this.$set(node, 'checked', checked);
                this.$set(node, 'indeterminate', false);

                this.updateTreeUp(nodeKey); // propagate up
                this.updateTreeDown(node, {checked, indeterminate: false}); // reset `indeterminate` when going down
                this.updatePropData();
                this.$emit('on-check-change', this.getCheckedNodes());
            },
            closeRightMenu(){
                this.rightMenu.show=false;
            },
            updatePropData(){
                this.flatState.forEach(vo=>{
                    let _current=this.data.find(item=>item.id===vo.node.id);
                    Object.assign(_current,{
                        expand:vo.node.expand,
                        checked:vo.node.checked,
                        selected:vo.node.selected
                    });
                });
            },
            addNode(type){
                this.rightMenu.show=false;
                this.$emit('on-add-node',{
                    node:this.rightMenu.node,
                    isFolder:type||0
                });
            },
            editNode(){
                this.rightMenu.show=false;
                this.$emit('on-edit-node',this.rightMenu.node);
            },
            removeNode(){
                let node=this.rightMenu.node;
                this.$Modal.confirm({
                    title:'删除确认',
                    content:'您是否要删除此节点？',
                    onOk:()=>{
                        this.rightMenu.show=false;
                        this.$emit('on-remove-node',this.rightMenu.node);
                    },
                    onCancel:()=>{
                        //this.rightMenu.show=false;
                    }
                });
            },
        },
        created(){
            this.flatState = this.compileFlatState();
            this.rebuildTree();
        },
        mounted () {
            this.$on('on-check', this.handleCheck);
            this.$on('on-selected', this.handleSelect);
            this.$on('toggle-expand', node => {
                this.updatePropData();
                this.$emit('on-toggle-expand', node);
            });
            this.$on('move-node',(data)=>{
                let currentNode=null,
                nodes=this.flatState.map(vo=>vo.node);
                for(let i=0,len=nodes.length;i<len;i++){
                    if(nodes[i].id===data.current){
                        currentNode=nodes[i];
                        break;
                    }
                }
                if(currentNode&&data.to){
                    currentNode.parentId=data.to;
                     this.$emit('on-move-node',currentNode);
                }
            });
            this.$on('right-click',(data)=>{
                if(this.editable){
                    let nodeKey=data.node.nodeKey;
                    const node = this.flatState[nodeKey].node;
                    if (!this.multiple){ // reset previously selected node
                        const currentSelectedKey = this.flatState.findIndex(obj => obj.node.selected);
                        if (currentSelectedKey >= 0 && currentSelectedKey !== nodeKey) this.$set(this.flatState[currentSelectedKey].node, 'selected', false);
                    }
                    this.$set(node, 'selected', true);
                    this.updatePropData();
                    this.$emit('on-select-change', this.getSelectedNodes());
                    Object.assign(this.rightMenu,{
                        show:true,
                        style:{
                            left:data.target.layerX+'px',
                            top:data.target.layerY+'px'
                        },
                        node:data.node
                    });
                }
            });
        }
    };
</script>
<style lang="scss" scoped>
    .tree-contextMenu{
        width: 120px;position: absolute; left: 0; top: 0; z-index:10;background: #fff;border:1px solid $main-color;
        a{
            display:block;padding:0 0 0 0px;font-size: 14px;cursor: pointer;height: 30px;line-height: 30px;color:$main-color;
            i{display:inline-block;width: 30px;text-align:center;}
            &:hover{background: $main-color;color: #fff;}
        }
    }
    .tree-menu-mask{width: 100%;height: 100%;position: absolute; left: 0; top: 0; z-index:9;}

</style>
