/**
 * Created by Administrator on 2018/6/7.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("self_evaluation_management","self_evaluation/student_self_detail/student_self_detail","css!"),
        C.Co("self_evaluation_management","self_evaluation/student_self_detail/student_self_detail","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function($,avalon, layer,css, html, x,data_center) {
        //查询方案内容
        var api_get_content=api.api+"Indexmaintain/indexmaintain_findByPlanSubject";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "student_self_detail",
                type:"",
                //方案id
                id:"",
                num:"",
                table_list:[
                    // {id:1,sub_subject:'七年级学生自评项目'},
                    // {id:2,sub_subject:'七年级学生自评项目'},
                    // {id:3,sub_subject:'七年级学生自评项目'}
                ],
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userType = data.data.user_type;
                    });
                    self.is_init = true;
                },
                get_id:function () {
                    //方案id
                    this.id=data_center.get_key("pro_plan_id");
                    var plan_level = data_center.get_key("get_plan_level");
                    //项目id
                    var id;
                    if(data_center.get_key("get_self_id")){
                        //学生自评
                        id=data_center.get_key("get_self_id");
                    }else if(data_center.get_key("get_mutual_id")){
                        //学生互评
                        id=data_center.get_key("get_mutual_id");
                    }else if(data_center.get_key("get_teacher_id")){
                        //教师评价
                        id=data_center.get_key("get_teacher_id");
                    }else if(data_center.get_key("get_parent_id")){
                        //家长评价
                        id=data_center.get_key("get_parent_id");
                    }
                    ajax_post(api_get_content,{id:this.id,plan_level:Number(plan_level)},this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_content:
                                this.complete_get_content(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_content:function (data) {
                    if(data.data.length==0){
                        this.num=1;
                    }else{
                        this.table_list=data.data;
                    }
                }
            });
            vm.$watch('onReady', function() {
                this.cb();
                this.get_id();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });