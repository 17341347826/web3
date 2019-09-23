define(["jquery", C.CLF('avalon.js'), 'layer',
        C.Co("evaluation_material", "teacher_evaluation/city_management_create_scheme/city_management_create_scheme", "css!"),
        C.Co("evaluation_material", "teacher_evaluation/city_management_create_scheme/city_management_create_scheme", "html!"),
        C.CMF("router.js"), C.CMF("data_center.js"),
        // C.CM('three_menu_module'),
        C.CM("table")],
    function ($, avalon, layer, css, html, x, data_center,tab) {
        //获取年级
        var api_get_grade = api.api + "base/grade/findGrades.action";
        //查询参考方案
        var api_get_refer = api.api + "Indexmaintain/indexmaintain_findByRefer";
        //查询方案内容
        var api_get_plan_content = api.api + "Indexmaintain/indexmaintain_findByPlanSubject";
        //获取学校类别
        var api_get_school_type = api.api + "base/schoolproperty/dept_sp";
        //添加方案校验
        var api_plan_name = api.api + 'Indexmaintain/find_plan_name';
        //添加方案
        var api_add_plan = api.api + "Indexmaintain/add_county_plan";

        var grade_map = {
            '一':1,
            '二':2,
            '三':3,
            '四':4,
            '五':5,
            '六':6,
            '七':7,
            '八':8,
            '九':9
        }


        var avalon_define = function (pxm) {
            var vm = avalon.define({
                $id: "city_management_create_scheme",
                url: "",
                type: "",
                num: "",
                first_table_list: [],
                second_table_list: [],
                second_table_list_value_list: [],
                plan_content: "",
                //学校信息
                school_info: 0,
                //年级信息
                grade_info: "",
                //方案类型
                plan_type: "",
                //方案校验：存在-false,不存在-true
                scheme_live: true,
                //查询参考方案
                reference_scheme_arr: "",
                //点击获得参考方案
                reference_arr: "",
                //学校数组
                school_list: [],
                // 请求参数
                request_data: {
                    plan_check_state: 2,//1:待审核 2:审核通过 3:审核不通过
                    plan_grade: "",
                    plan_gradeid: "",//number
                    plan_name: "",
                    //参考方案
                    plan_refer: "",
                    plan_referid: "",//number
                    //方案适用学校类别(必填)
                    plan_school_type: "",//全部
                    //方案适用学校类别id
                    plan_school_typeid: "",//number 0
                    plan_subject: "",//4:全部 1学生自评  2学生互评  3教师评价
                    plan_subjectid: "",//评价主体id(必填)
                    //1:启用 2:停用
                    plan_use_state: 2,//number
                    //方案类型
                    plan_type: ""//number 1:选项 2:直接打分
                },
                request_save_plan: {
                    fk_plan_id: "",
                    sub_subject: [],
                    sub_subjectid: []
                },
                response_data: {
                    //适用年级
                    grade_arr: ""
                },
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                    });
                    self.is_init = true;
                    ajax_post(api_get_school_type, {}, self);
                },
                //方案名称检查是否存在
                scheme_check: function () {
                    if (this.request_data.plan_name.trim() != '') {
                        //方案校验
                        ajax_post(api_plan_name, {plan_name: this.request_data.plan_name}, this);
                    }
                },
                get_grade: function () {
                    ajax_post(api_get_grade, {status: "1"}, this);
                },
                //方案类型
                type_click: function () {
                    this.request_data.plan_type = this.plan_type;
                    var grade_info = this.grade_info;
                    var plan_type = this.plan_type;
                    var grade_name = grade_info.split("|")[0];
                    var grade = this.grade_switch(grade_name);
                    this.get_refer(grade);
                },
                grade_switch:function(grade_name){
                    var grade_num = grade_name.substr(0,1);
                     return grade_map[grade_num];
                },
                //查询参考方案
                get_refer:function (plan_gradeid) {
                    if(this.school_info==0){
                        this.request_data.plan_school_typeid = 0;
                    }
                    ajax_post(api_get_refer, {
                        plan_gradeid: plan_gradeid,
                        plan_subjectid: this.request_data.plan_subjectid,
                        plan_type: this.request_data.plan_type,
                        plan_school_typeid: this.request_data.plan_school_typeid
                    }, this);
                },
                //适用年级
                get_apply_grade: function () {
                    var plan_subject = this.request_data.plan_subject;
                    if (plan_subject == '') {
                        toastr.warning('请先选择适用评价主体');
                        this.grade_info = '';
                        return;
                    } else {
                        var grade_info = this.grade_info;
                        var plan_type = this.plan_type;
                        if (plan_subject.length != 0 && plan_subject != "请选择" && grade_info != "请选择" && plan_type != 0) {
                            var grade = this.grade_switch(grade_info)
                            this.get_refer(grade);
                        }

                    }
                },
                //适用评价主体
                get_apply_subject: function () {
                    var plan_subject_id = this.request_data.plan_subjectid;
                    if (plan_subject_id == 1) {
                        this.request_data.plan_subject = '学生自评';
                    } else if (plan_subject_id == 2) {
                        this.request_data.plan_subject = '学生互评';
                    } else if (plan_subject_id == 3) {
                        this.request_data.plan_subject = '教师评价';
                    } else if (plan_subject_id == 4) {
                        this.request_data.plan_subject = '全部';
                    }
                    var grade_info = this.grade_info;
                    var plan_type = this.plan_type;
                    var grade = this.grade_switch(grade_info.split(['|'])[0]);
                    if (grade_info.length != 0 && plan_subject_id != 0 && grade_info != "请选择" && plan_type != 0) {
                        this.get_refer(grade)
                    }
                },
                //参考方案
                get_reference_scheme: function () {
                    var reference = this.reference_arr;
                    if (reference == 0) {
                        this.num = 3;
                    } else {
                        this.request_data.plan_refer = reference.split("|")[0];
                        this.request_data.plan_referid = Number(reference.split("|")[1]);
                        var id = Number(reference.split("|")[1]);
                        var plan_level = Number(reference.split("|")[2]);
                        this.request_save_plan.fk_plan_id = id;
                        ajax_post(api_get_plan_content, {id: id, plan_level: plan_level}, this);
                    }

                },
                //选择学校类别
                school_change: function () {
                    var get_school = this.school_info;
                    var grade_info = this.grade_info;
                    if (grade_info.length == 0 || grade_info == "请选择") {
                        toastr.info('请选择年级')
                        return;
                    }
                    if (this.request_data.plan_type == 0) {
                        toastr.info('请选择方案')
                        return
                    }

                    // grade = Number(grade_info.split("|")[1]);
                    var grade = this.grade_switch(grade_info.split('|')[0])
                    if (get_school == 0) {
                        this.request_data.plan_school_type = '全部';
                        this.get_refer(grade)
                        return;
                    }
                    this.request_data.plan_school_typeid = Number(get_school.split("|")[0]);
                    this.request_data.plan_school_type = get_school.split("|")[1];
                    var plan_subject_id = this.request_data.plan_subjectid;
                    if (plan_subject_id != 0) {
                        this.get_refer(grade)
                    }

                },
                //取消
                cancel_click: function () {
                    window.location = "#city_district_t_e_s_s?grade_id=" + pxm.grade_id+ '&plan_subjectid=' + pxm.plan_subjectid;
                    //评价任务管控的评价方案
                    // window.location = "#city_management_create_scheme_list?grade_id=" + pxm.grade_id +
                    //     '&is_switch=' + pxm.is_switch + '&module_type=' + pxm.module_type + '&plan_subjectid=' + pxm.plan_subjectid + "&grade_name=" + pxm.grade_name;
                },
                //添加
                add_click: function () {
                    if (this.school_info == 0) {
                        this.request_data.plan_school_typeid = 0;
                        this.request_data.plan_school_type = '全部';
                    }
                    if ($.trim(this.request_data.plan_name) == '') {
                        this.request_data.plan_school_typeid = 0;
                        toastr.warning('请填写方案名称');
                        return;
                    } else if (this.scheme_live == false) {
                        toastr.warning('方案名称已存在');
                        return;
                    } else if (this.request_data.plan_subjectid == 0) {
                        toastr.warning('请选择适用评价主体');
                        return;
                    } else if (this.grade_info == "请选择" || this.grade_info == "") {
                        toastr.warning('请选择适用年级');
                        return;

                    } else if (this.plan_type == '' || this.plan_type == '请选择') {
                        toastr.warning('请选择方案类型');
                        return;
                    }

                    else if (this.request_data.plan_use_state == '') {
                        toastr.warning('请选择一种使用状态');
                        return;
                    }
                    else {
                        var grade = this.grade_info;
                        this.request_data.plan_grade = grade.split("|")[0];
                        this.request_data.plan_gradeid = this.grade_switch(this.request_data.plan_grade)
                        // if (this.request_data.plan_grade == "七年级") {
                        //     this.request_data.plan_gradeid = 7;
                        // } else if (this.request_data.plan_grade == "八年级") {
                        //     this.request_data.plan_gradeid = 8;
                        // } else {
                        //     this.request_data.plan_gradeid = 9;
                        // }
                        // this.request_data.plan_gradeid = Number(grade.split("|")[1]);
                        ajax_post(api_add_plan, this.request_data, this);
                    }

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            //添加
                            case api_add_plan:
                                this.complete_add_plan(data);
                                break;
                            //查询参考方案
                            case api_get_refer:
                                this.complete_get_refer(data);
                                break;
                            //查询方案内容
                            case api_get_plan_content:
                                this.complete_get_plan_content(data);
                                break;
                            //获取学校类型
                            case api_get_school_type:
                                this.complete_get_school_type(data);
                                break;
                            //        方案校验
                            case api_plan_name:
                                this.complete_plan_name(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                //获取年级列表
                complete_get_grade: function (data) {
                    this.response_data.grade_arr = data.data;
                },
                complete_get_refer: function (data) {
                    this.reference_scheme_arr = data.data;
                },
                complete_add_plan: function (data) {
                    window.location = "#city_district_t_e_s_s?grade_id=" + pxm.grade_id+ '&plan_subjectid=' + pxm.plan_subjectid;
                    // window.location = "#city_management_create_scheme_list?plan_subjectid=" + pxm.plan_subjectid +
                    //     "&grade_id=" + pxm.grade_id + '&is_switch=' + pxm.is_switch + '&module_type=' + pxm.module_type + "&grade_name=" + pxm.grade_name;
                },
                line: function (idx) {
                    return this.second_table_list_value_list[idx];
                },
                complete_get_plan_content: function (data) {
                    if (data.data != null) {
                        /*获取方案内容*/
                        for (var i = 0; i < data.data.length; i++) {
                            this.request_save_plan.sub_subject.push(data.data[i].sub_subject);
                            this.request_save_plan.sub_subjectid.push(data.data[i].sub_subjectid.toString());
                        }
                        var val_arr = [];
                        if(data.data.length>0){
                            val_arr = data.data[0].value_list;
                        }
                        if (val_arr.length == 0) {//value_list==[];
                            this.num = 1;
                            this.first_table_list = data.data;
                        } else {
                            this.num = 2;
                            this.second_table_list = data.data;
                        }
                    }

                },
                complete_get_school_type: function (data) {
                    var dataList = data.data.list;
                    // dataList.push({id:0,property_name:'全部'});
                    this.school_list = data.data.list;
                },
                //    方案校验
                complete_plan_name: function (data) {
                    if (data.data == null || data.data == undefined || data.data == []) {
                        this.scheme_live = true;
                    } else {
                        toastr.warning('方案名称已存在');
                        this.scheme_live = false;
                    }
                },
            });
            vm.$watch('onReady', function () {
                this.cb();
                this.get_grade();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });