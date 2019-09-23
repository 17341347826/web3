/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),
        C.Co("user","css_update_demo/css_update_demo","css!"),
        C.Co("user","css_update_demo/css_update_demo","html!"),
        C.CM("table"),
        C.CM("modal"),
        C.CM("page_title"),
        C.CMF("data_center.js")],
    function (avalon, css, html, tab, modal,pageTitle, data_center) {
        //获取班级
        var api_class_simple = api.user + "class/findClassSimple.action";
        // 学生信息列表
        var api_student_list = api.user + "student/studentList.action";
        // 删除学生信息
        var api_student_delete = api.user + "student/delete.action";
        //年级列表
        var api_grades = api.user + "grade/findGrades.action";
        // 编辑学生信息
        var api_student_save = api.user + "student/saveStudent.action";
        //文件上传
        var api_file_upload = api.user + "file/upload.action";
        // 导入学生信息
        var api_student_import = api.user + "student/importStudent.action";

        var avalon_define = function () {
            var table = avalon.define({
                $id: "table",
                // 列表数据接口
                url: api_student_list,
                is_init: false,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 2
                },
                // 列表表头名称
                theadTh: [
                    {
                        title: "序号",
                        type: "index",
                        from: "id"
                    },
                    {
                        title: "测试数据",
                        type: "text",
                        from: "student_name"
                    },
                    {
                        title: "测试数据",
                        type: "cover_text",
                        from: "sex",
                        dict: {
                            1: '男',
                            2: '女'
                        }
                    },
                    {
                        title: "测试数据",
                        type: "text",
                        from: "student_num"
                    },
                    {
                        title: "常用操作",
                        type: "html",
                        from:"<a title='修改tab-edit-btn' class='tab-btn tab-edit-btn'></a>"+
                        "<a title='删除tab-trash-btn' class='tab-btn tab-trash-btn'></a>"+
                        "<a title='选择tab-change-btn' class='tab-btn tab-change-btn'></a>"+
                        "<a title='查看详情tab-details-btn' class='tab-btn tab-details-btn'></a>"+
                        "<a title='保存tab-save-btn' class='tab-btn tab-save-btn'></a>" +
                        "<a title='查看审核tab-cause-btn' class='tab-btn tab-cause-btn'></a>"
                    },
                    {
                        title: "审核类",
                        type: "html",
                        from:
                        "<a title='审核tab-audit-btn' class='tab-btn tab-audit-btn'></a>"+
                        "<a title='通过tab-pass-btn' class='tab-btn tab-pass-btn'></a>"+
                        "<a title='不通过tab-pass-no-btn' class='tab-btn tab-pass-no-btn'></a>"
                    },
                    {
                        title: "异议类",
                        type: "html",
                        from:
                        "<a title='异议tab-objection-btn' class='tab-btn tab-objection-btn'></a>"+
                        "<a title='撤销tab-repeal-btn' class='tab-btn tab-repeal-btn'></a>"+
                        "<a title='申诉tab-appeal-btn' class='tab-btn tab-appeal-btn'></a>"+
                        "<a title='确认tab-affirm-btn' class='tab-btn tab-affirm-btn'></a>"

                    },
                    {
                        title: "管理类",
                        type: "html",
                        from:"<a title='重置密码tab-rest-btn' class='tab-btn tab-rest-btn'></a>"+
                        "<a title='角色选择tab-role-btn' class='tab-btn tab-role-btn'></a>"+
                        "<a title='学生层次tab-level-btn' class='tab-btn tab-level-btn'></a>"+
                        "<a title='设置tab-setting-btn' class='tab-btn tab-setting-btn'></a>"+
                        "<a title='发布tab-issue-btn' class='tab-btn tab-issue-btn'></a>"

                    },
                    {
                        title: "指标与统计类",
                        type: "html",
                        from:
                        "<a title='采纳tab-accept-btn' class='tab-btn tab-accept-btn'></a>"+
                        "<a title='共享tab-share-btn' class='tab-btn tab-share-btn'></a>"+
                        "<a title='维护tab-maintenance-btn' class='tab-btn tab-maintenance-btn'></a>"+
                        "<a title='统计tab-statistics-btn' class='tab-btn tab-statistics-btn'></a>"+
                        "<a title='撤销失败tab-lose-btn' class='tab-btn tab-lose-btn'></a>"+
                        "<a title='停止发布tab-stop-btn' class='tab-btn tab-stop-btn'></a>"
                    }],
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
                    status:"",
                    fk_school_id: "",
                    //年级id
                    fk_grade_id: "0",
                    // 班级id
                    fk_class_id: "0",
                    // 学籍号
                    student_num: "",
                    // 学生姓名
                    student_name: "",
                    __hash__: ""
                },
                //增加、修改
                compileData: {
                    //学生id
                    id: "",
                    // 学生姓名
                    student_name: "",
                    //性别
                    sex: "",
                    //曾用名
                    old_name: "",
                    // 学籍号
                    student_num: "",
                    //文理科
                    arts_or_science: "",
                    //应往届
                    current_or_over: "",
                    // 邮箱
                    email: "",
                    //学生电话
                    phone: "",
                    //学校id
                    fk_school_id: "",
                    //学校代码
                    school_code: "",
                    //学校名称
                    school_name: "",
                    //年级id
                    fk_grade_id: "",
                    //班级id
                    fk_class_id: "",
                    //家长姓名
                    parent_name: "",
                    // 家长电话
                    parent_phone: "",
                    //备注
                    remark: ""
                },
                //查询
                demandData: {
                    class_info:"",
                    //班级id
                    fk_class_id: "",
                    // 学籍号
                    student_num: "",
                    // 学生姓名
                    student_name: ""
                },
                // 所有年级名称
                grade_name: [],
                // 所有班级名称
                class_name: [],
                // 性别
                sex: [{
                    "sex": 1,
                    "title": "男"
                }, {
                    "sex": 2,
                    "title": "女"
                }],
                // 科类类别
                arts_or_science: [{
                    "arts_or_science": "0",
                    "title": "不分文理科"
                }, {
                    "arts_or_science": "1",
                    "title": "文科"
                }, {
                    "arts_or_science": "2",
                    "title": "理科"
                }],
                // 学生类别
                current_or_over: [ {
                    "current_or_over": "0",
                    "title": "不分应往届"
                }, {
                    "current_or_over": "1",
                    "title": "应届"
                }, {
                    "current_or_over": "2",
                    "title": "往届"
                }],
                //上传文件名
                fileName: "",
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
                //状态
                flag: "",
                user: {
                    fk_school_id: "",
                    school_name: "",
                    school_code: ""
                },
                other:{
                    class_info:""
                },
                //  列表按钮操作
                cbopt: function (params) {
                    // 当前数据的id
                    if (params.type == "4") {
                        this.modal.id = params.data.id;
                        this.modal.title = "删除";
                        this.modal.info = "是否删除此学生信息？";
                        this.modal.url =  api_student_delete;
                        this.modal.msg = "";
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    }
                    else if (params.type == "2") {
                        this.modal.title = "修改";
                        this.modal.msg = "";
                        this.flag = true;
                        // 学生id
                        this.compileData.id = params.data.id;
                        // 学生姓名
                        this.compileData.student_name = params.data.student_name;
                        //性别
                        this.compileData.sex = params.data.sex;
                        //曾用名
                        this.compileData.old_name = params.data.old_name;
                        // 学籍号
                        this.compileData.student_num = params.data.student_num;
                        //文理科
                        this.compileData.arts_or_science = params.data.arts_or_science;
                        //应往届
                        this.compileData.current_or_over = params.data.current_or_over;
                        // 邮箱
                        this.compileData.email = params.data.email;
                        //学生电话
                        this.compileData.phone = params.data.phone;
                        //学校id
                        this.compileData.fk_school_id = params.data.fk_school_id;
                        //学校代码
                        this.compileData.school_code = params.data.school_code;
                        //学校名称
                        this.compileData.school_name = params.data.school_name;
                        //年级id
                        this.compileData.fk_grade_id = params.data.fk_grade_id;
                        //班级id
                        this.compileData.fk_class_id = params.data.fk_class_id;
                        this.demandData.class_info = params.data.fk_class_id+"|"+params.data.arts_or_science;
                        //家长姓名
                        this.compileData.parent_name = params.data.parent_name;
                        // 家长电话
                        this.compileData.parent_phone = params.data.parent_phone;
                        //备注
                        this.compileData.remark = params.data.remark;
                        ajax_post(api_class_simple, {
                            fk_school_id: params.data.fk_school_id,
                            fk_grade_id: params.data.fk_grade_id
                        }, this);
                        $("#compileData").modal({
                            closeOnConfirm: false
                        });
                    }
                },
                //查询事件
                demand: function () {
                    this.extend.__hash__ = new Date();
                },
                studentNumDemand: function () {
                    this.extend.student_num = this.demandData.student_num;
                },
                studentNameDemand: function () {
                    this.extend.student_name = this.demandData.student_name;
                },
                // 获取年级
                init: function () {
                    ajax_post(api_grades, {}, this);
                    this.cds();
                },
                //修改、添加
                compile: function () {
                    if (this.flag) {
                        if (this.compileData.sex != "" &&
                            this.compileData.fk_grade_id != "" &&
                            this.compileData.fk_class_id != "" &&
                            this.compileData.current_or_over != "") {
                            ajax_post(api_student_save, this.compileData.$model, this);
                        } else {
                            this.modal.msg = "所有选项必填或必选"
                        }
                    }
                },
                addClassInfo: function () {
                    this.modal.title = "添加";
                    // 学生姓名
                    this.compileData.student_name = "";
                    //性别
                    this.compileData.sex = "";
                    //曾用名
                    this.compileData.old_name = "";
                    // 学籍号
                    this.compileData.student_num = "";
                    //文理科
                    this.compileData.arts_or_science = "";
                    //应往届
                    this.compileData.current_or_over = "";
                    // 邮箱
                    this.compileData.email = "";
                    //学生电话
                    this.compileData.phone = "";
                    this.compileData.fk_school_id = this.user.fk_school_id;
                    this.compileData.school_name = this.user.school_name;
                    this.compileData.school_code = this.user.school_code;
                    //年级id
                    this.compileData.fk_grade_id = "";
                    //班级id
                    this.compileData.fk_class_id = "";
                    this.demandData.fk_class_id= "";
                    //家长姓名
                    this.compileData.parent_name = "";
                    // 家长电话
                    this.compileData.parent_phone = "";
                    //备注
                    this.compileData.remark = "";
                    this.demandData.class_info = "";
                    this.compileData.id="";
                    this.modal.msg = "";
                    $("#compileData").modal({
                        closeOnConfirm: false
                    });
                },
                classChange:function () {
                    var classInfo = this.other.class_info;
                    if(classInfo!=""){
                        this.compileData.fk_class_id = Number(classInfo.substring(0, classInfo.indexOf("|")));
                        this.compileData.arts_or_science = Number(classInfo.substring(classInfo.indexOf("|") + 1, classInfo.length));
                    }else {
                        this.compileData.arts_or_science="";
                    }
                },
                //数据校验
                numReg: function () {
                    if (this.compileData.student_num.length != 19 ||
                        this.compileData.student_num.length == "") {
                        this.modal.msg = "请输入正确格式的学籍号"
                    } else {
                        this.flag = true;
                    }
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
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        if (userType == "0") {
                            var data = JSON.parse(data.data["user"]);
                            var department_level = data.department_level;
                            if (department_level == "4") {
                                self.user.fk_school_id = data.fk_school_id;
                                self.extend.fk_school_id = data.fk_school_id;
                                self.user.school_name = data.school_name;
                                self.user.school_code = data.school_code;
                            }
                        }
                        self.is_init = true;
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var compileData = $("#compileData");
                    var info = $("#info-tips");
                    var file = $("#file-uploading");
                    switch (cmd) {
                        case  api_grades:
                            this.grade_name = data.data;
                            break;
                        case  api_student_save:
                            if (status == 200) {
                                compileData.modal("close");
                            }
                            this.infoModal(status, msg);
                            break;
                        case  api_file_upload:
                            if (status == 200) {
                                this.importData.fileBackName = data.data.file;
                                ajax_post(api_student_import, {file: this.importData.fileBackName}, this);
                            }
                            this.modal.msg = msg;
                            break;
                        case  api_student_delete:
                            this.infoModal(status, msg);
                            break;
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
                        case api_class_simple:
                            this.class_name = data.data;
                            this.other.class_info = this.demandData.class_info;
                            break;
                    }
                }
            });
            table.init();
            //班级
            table.$watch("compileData.fk_grade_id", function () {
                var gradeId = table.compileData.fk_grade_id;
                if(gradeId!=""){
                    ajax_post(api_class_simple, {fk_school_id: table.user.fk_school_id, fk_grade_id: gradeId}, table);
                }else {
                    this.class_name=[];
                }
            });
            //班级
            table.$watch("extend.fk_grade_id", function () {
                var gradeId = table.extend.fk_grade_id;
                if(gradeId!=""){
                    ajax_post(api_class_simple, {fk_school_id: table.user.fk_school_id, fk_grade_id: gradeId}, table);
                }else {
                    this.class_name=[];
                }
            });
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });