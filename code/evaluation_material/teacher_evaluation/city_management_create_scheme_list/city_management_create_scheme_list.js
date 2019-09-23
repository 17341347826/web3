define(["jquery",C.CLF('avalon.js'),'layer',
        // C.Co("evaluation_item","item_programme_management/item_programme_management","css!"),
        C.Co("evaluation_material","teacher_evaluation/city_management_create_scheme_list/city_management_create_scheme_list","css!"),
        C.Co("evaluation_material","teacher_evaluation/city_management_create_scheme_list/city_management_create_scheme_list","html!"),
        C.CMF("router.js"),C.CMF("data_center.js"),C.CM("table"), C.CM('three_menu_module')],
    function($,avalon, layer,css, html, x, data_center,tab,three_menu_module) {
        //获取学校类别
        var api_get_school_type = api.api+"base/schoolproperty/dept_sp";
        //获取年级
        var api_get_grade=api.api+"base/grade/findGrades.action";
        //查询方案
        var api_find_plan=api.api+"Indexmaintain/find_checkpass_plan_list";
        //修改
        var api_update_state=api.api+"Indexmaintain/indexmaintain_updatePlanState";
        //删除
        var api_delete_plan=api.api+"Indexmaintain/delete_county_plan";
        //标记为当前学期使用方案
        var api_opt_plan = api.api + 'Indexmaintain/opt_plan';
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "city_management_create_scheme_list",
                url:api_find_plan,
                type:"",
                schoolList:[],//学校类别
                is_init: false,
                remember:false,
                data: {
                    offset: 0,
                    rows: 15
                },
                params:{
                    fk_school_id:"",
                    work:"",
                    user_type:""
                },
                // 请求参数
                extend: {
                    plan_check_state:'',
                    plan_gradeid:"",
                    plan_name:"",
                    plan_school_typeid:"",
                    plan_subjectid:'',//1:学生自评 2:学生互评 3:教师评价 4:全部
                    plan_use_state:"",//方案使用状态 1:启用 2:停用
                    __hash__: ""
                },
                request_data:{
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
                        type: "min_text",
                        from: "plan_name",
                        min_width:"white-space"

                    },
                    {
                        title: "评价主体",
                        type: "cover_text",
                        from: "plan_subject",
                        dict: {
                            学生自评: '自评',
                            学生互评: '组评',
                            教师评价: '班评'
                        }
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
                    }, {
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
                        from:
                        "<a class='tab-toggle-off-btn tab-btn' ms-visible='el.plan_use_state==2 && el.plan_work == params.work && params.user_type ==0' ms-on-click='@oncbopt({current:$idx, type:1})'></a>"+
                        "<a class='tab-toggle-on-btn tab-btn' ms-visible='el.plan_use_state==1 && el.plan_work == params.work && params.user_type ==0' ms-on-click='@oncbopt({current:$idx, type:2})'></a>"+
                        // "<a class='tab-toggle-off-btn tab-btn' ms-visible='el.plan_use_state==2 && (el.plan_work != params.work || params.user_type !=0)'></a>"+
                        // "<a class='tab-toggle-on-btn tab-btn' ms-visible='el.plan_use_state==1 && (el.plan_work != params.work || params.user_type !=0)'></a>"+
                        "<span ms-visible='el.plan_use_state==1 && (el.plan_work != params.work || params.user_type !=0)'>启用</span>"+
                        "<span ms-visible='el.plan_use_state==2 && (el.plan_work != params.work || params.user_type !=0)'>停用</span>"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:5})' title='查看'></a>" +
                        "<a :if='params.fk_school_id == el.plan_workid' class='tab-btn tab-maintenance-btn' ms-on-click='@oncbopt({current:$idx, type:3})' title='方案内容维护'></a>" +
                        "<a :if='params.fk_school_id == el.plan_workid && el.plan_check_state!=2'  class='tab-btn tab-trash-btn' ms-on-click='@oncbopt({current:$idx, type:4})' title='删除'></a>"+
                        "<a :if='el.plan_check_state == 2'  class='tab-btn tab_produce_btn ma-left' ms-on-click='@oncbopt({current:$idx, type:8})' title='指定方案'></a>"

                    }
                ],
                cb: function() {
                    // this.plan_subjectid = pmx.plan_subjectid;
                    this.extend.plan_subjectid = pmx.plan_subjectid;
                    var self = this;
                    data_center.uin(function(data) {
                        var user = JSON.parse(data.data['user']);
                        self.params.user_type = data.data.user_type;
                        self.params.fk_school_id = user.fk_school_id;
                        self.params.work = user.school_name;
                        self.highest_level = user.highest_level;
                        ajax_post(api_get_school_type,{},self);
                    });
                },
                /*添加方案*/
                city_add_programme:function () {
                    window.location="#city_management_create_scheme?plan_subjectid=" + this.extend.plan_subjectid+
                    '&grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+'&module_type='+pmx.module_type+ "&grade_name="+pmx.grade_name;
                },
                //添加项目
                city_add_pro:function () {
                    window.location="#evaluation_project_create?plan_subjectid=" + this.extend.plan_subjectid+
                        '&grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+'&module_type='+pmx.module_type+ "&grade_name="+pmx.grade_name;
                },
                cbopt: function (params) {
                    var id=params.data.id;
                    var plan_type=params.data.plan_type;//方案类型 1:选项 2:直接打分
                    var grade=params.data.plan_grade;//适用年级
                    var plan_subject=params.data.plan_subject;//评价主体 学生自评
                    var plan_founder = params.data.plan_founder;//创建人
                    var plan_name = params.data.plan_name;//方案名称
                    var plan_level = params.data.plan_level;
                    var self = this;

                    if(params.type ==4&&params.data.plan_use_state==1){
                        toastr.error("该项目处于启用状态，无法删除.");
                        return;
                    }
                    if(params.type==1){//启用
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
                    }else if (params.type == 2) {//停用
                        layer.open({
                            title: "提示",
                            content: '是否停用该方案？',
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                ajax_post(api_update_state, {id: params.data.id, plan_use_state: 2,plan_level:plan_level}, self);
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
                        data_center.set_key("grade", grade);
                        data_center.set_key("plan_subject", plan_subject);
                        data_center.set_key("get_id", id);
                        data_center.set_key("get_plan_type", plan_type);
                        data_center.set_key("get_plan_level", plan_level);
                        window.location="#content_maintenance?grade_id="+pmx.grade_id+
                            '&is_switch='+pmx.is_switch+'&module_type='+pmx.module_type;
                    }else if(params.type == 5){//查看详情
                        window.location="#school_detail?&plan_type="+plan_type+
                            "&id="+id+"&grade="+grade+
                            "&plan_subject="+plan_subject+
                            "&plan_founder="+plan_founder+
                            "&plan_name="+plan_name+
                            '&grade_id='+pmx.grade_id+
                            '&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type;
                    }else if(params.type == 8){//区县管理员指定评价方案为当前学期使用方案
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
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取学校类别
                            case api_get_school_type:
                                this.complete_get_school_type(data);
                                break;
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
                            //    标记为当前使用方案
                            case api_opt_plan:
                                toastr.success("标记成功");
                                this.extend.__hash__ = new Date();
                                break;

                        }
                    } else {
                        $("#saveProduct").modal('open');
                        $(".am-modal-bd").text("操作失败！");
                    }
                },
                complete_get_school_type:function (data) {
                    this.schoolList = data.data.list;
                    ajax_post(api_get_grade,{status:"1"},this);
                },
                //年级名称
                grade_name:'',
                complete_get_grade:function (data) {
                    this.request_data.grade_arr=data.data;
                    // this.extend.plan_gradeid = pmx.grade_id;
                    this.extend.plan_gradeid = Number(pmx.grade_name);

                    var grade_id = pmx.grade_id;
                    for(var i=0;i<data.data.length;i++){
                        var id = data.data[i].id;
                        if(id == grade_id){
                            this.grade_name = data.data[i].remark;
                        }
                    }
                },
                complete_delete_plan:function (data) {
                    toastr.success("成功删除");
                    this.extend.__hash__ = new Date();
                },
                complete_update_state:function (data) {
                    toastr.success("修改成功");
                    this.extend.__hash__ = new Date();
                },
                go_href:function () {
                    window.location = "#evaluation_project_view?plan_subjectid="+pmx.plan_subjectid.toString()+
                        '&grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+'&module_type='+pmx.module_type + "&grade_name="+pmx.grade_name;
                    // if(index == 2){
                    //     window.location = "#evaluation_project_view?plan_subjectid="+pmx.plan_subjectid.toString();
                    // }else if(index == 3) {
                    //     window.location = "#parameter_setting?plan_subjectid="+pmx.plan_subjectid.toString();
                    // }
                },
                //参数设置
                parameter_add:function(){
                    window.location='#parameter_setting?grade_id='+pmx.grade_id+
                        '&is_switch='+pmx.is_switch+'&module_type='+pmx.module_type+'&plan_subjectid='+pmx.plan_subjectid.toString()+ "&grade_name="+pmx.grade_name;
                },
            });
            vm.$watch('onReady', function() {
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