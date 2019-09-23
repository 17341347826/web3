/**
 * Created by Administrator on 2018/5/31.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        "date_zh",
        C.Co('eval_param_set', 'e_task_control/create_task/create_task', 'html!'),
        C.Co('eval_param_set', 'e_task_control/create_task/create_task', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly")
    ],
    function ($,avalon, layer,date_zh, html, css, data_center, select_assembly) {
        //获取年级
        var api_get_grade = api.api + "base/grade/findGrades.action";
        //获取项目详情
        var get_project_detail_api = api.api + "Indexmaintain/find_county_evaluatepro_detail";
        //查询统一参考方案
        var reference_scheme_api = api.api + "Indexmaintain/indexmaintain_findByRefer";
        //获取学校类别集合
        var get_school_type_api = api.api + "base/schoolproperty/findlist.action";
        //创建项目
        var save_project_api = api.api + "Indexmaintain/add_county_evaluatepro";
        //获取方案详情
        var get_scheme_detail_api = api.api + "Indexmaintain/find_evaluatepro_plansubject_list";
        //修改项目
        var update_project_api = api.api + "Indexmaintain/update_county_evaluatepro";
        var scheme_detail_obj = {};
        var avalon_define = function (pxm) {
            var vm = avalon.define({
                $id: "create_task",
                //年级列表
                grade_list: [],
                //选择的年级
                grade: '',
                //方案配置
                programme: '1',
                //参考方案列表
                reference_scheme_list: [],
                select_scheme: '',
                is_change_programme: false,
                request_data: {
                    pro_end_time: '',
                    pro_grade: '',
                    pro_gradeid: '',
                    pro_group_type: '',
                    pro_name: '',
                    pro_plan: '',
                    pro_plan_config: '',
                    pro_plan_id: '',
                    //项目级别--1:省 2:市 3:区县 4:校
                    pro_rank: -1,
                    // pro_rank: 2,
                    pro_start_time: '',
                    //审核状态	number	1:待审核 2:审核通过 3:审核不通过  所有为空
                    pro_state: 1,
                    //评价主体--1:学生自评 2:学生互评 3:教师评价 4:家长评价
                    pro_type: 1,
                    evaluate_mode:'',//1 按学生评价 2 按考查项评价
                    school_type: []
                },
                update_data: {
                    id: '',
                    pro_end_time: '',
                    pro_grade: '',
                    pro_gradeid: '',
                    pro_group_type: '',
                    pro_name: '',
                    pro_plan_config: '',
                    pro_rank: '',
                    pro_start_time: '',
                    pro_state: '',
                    pro_type: '',
                    school_type: '',
                    evaluate_mode:""
                },
                init: function () {
                    this.get_grade();
                    if (pxm.pro_rank) {
                        this.programme = 1;
                        this.request_data.pro_rank = parseInt(pxm.pro_rank);
                        return;
                    }
                    if (pxm.project_id) {
                        //获取项目详情
                        this.get_detail(get_project_detail_api);

                    }
                },

                get_detail: function (url) {
                    ajax_post(url, {id: pxm.project_id}, this)
                },
                //获取年级数据
                get_grade: function () {
                    ajax_post(api_get_grade, {status: "1"}, this);
                },
                //获取学校类型
                get_school_type: function () {
                    ajax_post(get_school_type_api, {}, this);
                },
                //查询统一参考方案
                get_reference_scheme: function () {
                    ajax_post(reference_scheme_api, {
                        plan_gradeid:Number(this.request_data.pro_gradeid),
                        plan_school_typeid:'',
                        plan_subjectid:1,
                        plan_type:''
                    }, this)
                    // ajax_post(reference_scheme_api,{plan_grade:plan_grade,plan_subject:""},this);
                },
                //按学校类型查询参考方案
                get_rs_by_school: function (id) {
                    ajax_post(reference_scheme_api, {
                        plan_school_typeid: id,
                        plan_gradeid:this.request_data.pro_gradeid
                    }, this)
                },
                //修改项目
                update_project: function (id) {
                    for (var key in this.update_data) {
                        if (this.request_data[key]) {
                            this.update_data[key] = this.request_data[key];
                        }
                    }
                    this.update_data.id = id;
                    ajax_post(update_project_api, this.update_data.$model, this);
                },


                //开始时间
                get_start_date: function () {
                    var self = this;
                    $('#start_time_input')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            self.request_data.pro_start_time = e.currentTarget.value;
                        });
                },
                //结束时间
                get_end_date: function () {
                    var self = this;
                    $('#end_time_input')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            self.request_data.pro_end_time = e.currentTarget.value;
                        });
                },

                //年级改变
                grade_change: function () {
                    var split_arr = this.grade.split(',');
                    this.request_data.pro_gradeid = split_arr[0];
                    this.request_data.pro_grade = split_arr[1];
                    if(this.programme==1){
                        this.get_reference_scheme();
                    }else {
                        this.reference_scheme_list = [];
                        this.get_school_type();
                    }

                },
                //创建项目
                create_scheme: function () {
                    ajax_post(save_project_api, this.request_data.$model, this);
                },

                save_data: function () {
                    this.request_data.school_type = [];
                    var obj = {
                        'plan_id': '',
                        'plan_name': '',
                        'school_type_id': '',
                        'school_type': ''
                    }
                    var split_arr = [];
                    if (this.programme == 1) {
                        split_arr = this.select_scheme.split(',');
                        obj.plan_id = split_arr[0];
                        obj.plan_name = split_arr[1];
                        this.request_data.school_type.push(obj);
                    }
                    if (this.programme == 2) {
                        var reference_length = this.reference_scheme_list.length;
                        for (var i = 0; i < reference_length; i++) {
                            split_arr = this.reference_scheme_list[i].select_scheme.split(',');
                            obj.school_type_id = split_arr[0];
                            obj.school_type = split_arr[1];
                            obj.plan_id = split_arr[2];
                            obj.plan_name = split_arr[3];
                            this.request_data.school_type.push(obj);
                        }
                    }
                    this.request_data.pro_plan_config = this.programme;
                    this.request_data.school_type = JSON.stringify(this.request_data.school_type);
                    if (this.request_data.pro_name == '') {
                        toastr.info('请输入项目名称');
                        return;
                    }

                    if (this.request_data.pro_type == 2 && this.request_data.pro_group_type == '') {
                        toastr.info('请选择分组方式');
                        return;
                    }
                    if (this.request_data.pro_gradeid == '') {
                        toastr.info('请选择适用年级');
                        return;
                    }
                    if (this.request_data.pro_start_time == '' || this.request_data.pro_end_time == '') {
                        toastr.info('请输入时间');
                        return;
                    }
                    if (this.request_data.pro_type == 3) {
                        if(this.request_data.evaluate_mode == ''){
                            toastr.info('请选择评价方式');
                            return;
                        }
                    }
                    var start_time = this.request_data.pro_start_time;
                    var end_time = this.request_data.pro_end_time;
                    start_time = start_time.replace("-", "/");
                    end_time = end_time.replace("-", "/");
                    var new_start_time = new Date(Date.parse(start_time));
                    var new_end_time = new Date(Date.parse(end_time));
                    if (new_start_time > new_end_time) {
                        toastr.info('开始时间不能大于结束时间');
                        return;
                    }
                    if (this.request_data.school_type.length == 0) {
                        toastr.info('请选择方案');
                        return;
                    }
                    if (pxm.pro_rank) {
                        this.create_scheme();
                        return
                    }
                    if (pxm.project_id) {
                        this.update_project(pxm.project_id);
                    }

                },
                //取消
                cancel_btn:function(){
                    history.go(-1);
                },
                //使用方案改变
                programme_change: function (pro) {
                    this.reference_scheme_list = [];
                    scheme_detail_obj = {};
                    this.is_change_programme = true;
                    this.programme = pro;
                    if (pro == 1) {
                        this.get_reference_scheme();
                    } else {
                        this.select_scheme = '';
                        this.get_school_type();
                    }
                },
                //处理学校类型信息
                deal_school_type: function (data) {
                    if (!data.data || data.data == null)
                        return;
                    var schools = data.data;
                    var schools_length = schools.length;
                    for (var i = 0; i < schools_length; i++) {
                        this.get_rs_by_school(schools[i].id);
                    }
                },
                //按学校类别分类的下拉列表数据
                deal_scheme_msg: function (data) {
                    if (!data.data || data.data == null)
                        return;
                    if (this.programme == 1) {
                        this.reference_scheme_list = data.data;
                        if (pxm.project_id && !this.is_change_programme) {
                            var unified = scheme_detail_obj.unified;
                            this.select_scheme = unified.plan_id + ',' + unified.plan_name;
                        } else {
                            this.select_scheme = '';
                        }
                        return;
                    }else {
                        var list = data.data;
                        if (list.length > 0) {
                            var obj_data = {};
                            obj_data.plan_school_type = list[0].plan_school_type;
                            obj_data.plan_school_typeid = list[0].plan_school_typeid;
                            obj_data.list = list;
                            if (pxm.project_id && !this.is_change_programme) {
                                var plan = scheme_detail_obj[obj_data.plan_school_typeid];
                                if (plan) {
                                    obj_data.select_scheme = plan.school_type_id + ',' + plan.school_type + ',' + plan.plan_id + ',' + plan.plan_name;
                                }
                            } else {
                                obj_data.select_scheme = '';
                            }
                            this.reference_scheme_list.push(obj_data);
                        }
                    }
                    
                },
                //处理详情数据
                deal_detail_msg: function (data) {
                    for (var key in this.request_data) {
                        if (data.data[key]) {
                            this.request_data[key] = data.data[key]
                        }
                    }
                    this.grade = this.request_data.pro_gradeid + ',' + this.request_data.pro_grade;
                    this.programme = data.data.pro_plan_config;
                    this.get_detail(get_scheme_detail_api);

                },
                //处理方案详情
                deal_scheme_detail: function (data) {
                    if (!data.data || data.data == null || data.data.length == 0) {
                        //获取项目详情
                        this.get_detail(get_project_detail_api);
                        return;
                    }
                    for (var i = 0; i < data.data.length; i++) {
                        var school_type_id = data.data[i].school_type_id;
                        if (!school_type_id) {
                            school_type_id = 'unified';
                            this.programme = 1;
                        }
                        scheme_detail_obj[school_type_id] = data.data[i];
                    }
                    if (this.programme == 1) {
                        this.get_reference_scheme();
                    } else {
                        this.get_school_type();
                    }
                },

                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_grade:
                                if (data.data) {
                                    this.grade_list = data.data;
                                }
                                break;
                            case get_project_detail_api:
                                if (!data.data || data.data == null)
                                    return;
                                this.deal_detail_msg(data);
                                break;
                            case reference_scheme_api:
                                this.deal_scheme_msg(data);
                                break;
                            case get_school_type_api:
                                this.deal_school_type(data);
                                break;
                            case save_project_api:
                                window.location = '#evaluation_project_view';
                                break;
                            case get_scheme_detail_api:
                                this.deal_scheme_detail(data);
                                break;
                            case update_project_api:
                                window.location = '#evaluation_project_view';
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                }
            });
            vm.$watch('onReady', function () {
                this.init();
                $('#end_time_input').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language: 'zh-CN'
                });
                $('#start_time_input').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language: 'zh-CN'
                });
            });
            // vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
