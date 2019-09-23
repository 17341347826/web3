/**
 * Created by uptang on 2017/5/8.
 */
define(['avalon', "css!../classControl/classControlList",
        "user!./teacherInfoControl11", "tab", "modal","data_center"],
    function (avalon, css, html, tab, modal,data_center) {
        var table = avalon.define({
            $id: "table",
            // 列表数据接口
            url: api_teacher_list,
            is_init:false,
            // 列表请求参数
            data: {},
            //列表参数
            listData: {
                offset: 0,
                rows: 5
            },
            // 列表表头名称
            theadTh: [],
            //教师档案信息列表
            teacherListTd: [{
                title: "序号",
                type: "index",
                from: "id"
            },
                {
                    title: "姓名",
                    type: "text",
                    from: "teacher_name"
                },
                {
                    title: "教师编号",
                    type: "text",
                    from: "teacher_num"
                },
                {
                    title: "职称",
                    type: "text",
                    from: "tech_title"
                },
                {
                    title: "职务",
                    type: "cover_text",
                    from: "rank",
                    dict: {
                        4: '校级领导',
                        5: '年级领导',
                        6: '普通教师'
                    }
                },
                {
                    title: "联系电话",
                    type: "text",
                    from: "phone"
                },
                {
                    title: "操作",
                    type: "html",
                    from: "<button class='am-btn am-btn-primary am-margin-right-xs' ms-on-click='@oncbopt({current:$idx, type:2})'>修改</button>" +
                    "<button class='am-btn am-btn-danger' ms-on-click='@oncbopt({current:$idx, type:4})'>删除</button>"
                }],
            //教师任课信息列表
            teacherClassListTd: [{
                title: "序号",
                type: "index",
                from: "id"
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
                    title: "科目",
                    type: "text",
                    from: "subject_name"
                },
                {
                    title: "任课教师",
                    type: "text",
                    from: "teacher_name"
                }],
            //当前选项卡
            navTabs: "",
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
                fk_school_id:"",
                //年级id
                grade_id: "",
                // 班级id
                fk_class_id: "",
                // 教师编号
                teacher_num: "",
                // 教师姓名
                teacher_name: "",
                // 科目
                fk_subject_id: "",
                __hash__: ""
            },
            //教师档案添加/修改
            teacherCompile: {
                //教师id
                id: "",
                //学校id
                fk_school_id: "",
                //联系电话
                phone: "",
                //教师等级
                rank: "",
                //备注
                remark: "",
                //教师姓名
                teacher_name: "",
                //教师编号
                teacher_num: "",
                // 职称
                tech_title: ""
            },
            //查询
            demandData: {
                // 教师编号
                teacher_num: "",
                // 教师姓名
                teacher_name: "",
                // 任课教师姓名
                teacher_class_name: ""
            },
            // 所有年级名称
            grade_name: [],
            // 所有班级名称
            class_name: [],
            // 教师职务
            rank: [{
                "rank": "-1",
                "title": "请选择"
            }, {
                "rank": 4,
                "title": "校级领导"
            }, {
                "rank": 5,
                "title": "年级领导"
            }, {
                "rank": 6,
                "title": "普通教师"
            }],
            // 职称
            tech_title: [{
                "tech_title": "请选择"
            }, {
                "tech_title": "初级教师"
            }, {
                "tech_title": "中级教师"
            }, {
                "tech_title": "高级教师"
            }, {
                "tech_title": "特级教师"
            }],
            // 科目
            subject: [],
            //上传文件名
            fileName: "",
            importData: {
                // 返回名
                fileBackName: "",
                //已经存在的教师编号
                exist_teacher: [],
                // 文件格式错误的工作表
                format_error: [],
                // 校验未通过的学校
                refuse_school: [],
                // 文件中重复的教师编号
                repeate_teacher: []
            },
            user:{
                fk_school_id:"",
                school_name:"",
                school_code:""
            },
            //状态
            phoneFlag: "",
            updateFlag: "",
            //  列表按钮操作
            cbopt: function (params) {
                //删除
                if (params.type == "4") {
                    this.modal.id = params.data.id;
                    this.modal.url = api_teacher_delete;
                    this.modal.title = "删除";
                    this.modal.info = "是否删除此条信息？";
                    this.modal.msg = "";
                    $("#delete-modal").modal({
                        closeOnConfirm: false
                    });
                }
                else if (params.type == "2") {
                    this.modal.title = "修改";
                    this.modal.msg = "";
                    this.flag = true;
                    //教师id
                    this.teacherCompile.id = params.data.id;
                    //学校id
                    this.teacherCompile.fk_school_id = params.data.fk_school_id;
                    //联系电话
                    this.teacherCompile.phone = params.data.phone;
                    //教师等级
                    this.teacherCompile.rank = params.data.rank;
                    //备注
                    this.teacherCompile.remark = params.data.remark;
                    //教师姓名
                    this.teacherCompile.teacher_name = params.data.teacher_name;
                    //教师编号
                    this.teacherCompile.teacher_num = params.data.teacher_num;
                    // 职称
                    this.teacherCompile.tech_title = params.data.tech_title;
                    $("#compileData").modal({
                        closeOnConfirm: false
                    });
                }
            },
            //教师信息列表
            teacherList: function () {
                this.url = api_teacher_list;
                this.theadTh = this.teacherListTd;
                this.data = this.listData;
                this.navTabs = 1;
                this.extend.teacher_name = "";
                this.demandData.teacher_name = "";
                this.extend.__hash__ = new Date();
            },
            //教师任课信息列表
            teacherClassList: function () {
                this.url = api_teacher_class_list;
                this.theadTh = this.teacherClassListTd;
                this.data = this.listData;
                this.navTabs = 2;
                this.extend.teacher_name = "";
                this.extend.teacher_num = "";
                this.demandData.teacher_class_name = "";
                this.extend.__hash__ = new Date();
            },
            //查询事件
            demand: function () {
                if (this.navTabs == 1) {
                    this.extend.__hash__ = new Date();
                } else {
                    this.extend.__hash__ = new Date();
                }
            },
            teacherNumDemand: function () {
                this.extend.teacher_num = this.demandData.teacher_num;
            },
            teacherNameDemand: function () {
                if (this.navTabs == 1) {
                    this.extend.teacher_name = this.demandData.teacher_name;
                } else {
                    this.extend.teacher_name = this.demandData.teacher_class_name;
                }
            },
            // 获取年级
            init: function () {
                this.extend.teacher_num="";
                this.demandData.teacher_name = "";
                ajax_post(api_grades, {}, this);
                ajax_post(api_subject_list, {}, this);
            },
            //修改、添加
            addInfo: function () {
                this.modal.title = "添加";
                //教师id
                this.teacherCompile.id = "";
                //学校id
                this.teacherCompile.fk_schoo_id = this.user.fk_school_id;
                //联系电话
                this.teacherCompile.phone = "";
                //教师等级
                this.teacherCompile.rank = "";
                //备注
                this.teacherCompile.remark = "";
                //教师姓名
                this.teacherCompile.teacher_name = "";
                //教师编号
                this.teacherCompile.teacher_num = "";
                // 职称
                this.teacherCompile.tech_title = "";
                this.modal.msg = "";
                $("#compileData").modal({
                    closeOnConfirm: false
                });
            },
            compile: function () {
                if (this.teacherCompile.teacher_name != "" &&
                    this.teacherCompile.teacher_num != "") {
                    if (this.teacherCompile.phone == "" || this.phoneFlag) {
                        ajax_post(api_teacher_save, this.teacherCompile.$model, this);
                    } else {
                        this.modal.msg = "请输入正确格式的联系电话"
                    }
                } else {
                    this.modal.msg = "教师姓名和教师编号必填"
                }
            },
            //数据校验
            nameReg: function () {
                if (this.teacherCompile.teacher_name == "") {
                    this.modal.msg = "请输入教师姓名";
                }
            },
            numReg: function () {
                if (this.teacherCompile.teacher_num == "") {
                    this.modal.msg = "请输入教师编号";
                }
            },
            phoneReg: function () {
                var reg = /^((1(3|4|5|7|8)\d{9})|([0]{1}[1-9]{1}[0-9]{1}-[0-9]{8}|[0]{1}[1-9]{2}[0-9]{1}-[0-9]{7}))$/;
                var phoneReg = reg.test(this.teacherCompile.phone);
                if (this.teacherCompile.phone != '') {
                    if (!phoneReg) {
                        this.modal.msg = "请输入11位手机号码或区号 - 号码的固定电话";
                    } else {
                        this.phoneFlag = true
                    }
                }
            },
            regMsg: function () {
                this.modal.msg = "";
            },
            //上传
            uploadingModal: function () {
                this.modal.title = "上传文件";
                this.modal.msg = "";
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
                //已经存在的教师编号
                this.importData.exist_teacher = "";
                // 文件格式错误的工作表
                this.importData.format_error = "";
                // 校验未通过的学校
                this.importData.refuse_school = "";
                // 文件中重复的教师编号
                this.importData.repeate_teacher = "";
            },
            // 删除
            sure: function () {
                ajax_post(this.modal.url, {teacher_id: this.modal.id}, this);
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
            cds:function() {
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
                    self.cds();
                    self.is_init = true;
                });
            },
            on_request_complete: function (cmd, status, data, is_suc, msg) {
                var compileData = $("#compileData");
                switch (cmd) {
                    case api_grades:
                        this.grade_name = data.data;
                        break;
                    case api_subject_list:
                        this.subject = data.data;
                        break;
                    case api_teacher_save:
                        if (status == 200) {
                            compileData.modal("close");
                        }
                        this.infoModal(status, msg);
                        break;

                    case api_file_upload:
                        if (status == 200) {
                            this.importData.fileBackName = data.data.file;
                            ajax_post(api_teacher_import, {file: this.importData.fileBackName}, this);
                        }
                        this.modal.msg = msg;
                        break;
                    case api_teacher_delete:
                        this.infoModal(status, msg);
                        break;
                    case api_teacher_import:
                        if (status == 200) {
                            this.extend.__hash__ = new Date();
                            info.modal('open');
                            setTimeout(function () {
                                info.modal('close');
                            }, 1000)
                        } else if (status == 205) {
                            //已经存在的教师编号
                            this.importData.exist_teacher = data.data.exist_teacher;
                            // 文件格式错误的工作表
                            this.importData.format_error = data.data.format_error;
                            // 校验未通过的学校
                            this.importData.refuse_school = data.data.refuse_school;
                            // 文件中重复的教师编号
                            this.importData.repeate_teacher = data.data.repeate_teacher;
                        }
                        this.modal.msg = msg;
                        break;
                    case api_import_class:
                        this.infoModal(status, msg);
                        break;
                    case api_class_simple:
                        this.class_name = data.data;
                        break;
                }
            }
        });
        table.init();
        table.cds();
        table.$watch("extend.grade_id", function () {
            var gradeId = table.extend.grade_id;
            ajax_post(api_class_simple, {fk_school_id: 1, fk_grade_id: gradeId}, this);
        });
        table.$watch("onReady",function () {
            // table.url = api_teacher_list;
            table.theadTh = table.teacherListTd;
            table.data = table.listData;
            table.navTabs = 1;
            table.demandData.teacher_name = "";
            table.demandData.teacher_num = "";
            table.extend.__hash__ = new Date();
        });
        return {
            view: html,
            control: table
        }
    });