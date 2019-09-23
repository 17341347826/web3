/**
 * Created by Administrator on 2018/5/24.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('practice_management', 'sign_result/sign_result', 'html!'),
        C.Co('practice_management', 'sign_result/sign_result', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, three_menu_module) {
        //查询列表
        var api_check_list = api.api + "GrowthRecordBag/statis_enroll_distributed";
        //详情
        var api_get_info = api.api + "GrowthRecordBag/enroll_student_detail";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "sign_result",
                level:"",
                bt:"",
                // 请求参数
                data: {
                    district: '',//区县（非学校端）string
                    fk_bj_id:"",//班级id(学校端用
                    fk_hd_id:"",//活动id不能为空
                    fk_xx_id:""// 学校id（非学校端）
                },
                grade_name:"",
                area_list:[],
                school_list:[],
                class_list:[],
                dataList:[],
                init:function () {
                    this.data.fk_hd_id = Number(pmx.id);
                    this.bt = pmx.bt;
                    var grade_id = Number(pmx.grade_id);
                    this.grade_name = pmx.grade_name;
                    var login_level = cloud.user_level();
                    this.level = login_level;
                    if(login_level == 2){//市管理
                        all_area_list = cloud.area_list();
                        this.area_list = any_2_select(all_area_list, {name: "district", value: ["id"]});
                    }else if(login_level == 3){//区管理
                        this.school_list = cloud.school_list();
                    }else if(login_level == 4){//校管理
                        this.data.district = cloud.user_district();
                        // this.data.fk_xx_id = cloud.user_school_id();
                        all_class_list = cloud.find_class_simple({fk_grade_id:grade_id});
                        this.class_list = any_2_select(all_class_list, {name: "class_name", value: ["id"]});
                    }
                    this.check();
                },
                check:function () {
                    this.dataList = [];
                    ajax_post(api_check_list,this.data.$model,this);
                },
                area_change:function (el) {
                    this.data.district = el.name;
                    var school_list = cloud.school_list({district:el.name});
                    this.school_list = any_2_select(school_list, {name: "schoolname", value: ["id"]});
                    this.check();
                },
                school_change:function (el) {
                    this.data.fk_xx_id = el.value;
                    this.check();
                },
                class_change:function (el) {
                    this.data.fk_bj_id = Number(el.value);
                    this.check();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_check_list:
                                this.complete_check_list(data);
                                break;
                            //删除
                            case api_del:
                                this.extend.__hash__ = new Date();
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_check_list:function (data) {
                    this.dataList = data.data;
                },
                //导出
                export_click:function (el) {
                    var school_id = el.school_id;
                    var HTTP_X = location.origin;
                    var url = '';
                    if(this.login_level == 4){
                        url = HTTP_X + "/GrowthRecordBag/export_enroll_student?fk_bj_id=" + this.data.fk_bj_id +
                            "&fk_hd_id=" + this.data.fk_hd_id +
                            "&fk_xx_id=" + school_id;
                    }else{
                        url = HTTP_X + "/GrowthRecordBag/export_enroll_student?fk_hd_id=" + this.data.fk_hd_id +
                            "&fk_xx_id=" + school_id;
                    }
                    window.open(url);

                },
                //打印
                print_click:function (el) {
                    console.log(el);
                    var school_id = el.school_id;
                    if(this.level == 4){//学校

                    }else{
                        window.location = "#print_info?fk_hd_id=" +  this.data.fk_hd_id + "&school_id=" + school_id + "&bt=" + this.bt + "&grade_name=" + this.grade_name;
                    }
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
