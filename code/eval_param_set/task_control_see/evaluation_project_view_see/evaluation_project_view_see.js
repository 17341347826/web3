define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        "date_zh",
        C.Co("eval_param_set", "task_control_see/evaluation_project_view_see/evaluation_project_view_see", "css!"),
        C.Co("eval_param_set", "task_control_see/evaluation_project_view_see/evaluation_project_view_see", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM('three_menu_module'),
        C.CM("table")
    ],
    function ($, avalon, layer, date_zh, css, html, x, data_center, three_menu_module, tab) {
        //获取年级
        var api_get_grade = api.api + "base/grade/findGrades.action";
        //获取列表数据
        var get_list = api.api + "Indexmaintain/find_county_evaluatepro_list";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "evaluation_project_view_see",
                url: get_list,
                is_init: false,
                remember:false,
                only_hash: false,
                data: {
                    offset: 0,
                    rows: 15
                },
                //选择的年级
                pro_grade: '',
                // 请求参数
                extend: {
                    pro_end_time: '',
                    pro_grade: '',
                    pro_gradeid: '',
                    pro_name: '',
                    pro_rank: '',
                    pro_start_time: '',
                    pro_state: '',
                    pro_type: '',
                    pro_workid: '',
                    __hash__: ""
                },
                grade_list: [],
                is_show_create:true,
                // 表头名称
                theadTh: [
                    {
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
                        title: "项目类型",
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
                    // {
                    //     title: "审核状态",
                    //     type: "cover_text",
                    //     from: "pro_state",
                    //     //1:待审核2:审核通过3:审核不通过)
                    //     dict: {
                    //         1: '待审核',
                    //         2: '审核通过',
                    //         3: '不通过'
                    //     }
                    // },
                    {
                        title: "审核状态",
                        type: "html",
                        //1:待审核2:审核通过3:审核不通过)
                        from: "<span :if='el.pro_state == 1'>待审核</span>" +
                            "<span :if='el.pro_state == 2' ms-attr=\"{id:'check-pass'+$idx}\" ms-on-mouseenter='@oncbopt({current:$idx, type:5})'>审核通过</span>" +
                            "<span :if='el.pro_state == 3' ms-attr=\"{id:'check-reason'+$idx}\" ms-on-mouseenter='@oncbopt({current:$idx, type:4})'>不通过</span>"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from:
                            "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='查看'></a>"
                    }
                ],
                init: function () {
                    this.extend.pro_type = pmx.plan_subjectid;
                    var self = this;

                    var level = cloud.user_level()
                    if(Number(level)<4)
                        this.is_show_create = false;
                    data_center.uin(function (data) {
                        var user = JSON.parse(data.data["user"]);
                        self.is_init = true;
                        self.only_hash = true;
                        self.extend.pro_workid = Number(user.fk_school_id);
                        self.extend.pro_rank = parseInt(user.department_level);
                        // self.extend.pro_gradeid = Number(pmx.grade_name);
                        self.only_hash = false;
                        self.extend.__hash__ = new Date();
                    });


                },
                //开始时间
                get_start_date: function () {
                    var self = this;
                    $('#start_time_input')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            self.extend.pro_start_time = e.currentTarget.value;
                        });
                },
                //结束时间
                get_end_date: function () {
                    var self = this;
                    $('#end_time_input')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            self.extend.pro_end_time = e.currentTarget.value;
                        });
                },
                //获取年级数据
                get_grade: function () {
                    ajax_post(api_get_grade, {status: "1"}, this);
                },

                cbopt: function (params) {
                  if (params.type == 2) {
                        //查看
                        window.location = "#evaluation_project_detail?project_id=" + params.data.id +
                            "&grade_id=" + pmx.grade_id +
                            '&is_switch=' + pmx.is_switch +
                            '&module_type=' + pmx.module_type +
                            '&plan_level=' + params.data.plan_level;

                    }else if(params.type == 4){//审核状态不通过显示原因
                        var id = '#check-reason' + params.current;
                        //审核不通过原因
                        var pro_not_pass = params.data.pro_not_pass;
                        layer.tips(pro_not_pass,id, {
                            tips: [1, '#2bbba4'],
                            time:1000,
                        });
                    }
                    // else if(params.type == 5){//审核状态不通过显示原因
                    //     var id = '#check-pass' + params.current;
                    //     layer.tips('我是另外一个tips，只不过我长得跟之前那位稍有些不一样。',id, {
                    //         tips: [1, '#2bbba4'],
                    //         time:1000,
                    //     });
                    // }
                },
                grade_change: function () {
                    var grade = this.pro_grade;
                    this.only_hash = true;
                    this.extend.pro_gradeid = Number(pmx.grade_name);
                    this.extend.pro_grade = grade.split(',')[1];
                    this.only_hash = false;
                    this.extend.__hash__ = new Date();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            default:
                                break;

                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                //年级名称
                grade_name: '',
                complete_get_grade: function (data) {
                    this.grade_list = data.data;
                    var grade_id = pmx.grade_id;
                    for (var i = 0; i < data.data.length; i++) {
                        var id = data.data[i].id;
                        if (id == grade_id) {
                            this.pro_grade = data.data[i].id + ',' + data.data[i].grade_name;
                            this.grade_name = data.data[i].grade_name;
                        }
                    }
                    var grade = this.pro_grade;
                    this.only_hash = true;
                    this.extend.pro_gradeid = this.pro_grade.split(",")[0];
                    this.extend.pro_grade = this.grade_name;
                    this.init();
                    // this.only_hash = false;
                    // this.extend.__hash__ = new Date();
                },
                go_href: function () {
                    window.location = "#c_c_scheme_list_see?plan_subjectid=" + this.extend.pro_type +
                        "&grade_id=" + pmx.grade_id + '&is_switch=' + pmx.is_switch + '&module_type=' + pmx.module_type + '&grade_name=' + pmx.grade_name;
                },
                //参数设置
                parameter_add:function(){
                    window.location='#parameter_setting_see?grade_id='+pmx.grade_id+
                        '&is_switch='+pmx.is_switch+'&module_type='+pmx.module_type+'&plan_subjectid='+pmx.plan_subjectid.toString()+ '&grade_name=' + pmx.grade_name;
                },
            });
            vm.get_grade();
            vm.$watch('onReady', function () {
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