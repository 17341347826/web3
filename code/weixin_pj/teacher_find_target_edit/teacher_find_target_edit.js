define(['jquery',
        C.CLF('avalon.js'), 'layer',
        C.Co("weixin_pj", "teacher_find_target_edit/teacher_find_target_edit", "css!"),
        C.Co("weixin_pj", "teacher_find_target_edit/teacher_find_target_edit", "html!"),
        C.CMF("router.js"),C.CMF("data_center.js"), "jquery-weui"
    ],
    function($, avalon, layer,css,html, x,data_center,weui ) {
        //老师提交实现情况
        var api_add_situation=api.growth+"targetplan_updateTargetplan";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "teacher_find_target_edit",
                data:{
                    gradeID:"",
                    id:"",
                    module_type:"6",
                    score:"",
                    tar_situation:""
                },
                tar_targetplan:"",
                //编辑
                module_name:"",
                module_score:1,
                module_id:"",
                module_tar_situation:"",
                fk_grade_id:"",
                name:"",
                class:"",
                semester:"",
                init:function () {
                    var value = JSON.parse(pmx.el);
                    this.name = value.name;
                    this.class = value.class_name;
                    this.semester = pmx.semester;
                    this.data.gradeID = value.fk_grade_id;
                    this.data.id = value.id;
                    this.tar_targetplan = value.tar_targetplan;
                    var score = value.score;
                    if(score == 666){
                        this.module_score = 1;
                        this.data.score = 1;
                    }else{
                        this.module_score = score;
                        this.data.score = score;
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //老师填写实现情况
                            case api_add_situation:
                                $.toast("保存成功");
                                window.location = "#teacher_find_target";
                                break;

                        }
                    }
                },
                submit:function () {
                    this.data.score = this.module_score;
                    if(this.module_score == '1'){
                        this.data.tar_situation = '好';
                    }else if(this.module_score == '0.5'){
                        this.data.tar_situation = '一般';
                    }else if(this.module_score == '0'){
                        this.data.tar_situation = '未完成';
                    }
                    ajax_post(api_add_situation,this.data.$model,this);
                }

            });
            vm.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                this.init();

            });

            return vm;
        };

        return {
            view: html,
            define: avalon_define
        }
    });




