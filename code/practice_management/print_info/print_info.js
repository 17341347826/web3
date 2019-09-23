/**
 * Created by Administrator on 2018/5/24.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('practice_management', 'print_info/print_info', 'html!'),
        C.Co('practice_management', 'print_info/print_info', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, three_menu_module) {
        //详情
        var api_get_info = api.api + "GrowthRecordBag/enroll_student_detail";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "print_info",
                level:"",
                bt:"",
                //打印参数
                data:{
                    fk_bj_id:"",//学校端用
                    fk_hd_id:"",
                    fk_xx_id:""
                },
                grade_name:"",
                dataList:[],
                init:function () {
                    this.data.fk_hd_id = Number(pmx.fk_hd_id);
                    this.data.fk_xx_id = Number(pmx.school_id);
                    this.grade_name = pmx.grade_name;
                    this.bt = pmx.bt;
                    var grade_id = Number(pmx.grade_id);
                    var login_level = cloud.user_level();
                    this.level = login_level;
                    if(login_level == 2){//市管理
                    }else if(login_level == 3){//区管理
                    }else if(login_level == 4){//校管理
                    }
                    this.check();
                },
                check:function () {
                    this.dataList = [];
                    ajax_post(api_get_info,this.data.$model,this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_info:
                                this.complete_get_info(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_info:function (data) {
                    this.dataList = data.data;
                }
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
