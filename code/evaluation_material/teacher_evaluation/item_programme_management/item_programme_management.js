/*=========================================新需求=======================================*/
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("evaluation_material/stu_evaluation", "evaluation", "css!"),
        C.Co("evaluation_material/teacher_evaluation", "item_programme_management/item_programme_management", "css!"),
        C.Co("evaluation_material/teacher_evaluation", "item_programme_management/item_programme_management", "html!"),
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
        //修改
        var api_update_state = api.api + "Indexmaintain/indexmaintain_updatePlanState";
        //手动提交审核
        var api_submit_check = api.api + "Indexmaintain/update_plan_check_state";
        //删除
        var api_delete_plan = api.api + "Indexmaintain/indexmaintain_deletePlan";
        //校管理查询具体内容
        var api_get_plan=api.api+"Indexmaintain/indexmaintain_list_plan_subject";
        //市区县查看具体内容
        var api_get_plan_leader = api.api + "Indexmaintain/find_county_plan_subject_list";
        //标记为当前学期使用方案
        var api_opt_plan = api.api + 'Indexmaintain/opt_plan';
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
                        title: "使用方案",
                        type: "cover_text",
                        from: "current_select",
                        dict: {
                            0: '',
                            1: '当前学期使用'
                        }
                    },
                    {
                        title: "创建时间",
                        type: "text",
                        from: "plan_create_time"
                    },
                    {
                        title: "使用状态",
                        type: "html",
                        from: "<a class='tab-toggle-off-btn tab-btn' ms-visible='el.plan_use_state==2 && params.user_type == 0 && el.plan_work == params.work' ms-on-click='@oncbopt({current:$idx, type:1})'></a>" +
                        "<a class='tab-toggle-on-btn tab-btn' ms-visible='el.plan_use_state==1 && params.user_type == 0 && el.plan_work == params.work' ms-on-click='@oncbopt({current:$idx, type:2})'></a>"+
                        "<a class='tab-toggle-off-btn tab-btn' ms-visible='el.plan_use_state==2 && (el.plan_work != params.work || params.user_type != 0)'></a>" +
                        "<a class='tab-toggle-on-btn tab-btn' ms-visible='el.plan_use_state==1 && (el.plan_work != params.work || params.user_type != 0)'></a>"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a  :if='params.fk_school_id == el.plan_workid && (el.plan_check_state ==3 || el.plan_check_state ==4)  && params.user_type == 0' class='tab-btn tab-maintenance-btn' ms-on-click='@oncbopt({current:$idx, type:3})' title='方案内容维护'></a>" +
                        "<a :if='params.fk_school_id == el.plan_workid && el.plan_check_state != 2 && el.plan_check_state != 1  && params.user_type == 0'  class='tab-btn tab-trash-btn ma-left' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>" +
                        "<a :if='el.plan_check_state == 3'  class='tab-btn tab-objection-btn ma-left ' ms-on-click='@oncbopt({current:$idx, type:5})' title='查看'></a>" +
                        "<a  class='tab-btn tab-details-btn ma-left' ms-on-click='@oncbopt({current:$idx, type:6})' title='详情查看'></a>" +
                        "<a :if='(el.plan_check_state == 4 || el.plan_check_state == 3)  && params.user_type == 0' class='tab-btn tab-cause-btn ma-left' ms-on-click='@oncbopt({current:$idx, type:7})' title='提交审核'></a>"+
                        "<a :if='el.plan_check_state == 2'  class='tab-btn tab_produce_btn ma-left' ms-on-click='@oncbopt({current:$idx, type:8})' title='指定方案'></a>"

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
                        window.location = "#parameter_setting?grade_id="+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type + "&grade_name=" + pmx.grade_name;
                    }else{
                        var url_type = this.url_type;
                        if(url_type == 1){
                            window.location = "#student_self_evaluation?grade_id="+pmx.grade_id+'&is_switch='+pmx.is_switch+
                                '&module_type='+pmx.module_type + "&grade_name=" + pmx.grade_name;
                        }else if(url_type == 2){
                            window.location = "#student_mutual_evaluation?grade_id="+pmx.grade_id+'&is_switch='+pmx.is_switch+
                                '&module_type='+pmx.module_type + "&grade_name=" + pmx.grade_name;
                        }else{
                            window.location = "#teacher_evaluation?grade_id="+pmx.grade_id+'&is_switch='+pmx.is_switch+
                                '&module_type='+pmx.module_type + "&grade_name=" + pmx.grade_name;
                        }
                    }

                },
                /*添加方案*/
                school_add_programme: function () {
                    //1 自评 2互评 3教师
                    window.location = "#add_programme?plan_subject=" + this.url_type+'&grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                        '&module_type='+pmx.module_type + "&grade_name=" + pmx.grade_name;
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
                    if (params.type == 1) {//启用
                        layer.open({
                            title: "提示",
                            content: '是否启用该指标？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                ajax_post(api_update_state, {id: params.data.id, plan_use_state: 1,plan_level:plan_level}, self);
                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    } else if (params.type == 2) {//停用
                        layer.open({
                            title: "提示",
                            content: '是否停用该指标？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                ajax_post(api_update_state, {id: params.data.id, plan_use_state: 2,plan_level:plan_level}, self);
                                layer.close(index);

                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    } else if (params.type == 5) {//停用
                        var check_not_pass_desc = params.data.check_not_pass_desc;
                        layer.confirm('当前方案不通过的原因是:' + check_not_pass_desc, {
                            btn: ['确定'] //按钮
                        });
                    }
                    else if (params.type == 4) {//删除
                        layer.open({
                            title: "提示",
                            content: '是否删除该方案？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                ajax_post(api_delete_plan, {id: params.data.id}, self);
                                layer.close(index);
                            },
                            btn2: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    } else if (params.type == 3) {//维护
                        data_center.set_key("grade", grade);
                        data_center.set_key("plan_subject", plan_subject);
                        data_center.set_key("get_id", id);
                        data_center.set_key("get_plan_type", plan_type);
                        data_center.set_key("get_plan_refer", plan_refer);
                        data_center.set_key("plan_founder", plan_founder);
                        data_center.set_key("plan_school_type", plan_school_type);
                        data_center.set_key("plan_name", plan_name);

                        window.location = "#content_maintenance?grade_id="+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type;
                    } else if (params.type == 6) {//详情查看
                        window.location = "#school_detail?&plan_type=" + plan_type + "&id=" + id + "&grade=" + grade +
                            "&plan_subject=" + plan_subject + "&plan_founder=" + plan_founder + "&plan_name=" +
                            plan_name + "&plan_level=" +plan_level+'&grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type;
                    } else if (params.type == 7) {//手动提交审核
                        if(plan_level == 2){
                            ajax_post(api_get_plan,{fk_plan_id:id},self);
                        }else{
                            ajax_post(api_get_plan_leader,{fk_plan_id:id},self);

                        }
                    }else if(params.type == 8){//学校管理员指定评价方案为当前学期使用方案
                        layer.alert('确定指定'+params.data.plan_name+'为当前学期使用方案？', {
                            closeBtn: 0
                        }, function(){
                            ajax_post(api_opt_plan,{
                                id:params.data.id,
                                plan_form:params.data.plan_form,
                                plan_gradeid:params.data.plan_gradeid,
                                plan_workid:params.data.plan_workid,
                            },self);
                            layer.closeAll();
                        });
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            //删除
                            case api_delete_plan:
                                this.complete_delete_plan(data);
                                break;
                            //修改
                            case api_update_state:
                                this.complete_update_state(data);
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
                        //    标记为当前使用方案
                            case api_opt_plan:
                                toastr.success("标记成功");
                                this.extend.__hash__ = new Date();
                                break;
                        }
                    } else {
                       toastr.error(msg);
                    }
                },
                complete_check_info:function (data) {
                    if(data.data.length == 0){
                        toastr.warning("暂无内容，请先添加内容再提交")
                    }else{
                        ajax_post(api_submit_check, {
                            id: this.current_id,
                            plan_check_state: 1,
                            check_not_pass_desc:'',
                        }, this)
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
                                this.extend.plan_gradeid = this.change_remark(data.data[i].remark);
                                this.grade_name = data.data[i].remark;
                            }
                        }
                    }else{
                        this.request_data.grade_arr = data.data;
                        this.extend.plan_gradeid = this.change_remark(this.request_data.grade_arr[0].remark);
                        this.is_init = true;
                    }

                },
                change_remark:function(x){
                    if(x == "七年级"){
                        return 7;
                    }else if(x == "八年级"){
                        return 8;
                    }else{
                        return 9;
                    }
                },
                complete_delete_plan: function (data) {
                    toastr.success("成功删除");
                    this.extend.__hash__ = new Date();
                },
                complete_update_state: function (data) {
                    toastr.success("修改成功");
                    this.extend.__hash__ = new Date();
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