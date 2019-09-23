define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_analysis', 'region_analysis/region_analysis', 'html!'),
        C.Co('evaluation_analysis', 'region_analysis/region_analysis', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        "highcharts",
        "echarts",
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, highcharts, echarts,three_menu_module) {

        var avalon_define = function () {

            var vm = avalon.define({
                $id: "region_analysis",
                //学年学期列表
                semester_list: [],
                //年级列表
                grade_list: [],
                //学年学期下拉列表上是否显示初始值
                is_init_sel: true,
                city: "",
                grade_name: "",
                semester_name: "",
                //学年学期下拉列表选择的数据
                semester: '',
                //年级下拉列表选择数据
                gradeId: '',
                qy_hd_data: [],
                qy_zhpj_data: [],
                to_page:function (type) {
                    switch (type){
                        case 1:
                            window.location.href = '#co_analysis';
                            break;
                        case 2:
                            window.location.href = '#region_analysis_wd?sta_type=2';
                            break;
                        case 3:
                            window.location.href = '#region_analysis_wd?sta_type=3';
                            break;
                    }
                },
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value
                    this.semester_name = el.name
                    this.find_qy_hd_data()
                    this.find_qy_zhpj_data()
                },
                sel_change_grade: function (el) {
                    this.gradeId = el.value
                    this.grade_name = el.name;
                    this.find_qy_hd_data()
                    this.find_qy_zhpj_data()
                },
                init: function () {
                    if (this.is_init_sel && this.semester_list.length > 0) {
                        this.semester = this.semester_list[0].value;
                        this.semester_name = this.semester_list[0].name;
                    }
                    if (this.is_init_sel && this.grade_list.length > 0) {
                        this.gradeId = this.grade_list[0].value;
                        this.grade_name = this.grade_list[0].name;
                    }
                    this.find_qy_hd_data()
                    this.find_qy_zhpj_data()
                },
                init_data: function () {
                    this.city = D("user.user.city")
                    this.semester_list = cloud.semester_all_list();
                    this.grade_list = cloud.grade_all_list();
                },

                find_qy_hd_data: function () {
                    var self = this;
                    cloud.qy_analysis_hd({semester: this.semester, gradeId: this.gradeId}, function (data) {
                        self.qy_hd_data = data;
                        if(data.length==0)
                            return;
                        if(!data[0].qysx){
                            toastr.warning('请设置区域')
                            return;
                        }
                        EA.draw_line(echarts,'ra2','pj',data)
                    })
                },
                find_qy_zhpj_data: function () {
                    var self = this
                    cloud.qy_analysis_zhpj({semester: this.semester, gradeId: this.gradeId}, function (data) {
                        self.qy_zhpj_data = data;
                        if(data.length==0)
                            return;
                        EA.draw_bar(echarts,'ra1','pj',data);
                    })
                },

            });
            vm.$watch('onReady', function () {
                require(['/Growth/code/evaluation_analysis/e_a_charts.js'], function () {
                    vm.init();
                })
            });
            vm.init_data();
            return vm;
        };
        return {
            repaint:true,
            view: html,
            define: avalon_define
        }
    });