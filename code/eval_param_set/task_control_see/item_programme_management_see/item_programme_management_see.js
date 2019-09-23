/*=========================================新需求=======================================*/
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("evaluation_material/stu_evaluation", "evaluation", "css!"),
        C.Co("eval_param_set/task_control_see", "item_programme_management_see/item_programme_management_see", "css!"),
        C.Co("eval_param_set/task_control_see", "item_programme_management_see/item_programme_management_see", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("table"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, css,css2, html, x, data_center, tab, tmm) {
        //获取年级
        var api_get_grade = api.api + "base/grade/findGrades.action";
        //查询方案
        var api_find_plan = api.api + "Indexmaintain/find_checkpass_plan_list";
        //手动提交审核
        var api_submit_check = api.api + "Indexmaintain/update_plan_check_state";
        //校管理查询具体内容
        var api_get_plan=api.api+"Indexmaintain/indexmaintain_list_plan_subject";
        //市区县查看具体内容
        var api_get_plan_leader = api.api + "Indexmaintain/find_county_plan_subject_list";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "table",
                url: api_find_plan,
                type: "",
                schoolList: [],//学校类别
                is_init: false,
                remember: false,
                data: {
                    offset: 0,
                    rows: 15
                },
                params: {
                    fk_school_id: "",
                    name: "",
                    user_type:"",
                    work:""
                },
                // 请求参数
                extend: {
                    plan_gradeid: "",
                    plan_name: "",
                    plan_school_typeid: "",
                    plan_subjectid: '',//1:学生自评 2:学生互评 3:教师评价 4:全部
                    plan_use_state: "",//方案使用状态 1:启用 2:停用
                    plan_check_state: "",//1:待审核 2:审核通过 3:审核不通过
                    __hash__: ""
                },
                request_data: {
                    //适用年级
                    grade_arr: ""
                },
                // 表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "方案名称",
                        type: "min_text",
                        from: "plan_name",
                        min_width: "white-space"

                    },
                    {
                        title: "评价主体",
                        type: "text",
                        from: "plan_subject",
                    },
                    {
                        title: "适用年级",
                        type: "text",
                        from: "plan_grade"
                    },
                    {
                        title: "创建人",
                        type: "text_desc_width",
                        from: "plan_founder"
                    },
                    {
                        title: "创建时间",
                        type: "text",
                        from: "plan_create_time"
                    },
                    {
                        title: "使用状态",
                        type: "html",
                        from:
                            "<a class='tab-toggle-off-btn tab-btn' ms-visible='el.plan_use_state==2'></a>" +
                            "<a class='tab-toggle-on-btn tab-btn' ms-visible='el.plan_use_state==1'></a>"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from:
                            "<a  class='tab-btn tab-details-btn ma-left' ms-on-click='@oncbopt({current:$idx, type:6})' title='详情查看'></a>"

                    }
                ],
                url_type:"",
                level:"",
                cb: function () {
                    this.url_type = pmx.url_type;//1自评
                    this.extend.plan_subjectid = Number(this.url_type);
                    var self = this;
                    data_center.uin(function (data) {
                        var data_x = data.data;
                        var user = JSON.parse(data.data['user']);
                        self.params.work = user.school_name;
                        self.level = data_x.highest_level;
                        self.params.fk_school_id = user.fk_school_id;
                        self.params.user_type = data.data.user_type;
                        self.params.name = user.name;
                        self.highest_level = user.highest_level;
                        ajax_post(api_get_grade, {status: "1"}, self);

                    });
                },
                go_href:function (num) {
                    if(num == 0){
                        window.location = "#parameter_setting_see?grade_id="+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type + "&grade_name=" + pmx.grade_name;
                    }else{
                        var url_type = this.url_type;
                        if(url_type == 1){//自评
                            window.location = "#student_self_evaluation_see?grade_id="+pmx.grade_id+'&is_switch='+pmx.is_switch+
                                '&module_type='+pmx.module_type + "&grade_name=" + pmx.grade_name;
                        }else if(url_type == 2){//互评
                            window.location = "#student_mutual_evaluation_see?grade_id="+pmx.grade_id+'&is_switch='+pmx.is_switch+
                                '&module_type='+pmx.module_type + "&grade_name=" + pmx.grade_name;
                        }else{//教师评
                            window.location = "#teacher_evaluation_see?grade_id="+pmx.grade_id+'&is_switch='+pmx.is_switch+
                                '&module_type='+pmx.module_type + "&grade_name=" + pmx.grade_name;
                        }
                    }

                },
                current_id:"",
                cbopt: function (params) {
                    var id = params.data.id;
                    this.current_id = id;
                    var plan_type = params.data.plan_type;//方案类型 1:选项 2:直接打分
                    var grade = params.data.plan_grade;//适用年级
                    var plan_subject = params.data.plan_subject;//评价主体 学生自评
                    var plan_refer = params.data.plan_refer;
                    var plan_founder = params.data.plan_founder;//创建人
                    var plan_school_type = params.data.plan_school_type;
                    var plan_name = params.data.plan_name;//方案名称
                    var plan_level = params.data.plan_level;
                    var self = this;
                  if (params.type == 6) {//详情查看
                        window.location = "#school_detail?&plan_type=" + plan_type + "&id=" + id + "&grade=" + grade +
                            "&plan_subject=" + plan_subject + "&plan_founder=" + plan_founder + "&plan_name=" +
                            plan_name + "&plan_level=" +plan_level+'&grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type;
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            //查询方案具体内容
                            case api_get_plan:
                                this.complete_check_info(data);
                                break;
                            case api_get_plan_leader:
                                this.complete_check_info(data);
                                break;
                            //手动提交审核
                            case api_submit_check:
                                toastr.success("提交成功");
                                this.extend.__hash__ = new Date();
                                break;

                        }
                    } else {
                        $("#saveProduct").modal('open');
                        $(".am-modal-bd").text("操作失败！");
                    }
                },
                complete_check_info:function (data) {
                    if(data.data.length == 0){
                        toastr.warning("暂无内容，请先添加内容再提交")
                    }else{
                        ajax_post(api_submit_check, {id: this.current_id, plan_check_state: 1}, this)
                    }
                },
                //年级名称
                grade_name:'',
                complete_get_grade: function (data) {
                    if(this.level == 4){
                        var grade_id = pmx.grade_id;
                        for(var i=0;i<data.data.length;i++){
                            var id = data.data[i].id;
                            if(id == grade_id){
                                this.extend.plan_gradeid = data.data[i].id;
                                this.grade_name = data.data[i].remark;
                            }
                        }
                    }else{
                        this.request_data.grade_arr = data.data;
                        this.extend.plan_gradeid = this.request_data.grade_arr[0].id;
                        this.is_init = true;
                    }

                },
            });
            vm.$watch('onReady', function () {
                this.cb();
                // this.get_grade();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });