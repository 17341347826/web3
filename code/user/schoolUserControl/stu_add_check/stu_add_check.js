/**
 * Created by Administrator on 2018/2/26.
 */
define([
        C.CLF('avalon.js'),"layer",
        C.Co("user","schoolUserControl/stu_add_check/stu_add_check","css!"),
        C.Co("user","schoolUserControl/stu_add_check/stu_add_check","html!"),
        C.CM("table"),
        C.CMF("data_center.js"), C.CM('three_menu_module')],
    function (avalon,layer,css,html, tab,data_center,three_menu_module) {
        //获取本校待审核学生
        var api_get_stuInfo=api.user+'student/wait_check_stu';
        // 编辑学生信息
        var api_student_save = api.user + "student/saveStudent.action";
        //审核新增学生
        var api_check_status=api.user+'student/upd_check_status';
        //获取指定学校的年级班级集合
        var api_grade_class=api.user+'class/school_class.action';
        var avalon_define = function () {
            var table = avalon.define({
                $id: "stu_add_check",
                // 列表数据接口
                url: api_get_stuInfo,
                is_init: false,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                // 附加参数
                extend: {
                    //登录用户Token
                    Token:'',
                    __hash__: ""
                },
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
                //年级
                teach_class_list: [],
                //班级
                class_list:[],
                //修改
                add_modal:{
                    school_name:"",
                    msg:""
                },
                //弹框填写信息
                add:{
                    //	学生id	number	修改时必填
                    id:'',
                    //文理科
                    arts_or_science:"",
                    //应往届
                    current_or_over:"",
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
                // 列表表头名称
                theadTh: [
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },
                    {
                        title: "姓名",
                        type: "text",
                        from: "student_name"
                    },
                    {
                        title: "性别",
                        type: "cover_text",
                        from: "sex",
                        dict: {
                            1: '男',
                            2: '女'
                        }
                    },
                    {
                        title: "学籍号",
                        type: "text",
                        from: "student_num"
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
                        title: "科类",
                        type: "cover_text",
                        from: "arts_or_science",
                        dict: {
                            0: '不分文理',
                            1: '文科',
                            2: '理科'
                        }
                    },
                    {
                        title: "学生类别",
                        type: "cover_text",
                        from: "current_or_over",
                        dict: {
                            0: "不分应往届",
                            1: "应届",
                            2: "往届"
                        }
                    },
                    {
                        title: "操作",
                        type: "html",
                        from:"<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='编辑'></a>" +
                        "<a class='tab-btn tab-pass-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='通过'></a>"+
                        "<a class='tab-btn tab-pass-no-btn' ms-on-click='@oncbopt({current:$idx, type:3})' title='不通过'></a>"
                    }],
                //  列表按钮操作
                cbopt: function (params) {
                    //console.log(params);
                    var self=this;
                    //学生学籍号
                    var num=params.data.student_num;
                    if(params.type == "1") {//修改
                        //	学生id	number	修改时必填
                        self.add.id=params.data.id;
                        //文理科	string	0：不分文理；1：文科；2：理科
                            self.add.arts_or_science=params.data.arts_or_science;
                            //	应往届	string	0：不分应往届；1：应届；2：往届
                            self.add.current_or_over=params.data.current_or_over;
                            //	邮箱	string
                            self.add.email=params.data.email;
                            //	班级id	number
                            //console.log(self.class_list);
                            self.add.fk_class_id=params.data.fk_class_id;
                            //年级id	number
                            self.add.fk_grade_id=params.data.fk_grade_id;
                            //学校id	number
                            self.add.fk_school_id=params.data.fk_school_id;
                            //	曾用名	string
                            self.add.old_name=params.data.old_name;
                            //	家长姓名	string
                            self.add.parent_name=params.data.parent_name;
                            //	家长联系电话	string
                            self.add.parent_phone=params.data.parent_phone;
                            //	学生联系电话	string
                            self.add.phone=params.data.phone;
                            //	备注	string
                            self.add.remark=params.data.remark;
                            //	性别	string	1：男；2：女
                            self.add.sex=params.data.sex;
                            //	学生姓名	string
                            self.add.student_name=params.data.student_name;
                            //	学籍号	string
                            self.add.student_num=params.data.student_num;
                        $("#compileData").modal({
                            closeOnConfirm: false
                        });
                    }else if(params.type=='2'){//通过
                        ajax_post(api_check_status,{status:'1',student_num:num},self);
                    }else if(params.type=='3'){//不通过
                        layer.prompt({title: '不通过理由', formType: 2}, function(text, index){
                            layer.close(index);
                            ajax_post(api_check_status,{msg:text,status:'4',student_num:num},self);
                        });
                    }
                },
                //年级改变
                add_gradeChang:function(){
                    var self=this;
                    //年级集合
                    var gradeList=self.teach_class_list;
                    var id=this.add.fk_grade_id;
                    self.update.fk_grade_id=id;
                    for(var i=0;i<gradeList.length;i++){
                        if(id==gradeList[i]){
                            self.class_list=gradeList[i].class_list;
                            self.update.fk_class_id=self.class_list[0].class_id;
                        }
                    }
                },
                //修改提交
                add_stu:function () {
                    var reg = /^([\u4e00-\u9fa5]){2,7}$/;//姓名验证
                    var phone_reg =  /^((1(3|4|5|7|8)\d{9}))$/;//电话验证
                    //邮箱验证
                    var email_reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
                    if(this.add.student_num.length != 19 ||
                        $.trim(this.add.student_num) == ""){
                        this.add_modal.msg = "请输入正确格式的学籍号";
                        return;
                    }else if(!reg.test(this.add.student_name) && $.trim(this.add.student_name) == ""){
                        this.add_modal.msg = "请填写正确的学生姓名";
                        return;
                    }else if(this.add.sex == 0){
                        this.add_modal.msg = "请选择性别";
                        return;
                    }else if(this.add.current_or_over == 3){
                        this.add_modal.msg = "请选择学生类别";
                        return;
                    }else{
                        if(this.add.old_name){
                            if(!reg.test(this.add.old_name) || $.trim(this.add.old_name) == ""){
                                this.add_modal.msg = "请填写正确的曾用名";
                                return;
                            }
                        }
                        if(this.add.phone){
                            if(!phone_reg.test(this.add.phone)){
                                this.add_modal.msg = "请填写正确的学生电话";
                                return;
                            }
                        }
                        if(this.add.email){
                            if(!email_reg.test(this.add.email)){
                                this.add_modal.msg = "请填写正确的邮箱";
                                return;
                            }
                        }
                        if(this.add.parent_name){
                            if(!reg.test(this.add.parent_name) || $.trim(this.add.parent_name) == ""){
                                this.add_modal.msg = "请填写正确的父母姓名";
                                return;
                            }
                        }
                        if(this.add.parent_phone){
                            if(!phone_reg.test(this.add.parent_phone)){
                                this.add_modal.msg = "请填写正确的父母电话";
                                return;
                            }
                        }
                        ajax_post(api_student_save,this.add.$model,this);
                    }
                },
                init: function () {
                    this.is_init = true;
                    this.cds();
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        var tUser=JSON.parse(data.data['user']);
                        //学校id
                        var id=tUser.fk_school_id;
                        self.extend.Token=sessionStorage.getItem('token');
                        self.add_modal.school_name =tUser.school_name;
                        //    年级班级集合
                        ajax_post(api_grade_class,{school_id:id},self);
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd) {
                        //审核新增学生
                        case  api_check_status:
                            this.extend.__hash__=new Date();
                            break;
                        //  编辑学生信息
                        case api_student_save:
                            this.complete_stu_msg(data);
                            break;
                        // 获取年级班级集合
                        case api_grade_class:
                            this.complete_grade_class(data);
                            break;
                    }
                },
                complete_stu_msg:function(data){
                    $("#compileData").modal({
                        closeOnConfirm: true
                    });
                    toastr.success('修改成功');
                    this.extend.__hash__=new Date();
                },
                complete_grade_class:function(data){
                    this.teach_class_list=data.data;
                    this.class_list=this.teach_class_list[0].class_list;
                },
            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });