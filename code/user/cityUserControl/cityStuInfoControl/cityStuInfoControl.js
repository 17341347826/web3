/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),
        // C.Co("user","user_public/css/user","css!"),
        C.Co("user","cityUserControl/cityStuInfoControl/cityStuInfoControl","css!"),
        C.Co("user","cityUserControl/cityStuInfoControl/cityStuInfoControl","html!"),
        C.CM("table"),
        C.CM("modal"),
        C.CMF("data_center.js"),C.CM('three_menu_module'),
        "PCAS"],
    function (avalon, css, html, tab, modal, data_center,three_menu_module, PCAS) {
        // 学生信息列表
        var api_student_list = api.user + "student/studentList.action";
        // 删除学生信息
        var api_student_delete = api.user + "student/delete.action";
        //年级列表
        var api_grades = api.user + "grade/findGrades.action";
        //获取班级
        var api_class_simple = api.user + "class/findClassSimple.action";
        // 编辑学生信息
        var api_student_save = api.user + "student/saveStudent.action";
        //文件上传
        var api_file_upload = api.user + "file/upload.action";
        // 导入学生信息
        var api_student_import = api.user + "student/importStudent.action";
        //市级-学校维护
        var api_city_school = api.user + "school/schoolList.action";
        //批量删除学生记录
        var api_batch_del = api.user +'student/batch_del';
        var avalon_define = function () {
            var table = avalon.define({
                $id: "table",
                // 列表数据接口
                url:  api_student_list,
                is_init: false,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                //批量学生状态、批量删除学生
                stu_ids:[],
                // 列表表头名称
                theadTh: [
                    // {
                    //     title:
                    //         "<input type='checkbox' name='checkAll' id='checkAll'  value='全选'  ms-on-click='@oncbopt({current:$idx, type:7})'>全选",
                    //     type: "html",
                    //     from:
                    //         "<input type='checkbox' ms-attr='{value:el.user_id+\"|\"+el.guid}'  name='checkper' class='checkper' ms-on-click='@oncbopt({current:$idx, type:6})'>"
                    // },
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
                        title: "区县",
                        type: "text",
                        from: "district"
                    },
                    {
                        title: "学校名称",
                        type: "text",
                        from: "school_name"
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
                        from:"<a class='tab-btn tab-edit-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='编辑'></a>" +
                        "<a class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>"
                    }
                ],
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
                    city: "",
                    //区县
                    district: "",
                    //学校名称
                    school_name: "",
                    // 学籍号
                    student_num: "",
                    // 学生姓名
                    student_name: "",
                    __hash__: ""
                },
                // 性别
                sex: [ {
                    "sex": "1",
                    "title": "男"
                }, {
                    "sex": "2",
                    "title": "女"
                }],
                // 科类类别
                arts_or_science: [{
                    "arts_or_science": "-1",
                    "title": "请选择"
                }, {
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
                current_or_over: [{
                    "current_or_over": "0",
                    "title": "不分应往届"
                }, {
                    "current_or_over": "1",
                    "title": "应届"
                }, {
                    "current_or_over": "2",
                    "title": "往届"
                }],
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
                    school_name: "",
                    // 学籍号
                    student_num: "",
                    //学校代码
                    school_code: "",
                    //班级id
                    fk_class_id: "",
                    // 学生姓名
                    student_name: ""
                },
                // 所有年级名称
                grade_name: [],
                // 所有班级名称
                class_name: [],
                //学校集合
                school_code: [],
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
                nameListFlag: "",
                nameFlag: "",
                user: {
                    department_level: "",
                    //省
                    province: "",
                    //市
                    city: "",
                    //区县
                    district: ""
                },
                //修改的数据的年级id
                current_gId:'',
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
                    } else if (params.type == "2") {//编辑
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
                        //年级id
                        // this.compileData.fk_grade_id = params.data.fk_grade_id;
                        //请求年级
                        if(this.grade_name.length == 0){
                            //学校代码
                            this.demandData.school_code = params.data.school_code;
                            ajax_post(api_grades, {}, this);
                            this.current_gId = params.data.fk_grade_id;
                        }else{
                            this.compileData.fk_grade_id = params.data.fk_grade_id;
                            if(this.demandData.school_code != params.data.school_code){
                                //学校代码
                                this.demandData.school_code = params.data.school_code;
                                this.school_code = [];
                                ajax_post(api_city_school, {city: table.user.city, schoolcode: params.data.school_code}, table);
                            }
                        }
                        //学校id
                        this.compileData.fk_school_id = params.data.fk_school_id;
                        //学校名称
                        this.compileData.school_name = params.data.school_name;
                        //班级id
                        this.demandData.fk_class_id = params.data.fk_class_id;
                        //家长姓名
                        this.compileData.parent_name = params.data.parent_name;
                        // 家长电话
                        this.compileData.parent_phone = params.data.parent_phone;
                        //备注
                        this.compileData.remark = params.data.remark;
                        // this.school_code = [];
                        $("#compileData").modal({
                            closeOnConfirm: false
                        });
                    }else if(params.type == '6'){//单个checkbox
                        var list = this.stu_ids;
                        var ary = $('.checkper');
                        var value = params.data.id;
                        var index = params.current;
                        /*判断checkbox是否选中（参照本页面）:
                         html格式:ary[index].checked  //true/false
                         js格式：$('#checkAll').is(':checked')  //true/false
                         * */
                        if(ary[index].checked) {//选中   所有版本:true/false
                            list.push(value);
                        }else{//未选中
                            list.remove(value);
                        }
                        this.stu_ids = list;
                    }else if(params.type == '7'){//全选
                        //获取所有checkbox元素
                        var ary = $('.checkper');
                        //判断全选是否选中
                        if($('#checkAll').is(':checked')){//选中  is(':checked')----所有版本:true/false
                            var num_ary = [];
                            for(var i=0;i<ary.length;i++){
                                var value = ary[i].value.split('|');
                                var num = Number(value[0]);
                                // 设置元素为选中状态
                                ary[i].checked = true;
                                num_ary.push(num);
                            }
                            this.stu_ids = num_ary;
                        }else{//未选中
                            for(var i=0;i<ary.length;i++){
                                // 设置元素为未选中状态
                                ary[i].checked = false;
                            }
                            this.stu_ids = [];
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
                },
                //批量删除
                batch_del:function(){
                    var list = this.stu_ids;
                    if(list.length == 0){
                        toastr.warning('请选择需要操作的学生');
                        return;
                    }
                    ajax_post(api_batch_del,{id_arr:list},this);
                },
                //查询事件
                demand: function () {
                    this.extend.__hash__ = new Date();
                },
                schoolNameSearch: function () {
                    this.extend.school_name = this.demandData.school_name;
                },
                studentNumDemand: function () {
                    this.extend.student_num = this.demandData.student_num;
                },
                studentNameDemand: function () {
                    this.extend.student_name = this.demandData.student_name;
                },
                nameSearch: function () {
                    var val = this.demandData.school_code;
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
                        if (this.school_code.length == 0) {
                            lastLi.show();
                        } else {
                            lastLi.hide();
                            lis.show();
                        }
                        str = "";
                    }
                },
                nameListShow: function () {
                    this.nameListFlag = 1;
                    if (this.school_code.length == 0) {
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
                        this.demandData.school_code = "";
                        this.compileData.school_name = "";
                        this.class_name=[];
                        this.compileData.fk_class_id = '';
                        this.demandData.fk_class_id = '';
                    }
                },
                nameInput: function (id, name, num) {
                    this.compileData.fk_school_id = id;
                    this.compileData.school_name = name;
                    this.demandData.school_code = num;
                    this.compileData.school_code = num;
                    this.nameListFlag = 0;
                    this.class_name=[];
                    this.compileData.fk_class_id = '';
                    this.demandData.fk_class_id = '';
                    ajax_post(api_class_simple, {fk_school_id: this.compileData.fk_school_id, fk_grade_id: this.compileData.fk_grade_id}, this);

                },
                nameFlagTrue: function () {
                    this.nameFlag = true;
                },
                nameFlagFalse: function () {
                    this.nameFlag = false;
                },
                //修改
                compile: function () {
                    if (this.flag) {
                        if (this.modal.msg == '' && this.compileData.fk_school_id!="" &&this.compileData.student_name!="" &&
                            this.compileData.sex != null && this.compileData.fk_grade_id != "" &&
                            this.compileData.fk_class_id != "" &&  this.compileData.current_or_over != "" && this.demandData.school_code != '') {
                            ajax_post(api_student_save, this.compileData.$model, this);
                        } else {
                            this.modal.msg = "所有选项必填或必选"
                        }
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
                    this.fileName="";
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
                    this.importData.fileBackName="";
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
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        if (userType == "0") {
                            var data = JSON.parse(data.data["user"]);
                            var department_level = data.department_level;
                            self.user.department_level = department_level;
                            self.user.province = data.province;
                            self.user.city = data.city;
                            self.extend.city = data.city;
                            self.user.district = data.district;
                            self.extend.district = data.district;
                            if(department_level == 2){
                                new PCAS("province", "city", "area", "" + data.province + "", "" + data.city + "");
                            }
                        }
                        self.is_init = true;

                    });
                },
                user_level:'',
                init: function () {
                    this.user_level = cloud.user_level();
                    this.cds();
                    // //年级
                    // ajax_post(api_grades, {}, this);
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
                    var file=$("#file-uploading");
                    switch (cmd) {
                        case  api_grades:
                            this.complete_get_grades(data);
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
                            info.modal('open');
                            setTimeout(function () {
                                info.modal('close');
                            }, 1000);
                            this.modal.msg = msg;
                            break;
                        case  api_student_import:
                            if (status == 200) {
                                file.modal('close');
                                info.modal('open');
                                setTimeout(function () {
                                    info.modal('close');
                                }, 1000);
                                this.extend.__hash__ = new Date();
                            }else if (status == 205) {
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
                        case  api_city_school:
                            this.complete_city_school(data);
                            break;
                        case  api_class_simple:
                            this.complete_class_simple(data);
                            break;
                        //    批量删除
                        case api_batch_del:
                            this.complete_batch_del(data);
                            break;
                    }
                },
                //获取年级信息--只会调用一次
                complete_get_grades:function(data){
                    this.grade_name = data.data;
                    this.compileData.fk_grade_id = this.current_gId;
                    ajax_post(api_city_school, {city: this.user.city, schoolcode: this.demandData.school_code}, this);
                },
                //获取学校代码
                complete_city_school:function(data){
                    this.school_code = data.data.list;
                    this.class_name = [];
                    this.compileData.fk_class_id = '';
                    ajax_post(api_class_simple, {
                        fk_school_id: this.compileData.fk_school_id,
                        fk_grade_id: this.compileData.fk_grade_id
                    }, this);
                },
                //班级信息
                complete_class_simple:function(data){
                    this.class_name = data.data;
                    this.compileData.fk_class_id = this.demandData.fk_class_id;
                },
                //    批量删除
                complete_batch_del:function(data){
                    //批量操作后清除
                    this.clean_stu();
                    this.extend.__hash__ = new Date();
                    toastr.success('学生批量删除成功');
                },
            });
            table.$watch('onReady', function () {
                table.init();
            });
            //年级改变监测班级改变
            // table.$watch("compileData.fk_grade_id", function () {
            //     var gradeId = table.compileData.fk_grade_id;
            //     table.class_name=[];
            //     table.compileData.fk_class_id = '';
            //     table.demandData.fk_class_id = '';
            //     if(gradeId!=""  && table.compileData.fk_school_id != ''){
            //         ajax_post(api_class_simple, {fk_school_id: table.compileData.fk_school_id, fk_grade_id: gradeId}, table);
            //     }
            // });
            //学校id改变监测班级改变
            // table.$watch("compileData.fk_school_id", function () {
            //     var schoolId = table.compileData.fk_school_id;
            //     if(schoolId!="" && table.compileData.fk_grade_id != ''){
            //         ajax_post(api_class_simple, {fk_school_id: table.compileData.fk_school_id, fk_grade_id: table.compileData.fk_grade_id}, table);
            //     }else {
            //         table.class_name=[];
            //         table.compileData.fk_class_id = [];
            //     }
            // });
            //学校
            // table.$watch("demandData.school_code", function () {
            //     var schoolCode = table.demandData.school_code;
            //     var schoolId = table.compileData.fk_school_id;
            //     table.class_name=[];
            //     table.compileData.fk_class_id = '';
            //     table.demandData.fk_class_id = '';
            //     if(schoolId!="" && table.compileData.fk_grade_id != ''){
            //         ajax_post(api_class_simple, {fk_school_id: table.compileData.fk_school_id, fk_grade_id: table.compileData.fk_grade_id}, table);
            //     }
            // });
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });