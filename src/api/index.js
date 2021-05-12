import Vue from 'vue';
import axios from 'axios';

Vue.prototype.$http = axios;
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';


// 登录
export const login = (loginObj) => {
  axios.post('login', {username:loginObj.username,password:loginObj.password})
}