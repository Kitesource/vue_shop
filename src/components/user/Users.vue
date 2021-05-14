<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template v-slot="scope">
            <el-switch @change="handleUserStateChange(scope.row)" v-model="scope.row.mg_state"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteUserById(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" size="mini" icon="el-icon-setting" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        >
    </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
         <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="addForm.username" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="addForm.password" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="addForm.email" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input v-model="addForm.mobile" autocomplete="off"></el-input>
            </el-form-item>
         </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleAddUser">确 定</el-button>
        </div>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      >
      <el-form ref="editFormRef" :rules="editFormRules" :model="editForm" label-width="70px" @close="editDialogClose">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item> 
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="setRoleDialogVisible"
      width="30%"
      @close="setRoleDialogClosed"
      >
      <div>
        <p>当前用户:{{userInfo.username}}</p>
        <p>当前角色:{{userInfo.role_name}}</p>
        <p>分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleallotRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
     // 手机号校验规则
      var checkPhone = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('手机号不能为空'));
        } else {
          const reg = /^1[3|4|5|7|8][0-9]\d{8}$/
          if (reg.test(value)) {
            callback();
          } else {
            return callback(new Error('请输入正确的手机号'));
          }
        }
      };
    return {
      // 获取用户的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 用户数据
      userList:[],
      // 总数据条数
      total:0,
      // 添加用户对话框的显示与隐藏
      addDialogVisible:false,
      // 添加用户的表单数据对象
      addForm:{
        username:'',
        password:'',
        email:'',
        mobile:''
      },
      // 添加用户的表单验证对象
      addFormRules:{
        username:[
          { required:true, message:'请输入用户名', trigger:'blur' },
          { min:3, max:10, message:'用户名的长度在3~10个字符之间', trigger:'blur' }
        ],
        password:[
          { required:true, message:'请输入密码', trigger:'blur' },
          { min:6, max:15, message:'用户名的长度在6~15个字符之间', trigger:'blur' }
        ],
        email:[
          { required:true, message:'请输入邮箱', trigger:'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile:[
          { required:true, message:'请输入手机号', trigger:'blur' },
          { validator: checkPhone, trigger: 'blur'}
        ],
      }, 
      // 控制修改用户对话框
      editDialogVisible:false,
      // 修改前获取的用户信息对象
      editForm:{},
      //修改前获取的用户验证对象
      editFormRules:{
         email:[
          { required:true, message:'请输入邮箱', trigger:'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile:[
          { required:true, message:'请输入手机号', trigger:'blur' },
          {validator: checkPhone, trigger: 'blur'}
        ],
      },
      // 控制删除用户对话框
      deleteDialogVisible: false,
      // 控制分配角色对话框
      setRoleDialogVisible:false,
      // 需要被分配角色的用户信息
      userInfo:{},
      // 角色列表
      rolesList:[],
      // 已选中的id值
      selectedRoleId:''
    }
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      });
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 监听pagesize的改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听switch用户状态的改变
    async handleUserStateChange(userInfo) {
      const {data:res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if(res.meta.status !== 200){
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error('用户状态更新失败')
      }
      this.$message.success('用户状态更新成功')
    },
    // 监听添加用户对话框的关闭
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击确定添加新用户
    handleAddUser() {
      this.$refs.addFormRef.validate(async valid => {
        // 所有验证表单项通过验证 valid为true
        if(!valid) return;
        const { data:res } = await this.$http.post('users', this.addForm);
        console.log(res);
        if(res.meta.status !== 201){
           this.$message.error('添加用户失败!');
        }
        this.$message.success('添加成功!');
        // 隐藏添加用户对话框
        this.addDialogVisible = false;
        // 更新用户列表
        this.getUserList();
      })
    },
    //  展示修改用户对话框
    async showEditDialog(id) {
      const { data:res } = await this.$http.get('users/' + id);
      if(res.meta.status !== 200){
        return this.$message.error('')
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 监听修改用户对话框的关闭
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击确定修改用户信息
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return;
        const { data: res } = await this.$http.put('users/'+ this.editForm.id, { 
          email: this.editForm.email, 
          mobile: this.editForm.mobile
        })
        if(res.meta.status !== 200) return this.$message.error('更新用户信息失败');
        // 关闭对话框
        this.editDialogVisible = false;
        // 更新数据列表
        this.getUserList();
        // 提示修改
        this.$message.success('更新用户信息成功');
      })
    },
    // 删除用户
    deleteUserById(id) {
       this.$confirm('此操作将永久删除该用户, 是否继续?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const { data:res } = await this.$http.delete('users/' + id);
          if(res.meta.status !== 200 ){
            return this.$message({type:'info', messgae:'删除失败'});
          }
          this.$message({type: 'success',message: '删除成功'});
          // 更新用户列表
          this.getUserList();
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    },
    // 点击分配角色
    async setRole(userInfo) {
      this.userInfo = userInfo;

      // 展示对话框之前，获取所有角色列表
      const {data:res} = await this.$http.get('roles');
      if(res.meta.status !== 200){
        return this.$messgae.error('获取角色列表失败');
      }
      this.rolesList = res.data;
      this.setRoleDialogVisible = true;
    },
    // 点击确定用户分配角色
    async handleallotRole() {
      if(!this.selectedRoleId){
        return this.$message.error('请选择要分配的角色');
      }
      const { data:res } = await this.$http.put(`users/${this.userInfo.id}/role`, {rid:this.selectedRoleId})
      if(res.meta.status !== 200) {
        return this.$message.error('角色更新失败');
      }
      this.$message.success('角色更新成功');
      this.getUserList();
      this.setRoleDialogVisible = false;
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
      this.selectedRoleId = '';
      this.userInfo = {};
    }
  }
};
</script>

<style>
</style>