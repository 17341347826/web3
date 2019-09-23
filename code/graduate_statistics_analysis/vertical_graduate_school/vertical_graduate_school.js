define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('graduate_statistics_analysis', 'vertical_graduate_school/vertical_graduate_school', 'html!'),
        C.Co('graduate_statistics_analysis', 'vertical_analysis_graduate/vertical_analysis_graduate', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {
        var msg_api = api.api + "GrowthRecordBag/graduation_eval_longitudinal_analysis";
        var grade_list = []
        var old_data = [];
        var old_wd_cnt = [];
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "vertical_analysis_graduate",
                //当前tab所在位置
                now_tab:-1,
                //当前选择的学校
                now_school_name:'',
                //当前选择的区县
                now_district:'',

                value: value,
                count: count,
                is_init_sel: true,
                area_list: [],
                user: {},
                grade_list: [],
                school_list: [],
                fk_grade_id: '',
                semester: "",//接口参数 学期
                grade_all: [],//接口参数 年级
                //市参数
                city_p: {
                    semester: "",//学期
                    grade_ids: [],//年级
                },
                //区参数
                area_p: {
                    grade_ids: [],//年级
                    district_name: "",//区县
                },
                //学校参数
                school_p: {
                    grade_ids: [],
                    district_name: "",
                    class_name: "",
                    class_ids: ''
                },
                user_level: '',


                //市 渲染数据
                city_process_list: [],
                wd_cnt:[],
                //区 渲染数据
                area_process_list: [],
                //县 渲染数据
                school_process_list: [],
                class_process_list: [],
                grade_name: '',
                class_list:[],

                //初始数据
                init: function () {
                    var depart_id = cloud.user_depart_id()
                    this.get_data(depart_id);
                },
                search: function () {
                    this.school_process_list = this.filter_old_school(this.old_school_process_list)
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')
                },
                search_class: function () {
                    this.class_process_list = this.filter_old_class(this.old_class_process_list)
                    this.deal_data(this.filter_old_class(this.class_process_list), 'class', 'tubiao_4')
                },

                //初始前期数据
                init_data: function () {
                    this.user = cloud.user_user();
                    this.user_level = cloud.user_level();
                    grade_list = cloud.grade_list();
                    this.grade_list = any_2_select(grade_list, {name: "grade_name", value: ["grade_id"]});
                },
                grade_change:function (el,index) {
                    var class_list = grade_list[index].class_list;
                    this.class_list = any_2_select(class_list, {name: "class_name", value: ["class_id"]});
                    var arr = new Array();
                    if (el.value == '') {
                        this.area_p.grade_ids = arr;
                    } else {
                        arr.push(el.value);
                        this.area_p.grade_ids = arr;
                    }
                    this.wd_cnt = this.filter_area(old_wd_cnt);
                    this.deal_data(this.filter_area(this.area_process_list),'bar_img')
                },
                class_change:function (el,index) {
                    var arr = new Array();
                    if (el.value == '') {
                        this.school_p.class_ids = arr;
                    } else {
                        arr.push(el.value);
                        this.school_p.class_ids = arr;
                    }
                    this.area_process_list = this.filter_class(old_data);
                    this.wd_cnt = this.filter_class(old_wd_cnt);
                    this.deal_data(this.area_process_list,'bar_img')
                },
                filter_area: make_filter(function (line) {
                    if (
                        (vm.area_p.grade_ids.indexOf("" + line.fk_grade_id) >= 0 || vm.area_p.grade_ids.length == 0)
                        &&
                        (line.district_name == vm.area_p.district_name || vm.area_p.district_name == "")
                    ) {
                        return true;
                    }
                    return false;
                }),

                filter_class: make_filter(function (line) {
                    if (
                        (vm.area_p.grade_ids.indexOf("" + line.fk_grade_id) >= 0 || vm.area_p.grade_ids.length == 0)
                        &&
                        (line.district_name == vm.area_p.district_name || vm.area_p.district_name == "")
                        &&
                        (vm.school_p.class_ids.indexOf("" + line.fk_class_id) >= 0 || vm.school_p.class_ids.length == 0)
                        &&
                        (line.class_name == vm.school_p.class_name || vm.school_p.class_name == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                row_length: 0,
                //获取市进度数据

                get_data: function (depart_id) {
                    ajax_post(msg_api, {fk_school_id: depart_id}, this);
                },

                old_school_process_list: [],
                old_class_process_list: [],
                deal_data: function (data,div_id) {
                    var legend_arr = [];
                    var rank_arr = [];
                    var obj = {};
                    var series_arr = [];
                    for(var i=0;i<data.length;i++){
                        var grade_name = data[i].grade_name;
                        // var class_name = data[i].class_name;
                        var count = grade_name+'人数'
                        if(legend_arr.indexOf(count)==-1){
                            legend_arr.push(count)
                        }
                        var rank = grade_name+'比例'
                        if(legend_arr.indexOf(rank)==-1){
                            legend_arr.push(rank)
                        }
                        if(!obj.hasOwnProperty(count)){
                            obj[count] = [];
                        }
                        if(!obj.hasOwnProperty(rank)){
                            obj[rank] = [];
                        }
                        for(var k=0;k<data[i].sub_list.length;k++){
                            if(rank_arr.indexOf(data[i].sub_list[k].djmc)==-1){
                                rank_arr.push(data[i].sub_list[k].djmc)
                            }
                            obj[count].push(data[i].sub_list[k].djrs);
                            obj[rank].push(data[i].sub_list[k].rszb);
                        }

                    }
                    for(var m=0;m<legend_arr.length;m++){
                        var series_obj = {
                            name:legend_arr[m],
                            type:'bar',
                            data:obj[legend_arr[m]],
                            barWidth : 30,
                        }
                        if(legend_arr[m].substr(legend_arr[m].length-2)=='比例'){
                            series_obj.type = 'line';
                            series_obj.yAxisIndex = 1;
                        }
                        series_arr.push(series_obj);

                    }

                    var new_obj = {
                        "legend_arr":legend_arr,
                        "rank_arr":rank_arr,
                        "series_arr":series_arr,
                        "div":div_id
                    }
                    this.draw_img(new_obj)
                },
                draw_img: function (obj) {
                    var myChart = echarts.init(document.getElementById(obj.div));
                    myChart.clear();
                    var option = {
                        color: ['#efa35a','#8fee7d','#7bb6ed', '#059fd6','red','green'],
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'cross',
                                crossStyle: {
                                    color: '#999'
                                }
                            }
                        },

                        legend: {
                            data:obj.legend_arr
                        },

                        xAxis: [
                            {
                                type: 'category',
                                data: obj.rank_arr,
                                axisPointer: {
                                    type: 'shadow'
                                }
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                name: '人数',
                                min: 0,
                                interval: 2000,
                                axisLabel: {
                                    formatter: '{value} 人'
                                }
                            },
                            {
                                type: 'value',
                                name: '比例',
                                min: 0,
                                interval: 20,
                                axisLabel: {
                                    formatter: '{value} %'
                                }
                            }
                        ],
                        series: obj.series_arr
                    };

                    myChart.setOption(option);
                    myChart.resize();
                },

                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取方案内容
                            case msg_api:
                                this.deal_msg(data)
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },


                //处理获取的页面数据
                deal_msg: function (data) {

                    if (!data.data)
                        return;
                    this.area_process_list = [];
                    if (data.data.zhdj_cnt) {
                        var zhdj_cnt = data.data.zhdj_cnt;
                        var zhdj_cnt_length = zhdj_cnt.length;
                        //获取所有等级
                        var djmc_arr = [];
                        for (var i = 0; i < zhdj_cnt_length; i++) {
                            var sub_list = zhdj_cnt[i].sub_list;
                            var sub_list_length = sub_list.length;
                            for (var j = 0; j < sub_list_length; j++) {
                                if (djmc_arr.indexOf(sub_list[j].djmc) == -1) {
                                    djmc_arr.push(sub_list[j].djmc)
                                }
                            }
                        }
                        djmc_arr = djmc_arr.sort()
                        //判断所有数据中时候都有着几个等级，如果没有，这个等级数据为0
                        for (var m = 0; m < zhdj_cnt_length; m++) {
                            var new_sub_list = zhdj_cnt[m].sub_list;
                            var new_sub_list_length = new_sub_list.length;
                            if(new_sub_list_length==djmc_arr.length){
                                continue;
                            }
                            var arr = [];
                            for(var n=0;n<new_sub_list_length;n++){
                                arr.push(new_sub_list[n].djmc)
                            }
                            for(var dj = 0;dj<djmc_arr.length;dj++){
                                if(arr.indexOf(djmc_arr[dj])==-1){
                                    var obj = {
                                        djmc: djmc_arr[dj],
                                        djrs: 0,
                                        rszb: 0
                                    }
                                    data.data.zhdj_cnt[m].sub_list.splice(dj,0,obj);
                                }
                            }
                        }



                        this.area_process_list = data.data.zhdj_cnt;
                        old_data = data.data.zhdj_cnt;
                        this.deal_data(data.data.zhdj_cnt,'bar_img');
                    }
                    if(data.data.wd_cnt){
                        var wd_cnt = data.data.wd_cnt;
                        var wd_cnt_length = wd_cnt.length;
                        var zb_mc_arr = [];
                        for(var i=0;i<wd_cnt_length;i++){
                            var wd_sub_list = wd_cnt[i].sub_list;
                            var wd_sub_length  = wd_sub_list.length;
                            for(var k=0;k<wd_sub_length;k++){
                                var zb_mc = wd_sub_list[k].zb_mc;
                                if(zb_mc_arr.indexOf(zb_mc)==-1){
                                    zb_mc_arr.push(zb_mc)
                                }
                            }
                        }
                        for (var m = 0; m < wd_cnt_length; m++) {
                            var new_wd_sub_list = wd_cnt[m].sub_list;
                            var new_wd_sub_list_length = new_wd_sub_list.length;
                            if(new_wd_sub_list_length==zb_mc_arr.length){
                                continue;
                            }
                            var new_arr = [];
                            for(var n=0;n<new_wd_sub_list_length;n++){
                                new_arr.push(new_wd_sub_list[n].zb_mc)
                            }
                            for(var zb = 0;zb<zb_mc_arr.length;zb++){
                                if(new_arr.indexOf(zb_mc_arr[zb])==-1){
                                    var obj = {
                                        zb_mc: zb_mc_arr[zb],
                                        zb_pjf: 0
                                    }
                                    data.data.wd_cnt[m].sub_list.splice(zb,0,obj);
                                }
                            }
                        }
                        old_wd_cnt = data.data.wd_cnt;
                        this.wd_cnt = data.data.wd_cnt;
                    }
                }

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
