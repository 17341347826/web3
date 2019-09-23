/**
 * Created by Administrator on 2018/6/19.
 */
define(["jquery",C.CLF('avalon.js'),'layer',
        C.Co("evaluate_students","peer_review/parameter_setting/parameter_setting","css!"),
        C.Co("evaluate_students","peer_review/parameter_setting/parameter_setting","html!"),
        C.CMF("router.js"),C.CM('three_menu_module'),C.CMF("data_center.js")],
    function($,avalon,layer,css, html, x,three_menu_module, data_center) {
        //查询参数设置
        var api_get_setting=api.api+"Indexmaintain/indexmaintain_findByParameter";
        //添加参数设置
        var api_add_setting=api.api+"Indexmaintain/indexmaintain_addParameter";
        //修改参数设置
        var api_update_setting=api.api+"Indexmaintain/indexmaintain_updateParameter";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "parameter_setting",
                type:"",
                //1添加 2修改
                is_add:"",
                request_data:{
                    evaluate_number:"",
                    score_limit:""
                },
                //学校
                go_href:function (index) {
                    if(index == 1){
                        window.location = "#student_mutual_evaluation?grade_id="+pmx.grade_id+'&is_switch='+pmx.is_switch+
                        '&module_type='+pmx.module_type + '&grade_name=' + pmx.grade_name;
                    }else {
                        window.location = "#item_programme_management?url_type="+2+"&grade_id="+pmx.grade_id+
                            '&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type + '&grade_name=' + pmx.grade_name;
                    }
                },
                //市跳转
                city_href:function (index) {
                    if(index == 1){//评价方案
                        window.location = "#city_management_create_scheme_list?plan_subjectid=" + pmx.plan_subjectid.toString() +
                            "&grade_id=" + pmx.grade_id + '&is_switch=' + pmx.is_switch + '&module_type=' + pmx.module_type + '&grade_name=' + pmx.grade_name;
                    }else if(index == 2){//评价任务
                        window.location = "#evaluation_project_view?plan_subjectid=" + pmx.plan_subjectid.toString() +
                            "&grade_id=" + pmx.grade_id + '&is_switch=' + pmx.is_switch + '&module_type=' + pmx.module_type + '&grade_name=' + pmx.grade_name;
                    }
                },
                user_type:"",
                highest_level:'',
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var dataList=JSON.parse(data.data["user"]);
                        self.user_type = data.data.user_type;
                        self.highest_level = data.data.highest_level;
                    });
                },
                get_setting:function () {
                    ajax_post(api_get_setting,{},this);
                },
                add_click:function () {
                    var reg=/^[0-9]*[1-9][0-9]*$/;
                    this.request_data.evaluate_number=Number(this.request_data.evaluate_number);
                    this.request_data.score_limit=Number(this.request_data.score_limit);
                    if(!(reg.test(this.request_data.evaluate_number))){
                        toastr.warning("互评人数限制只能为正整数")
                    }else if(!(reg.test(this.request_data.score_limit))){
                        toastr.warningg("统计分数只能为正整数")
                    }else{
                        if(this.is_add==1){//添加
                            ajax_post(api_add_setting,this.request_data,this);

                        }else{//修改
                            ajax_post(api_update_setting,this.request_data,this);
                        }
                    }
                },
                //取消
                cancel_click:function(){
                    if(this.highest_level == 4){
                        window.location='#student_mutual_evaluation?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type + '&grade_name=' + pmx.grade_name;
                    }else if(this.highest_level != 4){
                        window.location = "#evaluation_project_view?plan_subjectid=" + pmx.plan_subjectid.toString() +
                            "&grade_id=" + pmx.grade_id + '&is_switch=' + pmx.is_switch + '&module_type=' + pmx.module_type + '&grade_name=' + pmx.grade_name;
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询
                            case api_get_setting:
                                this.complete_get_setting(data);
                                break;
                            //添加
                            case api_add_setting:
                                this.complete_add_setting(data);
                                break;
                            //修改
                            case api_update_setting:
                                this.complete_update_setting(data);
                                break;
                        }
                    } else {
                        toastr.error("操作失败");
                    }
                },
                complete_get_setting:function (data) {
                    if(data.data==null){//添加
                        this.is_add=1;
                    }else{
                        this.is_add=2;
                        this.request_data.evaluate_number=data.data.evaluate_number;
                        this.request_data.score_limit=data.data.score_limit;
                    }
                },
                complete_add_setting:function (data) {
                    toastr.success("参数设置添加成功！");
                    if(this.highest_level == 4){
                        window.location='#student_mutual_evaluation?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type + '&grade_name=' + pmx.grade_name;
                    }else if(this.highest_level != 4){
                        window.location = "#evaluation_project_view?plan_subjectid=" + pmx.plan_subjectid.toString() +
                            "&grade_id=" + pmx.grade_id + '&is_switch=' + pmx.is_switch + '&module_type=' + pmx.module_type + '&grade_name=' + pmx.grade_name;
                    }
                },
                complete_update_setting:function (data) {
                    toastr.success("参数设置修改成功！");
                    if(this.highest_level == 4){
                        window.location='#student_mutual_evaluation?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type + '&grade_name=' + pmx.grade_name;
                    }else if(this.highest_level != 4){
                        window.location = "#evaluation_project_view?plan_subjectid=" + pmx.plan_subjectid.toString() +
                            "&grade_id=" + pmx.grade_id + '&is_switch=' + pmx.is_switch + '&module_type=' + pmx.module_type + '&grade_name=' + pmx.grade_name;
                    }
                }
            });
            vm.$watch('onReady', function() {
                this.cb();
                this.get_setting();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });