define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_condition_monitor', 'class_user_activity/class_user_activity', 'html!'),
        C.Co('evaluation_condition_monitor', 'class_user_activity/class_user_activity', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        C.CM("use_state_module"),
        C.CM("three_menu_module")

    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, use_state_module, three_menu_module) {
        var full_record = []
        var avalon_define = function () {
            var grade_list = [];
            var semester_full = [];
            var vm = avalon.define({
                $id: "class_user_activity",
                //下拉列表是否初始化
                is_init_sel: true,
                head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期", project: "请选择项目"},
                project_list: [],
                filter: {code: "", name: ""},
                filter_show: function (el) {
                    if (this.filter.name == "" && el.stu_num.indexOf(this.filter.code) >= 0) return true;
                    else if (this.filter.code == "" && el.stu_name.indexOf(this.filter.name) >= 0) return true;
                    else if (this.filter.name == "" && this.filter.code == "") return true;
                    else if (el.stu_num.indexOf(this.filter.code) && el.stu_name.indexOf(this.filter.name)) return true;
                    return false;
                },
                form_list: {
                    district: 0,
                    grade_id: 0,
                    school: ""
                },
                class_id: "",
                headers: [],
                detail: [],
                change_grade: function (value, index) {
                    this.form_list.grade_id = Number(value.value);
                    var ori_class = grade_list[index].class_list;

                    // 获取班级列表
                    var sel_class_ls = any_2_select(ori_class, {name: "class_name", value: ["class_id"]})
                    this.class_list = sel_class_ls;

                    // 修改对应显示信息
                    data_center.scope("term_eva_opt_grade", function (p) {
                        p.head_value = value.name;
                    });

                    this.change_class(this.class_list[0], 0);
                    cloud.class_yfhy_process(vm.form_list.$model, function (url, arg, data) {
                        full_record = data.list;
                        vm.refresh_data();
                    });
                },
                change_class: function (value, index) {
                    data_center.scope("term_eva_opt_class", function (p) {
                        p.head_value = value.name;
                    });
                    this.class_id = value.value;
                    this.refresh_data();
                },

                refresh_data:function () {
                  full_record.forEach(function (value) {
                        if(value.class_id == vm.class_id){
                            calc_ext([value], [
                                ["all_cnt", "{tch_cnt} + {stu_cnt} + {par_cnt}"],
                                ["all_login", "{tch_login} + {stu_login} + {par_login}"],
                                ["all_logins", "{tch_logins} + {stu_logins} + {par_logins}"],
                                ["all_visits", "{tch_visits} + {stu_visits} + {par_visits}"],
                            ])
                            vm.detail = value;
                        }
                    });
                },
                grade_list: [],
                class_list: [],
                detail: {
                    "tch_cnt": 0,
                    "tch_class_cnt": 0,
                    "tch_login": 1,
                    "tch_logins": 1,
                    "tch_visits": 0,
                    "stu_cnt": 0,
                    "stu_login": 1,
                    "stu_logins": 6,
                    "stu_visits": 27,
                    "par_cnt": 0,
                    "par_login": 0,
                    "par_logins": 0,
                    "par_visits": 0
                },
                init: function () {
                    setTimeout(function (args) {
                        vm.form_list.school = cloud.user_school({});
                        vm.form_list.district = cloud.user_district({});
                        // -> 不同的身份，获取的班级，年级列表不一样
                        grade_list = cloud.auto_grade_list({});
                        vm.grade_list = any_2_select(grade_list, {name: "grade_name", value: ["grade_id"]});
                        vm.change_grade(vm.grade_list[0], 0);
                    }, 0);
                },

            });

            vm.$watch("onReady", function () {
                vm.init();
            });
            return vm;
        }

        return {
            view: html,
            define: avalon_define
        }
    });
