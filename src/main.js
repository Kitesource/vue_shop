import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid';
import VueQuillEditor from 'vue-quill-editor';
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

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

// 注册主见
Vue.component('tree-table', TreeTable);
Vue.use(VueQuillEditor);

// 全局时间过滤器
Vue.filter('dateFormat', (date) =>{
  const time = new Date(date);
  const y = time.getFullYear();
  const m = (time.getMonth() + 1).toString().padStart(2, '0');
  const d = (time.getDate()).toString().padStart(2, '0');
  const hh = (time.getHours()).toString().padStart(2, '0');
  const mm = (time.getMinutes()).toString().padStart(2, '0');
  const ss = (time.getSeconds()).toString().padStart(2, '0');

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
