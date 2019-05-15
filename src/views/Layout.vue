<template>
    <section class="wrap" :class="{hide:!menu.status}" ref="mainWrap">
        <header class="header">
            <i class="logo">综合管理系统</i>
            <div class="loginInfo">
                <Dropdown trigger="click" @on-click="dropDownHandler">
                    <a href="javascript:void(0)">
                        欢迎您，{{user.name}}
                        <Icon type="md-arrow-dropdown" size="18" />
                    </a>
                    <DropdownMenu slot="list">
                        <DropdownItem name="logout">
                            <Icon type="md-log-out"></Icon> 安全退出</DropdownItem>
                        <!-- <DropdownItem name="changePassword">
                            <Icon type="md-unlock"></Icon> 修改密码</DropdownItem> -->
                    </DropdownMenu>
                </Dropdown>
            </div>
        </header>
        <section class="leftMenu" :class="{hide:!menu.status}" ref="leftMenu">
            <Menu theme="dark" width="auto" id="leftMenu" @on-select="refreshTabs" :open-names="menu.openNames" :active-name="menu.activeName" ref="menuComponent" v-if="menu.tree.length > 0">
                <template v-for="level1 in menu.tree">
                    <Submenu :key="level1.id" :name="level1.id" v-if="level1.children">
                        <template slot="title">
                            <Icon :type="level1.icon" size="14"></Icon>{{level1.name}}</template>
                        <template v-for="level2 in level1.children">
                            <Submenu :key="level2.id" :name="level2.id" v-if="level2.children">
                                <template slot="title">
                                    <Icon :type="level2.icon" size="14"></Icon>{{level2.name}}</template>
                                <MenuItem v-for="level3 in level2.children" :name="level3.id" class="menuLink" :key="level3.id" :to="level3.url||''">
                                    <Icon :type="level3.icon"></Icon> {{level3.name}}
                                </MenuItem>
                            </Submenu>
                            <MenuItem v-else :name="level2.id" class="menuLink" :key="level2.id" :to="level2.url||''">
                                <Icon :type="level2.icon" :key="level2.id"></Icon> 
                                {{level2.name}}
                            </MenuItem>
                        </template>
                    </Submenu>
                    <MenuItem v-else :key="level1.id" :name="level1.id" class="menuLink" :to="level1.url||''">
                        <Icon :type="level1.icon" size="14" :key="level1.id"></Icon> 
                        {{level1.name}}
                    </MenuItem>
                </template>
            </Menu>
        </section>
        <div class="menuMin" @click="toggleMenu" :class="{hide:!menu.status}">
            <Icon :type="menu.status === true ? 'ios-arrow-back' : 'ios-arrow-forward'"></Icon>
        </div>
        <section class="mainContent" :class="{scrollDisable:loading, tabEnabled:tabs.enabled}">
            <transition name="fade">
                <div class="loading" v-if="loading"><img src="../assets/loading.gif"></div>
            </transition>
            <transition name="fade">
                <div class="tabsRightMenu" v-if="tabs.popMenu.show" :style="tabs.popMenu.style">
                    <i v-for="(vo,index) in tabs.popMenu.data" :key="index" @click="closeTabs(vo.action)">{{vo.name}}</i>
                </div>
            </transition>
            <div class="mask" @click="clickMask" v-if="tabs.popMenu.show"></div>
            <div class="tabsWrap" v-if="tabs.data.length > 0 && tabs.enabled" ref="tabs">
                <Icon type="chevron-left" class="scroll-btn prev" v-show="tabs.showScrollPrev" @click.native="tabPrev"></Icon>
                <ul :style="{minWidth:tabs.width+'px',marginLeft:tabs.scrollLeft+'px'}">
                    <li v-for="vo in tabs.data" :class="{act:vo.act}" @click.self="refreshTabs(vo.id)" :key="vo.id" @contextmenu.self.prevent="showPopMenu">{{vo.title}}
                        <Icon type="md-close" class="icon" size="12" @click.native="closeTab(vo.id)"></Icon>
                    </li>
                </ul>
                <Icon type="chevron-right" class="scroll-btn next" v-show="tabs.showScrollNext" @click.native="tabNext"></Icon>
            </div>
            <section class="viewWrap" :class="{tabEnabled:tabs.enabled}">
                <keep-alive>
                    <router-view v-if="tabs.enableTab && $route.meta.keepAlive"></router-view>
                </keep-alive>
                <router-view v-if="!tabs.enableTab || !$route.meta.keepAlive"></router-view>
            </section>
        </section>
    </section>
