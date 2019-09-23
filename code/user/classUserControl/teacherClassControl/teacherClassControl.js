/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),
        C.Co("user", "classUserControl/teacherClassControl/teacherClassControl", "css!"),
        C.Co("user", "classUserControl/teacherClassControl/teacherClassControl", "html!"),
        C.CM("table"),
        C.CM("modal"),C.CM('three_menu_module'),
        C.CMF("data_center.js")],
    function (avalon, css, html, tab, modal,three_menu_module, data_center) {
        // 教师集合
        var api_teacher_choose = api.user + "teacher/chooseteacher.action";
        // 教师任课信息列表
        var api_teacher_class_list = api.user + "teacher/teachClassList.action";
        // 编辑教师任课信息
        var api_teacher_save_class = api.user + "teacher/saveTeachClass.action";
        // 删除教师任课信息
        var api_teacher_delete_class = api.user + "teacher/delTeachClass.action";
        // 科目
        var api_subject_list = api.user + "subject/subjectList.action";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "teacherClassControl",
                // 列表数据接口
                url: api_teacher_class_list,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                is_init: false,
                // 列表表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "年级",
                    type: "text",
                    from: "grade_name"
                }, {
                    title: "班级",
                    type: "text",
                    from: "class_name"
                }, {
                    title: "科目",
                    type: "text",
                    from: "subject_name"
                }, {
                    title: "任课教师",
                    type: "text",
                    from: "teacher_name"
                }, {
                    title: "操作",
                    type: "html",
                    from:"<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='编辑'></a>" +
                    "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>"
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
                    // 年级id
                    grade_id: "",
                    fk_class_id: "",
                    __hash__: ""
                },

                //增加、修改
                compileData: {
                    //id
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
                //科目
                subject: [],
                //所有教师
                teacherAll: [],
                //班主任集合
                teach_class_list: [],
                class_list:[],
                //状态
                updateFlag: "",
                nameListFlag: "",
                nameFlag: "",
                //查询事件
                demand: function () {
                    this.extend.__hash__ = new Date();
                },
                gradeChange:function () {
                    var gId=this.extend.fk_grade_id;
                    var grade=this.teach_class_list;
                    for(var i=0;i<grade.length;i++){
                        var id=grade[i].grade_id;
                        if(id==gId){
                            this.class_list=grade[i].class_list;
                        }
                    }
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        var userType = data.data.user_type;
                        if (userType == "1") {
                            var tUserData = JSON.parse(data.data["user"]);
                            cArr = tUserData.lead_class_list;
                            self.teach_class_list = cArr;
                            self.class_list=cArr[0].class_list;
                            self.extend.fk_class_id = cArr[0].class_list[0].class_id;
                            self.extend.fk_grade_id = cArr[0].grade_id;
                            self.compileData.fk_grade_id = cArr[0].grade_id;
                            self.compileData.grade_name = cArr[0].grade_name;
                            self.compileData.fk_class_id = cArr[0].class_list[0].class_id;
                            self.compileData.class_name = cArr[0].class_list[0].class_name;
                            self.compileData.fk_school_id = tUserData.fk_school_id;
                            self.is_init = true;
                            self.extend.__hash__ = new Date();
                        }
                        ajax_post(api_teacher_choose, {fk_school_id: self.compileData.fk_school_id}, self);
                    });
                },
                //  列表按钮操作
                cbopt: function (params) {
                    //删除
                    if (params.type == "4") {
                        this.modal.id = params.data.id;
                        this.modal.url = api_teacher_delete_class;
                        this.modal.title = "删除";
                        this.modal.info = "是否删除此条信息？";
                        this.modal.msg = "";
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    } else if (params.type == "2") {
                        this.modal.title = "修改";
                        //id
                        this.compileData.id = params.data.id;
                        //任课教师id
                        this.compileData.fk_teacher_id = params.data.fk_teacher_id;
                        //任课科目id
                        this.compileData.fk_subject_id = params.data.fk_subject_id;
                        //任课班级id
                        this.compileData.fk_class_id = params.data.fk_class_id;
                        this.compileData.class_name = params.data.class_name;
                        this.compileData.grade_name = params.data.grade_name;
                        this.compileData.subject_name = params.data.subject_name;
                        if (params.data.teacher_name == null || params.data.teacher_num == null) {
                            this.compileData.teacher_name = ""
                        } else {
                            this.compileData.teacher_name = "" + params.data.teacher_name + "" + '-' + "" + params.data.teacher_num + "";
                        }
                        this.modal.msg = "";
                        this.updateFlag = 3;
                        $("#compileData").modal({
                            closeOnConfirm: false
                        });
                    }
                },
                //修改、添加
                addInfo: function () {
                    this.modal.title = "添加";
                    this.compileData.id = "";
                    this.compileData.teacher_name = "";
                    this.compileData.fk_subject_id = "";
                    if (this.extend.fk_class_id != "") {
                        this.compileData.fk_class_id = this.extend.fk_class_id;
                    }
                    if (this.extend.grade_id != "") {
                        this.compileData.fk_grade_id = this.extend.grade_id;
                    }
                    this.modal.msg = "";
                    this.updateFlag = 4;
                    $("#compileData").modal({
                        closeOnConfirm: false
                    });
                },
                compile: function () {
                    if (this.compileData.fk_grade_id != "" &&
                        this.compileData.fk_class_id != "" &&
                        this.compileData.fk_subject_id != "" &&
                        this.compileData.fk_teacher_id != "") {
                        ajax_post(api_teacher_save_class, this.compileData.$model, this)
                    } else {
                        this.modal.msg = "所有选项必填或必选";
                    }
                },
                //教师模糊查询
                nameSearch: function () {
                    var val = this.compileData.teacher_name;
                    var lastLi = $(".am-selected-list li:last-child");
                    var lis = $(".am-selected-list li").not("li:last-child");
                    var str = "";
                    if (val != null && val.length > 0) {
                        for (var i = 0; i <= lis.length; i++) {
                            var index = lis.eq(i).text().indexOf(val);
                            if (index >= 0) {
                                lis.eq(i).show();
                                str += i;
                            } else {
                                if (i == lis.length && index == -1 && str == "") {
                                    lastLi.show();
                                } else {
                                    lis.eq(i).hide();
                                }
                            }
                        }
                    } else {
                        lastLi.hide();
                        lis.show();
                        str = "";
                    }
                },
                nameListShow: function () {
                    this.nameListFlag = 1;
                    if (this.teacherAll.length == 0) {
                        $(".am-selected-list li:last-child").show();
                    } else {
                        $(".am-selected-list li:last-child").hide();
                    }
                    this.modal.msg = "";
                    $(".am-selected-list li").not("li:last-child").show();
                },
                nameListHide: function () {
                    if (this.nameFlag == false) {
                        this.nameListFlag = 0;
                        this.compileData.teacher_name = "";
                    }
                },
                nameInput: function (id, name, num) {
                    this.compileData.fk_teacher_id = id;
                    this.compileData.teacher_name = "" + name + "" + '-' + "" + num + "";
                    this.nameListFlag = 0;
                },
                nameFlagTrue: function () {
                    this.nameFlag = true;
                },
                nameFlagFalse: function () {
                    this.nameFlag = false;
                },
                // 删除
                sure: function () {
                    ajax_post(this.modal.url, {teachclass_id: this.modal.id}, this);
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
                // 获取年级
                init: function () {
                    ajax_post(api_subject_list, {status: 1}, this);
                    this.cds();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var compileData = $("#compileData");
                    var info = $("#info-tips");
                    switch (cmd) {
                        case  api_teacher_save_class:
                            if (status == 200) {
                                compileData.modal("close");
                            }
                            this.infoModal(status, msg);
                            break;
                        case  api_teacher_delete_class:
                            info.modal('open');
                            setTimeout(function () {
                                info.modal('close');
                            }, 1000);
                            this.modal.msg = msg;
                            this.extend.__hash__ = new Date();
                            break;
                        case  api_subject_list:
                            this.subject = data.data;
                            break;
                        case  api_teacher_choose:
                            this.teacherAll = data.data;
                            break;
                    }
                }
            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });