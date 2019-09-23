define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        "date_zh",
        C.Co("eval_param_set/task_control_see", "teacher_evaluation_see/teacher_evaluation_see", "css!"),
        C.Co("eval_param_set/task_control_see", "teacher_evaluation_see/teacher_evaluation_see", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("table"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, date_zh, css, html, x, data_center, tab, three_menu_module) {
        //获取年级
        var api_get_grade = api.api + "base/grade/findGrades.action";
        //查询方案
        var api_find_plan = api.api + "Indexmaintain/indexmaintain_findByEvaluatePro";
        //修改
        var api_update_state = api.growth + "indexmaintain_updateEvaluatePro";
        //删除
        var api_delete_plan = api.api + "Indexmaintain/indexmaintain_deleteEvaluatePro";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "teacher_evaluation_see",
                url: api_find_plan,
                type: "",
                is_init: false,
                data: {
                    offset: 0,
                    rows: 15
                },
                // 请求参数
                extend: {
                    pro_type: 3,
                    pro_workid: "",
                    pro_name: "",
                    pro_grade: "",
                    //项目级别(1:省2:市3:区县4:校)
                    pro_rank: "",
                    //审核状态(1:待审核2:审核通过3:审核不通过
                    pro_state: '',
                    pro_start_time: "",
                    pro_end_time: "",
                    __hash__: ""
                },
                request_data: {
                    //适用年级
                    grade_arr: ""
                },
                params:{
                    user_type:""
                },
                // 表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "项目名称",
                        type: "min_text",
                        from: "pro_name",
                        min_width: "white-space"
                    },
                    {
                        title: "项目级别",
                        type: "cover_text",
                        from: "pro_rank",
                        //1:省2:市3:区县4:校
                        dict: {
                            1: '省级',
                            2: '市级',
                            3: '区县',
                            4: '校级'
                        }
                    },
                    {
                        title: "使用年级",
                        type: "text",
                        from: "pro_grade"
                    },
                    {
                        title: "开始时间",
                        type: "text",
                        from: "pro_start_time"
                    },
                    {
                        title: "结束时间",
                        type: "text",
                        from: "pro_end_time"
                    },
                    {
                        title: "创建人",
                        type: "text_desc_width",
                        from: "pro_founder"
                    },
                    {
                        title: "创建时间",
                        type: "text",
                        from: "pro_time"
                    },
                    {
                        title: "审核状态",
                        type: "cover_text",
                        from: "pro_state",
                        //1:待审核2:审核通过3:审核不通过)
                        dict: {
                            1: '待审核',
                            2: '审核通过',
                            3: '不通过'
                        }
                    },
                    {
                        title: "操作",
                        type: "html",
                        from:
                            "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='查看'></a>"
                    }
                ],
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        var dataList = JSON.parse(data.data["user"]);
                        self.params.user_type = data.data.user_type;
                        self.extend.pro_workid = Number(dataList.fk_school_id);
                    });
                    self.is_init = true;
                },
                go_href:function () {
                    window.location = "#item_programme_management_see?url_type="+3+'&grade_id='+pmx.grade_id+
                        '&is_switch='+pmx.is_switch+'&module_type='+pmx.module_type + "&grade_name=" + pmx.grade_name;
                },
                //开始时间
                get_start_date: function () {
                    $('#start_time_input')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            vm.extend.pro_start_time = e.currentTarget.value;
                        });
                },
                //结束时间
                get_end_date: function () {
                    $('#end_time_input')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            vm.extend.pro_end_time = e.currentTarget.value;
                        });
                },
                get_grade: function () {
                    ajax_post(api_get_grade, {status: "1"}, this);
                },
                cbopt: function (params) {
                    var id = params.data.id;
                    var plan_id = params.data.pro_plan_id;
                    var plan_level = params.data.plan_level;
                    var self = this;
                    if (params.type == 1) {//详情
                        data_center.set_key("pro_plan_id", plan_id);
                        data_center.set_key("get_teacher_id", id);
                        data_center.set_key("get_plan_level", plan_level);
                        window.location = "#student_self_detail?grade_id="+pmx.grade_id+
                            '&is_switch='+pmx.is_switch+'&module_type='+pmx.module_type +"&plan_level="+plan_level;
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_grade: function (data) {
                    this.request_data.grade_arr = data.data;
                    var grade_id = pmx.grade_id;
                    for(var i=0;i<data.data.length;i++){
                        var id = data.data[i].id;
                        if(id == grade_id){
                            this.extend.pro_grade = data.data[i].remark;
                        }
                    }
                },

            });
            vm.$watch('onReady', function () {
                this.cb();
                this.get_grade();
                $('#end_time_input').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language: 'zh-CN'
                });
                $('#start_time_input').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language: 'zh-CN'
                });
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });