define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'total_progress/total_progress', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module"),
        C.CMF("formatUtil.js")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {
        avalon.filters.bai_fen_b = function (el) {
            return Number(el) * 100 + '%'
        };
        //获取总进度
        var api_total_progress = api.api + 'GrowthRecordBag/total_input_progress_2';
        var avalon_define = function () {
            var grade_progress_api = api.api + "GrowthRecordBag/total_input_progress";
            var class_progress_api = api.api+"GrowthRecordBag/class_total_input_progress";
            var upmater_total_api = api.api+"GrowthRecordBag/upmater_total_input_progress_class";
            var vm = avalon.define({
                $id: "daily_perform_progress",
                grade_extend: {
                    end_date: '',
                    fk_class_id: '',
                    fk_grade_id: '',
                    fk_school_id: '',
                    fk_semester_id: '',
                    start_date: ''
                },
                //学年学期列表
                semester_list: [],
                //年级列表
                grade_list: [],
                //学校总进度
                school_progress:[],
                //评价进度汇总
                pj_progress:[],
                //	上传进度会
                zhsj_progress:[],
                //班级总进度
                class_progress:[],
                //上传材料进度
                upmater:[],
                //年级班级
                init: function () {
                    this.get_progress();
                },
                init_data: function () {
                    this.semester_list = cloud.semester_all_list();
                    this.grade_extend.fk_school_id = cloud.user_school_id();
                    this.grade_list = cloud.grade_all_list();
                    this.grade_extend.fk_grade_id = this.grade_list[0].value;
                    this.deal_date(this.semester_list[0]);
                },
                deal_date:function (date) {
                    var arr = date.value.split('|');
                    this.grade_extend.fk_semester_id = Number(arr[0]);
                    this.grade_extend.start_date = time_2_str(arr[1]);
                    this.grade_extend.end_date = time_2_str(arr[2]);
                },
                //选择学年学期
                sel_semester: function (el) {
                    this.grade_extend.fk_semester_id = el.value.split('|')[0];
                    var val = el.value.split('|');
                    this.grade_extend.start_date = time_2_str(val[1]);
                    this.grade_extend.end_date = time_2_str(val[2]);
                    this.get_progress();
                },
                //选择年级
                sel_grade: function (el) {
                    this.grade_extend.fk_grade_id = el.value;
                    this.get_progress();
                },
                //获取学校表格数据
                get_progress: function () {
                    //评价进度汇总
                    this.pj_progress = [];
                    //上传进度汇总
                    this.zhsj_progress = [];
                    //各班级评级进度汇总
                    this.class_progress = [];
                    //各班级上传进度汇总
                    this.upmater = [];
                    layer.load(1, {shade:[0.3,'#121212']});
                    ajax_post(api_total_progress,{
                        // fk_bj_id:'',
                        fk_nj_id:Number(this.grade_extend.fk_grade_id),
                        fk_xq_id:Number(this.grade_extend.fk_semester_id),
                        user_level:cloud.user_level(),
                    },this);
                    // ajax_post(grade_progress_api, this.grade_extend.$model, this);
                    // ajax_post(class_progress_api,this.grade_extend.$model,this);
                    // ajax_post(upmater_total_api,this.grade_extend.$model,this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取总进度
                            case api_total_progress:
                                this.complete_total_progress(data);
                                break;
                            case grade_progress_api:
                                this.deal_progress(data);
                                break;
                            case class_progress_api:
                                this.deal_class_progress(data);
                                break;
                            case upmater_total_api:
                                this.deal_upmater(data);
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                    if(cmd==api_total_progress){
                        layer.closeAll();
                    }
                },
                //总进度
                complete_total_progress:function(data){
                    layer.closeAll();
                    if(!data.data)
                        return;
                    //评价进度汇总
                    this.pj_progress = data.data.pj_progress_gather;
                    //上传进度汇总
                    this.zhsj_progress = data.data.zhsj_progress_gather;
                    //各班级评级进度汇总
                    this.class_progress = data.data.class_pj_progress_gather;
                    //各班级上传进度汇总
                    this.upmater = data.data.class_zhsj_progress_gather;
                },
                //处理学校表格数据
                deal_progress: function (data) {
                    if (!data.data)
                        return;
                    console.dir(data)
                    this.school_progress = data.data;
                },
                deal_class_progress:function (data) {
                    if(!data.data)
                        return;
                    this.class_progress = data.data;
                },
                deal_upmater:function (data) {
                    if(!data.data)
                        return;
                    this.upmater = data.data;
                },
            });
            vm.$watch('onReady', function () {
                require(['/Growth/code/evaluation_supervision/e_s_public.js'], function () {
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