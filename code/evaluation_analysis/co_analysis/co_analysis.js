define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_analysis', 'co_analysis/co_analysis','html!'),
        C.Co('evaluation_analysis', 'co_analysis/co_analysis','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        "highcharts",
        "echarts",
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer,html,css,data_center,select_assembly,highcharts,echarts,three_menu_module) {

        var avalon_define = function () {

            var vm = avalon.define({
                $id: "co_analysis",
                title:"",
                //学年学期列表
                semester_list: [],
                //年级列表
                grade_list: [],
                //学年学期下拉列表上是否显示初始值
                is_init_sel: true,
                //学年学期下拉列表选择的数据
                semester: '',
                //年级下拉列表选择数据
                current_semester_name:"",
                current_grade_name:"",
                gradeId:'',
                qt_sex_data:[],
                qt_zd_data:[],
                qt_cz_data:[],
                qt_ls_data:[],
                to_page:function (type) {
                    switch (type){
                        case 1:
                            window.location.href = '#co_analysis';
                            break;
                        case 2:
                            window.location.href = '#group_wd?sta_type=2';
                            break;
                        case 3:
                            window.location.href = '#group_ys?sta_type=3';
                            break;
                    }
                },
                // select 选择的条件
                sel_change_semester:function(el){
                    console.log(el)
                    this.semester=el.value
                    this.find_qt_sex_data();
                    this.find_qt_zd_data();
                    this.find_qt_cz_data();
                    this.find_qt_ls_data()
                },
                sel_change_grade: function (el) {
                    this.gradeId = el.value;
                    this.find_qt_sex_data();
                    this.find_qt_zd_data();
                    this.find_qt_cz_data();
                    this.find_qt_ls_data()
                },
                init:function(){
                    if (this.is_init_sel && this.semester_list.length > 0) {
                        this.semester = this.semester_list[0].value;
                        this.current_semester_name = this.semester_list[0].name;
                    }
                    if (this.is_init_sel && this.grade_list.length > 0) {
                        this.gradeId = this.grade_list[0].value;
                        this.current_grade_name = this.grade_list[0].name;
                    }
                    this.find_qt_sex_data();
                    this.find_qt_zd_data();
                    this.find_qt_cz_data();
                    this.find_qt_ls_data()
                },
                init_data:function () {
                    this.semester_list = cloud.semester_all_list();
                    this.grade_list = cloud.grade_all_list();
                    this.title = cloud.user_city();
                },
                //群体性分析男女比较数据
                find_qt_sex_data:function(){
                    var self = this;
                    cloud.qt_analysis_sex({semester:this.semester,gradeId:this.gradeId},function(data){
                        self.qt_sex_data=data;
                        if(data.length==0)
                            return;
                        EA.draw_bar(echarts,'ra1','sex',data);
                    })
                },
                //群体性分析 — 寄宿、走读学生比较
                find_qt_zd_data:function(){
                    var self = this;
                     cloud.qt_analysis_zd({semester:this.semester,gradeId:this.gradeId},function(data){
                        self.qt_zd_data=data;
                        if(data.length==0)
                            return;
                         EA.draw_bar(echarts,'ra2','js',data);
                    })
                },
                find_qt_cz_data:function(){
                    //暂时无接口
                },
                find_qt_ls_data:function(){
                    //展示无接口
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
        view: html,
        define: avalon_define
    }
});