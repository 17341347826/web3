define(["jquery", C.CLF('avalon.js'), 'layer',
        C.Co("evaluation_material","teacher_evaluation/check_list/check_list","css!"),
        C.Co("evaluation_material","teacher_evaluation/check_list/check_list","html!"),
        C.CMF("router.js"), C.CMF("data_center.js"), C.CM("table"), C.CM('page_title')
    ],
    function($, avalon, layer, css, html, x, data_center, tab,page_title) {
        //获取年级
        var api_get_grade=api.api+"base/grade/findGrades.action";
        //查询
        var api_get_plan=api.api+"Indexmaintain/indexmaintain_findByEvaluatePro";
        var avalon_define = function() {
            var table = avalon.define({
                $id: "table",
                // 数据接口
                url: api_get_plan,
                /*判断权限操作*/
                user_type: "",
                is_init: false,
                remember:false,
                grade_info:[],
                data: {
                    offset: 0,
                    rows: 15
                },
                // 请求参数
                extend: {
                    pro_rank:'',
                    pro_workid:"",
                    pro_grade: "",
                    pro_type:"",
                    pro_state:1,
                    __hash__: ""
                },
                response_data:{
                    //适用年级
                    grade_arr:""
                },
                // 表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "项目名称",
                        type: "text",
                        from: "pro_name"
                    },
                    // {
                    //     title: "项目级别",
                    //     type: "cover_text",
                    //     from: "pro_rank",
                    //     //1:省2:市3:区县4:校
                    //     dict: {
                    //         1: '省级',
                    //         2: '市级',
                    //         3: '区县',
                    //         4:'校级'
                    //     }
                    // },
                    {
                        title: "使用年级",
                        type: "text",
                        from: "pro_grade"
                    },
                    {
                        //评价主体(1:学生自评2:学生互评3:教师评价4:家长评价)
                        title: "评价主体",
                        type: "cover_text",
                        from: "pro_type",
                        dict: {
                            1: '学生自评',
                            2: '学生互评',
                            3: '教师评价',
                            4:'家长评价'
                        }
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
                        type: "text",
                        from: "pro_founder"
                    },
                    {
                        title: "创建时间",
                        type: "text",
                        from: "pro_time"
                    },
                    {
                        title: "审核",
                        type: "html",
                        from: "<a class='tab-btn tab-audit-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='审核'></a>"
                    }
                ],
                get_grade:function () {
                    ajax_post(api_get_grade,{status:"1"},this);
                },
                //使用年级
                get_apply_grade:function () {
                    var grade=this.grade_info;
                    if(grade == ''){
                        this.extend.pro_grade= '';
                    }else{
                        this.extend.pro_grade=grade.split("|")[0];
                    }
                },
                cb: function() {
                    this.extend.pro_grade = '';
                    var self = this;
                    data_center.uin(function(data) {
                        self.user_type = data.data.user_type;
                        var dataList=JSON.parse(data.data["user"]);
                        self.extend.pro_workid=Number(dataList.fk_school_id);
                        self.extend.pro_rank = Number(data.data.highest_level);
                    });
                    self.is_init = true;
                },

                cbopt: function(params) {
                    // 当前数据的方案id
                    console.log(params)
                    var plan_id = params.data.pro_plan_id;
                    var pro_name=params.data.pro_name;
                    var pro_type=params.data.pro_type;
                    var pro_grade_id=params.data.pro_gradeid;
                    var pro_group_type = params.data.pro_group_type;
                    var plan_level = params.data.plan_level;
                    var pro_start_time = params.data.pro_start_time;
                    var pro_end_time = params.data.pro_end_time;
                    //当前数据id
                    var id = params.data.id;
                    // 跳转传值
                    data_center.set_key("get_plan_id", plan_id);
                    data_center.set_key("get_pro_name", pro_name);
                    data_center.set_key("get_pro_type", pro_type);
                    data_center.set_key("get_grade_id", pro_grade_id);
                    data_center.set_key("pro_group_type", pro_group_type);
                    data_center.set_key("get_id", id);
                    data_center.set_key("get_plan_level", plan_level);
                    data_center.set_key("pro_start_time", pro_start_time);
                    data_center.set_key("pro_end_time", pro_end_time);
                    if(params.type==1){
                        window.location="#check_detail";
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
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
                complete_get_grade:function (data) {
                    this.response_data.grade_arr=data.data;
                }
            });
            table.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                this.cb();
                this.get_grade();
            });
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });