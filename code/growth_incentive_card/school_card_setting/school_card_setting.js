/**
 * Created by Administrator on 2018/7/4.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("growth_incentive_card", "school_card_setting/school_card_setting", "css!"),
        C.Co("growth_incentive_card", "school_card_setting/school_card_setting", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, css,html, layer, table, data_center, three_menu_module) {
        //年级
        var grade_list = api.api + "base/class/school_class.action";
        //初始设置——参数保存
        var initial_setting = api.api + "everyday/set_mark_param";
        //初始设置——参数查询
        var initial_setting_demand = api.api + "everyday/page_mark_param";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "school_card_setting",
                //年级
                grade_list: [],
                class_list: [],
                //初始设置
                initial_setting: [],
                //参数保存
                initial_data: {
                    id: "",
                    fk_grade_id: "",
                    grade_name: "",
                    cycle_type: "",
                    max_number: ""
                },
                //参数查询
                other: {
                    grade: "",
                    code: "",
                    name: "",
                    card_name: "",
                    start_time: "",
                    end_time: "",
                    fk_school_id: "",
                    fk_grade_id: ""
                },
                //年级改变
                gradeChange: function () {
                    var grade = this.other.grade;
                    this.initial_data.fk_grade_id = Number(grade.substring(0, grade.indexOf("|")));
                    this.initial_data.grade_name = grade.substring(grade.indexOf("|") + 1, grade.length);
                },
                demand: function () {
                    //最大获卡数是：999999999
                    // var reg = /^[1-9]*[1-9][0-9]$/;
                    var reg = /^[1-9][0-9]{0,8}$/;
                    var numReg = reg.test(this.initial_data.max_number);
                    if (this.other.grade != "" &&
                        this.initial_data.cycle_type != "" &&
                        this.initial_data.max_number != "") {
                        if (!numReg) {
                            toastr.warning("请输入正确的最大获卡数");
                        } else {
                            ajax_post(initial_setting, this.initial_data.$model, this);
                        }
                    } else {
                        toastr.warning("年级、周期以及最大获卡量必选或必填");
                    }
                },
                //数据转换
                setCycleType: function (a) {
                    return a == 1 ? "每天" : a == 2 ? "每周" : a == 3 ? "每月" : a == 4 ? "每学期" : "";
                },
                details: function (data) {
                    this.other.grade = data.fk_grade_id + "|" + data.grade_name;
                    this.initial_data.id = data.id;
                    this.initial_data.fk_grade_id = data.fk_grade_id;
                    this.initial_data.grade_name = data.grade_name;
                    this.initial_data.max_number = data.max_number;
                    this.initial_data.cycle_type = data.cycle_type;
                },
                init: function () {
                    this.cds();
                    //初始化设置列表
                    ajax_post(initial_setting_demand, {offset: 0, rows: 99999999}, this);
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        if (userType == "0") {//管理员，目前权限是校管理员
                            var tUserData = JSON.parse(data.data["user"]);
                            self.other.fk_school_id = tUserData.fk_school_id;
                            ajax_post(grade_list, {school_id: tUserData.fk_school_id}, self);
                        }
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //年级
                            case grade_list:
                                this.grade_list = data.data;
                                break;
                            // 初始化设置参数保存
                            case initial_setting:
                                if (status == 200) {
                                    ajax_post(initial_setting_demand, {offset: 0, rows: 99999999}, this);
                                    this.other.grade = "";
                                    this.initial_data.cycle_type = "";
                                    this.initial_data.max_number = "";
                                }
                                toastr.success('设置成功');
                                break;
                            //初始化设置
                            case initial_setting_demand:
                                this.initial_setting = data.data.list;
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });