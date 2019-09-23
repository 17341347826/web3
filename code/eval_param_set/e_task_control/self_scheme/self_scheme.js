/**
 * Created by Administrator on 2018/5/29.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('eval_param_set', 'e_task_control/self_scheme/self_scheme','html!'),
        C.Co('eval_param_set', 'e_task_control/self_scheme/self_scheme','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CMF("table/table.js"),
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,table,three_menu_module) {
        //获取年级
        var api_get_grade=api.api+"base/grade/findGrades.action";
        //查询方案
        var api_find_plan=api.api+"Indexmaintain/find_checkpass_plan_list";
        //修改
        var api_update_state=api.api+"Indexmaintain/indexmaintain_updatePlanState";
        //删除
        var api_delete_plan=api.api+"Indexmaintain/delete_county_plan";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "self_scheme",
                url:api_find_plan,
                type:"",
                //年级列表
                grade_list:[],
                is_init: false,
                remember:false,
                data: {
                    offset: 0,
                    rows: 15
                },
                params:{
                    fk_school_id:""
                },
                // 请求参数
                extend: {
                    plan_gradeid:"",
                    plan_name:"",
                    plan_school_typeid:"",
                    plan_subjectid:1,//1:学生自评 2:学生互评 3:教师评价 4:全部
                    plan_use_state:"",//方案使用状态 1:启用 2:停用
                    __hash__: ""
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
                        min_width:"white-space"

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
                        "<a class='tab-btn tab-toggle-off-btn ' ms-visible='el.plan_use_state==2' ms-on-click='@oncbopt({current:$idx, type:1})'></a>"+
                        "<a class='tab-btn tab-toggle-on-btn' ms-visible='el.plan_use_state==1' ms-on-click='@oncbopt({current:$idx, type:2})'></a>"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:5})' title='查看'></a>" +
                        "<a :if='params.fk_school_id == el.plan_workid' class='tab-btn tab-setting-btn' ms-on-click='@oncbopt({current:$idx, type:3})' title='方案内容维护'></a>" +
                        "<a :if='params.fk_school_id == el.plan_workid'  class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>"
                    }
                ],
                cbopt: function (params) {
                    var id=params.data.id;
                    var plan_type=params.data.plan_type;//方案类型 1:选项 2:直接打分
                    var grade=params.data.plan_grade;//适用年级
                    var plan_subject=params.data.plan_subject;//评价主体 学生自评
                    var plan_founder = params.data.plan_founder;//创建人
                    var plan_name = params.data.plan_name;//方案名称
                    var self = this;
                    if(params.type==1){//启用
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
                    }else if (params.type == 2) {//停用
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
                    }else if (params.type == 4) {//删除
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
                    }else if(params.type == 3){//维护
                        // data_center.set_key("grade", grade);
                        // data_center.set_key("plan_subject", plan_subject);
                        // data_center.set_key("get_id", id);
                        // data_center.set_key("get_plan_type", plan_type);
                        // window.location="#content_maintenance";
                    }else if(params.type == 5){//查看详情
                        // window.location="#school_detail?&plan_type="+plan_type+"&id="+id+"&grade="+grade+"&plan_subject="+plan_subject+"&plan_founder="+plan_founder+"&plan_name="+plan_name;
                    }
                },
                //创建方案
                create_scheme:function(){
                    window.location='#create_scheme';
                },
                init:function () {
                    this.cb();
                },
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level=data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        self.params.fk_school_id = tUserData.fk_school_id;
                        //年级
                        ajax_post(api_get_grade, {status: "1"}, self);
                    });
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
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_grade:function (data) {
                    this.grade_list=data.data;
                    this.is_init = true;
                    this.extend.__hash__=new Date();
                },
                complete_delete_plan:function (data) {
                    toastr.success("成功删除");
                    this.extend.__hash__ = new Date();
                },
                complete_update_state:function (data) {
                    toastr.success("修改成功");
                    this.extend.__hash__ = new Date();
                }
            });
            vm.$watch('onReady', function () {

            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });