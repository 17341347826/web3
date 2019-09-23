/**
 * Created by Administrator on 2018/6/19.
 */
define(["jquery",C.CLF('avalon.js'),'layer',
        C.Co("eval_param_set","task_control_see/parameter_setting_see/parameter_setting_see","css!"),
        C.Co("eval_param_set","task_control_see/parameter_setting_see/parameter_setting_see","html!"),
        C.CMF("router.js"),C.CM('three_menu_module'),C.CMF("data_center.js")],
    function($,avalon,layer,css, html, x,three_menu_module, data_center) {
        //查询参数设置
        var api_get_setting=api.api+"Indexmaintain/indexmaintain_findByParameter";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "parameter_setting_see",
                type:"",
                //1添加 2修改
                is_add:"",
                request_data:{
                    evaluate_number:"",
                    score_limit:""
                },
                //学校跳转
                go_href:function (index) {
                    if(index == 1){
                        window.location = "#student_mutual_evaluation_see?grade_id="+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type + '&grade_name=' + pmx.grade_name;
                    }else {
                        window.location = "#item_programme_management_see?url_type="+2+"&grade_id="+pmx.grade_id+
                            '&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type + '&grade_name=' + pmx.grade_name;
                    }
                },
                //市、区县跳转
                city_href:function (index) {
                    if(index == 1){//评价方案
                        window.location = "#c_c_scheme_list_see?plan_subjectid=" + pmx.plan_subjectid.toString() +
                            "&grade_id=" + pmx.grade_id + '&is_switch=' + pmx.is_switch + '&module_type=' + pmx.module_type + '&grade_name=' + pmx.grade_name;
                    }else if(index == 2){//评价任务
                        window.location = "#evaluation_project_view_see?plan_subjectid=" + pmx.plan_subjectid.toString() +
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
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询
                            case api_get_setting:
                                this.complete_get_setting(data);
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