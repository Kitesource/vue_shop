import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式
import './assets/css/global.css';


import axios from 'axios';
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
Vue.prototype.$http = axios;
// 请求拦截器
axios.interceptors.request.use(config => {
  // config 是请求对象
  config.headers.Authorization = window.sessionStorage.getItem('token');
  // 最后必须return config
  return config;
})

Vue.config.productionTip = false;

Vue.component('tree-table', TreeTable);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
