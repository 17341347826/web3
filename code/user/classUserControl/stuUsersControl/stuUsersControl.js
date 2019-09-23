/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),
        C.Co("user", "classUserControl/stuUsersControl/stuUsersControl", "css!"),
        C.Co("user", "classUserControl/stuUsersControl/stuUsersControl", "html!"),
        C.CM("table"),
        C.CM("modal"),C.CM('three_menu_module'),
        C.CMF("data_center.js"),'layer'],
    function (avalon, css, html, tab, modal, three_menu_module,data_center,layer) {
        //指定学校的年级班级集合
        var api_grade_class = api.user + 'class/school_class.action';
        //学生账号启用、停用
        var api_update_student_status = api.user + "student/update_status.action";
        //重置密码
        var api_reset_pwd = api.user + "baseUser/resetpwd.action";
        //学生用户管理列表
        var api_student_user_list = api.user + "student/student_users";
        // 可选择角色
        var role_list = api.user + "role/student_choose_role";
        // 保存角色
        var user_role_save = api.user + "user_role/save";
        //层次
        var user_rank_save = api.user + "student/edit_stu_rank";
        //获取班级是文科 理科 不分文理科
        var api_class_simple = api.user + "class/findClassSimple.action";
        //班主任新增学生
        var api_add_stu = api.user+"student/add_student";

        //修改学生用户状态-批量
        var api_batch_status = api.user + 'student/batch_upd_status';
        //批量重置用户密码
        var api_batch_resetpwd = api.user + 'baseUser/batch_resetpwd';
        //批量删除学生记录
        var api_batch_del = api.user +'student/batch_del';
        var avalon_define = function () {
            var table = avalon.define({
                $id: "stuUsersControl",
                //性别
                sex:[
                    {id:"1",title:"男"},
                    {id:"2",title:"女"}
                ],
                //文理科
                arts_or_science:[
                    {id:"0",title:"不分文理科"},
                    {id:"1",title:"文科"},
                    {id:"2",title:"理科"}
                ],
                //学生类别
                //0：不分应往届；1：应届；2：往届
                current_or_over:[
                    {id:"0",title:"不分应往届"},
                    {id:"1",title:"应届"},
                    {id:"2",title:"往届"}
                ],
                // 列表数据接口
                url: api_student_user_list,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                is_init: false,
                //批量改变学生状态:1：启用；2：停用
                stu_status:'',
                //批量学生状态、批量删除学生
                stu_ids:[],
                //批量重置密码
                stu_guids:[],
                // 列表表头名称
                theadTh: [
                    {
                        title:
                        "<input type='checkbox' name='checkAll' id='checkAll'  value='全选'  ms-on-click='@oncbopt({current:$idx, type:7})'>全选",
                        // "<input type='checkbox'  ms-duplex='@stu_ids' ms-attr='{value:el.name,id:\"option\"+el.value}' data-duplex-changed='@check_btn(el.user_id)'>"+
                        // +"<label ms-attr='{for:\"option\"+el.value}'>全选</label>",
                        type: "html",
                        from:
                            "<input type='checkbox' ms-attr='{value:el.user_id+\"|\"+el.guid}'  name='checkper' class='checkper' ms-on-click='@oncbopt({current:$idx, type:6})'>"
                            // "<input type='checkbox'  ms-duplex='@stu_ids' ms-attr='{value:el.user_id}' data-duplex-changed='@check_btn(2)'>"
                    },
                    {
                        title: "序号",
                        type: "index",
                        from: "stu_id"
                    },
                    {
                        title: "姓名",
                        type: "text",
                        from: "name"
                    },
                    {
                        title: "学籍号",
                        type: "text",
                        from: "code"
                    },
                    {
                        title: "年级",
                        type: "text",
                        from: "grade_name"
                    },
                    {
                        title: "班级",
                        type: "text",
                        from: "class_name"
                    },
                    {
                        title: "层次",
                        type: "text",
                        from: "rank"
                    },
                    {
                        title: "账号",
                        type: "text",
                        from: "account"
                    }, {
                        title: "账号状态",
                        type: "cover_text",
                        from: "status",
                        dict: {
                            1: "启用",
                            2: "停用",
                            3: "待审核",
                            4: "未通过"
                        }
                    },
                    {
                        title: "使用状态",
                        type: "html",
                        from:
                        "<a class='tab-toggle-on-btn tab-btn' ms-visible='el.status==1' ms-on-click='@oncbopt({current:$idx, type:2})'></a>"+
                        "<a class='tab-toggle-off-btn tab-btn'  ms-visible='el.status==2' ms-on-click='@oncbopt({current:$idx, type:1})'></a>"
                    },{
                        title: "角色",
                        type: "html",
                        from: "<span ms-for='col in el.userRoles'>{{@col.role_name}}<span ms-if='el.userRoles.length>1'  class='am-margin-horizontal-xs'>/</span></span>"
                    }, {
                        title: "操作",
                        type: "html",
                        from: "" +
                        "<a class='tab-btn tab-level-btn' :if='el.status==1 || el.status==2' ms-on-click='@oncbopt({current:$idx, type:5})' title='学生分层'></a>"+
                        "<a class='tab-btn tab-rest-btn' :if='el.status==1 || el.status==2' ms-on-click='@oncbopt({current:$idx, type:3})' title='重置密码'></a>"+
                        "<a class='tab-btn tab-role-btn' :if='el.status==1 || el.status==2' ms-on-click='@oncbopt({current:$idx, type:4})' title='角色设置'></a>"
                    }
                ],
                //身份为班主任:true-是，false-不是
                is_headMaster:false,
                // 模态框
                modal: {
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: "",
                    type:'',
                },
                // 附加参数
                extend: {
                    // fk_school_id:"",
                    fk_grade_id: "",
                    // // 班级id
                    class_id: "",
                    // 学籍号
                    account: "",
                    // 学生姓名
                    name: "",
                    __hash__: ""
                },
                //查询
                demandData: {
                    // 学籍号
                    account: "",
                    // 学生姓名
                    name: ""
                },
                //用户id
                userId: "",
                //按钮状态
                paramsType: "",
                //年级
                teach_class_list: [],
                grade_info:'',
                //班级
                class_list:[],
                //增加、修改
                compileData: {
                    // 用户id
                    id: "",
                    //任课教师id
                    fk_teacher_id: "",
                    teacher_name: "",
                    // 年级id
                    fk_grade_id: "",
                    grade_name: "",
                    //任课科目id
                    fk_subject_id: "",
                    subject_name: "",
                    //任课班级id
                    fk_class_id: "",
                    class_name: ""
                },
                role: [],
                role_list: [],
                role_user: [],
                other:{
                    rank:""
                },
                //  列表按钮操作
                cbopt: function (params) {
                    if (params.type == "4") {
                        this.userId = params.data.guid;
                        this.role_user = params.data.userRoles;
                        this.modal.title = "角色设置";
                        this.modal.msg = "";
                        this.role=[];
                        ajax_post(role_list, {}, this);
                        $("#role-setting").modal({
                            closeOnConfirm: false
                        });
                    } else if (params.type == "5"){
                        this.userId = params.data.user_id;
                        this.other.rank = params.data.rank;
                        this.modal.title = "学生层次设置";
                        this.modal.msg = "";
                        $("#rank-setting").modal({
                            closeOnConfirm: false
                        });
                    } else {
                        // 当前数据的id
                        if (params.type == "1") {
                            this.userId = params.data.user_id;
                            this.modal.title = "启用";
                            this.modal.info = "是否启用此账号？";
                            this.modal.msg = "";
                            this.paramsType = 1;
                            this.modal.type = '1';
                        } else if (params.type == "2") {
                            this.userId = params.data.user_id;
                            this.modal.title = "停用";
                            this.modal.info = "是否停用此账号？";
                            this.modal.msg = "";
                            this.paramsType = 2;
                            this.modal.type = '2';
                        } else if (params.type == "3") {
                            this.userId = params.data.guid;
                            this.modal.title = "重置密码";
                            this.modal.info = "是否重置此账号密码？";
                            this.modal.msg = "";
                            this.paramsType = 3;
                            this.modal.type = '3';
                        }else if(params.type == '6'){//单个checkbox
                            var list = this.stu_ids;
                            var guid_list = this.stu_guids;
                            var ary = $('.checkper');
                            var value = params.data.user_id;
                            var guid = params.data.guid;
                            var index = params.current;
                            /*判断checkbox是否选中（参照本页面）:
                             html格式:ary[index].checked  //true/false
                             js格式：$('#checkAll').is(':checked')  //true/false
                            * */
                            if(ary[index].checked) {//选中   所有版本:true/false
                                list.push(value);
                                guid_list.push(guid);
                            }else{//未选中
                                list.remove(value);
                                guid_list.remove(guid);
                            }
                            this.stu_ids = list;
                            this.stu_guids = guid_list;
                        }else if(params.type == '7'){//全选
                            //获取所有checkbox元素
                            var ary = $('.checkper');
                            //判断全选是否选中
                            if($('#checkAll').is(':checked')){//选中  is(':checked')----所有版本:true/false
                                var num_ary = [];
                                var guid_ary = [];
                                for(var i=0;i<ary.length;i++){
                                    var value = ary[i].value.split('|');
                                    var num = Number(value[0]);
                                    var guid = Number(value[1]);
                                    // 设置元素为选中状态
                                    ary[i].checked = true;
                                    num_ary.push(num);
                                    guid_ary.push(guid);
                                }
                                this.stu_ids = num_ary;
                                this.stu_guids = guid_ary;
                            }else{//未选中
                                for(var i=0;i<ary.length;i++){
                                    // 设置元素为未选中状态
                                    ary[i].checked = false;
                                }
                                this.stu_ids = [];
                                this.stu_guids = [];
                            }
                        }
                        if(params.type != '6' && params.type != '7') {
                            $("#delete-modal").modal({
                                closeOnConfirm: false
                            });
                        }
                    }
                },
                //每一次批量操作完成后打扫工作
                clean_stu:function(){
                    //全选变为未选中状态
                    // $('#checkAll').checked = false;不行
                    $('#checkAll').attr("checked",false);
                    //获取所有checkbox元素
                    var ary = $('.checkper');
                    //单个checkbox修改
                    for(var i=0;i<ary.length;i++){
                        // 设置元素为未选中状态
                        ary[i].checked = false;
                    }
                    this.stu_ids = [];
                    this.stu_guids = [];
                },
                //批量修改学生状态
                batch_status:function(){
                    var list = this.stu_ids;
                    if(list.length == 0){
                        toastr.warning('请选择需要操作的学生');
                        return;
                    }
                    $('#change_status').modal({
                        closeOnConfirm: false
                    });
                },
                //保存修改状态
                save_status:function(){
                    //批量修改学生状态
                    ajax_post(api_batch_status,{id_arr:this.stu_ids,status:this.stu_status},this);
                },
                //批量重置密码
                batch_resetpwd:function(){
                    var list = this.stu_guids;
                    if(list.length == 0){
                        toastr.warning('请选择需要操作的学生');
                        return;
                    }
                    ajax_post(api_batch_resetpwd,{guid_arr:list},this);
                },
                //批量删除学生
                batch_del:function(){
                    var list = this.stu_ids;
                    if(list.length == 0){
                        toastr.warning('请选择需要操作的学生');
                        return;
                    }
                    ajax_post(api_batch_del,{id_arr:list},this);
                },
                rolePowerSetting:function (data) {
                    this.role_list=data;
                    var role=this.role_user;
                    for(var j=0;j<role.length;j++){
                        var roleId=role[j].role_id;
                        this.role.push(roleId);
                    }
                },
                roleSave:function () {
                    ajax_post(user_role_save,{roles:this.role,user:this.userId},this)
                },
                rankSave:function () {
                    ajax_post(user_rank_save, {
                        rank:this.other.rank,
                        student_id:this.userId
                    }, this);
                },
                //查询事件
                demand: function () {
                    this.extend.__hash__ = new Date();
                },
                studentNumDemand: function () {
                    this.extend.account = this.demandData.account;
                },
                studentNameDemand: function () {
                    this.extend.name = this.demandData.name;
                },
                //modal操作
                sure: function () {
                    if (this.paramsType == 1) {
                        ajax_post(api_update_student_status, {id: this.userId, status: 1}, this)
                    } else if (this.paramsType == 2) {
                        ajax_post(api_update_student_status, {id: this.userId, status: 2}, this)
                    } else if (this.paramsType == 3) {
                        ajax_post(api_reset_pwd, {id: this.userId}, this)
                    }
                },
                //model操作
                modal_insure_info:function(){
                    var info = $("#info-tips");
                    info.modal('close');
                },
                //年级改变
                gradeChange:function () {
                    this.is_init = false;
                    var info = this.grade_info.split('|');
                    this.compileData.fk_grade_id = info[0];
                    this.compileData.grade_name = info[1];
                    //添加单个学生赋值
                    this.add.fk_grade_id = info[0];
                    this.extend.fk_grade_id = info[0];
                    var gId=this.extend.fk_grade_id;
                    var grade=this.teach_class_list;
                    for(var i=0;i<grade.length;i++){
                        var id=grade[i].grade_id;
                        if(id==gId){
                            this.class_list = grade[i].class_list;
                            this.extend.class_id = Number(this.class_list[0].class_id);
                            this.compileData.fk_class_id = this.class_list[0].class_id;
                            this.compileData.class_name = this.class_list[0].class_name;
                            this.add.fk_class_id = this.class_list[0].class_id;
                        }
                    }
                    this.is_init = true;
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        var highest_level = data.data.highest_level;
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        //登陆者基本信息
                        var tUserData = JSON.parse(data.data["user"]);
                        if(userType == '0' && highest_level == '4'){//校
                            var id = tUserData.fk_school_id;
                            self.add_modal.school_name = tUserData.school_name;
                            self.compileData.fk_school_id = tUserData.fk_school_id;
                            self.add.fk_school_id = Number(tUserData.fk_school_id);
                            //指定学校的年级班级集合
                            ajax_post(api_grade_class,{school_id:id},self);
                        }else if (userType == "1") {//教师身份
                            //user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                            var high_level = data.data.highest_level;
                            cArr = tUserData.lead_class_list;
                            if(high_level == '6' && cArr.length>0){//班主任或者普通教师
                                self.is_headMaster = true;
                            }
                            self.teach_class_list = cArr;
                            self.add_modal.school_name = tUserData.school_name;
                            self.class_list=cArr[0].class_list;
                            self.extend.class_id = cArr[0].class_list[0].class_id;
                            self.extend.fk_grade_id = cArr[0].grade_id;
                            self.compileData.fk_grade_id = cArr[0].grade_id;
                            self.compileData.grade_name = cArr[0].grade_name;
                            self.compileData.fk_class_id = cArr[0].class_list[0].class_id;
                            self.compileData.class_name = cArr[0].class_list[0].class_name;
                            self.compileData.fk_school_id = tUserData.fk_school_id;
                            //添加单个学生赋值
                            self.add.fk_grade_id = self.teach_class_list[0].grade_id;
                            self.add.fk_class_id = self.class_list[0].class_id;
                            self.add.fk_school_id = Number(tUserData.fk_school_id);
                            self.is_init = true;
                        }
                    });
                },
                infoModal: function (status, msg) {
                    var info = $("#info-tips");
                    if (status == 200) {
                        this.extend.__hash__ = new Date();
                        info.modal('open');
                        if(this.modal.type != '3'){
                            setTimeout(function () {
                                info.modal('close');
                            }, 1000)
                        }
                    }
                    this.modal.msg = msg;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var info = $("#info-tips");
                    if(is_suc){
                        switch (cmd) {
                            //指定学校的年级班级集合
                            case api_grade_class:
                                this.complete_grade_class(data);
                                break;
                            case  api_update_student_status:
                                this.infoModal(status, msg);
                                break;
                            case  api_reset_pwd:
                                this.infoModal(status, msg);
                                break;
                            case role_list:
                                if(status==200){
                                    this.rolePowerSetting(data.data.list);
                                }
                                break;
                            case user_role_save:
                                $("#role-setting").modal("close");
                                info.modal('open');
                                setTimeout(function () {
                                    info.modal('close');
                                }, 1000);
                                this.modal.msg = msg;
                                this.extend.__hash__ = new Date();
                                break;
                            case user_rank_save:
                                $("#rank-setting").modal("close");
                                info.modal('open');
                                setTimeout(function () {
                                    info.modal('close');
                                }, 1000);
                                this.modal.msg = msg;
                                this.extend.__hash__ = new Date();
                                break;
                            case api_class_simple:
                                this.complete_class_simple(data);
                                break;
                            case api_add_stu:
                                this.complete_add_stu(data);
                                break;
                            // 批量修改学生状态
                            case api_batch_status:
                                this.complete_batch_status(data);
                                break;
                            //        批量重置密码
                            case api_batch_resetpwd:
                                this.complete_batch_resetpwd(data);
                                break;
                            //        批量删除学生
                            case api_batch_del:
                                this.complete_batch_del(data);
                                break;
                        }
                    }else{
                        toastr.error(msg);
                    }

                },
                add_modal:{
                    title:"",
                    school_name:"",
                    msg:""
                },
                add:{
                    //文理科
                    arts_or_science:"",
                    //应往届
                    current_or_over:"3",
                    //邮箱
                    email:"",
                    fk_class_id:"",//number
                    fk_grade_id:"",//number
                    fk_school_id:"",//number
                    //曾用名
                    old_name:"",
                    parent_name:"",
                    parent_phone:"",
                    //学生联系电话
                    phone:"",
                    //备注
                    remark:"",
                    sex:"",//1：男；2：女
                    student_name:"",
                    student_num:""


                },
                //新增学生切换年级
                add_gradeChang:function () {
                    var get_grade_id = this.add.fk_grade_id;
                    for(var i=0;i<this.teach_class_list.length;i++){
                        if(get_grade_id == this.teach_class_list[i].grade_id){
                            this.class_list = this.teach_class_list[i].class_list;
                            this.add.fk_class_id = this.class_list[0].class_id;
                            ajax_post(api_class_simple,{fk_grade_id:Number(get_grade_id),fk_school_id:Number(this.compileData.fk_school_id)},this);
                        }
                    }

                },
                //新增学生
                addStuInfo: function () {
                    ajax_post(api_class_simple,{fk_grade_id:Number(this.add.fk_grade_id),fk_school_id:Number(this.compileData.fk_school_id)},this);
                    this.add_modal.title = "添加";
                    $("#compileData").modal({
                        closeOnConfirm: false
                    });
                },
                //指定学校的年级班级集合
                complete_grade_class:function(data){
                    var cArr = data.data;
                    this.teach_class_list = cArr;
                    this.class_list = cArr[0].class_list;
                    this.extend.class_id = cArr[0].class_list[0].class_id;
                    this.extend.fk_grade_id = cArr[0].grade_id;
                    this.compileData.fk_grade_id = cArr[0].grade_id;
                    this.compileData.grade_name = cArr[0].grade_name;
                    this.compileData.fk_class_id = cArr[0].class_list[0].class_id;
                    this.compileData.class_name = cArr[0].class_list[0].class_name;
                    //添加单个学生赋值
                    this.add.fk_grade_id = this.teach_class_list[0].grade_id;
                    this.add.fk_class_id = this.class_list[0].class_id;
                    this.is_init = true;
                },
                complete_class_simple:function (data) {
                    var dataList = data.data;
                    var dataListLength = dataList.length;
                    for(var i=0;i<dataListLength;i++){
                        if(this.add.fk_class_id == dataList[i].id){
                            var class_type = dataList[i].class_type;
                            this.add.arts_or_science = dataList[i].class_type;
                        }
                    }
                },
                //提交新增学生
                add_stu:function () {
                    var reg = /^([\u4e00-\u9fa5]){2,7}$/;//姓名验证
                    var phone_reg =  /^((1(3|4|5|7|8)\d{9}))$/;//电话验证
                    //邮箱验证
                    var email_reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
                    if(this.add.student_num.length != 19 ||
                        $.trim(this.add.student_num) == ""){
                        this.add_modal.msg = "请输入正确格式的学籍号";
                        return;
                    }
                    if(!reg.test(this.add.student_name) || $.trim(this.add.student_name) == ""){
                        this.add_modal.msg = "请填写正确的学生姓名";
                        return;
                    }
                    if(this.add.sex == 0){
                        this.add_modal.msg = "请选择性别";
                        return;
                    }
                    if(this.add.current_or_over == 3){
                        this.add_modal.msg = "请选择学生类别";
                        return;
                    }
                    if (this.add.old_name) {
                        if (!reg.test(this.add.old_name)) {
                            this.add_modal.msg = "请填写正确的曾用名";
                            return;
                        }
                    }
                    if (this.add.phone) {
                        if (!phone_reg.test(this.add.phone)) {
                            this.add_modal.msg = "请填写正确的学生电话";
                            return;
                        }
                    }
                    if (this.add.email) {
                        if (!email_reg.test(this.add.email)) {
                            this.add_modal.msg = "请填写正确的邮箱";
                            return;
                        }
                    }
                    if (this.add.parent_name) {
                        if (!reg.test(this.add.parent_name) && $.trim(this.add.parent_name) == "") {
                            this.add_modal.msg = "请填写正确的父母姓名";
                            return;
                        }
                    }
                    if (this.add.parent_phone) {
                        if (!phone_reg.test(this.add.parent_phone)) {
                            this.add_modal.msg = "请填写正确的父母电话";
                            return;
                        }
                    }
                    ajax_post(api_add_stu, this.add, this);

                },
                complete_add_stu:function (data) {
                    if(data.message === '该学籍号已存在' && data.status.toString() !== '200'){
                        this.add_modal.msg = '该学籍号已存在';
                    }else{
                        toastr.success('添加成功');
                        $("#compileData").modal({
                            closeOnConfirm: true
                        });
                        this.extend.__hash__ = new Date();
                    }

                },
                //取消新增学生
                cancel_add:function () {
                    this.add.current_or_over = "3";
                    this.add.email = "";
                    this.add.old_name = "";
                    this.add.parent_name = "";
                    this.add.parent_phone = "";
                    this.add.phone = "";
                    this.add.remark = "";
                    this.add.sex = "0";
                    this.add.student_name = "";
                    this.add.student_num = "";
                },
                //批量修改学生状态
                complete_batch_status:function(data){
                    console.log(data);
                    $('#change_status').modal({
                        closeOnConfirm: true
                    });
                    //批量操作后清除
                    this.clean_stu();
                    this.extend.__hash__ = new Date();
                    toastr.success('学生批量修改状态成功');
                },
            //    批量重置密码
                complete_batch_resetpwd:function(data){
                    //批量操作后清除
                    this.clean_stu();
                    this.extend.__hash__ = new Date();
                    toastr.success(data.message);
                },
            //    批量删除学生
                complete_batch_del:function(data){
                    console.log(data);
                    //批量操作后清除
                    this.clean_stu();
                    this.extend.__hash__ = new Date();
                    toastr.success('学生批量删除成功');
                },
            });
            table.cds();
            // table.$watch('stu_ids', function () {
            //     console.log('1');
            // });
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });