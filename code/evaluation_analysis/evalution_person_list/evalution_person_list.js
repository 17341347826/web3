define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_analysis', 'evalution_person_list/evalution_person_list', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {

        var avalon_define = function () {
            //获取的年级和班级信息
            var all_grade_list = [];
            var all_class_list = [];
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
                now_grade_name:'',
                now_class_name:'',
                init: function () {
                    all_grade_list = cloud.grade_list();
                    this.grade_list = any_2_select(all_grade_list, {name: "grade_name", value: ["grade_id"]});
                    this.now_grade_name = this.grade_list[0].name;
                    all_class_list = all_grade_list[0].class_list;
                    this.class_list = any_2_select(all_class_list, {name: "class_name", value: ["class_id"]});
                    this.now_class_id = this.class_list[0].value;
                    this.now_class_name = this.class_list[0].name;
                    this.student_list = cloud.class_members({fk_class_id: this.now_class_id});
                },
                grade_change: function (el, index) {
                    all_class_list = all_grade_list[index].class_list;
                    this.now_grade_name = this.grade_list[index].name;
                    this.class_list = any_2_select(all_class_list, {name: "class_name", value: ["class_id"]});
                    this.now_class_id = this.class_list[0].value;
                    this.now_class_name = this.class_list[0].name;
                    this.student_list = cloud.class_members({fk_class_id: this.now_class_id});
                },
                class_change:function (el,index) {
                    this.now_class_id = this.class_list[index].value;
                    this.now_class_name = this.class_list[index].name;
                    this.student_list = cloud.class_members({fk_class_id: this.now_class_id});
                },
                detail:function (el) {
                    data_center.set_key('analysis_stu',JSON.stringify(el));
                    window.location = "#analysis";
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