</template>
<script>
import { layout } from '../mode/token.js';
import {parseTreeNode, clone} from '../vendor/utils/transform';
import { mapState } from 'vuex';
import { appConfig } from '../config';
export default {
    data() {
        return {
            mainWidth: 0,
            menu: {
                status: true,
                width: 0,
                data: [],
                tree: [],
                openNames: [],
                activeName: null
            },
            user: {
                name: this.$session('user').name
            },
            tabs: {
                data: [],
                width: '100%',
                enabled: appConfig.tabs.enabled,
                showScrollNext: false,
                showScrollPrev: false,
                scrollLeft: 0,
                popMenu: {
                    show: false,
                    style: {},
                    data: [
                        { name: '关闭当前', action: 'current' },
                        { name: '关闭其他', action: 'others' },
                        { name: '关闭全部', action: 'all' }
                    ]
                }
            }
        };
    },
    computed: {
        ...mapState({
            loading: state => state.system.loading,
            menuState: state => state.system.menuState
        })
    },
    mixins: [layout],
    methods: {
        toggleMenu() {
            this.menu.status = !this.menu.status;
        },
        showPopMenu(event) {
            Object.assign(this.tabs.popMenu, {
                show: true,
                style: {
                    left: event.clientX + 'px',
                    top: event.clientY + 'px'
                }
            });
        },
        clickMask() {
            this.tabs.popMenu.show = false;
        },
        activeTab(id) {
            let currentRoute = this.menu.data.find(vo => vo.id === id);
            if (currentRoute.url) {
                let currentTab = this.tabs.data.find(vo => vo.id === id);
                this.tabs.data.forEach(vo => {
                    vo.act = false;
                });
                this.currentMenu = id;
                if (!currentTab) {
                    this.tabs.data.push({
                        title: currentRoute.name,
                        id: currentRoute.id,
                        act: true,
                        url: currentRoute.url,
                        index: this.tabs.data.length,
                        //这里是匹配路由的name，现在因为路由只有一层直接使用url，而且定义路由时候name需要跟url一样
                        name: currentRoute.url ? currentRoute.url.replace('-', ',') : currentRoute.name
                    });
                    this.$nextTick(function () {
                        this.setKeepAlive(id, true);
                    });
                } else {
                    currentTab.act = true;
                }
                this.$router.push(currentRoute.url);
            }
        },
        refreshTabs(id) {
            if (!appConfig.tabs.enabled) { return false; }
            let currentTab = this.tabs.data.find(vo => vo.id === id);
            if (this.tabs.data.length >= appConfig.tabs.max && !currentTab) {
                switch (appConfig.tabs.handlerType) {
                    //0不作任何提示，1每次新增窗口警告， 2确认框形式，让用户选择新开还是覆盖 3直接覆盖
                    case 1:
                        this.$Message.warning('您当前打开窗口过多，会影响系统性能！');
                        this.activeTab(id);
                        break;
                    case 2:
                        this.$Modal.confirm({
                            width: 500,
                            title: '系统提示',
                            content: '您当前打开窗口过多，会影响系统性能！',
                            okText: '覆盖',
                            cancelText: '新开',
                            closable: true,
                            onOk: () => {
                                this.tabs.data.splice(0, 1);
                                this.activeTab(id);
                            },
                            onCancel: () => {
                                this.activeTab(id);
                            }
                        });
                        break;
                    case 3:
                        this.tabs.data.splice(0, 1);
                        this.activeTab(id);
                        break;
                }
            } else {
                this.activeTab(id);
            }
            let tabWidth = 20,
                tabIndex = this.tabs.data.findIndex(vo => vo.id === id),
                currentTabLeft = 0;
            this.tabs.data.forEach((vo, index) => {
                tabWidth += (vo.title.length * 14 + 56);
                if (index === tabIndex) {
                    currentTabLeft = tabWidth;
                }
            });
            if (this.mainWidth > 0 && tabWidth > this.mainWidth) {
                this.tabs.showScrollNext = true;
            }
            if (currentTabLeft > this.mainWidth) {
                this.tabs.scrollLeft = -(currentTabLeft - 58 - this.mainWidth);
                this.tabs.showScrollPrev = true;
            }
            this.tabs.width = tabWidth;
        },
        setKeepAlive(id, state) {
            let layout = this.$router.options.routes.find(vo => vo.name === 'Layout'),
                _route = this.tabs.data.find(vo => vo.id === id);
            if (layout && _route) {
                let _currentRoute = layout.children.find(vo => vo.name === _route.name);
                if (_currentRoute) {
                    _currentRoute.meta.keepAlive = state;
                }
            }
        },
        closeTabs(action) {
            switch (action) {
                case 'current':
                    this.closeTab(this.currentMenu);
                    break;
                case 'all':
                    this.tabs.data = [];
                    Object.assign(this.tabs, {
                        width: '100%',
                        showScrollNext: false,
                        showScrollPrev: false,
                        scrollLeft: 0
                    });

                    break;
                case 'others':
                    this.tabs.data = this.tabs.data.filter(vo => vo.id === this.currentMenu);
                    Object.assign(this.tabs, {
                        width: '100%',
                        scroll: 0,
                        showScrollNext: false,
                        showScrollPrev: false,
                        scrollLeft: 0
                    });
                    this.currentMenu = this.tabs.data[this.tabs.data.length - 1].id;
                    break;
            }
            this.tabs.popMenu.show = false;
        },
        closeTab(id) {
            this.setKeepAlive(id, false);
            this.tabs.data = this.tabs.data.filter(vo => vo.id !== id);
            if (this.tabs.data.length > 0) {
                let lastTab = this.tabs.data[this.tabs.data.length - 1];
                this.$router.push(lastTab.url);
                lastTab.act = true;
                this.currentMenu = lastTab.id;
            }
        },
        tabNext() {
            let scrollLeft = this.tabs.width + this.tabs.scrollLeft - this.mainWidth;
            if (scrollLeft > 0) {
                if (scrollLeft > this.mainWidth) {
                    this.tabs.scrollLeft = -this.mainWidth + this.tabs.scrollLeft;
                } else {
                    this.tabs.scrollLeft = -(this.tabs.width - this.mainWidth + 10);
                    this.tabs.showScrollNext = false;
                }
            }
            this.tabs.showScrollPrev = true;
        },
        tabPrev() {
            if (this.tabs.scrollLeft + this.mainWidth < 0) {
                this.tabs.scrollLeft += this.mainWidth;
                this.tabs.showScrollNext = true;
            } else {
                this.tabs.scrollLeft = 0;
                this.tabs.showScrollNext = true;
                this.tabs.showScrollPrev = false;
            }
        },
        initLayout(data) {
            let _data = [];
            data.forEach(vo => {
                _data.push({id: vo.resourceId, name: vo.resourceName,sort: vo.resourceSort,url: vo.resourceUrl, state: vo.resourceState, type: vo.resourceType, parentId: vo.parentId});
            });
            this.menu.data = clone(_data);
            this.menu.tree = parseTreeNode(_data, '0');
        },
        findCurrentRoute() {
            let initRoute = this.menu.data.find(vo => vo.url === this.$router.currentRoute.path);
            if (initRoute) {
                let _parentId = initRoute.parentId,
                    currentItem = null,
                    moduleID = initRoute.id;
                while (_parentId !== '0') {
                    currentItem = this.menu.data.find(vo => _parentId === vo.id);
                    _parentId = currentItem.parentId;
                    moduleID = currentItem.id;
                }
                Object.assign(this.menu, {
                    activeName: initRoute.id,
                    openNames: [moduleID]
                });
                this.refreshTabs(initRoute.id);
            }
        }
    },
    watch: {
        '$route': function () {
            this.findCurrentRoute();
        },
        //tabs数据为空时候的统一处理
        'tabs.data': function (newVal) {
            if (newVal.length === 0) {
                this.$router.push('/');
                Object.assign(this.menu, {
                    openNames: [],
                    activeName: null
                });
            }
        }
    },
    mounted() {
        this.mainWidth = this.$refs.mainWrap.clientWidth;
        this.menu.width = this.$refs.leftMenu.clientWidth;
    }

}
</script>
<style lang="scss" src="../style/index.scss"></style>




