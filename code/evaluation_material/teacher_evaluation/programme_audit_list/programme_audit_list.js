define(["jquery", C.CLF('avalon.js'), 'layer',
        C.Co("evaluation_material","teacher_evaluation/programme_audit_list/programme_audit_list","css!"),
        C.Co("evaluation_material","teacher_evaluation/programme_audit_list/programme_audit_list","html!"),
        C.CMF("router.js"), C.CMF("data_center.js"), C.CM("table"), C.CM('page_title'),C.CM("three_menu_module")
    ],
    function($, avalon, layer, css, html, x, data_center, tab,page_title,three_menu_module) {
        //获取年级
        var api_get_grade=api.api+"base/grade/findGrades.action";
        //查询分组
        var api_get_school_group = api.api+"Indexmaintain/find_school_group_list";
        //查询
        var api_get_plan=api.api+"Indexmaintain/find_check_plan_list";
        var avalon_define = function() {
            var table = avalon.define({
                $id: "programme_audit_list",
                // 数据接口
                url: api_get_plan,
                /*判断权限操作*/
                user_type: "",
                is_init: false,
                remember:false,
                districtid:"",
                grade_info:[],
                schoolList:[],
                get_school_info:"",
                data: {
                    offset: 0,
                    rows: 15
                },
                // 请求参数
                extend: {
                    plan_check_state:1,//方案审核状态 1:待审核 2:审核通过 3:审核不通过
                    plan_gradeid:"",
                    plan_name: "",//方案名称
                    sch_group_guid:"",//学校分组id number
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
                        title: "方案名称",
                        type: "text",
                        from: "plan_name"
                    },
                    {
                        title: "适用年级",
                        type: "text",
                        from: "plan_grade"
                    },
                    {
                        //评价主体(1:学生自评2:学生互评3:教师评价4:家长评价)
                        title: "评价主体",
                        type: "text",
                        from: "plan_subject"
                    },
                    {
                        title: "创建单位",
                        type: "text",
                        from: "plan_work"
                    },
                    {
                        title: "创建时间",
                        type: "text",
                        from: "plan_create_time"
                    },

                    {
                        title: "创建人",
                        type: "text",
                        from: "plan_founder"
                    },
                    {
                        title: "审核",
                        type: "html",
                        from: "<a class='tab-btn tab-audit-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='审核'></a>"
                    }
                ],
                // get_grade:function () {
                //     ajax_post(api_get_grade,{status:"1"},this);
                // },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        self.user_type = data.data.user_type;
                        var dataList=JSON.parse(data.data["user"]);
                        self.districtid = dataList.fk_school_id;
                        ajax_post(api_get_grade,{status:"1"},self);
                    });

                },

                cbopt: function(params) {
                    // 当前数据的方案id
                    // var plan_id = params.data.pro_plan_id;
                    var plan_id = params.data.id;
                    var pro_name=params.data.pro_name;
                    var pro_type=params.data.pro_type;
                    var pro_grade_id=params.data.pro_gradeid;
                    var pro_group_type = params.data.pro_group_type;
                    //当前数据id
                    var id = params.data.id;
                    // 跳转传值
                    data_center.set_key("get_plan_id", plan_id);
                    data_center.set_key("get_pro_name", pro_name);
                    data_center.set_key("get_pro_type", pro_type);
                    data_center.set_key("get_grade_id", pro_grade_id);
                    data_center.set_key("pro_group_type", pro_group_type);
                    data_center.set_key("get_id", id);
                    var plan_level = params.data.plan_level;
                    if(params.type==1){
                        window.location="#programme_audit_detail?&plan_id="+plan_id+'&plan_level='+plan_level;
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                                //获取学校分组
                            case api_get_school_group:
                                this.complete_get_school_group(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_grade:function (data) {
                    this.response_data.grade_arr=data.data;
                    ajax_post(api_get_school_group,{cityid:"",districtid:this.districtid},this);

                },
                complete_get_school_group:function (data) {
                    var school_list = [];
                    var dataList = data.data;
                    var dataListLength = dataList.length;
                    for(var i= 0;i<dataListLength;i++){
                        var obj = {};
                        obj['sch_group_guid'] = dataList[i].sch_group_guid;
                        obj['get_id'] =dataList[i].id;
                        school_list.push(obj);
                    }
                    this.schoolList = school_list;
                    this.extend.plan_gradeid ='';
                    this.is_init = true;
                    this.extend.__hash__ = new Date();
                },
                school_change:function () {
                    var get_info = this.get_school_info;
                    if(get_info == ''){
                        this.extend.sch_group_guid = '';
                        this.extend.__hash__ = new Date();
                    }else{
                        for(var i=0;i<this.schoolList.length;i++){
                            if(get_info == this.schoolList[i].get_id){
                                this.extend.sch_group_guid = this.schoolList[i].sch_group_guid;
                                this.extend.__hash__ = new Date();
                            }
                        }
                    }

                }
            });
            table.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                this.cb();
                // this.get_grade();
            });
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });