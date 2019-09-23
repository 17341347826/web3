/*=========================================新需求=======================================*/
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("evaluation_material/stu_evaluation", "evaluation", "css!"),
        C.Co("evaluation_material/teacher_evaluation", "self_evaluation_scheme_stu/self_evaluation_scheme_stu", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("table"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, css, html, x, data_center, tab, tmm) {
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
        var avalon_define = function () {
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
                },
                // 请求参数
                extend: {
                    plan_gradeid: "",
                    plan_name: "",
                    plan_school_typeid: "",
                    plan_subjectid: '1',//1:学生自评 2:学生互评 3:教师评价 4:全部
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
                    // {
                    //     title: "内容数量",
                    //     type: "text",
                    //     from: "role"
                    // },
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
                        from: "<span class='am-icon-toggle-off' ms-visible='el.plan_use_state==2' ms-on-click='@oncbopt({current:$idx, type:1})'></span>" +
                        "<span class='am-icon-toggle-on' ms-visible='el.plan_use_state==1' ms-on-click='@oncbopt({current:$idx, type:2})'></span>"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a  :if='params.fk_school_id == el.plan_workid && (el.plan_check_state ==3 || el.plan_check_state ==4) ' class='tab-btn tab-maintenance-btn' ms-on-click='@oncbopt({current:$idx, type:3})' title='方案内容维护'></a>" +
                        "<a :if='params.fk_school_id == el.plan_workid && el.plan_check_state != 2 && el.plan_check_state != 1'  class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>" +
                        "<a :if='el.plan_check_state == 3'  class='tab-btn tab-objection-btn' ms-on-click='@oncbopt({current:$idx, type:5})' title='查看'></a>" +
                        "<a  class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:6})' title='详情查看'></a>" +
                        "<a :if='el.plan_check_state == 4 || el.plan_check_state == 3' class='tab-btn tab-cause-btn' ms-on-click='@oncbopt({current:$idx, type:7})' title='提交审核'></a>"

                    }
                ],
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var user = JSON.parse(data.data['user']);
                        self.params.fk_school_id = user.fk_school_id;
                        self.params.name = user.name;
                        self.highest_level = user.highest_level;
                        ajax_post(api_get_grade, {status: "1"}, self);

                    });
                },
                /*添加方案*/
                school_add_programme: function () {
                    window.location = "#add_programme?plan_subject=1";
                },
                cbopt: function (params) {
                    var id = params.data.id;
                    var plan_type = params.data.plan_type;//方案类型 1:选项 2:直接打分
                    var grade = params.data.plan_grade;//适用年级
                    var plan_subject = params.data.plan_subject;//评价主体 学生自评
                    var plan_refer = params.data.plan_refer;
                    var plan_founder = params.data.plan_founder;//创建人
                    var plan_school_type = params.data.plan_school_type;
                    var plan_name = params.data.plan_name;//方案名称
                    var self = this;
                    if (params.type == 1) {//启用
                        layer.open({
                            title: "提示",
                            content: '是否启用该指标？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                ajax_post(api_update_state, {id: params.data.id, plan_use_state: 1}, self);
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
                                ajax_post(api_update_state, {id: params.data.id, plan_use_state: 2}, self);
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

                        window.location = "#content_maintenance";
                    } else if (params.type == 6) {//详情查看
                        // data_center.set_key("grade", grade);
                        // data_center.set_key("plan_subject", plan_subject);
                        // data_center.set_key("get_id", id);
                        // data_center.set_key("get_plan_type", plan_type);
                        // data_center.set_key("get_plan_refer", plan_refer);
                        // data_center.set_key("plan_founder", plan_founder);
                        // data_center.set_key("plan_school_type", plan_school_type);
                        // data_center.set_key("plan_name", plan_name);

                        window.location = "#school_detail?&plan_type=" + plan_type + "&id=" + id + "&grade=" + grade + "&plan_subject=" + plan_subject + "&plan_founder=" + plan_founder + "&plan_name=" + plan_name;
                    } else if (params.type == 7) {//手动提交审核
                        ajax_post(api_submit_check, {id: id, plan_check_state: 1}, self)

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
                complete_get_grade: function (data) {
                    this.request_data.grade_arr = data.data;
                    this.is_init = true;
                    this.extend.__hash__ = new Date();
                },
                complete_delete_plan: function (data) {
                    toastr.success("成功删除");
                    this.extend.__hash__ = new Date();
                },
                complete_update_state: function (data) {
                    toastr.success("修改成功");
                    this.extend.__hash__ = new Date();
                }
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