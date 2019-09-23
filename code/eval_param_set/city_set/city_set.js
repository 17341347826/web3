/**
 * Created by Administrator on 2018/5/24.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('eval_param_set', 'city_set/city_set', 'html!'),
        C.Co('eval_param_set', 'city_set/city_set', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly")
    ],
    function (avalon, layer, html, css, data_center, select_assembly) {
        var api_get_grade = api.api+"base/grade/findGrades.action";
        //回显
        var api_get_project_control = api.api + "score/get_project_control";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "city_set",
                grade_list:[],
                data:{
                    city:"",
                    fk_grade_id:"",
                    fk_unit_id:"",//创建者单位
                    unit_lv:""//统计时采用的规则创建人单位等级 1省 2 市 3 区 4 学校
                },
                gradeChange:function () {
                    if(this.data.fk_grade_id != ''){
                        ajax_post(api_get_project_control,{city:this.data.city,fk_grade_id:this.data.fk_grade_id},this);
                    }
                },
                cb:function () {
                    ajax_post(api_get_grade,{status:1},this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            case api_get_project_control:
                                this.data.unit_lv = data.data.unit_lv;
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_get_grade:function(data){
                    this.grade_list = data.data;
                    this.data.city = cloud.user_city();
                    this.data.fk_unit_id = cloud.user_school_id();
                },
                ajax_add:function () {
                        //unit_lv  统计时采用的规则创建人单位等级 1省 2 市 3 区 4 学校
                    if(this.data.fk_grade_id == ''){
                        toastr.warning('请选择适用年级');
                        return;
                    }
                    else if(this.data.unit_lv == ''){
                        toastr.warning('请选择规则使用');
                        return;
                    }else{
                        cloud.edit_project_control(vm.data.$model,function (url,is_suc, ars, data,msg) {
                            if(is_suc){
                                toastr.success('设置成功');
                            }else{
                                toastr.error(msg);
                            }
                        });
                    }


                }

            });
            vm.$watch('onReady', function () {
                this.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
