define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_analysis', 'comparative_person_list/comparative_person_list', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {
        avalon.filters.str_static = function (testStr) {
            var tempObj = {};
            testStr = testStr.split(',').sort();
            for (i = 0; i < testStr.length; i++) {
                var charAt = testStr[i];
                if (tempObj[charAt]) {
                    tempObj[charAt]++;
                } else {
                    tempObj[charAt] = 1;
                }
            }
            var str = ''
            for(var key in tempObj){
                str+=tempObj[key]+key+' '
            }
            return str;
        }
        var avalon_define = function () {
            //获取的年级和班级信息
            var all_grade_list = [];
            var all_class_list = [];
            var personal_api = api.api + "GrowthRecordBag/lateral_analysis_bypersonal";
            var vm = avalon.define({
                $id: "d_e_progress",

                //下拉列表呈现的年级和班级
                grade_list: [],
                class_list: [],
                //学生列表
                student_list: [],
                //当前选择的班级id
                now_class_id: '',
                //当前年级和班级名称
                now_grade_name: '',
                now_class_name: '',
                now_grade_id: '',
                init: function () {
                    all_grade_list = cloud.grade_list();
                    this.grade_list = any_2_select(all_grade_list, {name: "grade_name", value: ["grade_id"]});
                    this.now_grade_name = this.grade_list[0].name;
                    this.now_grade_id = this.grade_list[0].value;
                    all_class_list = all_grade_list[0].class_list;
                    this.class_list = any_2_select(all_class_list, {name: "class_name", value: ["class_id"]});
                    this.now_class_id = this.class_list[0].value;
                    this.now_class_name = this.class_list[0].name;
                    this.get_person_msg();
                },
                grade_change: function (el, index) {
                    all_class_list = all_grade_list[index].class_list;
                    this.now_grade_name = this.grade_list[index].name;
                    this.now_grade_id = this.grade_list[index].value;
                    this.class_list = any_2_select(all_class_list, {name: "class_name", value: ["class_id"]});
                    this.now_class_id = this.class_list[0].value;
                    this.now_class_name = this.class_list[0].name;
                    this.get_person_msg();
                },
                class_change: function (el, index) {
                    this.now_class_id = this.class_list[index].value;
                    this.now_class_name = this.class_list[index].name;
                    this.get_person_msg();
                },
                get_person_msg: function () {
                    ajax_post(personal_api, {
                        fk_class_id: this.now_class_id,
                        fk_grade_id: this.now_grade_id
                    }, this)
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case personal_api:
                                this.student_list = data.data;
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg)
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
