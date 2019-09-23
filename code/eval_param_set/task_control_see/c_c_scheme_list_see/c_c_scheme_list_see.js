define(["jquery",C.CLF('avalon.js'),'layer',
        C.Co("eval_param_set","task_control_see/c_c_scheme_list_see/c_c_scheme_list_see","css!"),
        C.Co("eval_param_set","task_control_see/c_c_scheme_list_see/c_c_scheme_list_see","html!"),
        C.CMF("router.js"),C.CMF("data_center.js"),C.CM("table"), C.CM('three_menu_module')],
    function($,avalon, layer,css, html, x, data_center,tab,three_menu_module) {
        //获取学校类别
        var api_get_school_type = api.api+"base/schoolproperty/dept_sp";
        //获取年级
        var api_get_grade=api.api+"base/grade/findGrades.action";
        //查询方案
        var api_find_plan=api.api+"Indexmaintain/find_checkpass_plan_list";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "c_c_scheme_list_see",
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
                        from:
                            "<span ms-visible='el.plan_use_state==1'>启用</span>"+
                            "<span ms-visible='el.plan_use_state==2'>停用</span>"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:5})' title='查看'></a>"
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
                cbopt: function (params) {
                    var id=params.data.id;
                    var plan_type=params.data.plan_type;//方案类型 1:选项 2:直接打分
                    var grade=params.data.plan_grade;//适用年级
                    var plan_subject=params.data.plan_subject;//评价主体 学生自评
                    var plan_founder = params.data.plan_founder;//创建人
                    var plan_name = params.data.plan_name;//方案名称
                    var plan_level = params.data.plan_level;
                    var self = this;
                   if(params.type == 5){//查看详情
                        window.location="#school_detail?&plan_type="+plan_type+
                            "&id="+id+"&grade="+grade+
                            "&plan_subject="+plan_subject+
                            "&plan_founder="+plan_founder+
                            "&plan_name="+plan_name+
                            '&grade_id='+pmx.grade_id+
                            '&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type;
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
                go_href:function () {
                    window.location = "#evaluation_project_view_see?plan_subjectid="+pmx.plan_subjectid.toString()+
                        '&grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+'&module_type='+pmx.module_type + "&grade_name="+pmx.grade_name;
                },
                //参数设置--只有学生自评才有
                parameter_add:function(){
                    window.location='#parameter_setting_see?grade_id='+pmx.grade_id+
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