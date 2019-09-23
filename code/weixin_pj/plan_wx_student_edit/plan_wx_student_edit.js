define(['jquery',
        C.CLF('avalon.js'), 'layer',
        C.Co("weixin_pj", "plan_wx_student_edit/plan_wx_student_edit", "css!"),
        C.Co("weixin_pj", "plan_wx_student_edit/plan_wx_student_edit", "html!"),
        C.CMF("router.js"),C.CMF("data_center.js"), "jquery-weui"
    ],
    function($, avalon, layer,css,html, x,data_center,weui ) {
        //添加
        var api_add_target_plan=api.growth+"targetplan_addTargetplan";
        //修改
        var api_update_target_plan=api.growth+"targetplan_updateTargetplan";
        avalon.filters.con_filters = function(str){
            if(str == null){
                return '';
            }
            return str;
        };
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "plan_wx_student_edit",
                semester:"",
                name:"",
                code:"",
                data:{
                    tar_targetplan:"",
                    tar_schoolyear:"",
                    tar_semester:"",
                    gradeID:'',
                    semester_id:''
                },
                update_data:{
                    gradeID:"",
                    module_type:5,
                    id:""
                },
                flag:0,
                init:function () {
                    this.semester = pmx.key;
                    var semester = this.semester;
                    this.name = pmx.login_name;
                    this.code = pmx.login_code;
                    var value = JSON.parse(pmx.el);
                    this.data.tar_targetplan = value.tar_targetplan;
                    if(value.tar_targetplan == '' || value.tar_targetplan == null){
                        this.flag = 1;//添加
                        this.data.tar_schoolyear = semester.substr(0,3);
                        this.data.tar_semester = semester.substr(3,2);
                        this.data.gradeID = Number(pmx.gradeID);
                        this.data.semester_id = value.semester_id;
                    }else{
                        this.update_data.id = Number(value.id);
                        this.update_data.tar_targetplan = value.tar_targetplan;
                        this.update_data.gradeID = Number(pmx.gradeID);
                    }
                },
                submit:function () {
                    if(this.flag == 1){
                        ajax_post(api_add_target_plan, this.data.$model, this);
                    }else{
                        this.update_data.tar_targetplan = this.data.tar_targetplan;
                        ajax_post(api_update_target_plan, this.update_data, this);
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_add_target_plan:
                                window.location = '#plan_wx_student';
                                break;
                            case api_update_target_plan:
                                window.location = '#plan_wx_student';
                                break;

                        }
                    }else{
                        $.alert(msg)
                    }
                }

            });
            vm.$watch("onReady", function() {
                this.init();

            });

            return vm;
        };

        return {
            view: html,
            define: avalon_define
        }
    });




