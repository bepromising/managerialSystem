<template>
    <section class="loginContainer">
        <div class="loginWrap">
            <h1>
                综合管理后台</h1>
            <div class="loginBox" @keyup.enter="login">
                <ul>
                    <li>
                        <Icon type="md-person" class="icon" size="20"></Icon>
                        <input type="text" class="fill" placeholder="用户名" name="account" v-model="account" autofocus/>
                    </li>
                    <li>
                        <Icon type="md-lock" class="icon" size="20"></Icon>
                        <input type="password" class="fill" placeholder="密码" name="password" v-model="password" />
                    </li>
                </ul>
                <input type="button" value="提交" class="loginBtn" id="loginNow" @click="login" />
            </div>
        </div>
    </section>
</template>
<script>
import { system } from '../config';
import User from '../config/module/user.js';

export default {
    name: 'Login',
    data() {
        return {
            account: null,
            password: null
        };
    },
    methods: {
        login() {
            window.sessionStorage.clear();
            if (this.account === null || this.password === null) {
                this.$Notice.warning({
                    title: '用户名或密码不能为空',
                    duration: 3
                });
            } else {
                this.$http({
                    method: 'post',
                    url: User.login,
                    data: {
                        userAcct: this.account,
                        userPwd: this.password
                    }
                }).then(({ data }) => {
                    if (!data.success) {
                        this.$Notice.error({
                            title: '用户名或密码错误',
                            duration: 3
                        });
                    } else {
                        let { token, userType, userName, userId, userAcct } = data.result;
                        this.$session('user', {
                            token: token,
                            account: userAcct,
                            userId: userId,
                            name: userName
                        });
                        Object.assign(this.$http.defaults.headers.post, {
                            'Access-Control-Expose-Headers': 'x-shiro-authorization',
                            'x-shiro-authorization': token,
                        });
                        this.$router.push('/');
                    }
                });
            }
        }
    }
}
</script>
<style lang="scss" src="../style/login.scss"></style>
