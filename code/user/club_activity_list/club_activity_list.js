/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),"jquery","layer","select2",
        C.Co("user","club_activity_list/club_activity_list","css!"),
        C.Co("user","club_activity_list/club_activity_list","html!"),
        C.CM("table"),
        C.CMF("data_center.js"), C.CM('three_menu_module')],
    function (avalon,$,layer,select2,css, html, tab, data_center,three_menu_module) {
        //文件上传
        var api_file_upload = api.user + "file/upload.action";
        // 导入学生信息
        var api_student_import = api.user + "student/importStudent.action";
        //查询所有社团
        var api_found_community=api.growth+'communityManagement_queryCommunity';
        //删除社团
        var api_delete_community=api.growth+'communityManagement_deleteCommunity';
        var avalon_define = function () {
            var table = avalon.define({
                $id: "club_activity_list",
                // 列表数据接口
                url: api_found_community,
                is_init: false,
                remember:false,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                //负责人列表
                charge_list:[],
                //负责人信息
                charge_info:'',
                //指导老师
                guide_teach:[],
                guide_info:'',
                //社团类型
                club_type:[
                    {id:1,type_name:'休闲'},
                    {id:2,type_name:'艺术'},
                    {id:3,type_name:'体育'},
                    {id:4,type_name:'新闻'},
                    {id:5,type_name:'科技'},
                    {id:6,type_name:'公益'},
                    {id:7,type_name:'学习'}
                ],
                //联系方式状态
                phone_type:false,
                // 模态框
                modal: {
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: ""
                },
                // 附加参数
                extend: {
                    //社团名字
                    communityName:'',
                    //社团类型
                    communityType:'',
                    //负责人
                    managementPerson:'',
                    __hash__:''
                },
                //增加、修改
                compileData: {
                    id:'',
                    //社团名字
                    communityName:'',
                    //社团人数
                    communityNum:'',
                    //社团类型
                    communityType:'',
                    //指导教师id:1，2，3
                    fk_zdjs_id:'',
                    //指导教师
                    instructor:'',
                    //负责人id
                    fk_fzr_id:'',
                    //负责人
                    managementPerson:'',
                    //男女比例
                    proportion:'',
                    //联系方式
                    tel:'',
                    //备注
                    remark: "",
                    //社团简介
                    stjj:'',
                },
                //上传文件名
                fileName: "",
                //上传文件
                importData: {
                    // 返回名
                    fileBackName: "",
                    //已经存在的学籍号
                    exist_student: [],
                    // 文件格式错误的工作表
                    format_error: [],
                    // 校验未通过的班级
                    refuse_class: [],
                    // 校验未通过的年级
                    refuse_grade: [],
                    //校验未通过的学校
                    refuse_school: [],
                    //在当前文件中重复的学籍号
                    repeate_student: []
                },
                user: {
                    fk_school_id: "",
                    school_name: "",
                    school_code: ""
                },
                // 列表表头名称
                theadTh: [
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },
                    {
                        title: "社团名称",
                        type: "text",
                        from: "communityName"
                    },
                    {
                        title: "负责人",
                        type: "text",
                        from: "managementPerson"
                    },
                    {
                        title: "联系方式",
                        type: "text",
                        from: "tel"
                    },
                    {
                        title: "指导老师",
                        type: "text",
                        from: "instructor"
                    },
                    {
                        title: "社团人数",
                        type: "text",
                        from: "communityNum"
                    },
                    {
                        title: "男女比例",
                        type: "text",
                        from: "proportion"
                    },
                    {
                        title: "社团类型",
                        type: "text",
                        from: "communityType"
                    },{
                        title: "备注",
                        type: "text",
                        from: "remark"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from:"<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='修改'></a>" +
                        "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='删除'></a>"
                    }],
                //  列表按钮操作
                cbopt: function (params) {
                    var self=this;
                    var id=params.data.id;
                    //console.log(params);
                    // 当前数据的id
                    if (params.type == "2") {
                        layer.confirm('是否删除此社团信息？', {
                            btn: ['确定','取消'] //按钮
                        }, function(){
                            ajax_post(api_delete_community,{id:id},self);
                        });
                    } else if (params.type == "1") {
                        window.location = '#club_activity_add?club_info='+JSON.stringify(params.data);
                    }
                },
                // 获取年级
                init: function () {
                    this.cds();
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        if (userType == "0") {
                            var data = JSON.parse(data.data["user"]);
                            //1：省级；2：市州级；3：区县级；4：校级
                            var department_level = data.department_level;
                            if (department_level == "4") {
                                self.user.fk_school_id = data.fk_school_id;
                                self.user.school_name = data.school_name;
                                self.user.school_code = data.school_code;
                            }
                        }
                        self.is_init = true;
                        self.extend.__hash__ = new Date();
                    });
                },
                //新增
                addClassInfo: function () {
                    window.location = '#club_activity_add';
                },
                numMsg: function () {
                    this.modal.msg = "";
                },
                //上传
                uploadingModal: function () {
                    this.modal.title = "上传文件";
                    $("#file").val("");
                    this.fileName = "";
                    this.fileChange();
                    $("#file-uploading").modal({
                        closeOnConfirm: false
                    });
                },
                uploading: function () {
                    var file = this.fileName;
                    var subFile = file.substring(file.indexOf(".") + 1, file.length);
                    if (subFile == "xlsx" || subFile == "xls") {
                        this.modal.msg = "正在上传，请勿取消";
                        fileUpload(api_file_upload, this);
                    } else {
                        this.modal.msg = "请上传Excel文件";
                    }
                },
                fileChange: function () {
                    this.modal.msg = "";
                    this.importData.fileBackName = "";
                    //已经存在的学籍号
                    this.importData.exist_student = "";
                    // 文件格式错误的工作表
                    this.importData.format_error = "";
                    // 校验未通过的班级
                    this.importData.refuse_class = "";
                    // 校验未通过的年级
                    this.importData.refuse_grade = "";
                    //校验未通过的学校
                    this.importData.refuse_school = "";
                    //在当前文件中重复的学籍号
                    this.importData.repeate_student = "";
                },
                // 删除
                sure: function () {
                    ajax_post(this.modal.url, {student_id: this.modal.id}, this);
                },
                infoModal: function (status, msg) {
                    var info = $("#info-tips");
                    if (status == 200) {
                        this.extend.__hash__ = new Date();
                        info.modal('open');
                        setTimeout(function () {
                            info.modal('close');
                        }, 1000)
                    }
                    this.modal.msg = msg;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var compileData = $("#compileData");
                    var info = $("#info-tips");
                    var file = $("#file-uploading");
                    switch (cmd) {
                        case  api_file_upload:
                            if (status == 200) {
                                this.importData.fileBackName = data.data.file;
                                ajax_post(api_student_import, {file: this.importData.fileBackName}, this);
                            }
                            this.modal.msg = msg;
                            break;
                        // case  api_student_delete:
                        //     this.infoModal(status, msg);
                        //     break;
                        case  api_student_import:
                            if (status == 200) {
                                file.modal('close');
                                info.modal('open');
                                setTimeout(function () {
                                    info.modal('close');
                                }, 1000);
                                this.extend.__hash__ = new Date();
                            } else if (status == 205) {
                                //已经存在的学籍号
                                this.importData.exist_student = data.data.exist_student;
                                // 文件格式错误的工作表
                                this.importData.format_error = data.data.format_error;
                                // 校验未通过的班级
                                this.importData.refuse_class = data.data.refuse_class;
                                // 校验未通过的年级
                                this.importData.refuse_grade = data.data.refuse_grade;
                                //校验未通过的学校
                                this.importData.refuse_school = data.data.refuse_school;
                                //在当前文件中重复的学籍号
                                this.importData.repeate_student = data.data.repeate_student;
                            }
                            this.modal.msg = msg;
                            break;
                        //删除
                        case api_delete_community:
                            toastr.success('删除成功');
                            layer.closeAll();
                            this.extend.__hash__=new Date();
                            break;
                    }
                },
                complete_add_commuity:function(data){
                    $("#compileData").modal({
                        closeOnConfirm: true
                    });
                    this.extend.__hash__=new Date();
                },
                complete_update_community:function(data){
                    $("#compileData").modal({
                        closeOnConfirm: false
                    });
                    this.extend.__hash__=new Date();
                },
            });
            table.$watch('onReady', function () {
                table.init();
            });
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });