/**
 * Created by uptang on 2017/4/28.
 */

define([
        C.CLF('avalon.js'),
        C.Co("user", "schoolUserControl/classControl/classControlList", "css!"),
        C.Co("user", "schoolUserControl/classControl/classControlList", "html!"),
        C.CM("table"),
        C.CM("modal"),
        C.CMF("data_center.js"),
        "PCAS",
        C.CM('three_menu_module')
    ],
    function (avalon, css1, html, tab, modal, data_center, PCAS,three_menu_module) {
        //班级信息列表
        var api_class = api.user + "class/findClassInfo.action";
        //删除班级
        var api_delete_class = api.user + "class/deleteClass.action";
        //年级列表
        var api_grades = api.user + "grade/findGrades.action";
        //年级--校级
        var grade_list = api.api + "base/class/school_class.action";
        //班级属性列表
        var api_class_property = api.user + "classProperty/findClassProperties.action";
        //编辑班级
        var api_save_class = api.user + "class/saveClass.action";
        //文件上传
        var api_file_upload = api.user + "file/upload.action";
        //班级信息上传
        var api_import_class = api.user + "class/importClass.action";
        //市级-学校维护
        var api_city_school = api.user + "school/schoolList.action";
        // 教师集合
        var api_teacher_choose = api.user + "teacher/chooseteacher.action";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "classControlList",
                is_init: false,
                // 列表数据接口
                url: api_class,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                // 列表表头名称
                theadTh: [],
                //学校管理员
                schoolThead: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "年级名称",
                        type: "text",
                        from: "grade_name"
                    },
                    {
                        title: "班级名称",
                        type: "text",
                        from: "class_name"
                    },
                    {
                        title: "班级类别",
                        type: "text",
                        from: "class_property"
                    },
                    {
                        title: "班级科类",
                        type: "cover_text",
                        from: "class_type",
                        dict: {
                            0: '不分文理',
                            1: '文科',
                            2: '理科'
                        }
                    },
                    {
                        title: "班主任",
                        type: "text",
                        from: "class_teacher_name"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from:"<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='编辑'></a>" +
                        "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>"
                    }],
                //市级用户
                //学校管理员
                cityThead: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "区县",
                    type: "text",
                    from: "district"
                }, {
                    title: "学校名称",
                    type: "text",
                    from: "school_name"
                }, {
                    title: "年级名称",
                    type: "text",
                    from: "grade_name"
                }, {
                    title: "班级名称",
                    type: "text",
                    from: "class_name"
                }, {
                    title: "班级科类",
                    type: "cover_text",
                    from: "class_type",
                    dict: {
                        0: '不分文理',
                        1: '文科',
                        2: '理科'
                    }
                }, {
                    title: "班级类别",
                    type: "text",
                    from: "class_property"
                },
                    {
                        title: "班主任",
                        type: "text",
                        from: "class_teacher_name"
                    }, {
                        title: "操作",
                        type: "html",
                        from:"<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='编辑'></a>" +
                        "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>"
                }],
                // 附加参数
                extend: {
                    //市
                    city: "",
                    //区县
                    district: "",
                    //学校名称
                    school_name: "",
                    //学校id
                    fk_school_id: "",
                    //年级id
                    fk_grade_id: "",
                    //班级类别
                    class_property: "",
                    __hash__: ""
                },
                // 模态框
                modal: {
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: ""
                },
                //增加、修改
                compileData: {
                    //学校名称
                    school_name: "",
                    //学校代码
                    school_code: "",
                    // 年级名称
                    grade_name: "",
                    // 班级名称
                    class_name: "",
                    // 班级代码
                    class_code: "",
                    // 班级科类
                    class_type: "",
                    // 班级类别
                    class_property: "",
                    // 班主任教师名称
                    class_teacher_name: "",
                    //学校id
                    fk_school_id: "",
                    //班主任教师id
                    fk_class_teacher_id: "",
                    //年级id
                    fk_grade_id: "",
                    //班级id
                    id: ""
                },
                // 所有年级名称
                grade_name: [],
                //所有教师
                teacherAll: [],
                // 班级科类
                class_type: [{
                    "class_type": "0",
                    "title": "不分文理"
                }, {
                    "class_type": 1,
                    "title": "文科"
                }, {
                    "class_type": 2,
                    "title": "理科"
                }],
                // 班级类别
                class_property: [],
                // 市级==获取区县学校
                city_school: [],
                //上传文件名
                fileName: "",
                classImport: {
                    // 返回名
                    fileBackName: "",
                    //允许操作的班级属性
                    allowClassProperty: [],
                    // 允许操作的年级
                    allowGrade: [],
                    // 已经存在的班级
                    refuseClass: [],
                    // 校验未通过的年级
                    refuseGrade: [],
                    //校验未通过的班级属性
                    refuseProperty: [],
                    //校验未通过的学校代码
                    refuseSchool: [],
                    //重复的班级
                    repeatClass: []
                },
                //状态
                flag: "",
                other: {
                    school_name: "",
                    schoolListFlag: "",
                    schoolFlag: "",
                    msg: "",
                    nameListFlag: "",
                    nameFlag: ""
                },
                user: {
                    //用户类型
                    user_type: "",
                    //管理员等级
                    department_level: "",
                    //省
                    province: "",
                    //市
                    city: "",
                    //区县
                    district: "",
                    // 市级===学校名称
                    schoolname: "",
                    fk_school_id: "",
                    school_name: "",
                    school_code: ""
                },
                //  列表按钮操作
                cbopt: function (params) {
                    if (params.type == "4") {
                        this.modal.title = "删除";
                        this.modal.info = "是否删除此班级？";
                        this.modal.url = api_delete_class;
                        // 当前数据的id
                        this.modal.id = params.data.id;
                        this.modal.msg = "";
                        $("#delete-modal").modal({
                            closeOnConfirm: false
                        });
                    } else if (params.type == "2") {
                        this.modal.title = "修改";
                        this.modal.msg = "";
                        if (this.user.department_level == "2") {
                            //所属区县
                            new PCAS("province1", "city1", "area1", "" + params.data.province + "", "" + params.data.city + "", "" + params.data.district + "");
                            //学校名称
                            this.other.school_name = "" + params.data.school_name + "" + '-' + "" + params.data.school_code + "";
                        } else if (this.user.department_level == "4") {
                            this.compileData.school_name = params.data.school_name;
                        }
                        this.user.province = params.data.province;
                        this.user.city = params.data.city;
                        this.user.district = params.data.district;
                        this.compileData.school_code = params.data.school_code;
                        this.compileData.fk_school_id = params.data.fk_school_id;
                        //年级
                        this.compileData.fk_grade_id = params.data.fk_grade_id;
                        this.compileData.grade_name = params.data.grade_name;
                        //班级名称
                        this.compileData.class_name = params.data.class_name;
                        //班级代码
                        this.compileData.class_code = params.data.class_code;
                        this.compileData.fk_class_teacher_id = params.data.fk_class_teacher_id;
                        //班级属性
                        this.compileData.class_property = params.data.class_property;
                        if (params.data.class_teacher_name == null || params.data.class_teacher_num == null) {
                            this.compileData.class_teacher_name = ""
                        } else {
                            //班主任
                            this.compileData.class_teacher_name = "" + params.data.class_teacher_name + "" + '-' + "" + params.data.class_teacher_num + "";
                        }
                        //班级类型
                        this.compileData.class_type = params.data.class_type;
                        this.compileData.id = params.data.id;
                        this.flag = true;
                        $("#compileData").modal({
                            closeOnConfirm: false
                        });
                    }
                },
                //查询事件
                demand: function () {
                    this.extend.__hash__ = new Date();
                },
                // 市级--学校名称搜索
                schoolNameSearch: function () {
                    this.extend.school_name = this.user.schoolname
                },
                //模糊查询匹配
                nameSearch: function (name, obj) {
                    var self = this;
                    var val = name;
                    var lastLi = obj.find("li:last-child");
                    var lis = obj.find("li").not("li:last-child");
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
                                    self.other.msg = "无此数据"
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
                nameListShow: function (arr) {
                    if (arr.length == 0) {
                        $(".am-selected-list li:last-child").show();
                    } else {
                        $(".am-selected-list li:last-child").hide();
                    }
                    $(".am-selected-list li").not("li:last-child").show();
                },
                nameInput: function (id, name, num) {
                    this.compileData.fk_class_teacher_id = id;
                    this.compileData.class_teacher_name = "" + name + "" + '-' + "" + num + "";
                    this.nameListFlag = 0;
                },
                //市级==学校模糊查询
                schoolNameInput: function (id, name, num) {
                    this.compileData.fk_school_id = id;
                    this.other.school_name = "" + name + "" + '-' + "" + num + "";
                    this.compileData.school_code = num;
                    this.other.schoolListFlag = 0;
                },
                schoolNameDemand: function () {
                    var val = this.other.school_name;
                    var obj = $(".school-name");
                    this.nameSearch(val, obj);
                },
                schoolNameListShow: function () {
                    var arr = [];
                    if (this.user.district != "") {
                        if (this.city_school.length != 0) {
                            arr = this.city_school;
                        } else {
                            this.other.msg = "暂无数据（请先导入或新增学校）"
                        }
                    } else {
                        this.other.msg = "请先选择区县"
                    }
                    this.other.schoolListFlag = 1;
                    this.nameListShow(arr);
                    this.numMsg();
                },
                schoolNameListHide: function () {
                    if (this.other.schoolFlag == false) {
                        this.other.schoolListFlag = 0;
                        this.other.school_name = "";
                    }
                },
                schoolNameTrue: function () {
                    this.other.schoolFlag = true;
                },
                schoolNameFalse: function () {
                    this.other.schoolFlag = false;
                },
                //班主任模糊查询
                teacherNameInput: function (id, name, num) {
                    this.compileData.fk_class_teacher_id = id;
                    this.compileData.class_teacher_name = "" + name + "" + '-' + "" + num + "";
                    this.other.nameListFlag = 0;
                },
                teacherNameDemand: function () {
                    var val = this.compileData.class_teacher_name;
                    var obj = $(".teacher-name");
                    this.nameSearch(val, obj);
                },
                teacherNameListShow: function () {
                    var arr = [];
                    if (this.compileData.fk_school_id != "") {
                        if (this.teacherAll.length != 0) {
                            arr = this.teacherAll;
                        } else {
                            this.other.msg = "暂无数据（请先导入或新增教师）";
                        }
                    } else {
                        if (this.user.department_level == "2") {
                            this.other.msg = "请先输入并选择学校"
                        } else if (this.user.department_level == "4") {
                            this.other.msg = "请先输入并选择"
                        }
                    }
                    this.other.nameListFlag = 1;
                    this.nameListShow(arr);
                    this.numMsg();
                },
                teacherNameListHide: function () {
                    if (this.other.nameFlag == false) {
                        this.other.nameListFlag = 0;
                        this.compileData.class_teacher_name = "";
                    }
                },
                teacherNameTrue: function () {
                    this.other.nameFlag = true;
                },
                teacherNameFalse: function () {
                    this.other.nameFlag = false;
                },
                init: function () {
                    this.cds();
                    ajax_post(api_class_property, {status: 1}, this);
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        if (userType == "0") {
                            var data = JSON.parse(data.data["user"]);
                            var department_level = data.department_level;
                            self.user.department_level = department_level;
                            if (department_level == "2") {
                                self.user.province = data.province;
                                self.user.city = data.city;
                                self.extend.city = data.city;
                                self.theadTh = self.cityThead;
                                ajax_post(api_grades, {status: 1}, self);
                                new PCAS("province", "city", "area", "" + data.province + "", "" +data.city + "");
                            } else if (department_level == "4") {
                                self.user.fk_school_id = data.fk_school_id;
                                self.extend.fk_school_id = data.fk_school_id;
                                self.user.school_name = data.school_name;
                                self.user.school_code = data.school_code;
                                self.theadTh = self.schoolThead;
                                ajax_post(api_grades, {status: 1}, self);
                            }
                        }
                        self.is_init = true;
                    });

                },
                //修改、添加
                compile: function () {
                    if (this.user.user_type = '0') {
                        if (this.flag && this.compileData.fk_school_id != ""
                            && this.compileData.fk_school_id != "") {
                            if (this.compileData.fk_grade_id == 0) {
                                this.modal.msg = "请选择年级"
                            } else {
                                ajax_post(api_save_class, this.compileData.$model, this);
                            }
                        } else {
                            if(!this.flag){
                                this.modal.msg = "请输入正确格式的班级名称"
                            }else {
                                this.modal.msg = "学校、年级和班级必填或必选"
                            }
                        }
                    } else if (this.user.user_type = '1') {
                        if (this.flag) {
                            if (this.compileData.fk_grade_id == 0) {
                                this.modal.msg = "请选择年级"
                            } else {
                                ajax_post(api_save_class, this.compileData.$model, this);
                            }
                        }else {
                            this.modal.msg = "请输入正确格式的班级名称"
                        }
                    }
                },
                addInfo: function () {
                    this.modal.title = "添加";
                    if (this.user.department_level == "2") {
                        this.compileData.school_code = "";
                        this.other.school_name = "";
                        new PCAS("province1", "city1", "area1", "" + this.user.province + "", "" + this.user.city + "");
                    } else if (this.user.department_level == "4") {
                        this.compileData.grade_name = "";
                        this.compileData.fk_school_id = this.user.fk_school_id;
                        this.compileData.school_name = this.user.school_name;
                        this.compileData.school_code = this.user.school_code;
                    }
                    // 班级代码
                    this.compileData.class_code = "";
                    // 班级名称
                    this.compileData.class_name = "";
                    //年级id
                    this.compileData.fk_grade_id = "";
                    // 班主任教师名称
                    this.compileData.class_teacher_name = "";
                    // 班级科类
                    this.compileData.class_type = "";
                    // 班级类别
                    this.compileData.class_property = "";
                    this.compileData.id = "";
                    this.modal.msg = "";
                    $("#compileData").modal({
                        closeOnConfirm: false
                    });
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
                    this.classImport.fileBackName = "";
                    //允许操作的班级属性
                    this.classImport.allowClassProperty = "";
                    // 允许操作的年级
                    this.classImport.allowGrade = "";
                    // 已经存在的班级
                    this.classImport.refuseClass = "";
                    // 校验未通过的年级
                    this.classImport.refuseGrade = "";
                    //校验未通过的班级属性
                    this.classImport.refuseProperty = "";
                    //校验未通过的学校代码
                    this.classImport.refuseSchool = "";
                    //重复的班级
                    this.classImport.repeatClass = "";
                },
                // 删除
                sure: function () {
                    ajax_post(this.modal.url, {class_id: this.modal.id}, this);
                },
                //数据校验
                numReg: function () {
                    var reg = /^(([0]{1}[1-9]{1,2})|((?!0)\d{1,3})|(00[1-9])|([1-9]\d{2})|(\d[1-9]\d))$/;
                    var numReg = reg.test(this.compileData.class_name);
                    if (this.compileData.class_name == "") {
                        this.modal.msg = "请选择年级以及输入班级名称"
                    } else {
                        if (!numReg) {
                            this.modal.msg = "请输入正确格式的班级名称"
                        } else {
                            this.flag = true;
                        }
                    }
                },
                numMsg: function () {
                    this.modal.msg = "";
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
                        //市级===获取区县学校
                        case  api_city_school:
                            this.city_school = data.data.list;
                            break;
                        case  api_grades:
                            this.grade_name = data.data;
                            break;
                        case grade_list:
                            this.grade_name = data.data;
                            break;
                        case  api_class_property:
                            this.class_property = data.data;
                            break;
                        case  api_teacher_choose:
                            this.teacherAll = data.data;
                            break;
                        case api_save_class:
                            if (status == 200) {
                                compileData.modal("close");
                            }
                            this.infoModal(status, msg);
                            break;
                        case  api_file_upload:
                            if (status == 200) {
                                this.classImport.fileBackName = data.data.file;
                                ajax_post(api_import_class, {file: this.classImport.fileBackName}, this);
                            }
                            this.modal.msg = msg;
                            break;
                        case  api_delete_class:
                            info.modal('open');
                            setTimeout(function () {
                                info.modal('close');
                            }, 1000);
                            this.modal.msg = msg;
                            this.extend.__hash__ = new Date();
                            break;
                        case  api_import_class:
                            if (status == 200) {
                                file.modal('close');
                                info.modal('open');
                                setTimeout(function () {
                                    info.modal('close');
                                }, 1000);
                                this.extend.__hash__ = new Date();
                            } else if (status == 205) {
                                //允许操作的班级属性
                                this.classImport.allowClassProperty = data.data.allowClassProperty;
                                // 允许操作的年级
                                this.classImport.allowGrade = data.data.allowGrade;
                                // 已经存在的班级
                                this.classImport.refuseClass = data.data.refuseClass;
                                // 校验未通过的年级
                                this.classImport.refuseGrade = data.data.refuseGrade;
                                //校验未通过的班级属性
                                this.classImport.refuseProperty = data.data.refuseProperty;
                                //校验未通过的学校代码
                                this.classImport.refuseSchool = data.data.refuseSchool;
                                //重复的班级
                                this.classImport.repeatClass = data.data.repeatClass;
                            }
                            this.modal.msg = msg;
                            break;
                    }
                }
            });
            table.init();
            //市级==区县获取学校
            table.$watch('user.district', function () {
                if (table.user.district != "") {
                    ajax_post(api_city_school, {district: table.user.district, department_level: 4}, table);
                } else {
                    table.city_school = [];
                }
            });
            //获取老师
            table.$watch('compileData.fk_school_id', function () {
                if (table.compileData.fk_school_id != "") {
                    ajax_post(api_teacher_choose, {fk_school_id: table.compileData.fk_school_id}, table);
                } else {
                    table.teacherAll = [];
                }
            });
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });