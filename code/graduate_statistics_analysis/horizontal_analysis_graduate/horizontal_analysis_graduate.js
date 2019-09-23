define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('graduate_statistics_analysis', 'horizontal_analysis_graduate/horizontal_analysis_graduate', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {
        var msg_api = api.api + "GrowthRecordBag/graduation_eval_horizontal_analysis";
        var avalon_define = function () {

            var vm = avalon.define({
                $id: "horizontal_analysis_graduate",
                value: value,
                count: count,
                is_init_sel: true,
                area_list: [],
                user:{},
                grade_list: [],
                school_list: [],
                fk_grade_id:'',
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
                    grade_ids: [],//年级
                    district_name: "",//区县
                    fk_school_id: "",//学校
                    school_name: '',//学校名称
                    fk_class_id:''//班级id
                },
                user_level: '',
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value;
                    this.extend.fk_semester_id = this.semester.split('|')[0];
                    ajax_post(msg_api, this.extend.$model, this);
                },
                to_page:function (url) {
                    window.location.href = '#'+url;
                },
                sel_change_grade: function (el) {
                    this.city_p.grade_ids = [];
                    this.area_p.grade_ids = [];
                    this.school_p.grade_ids = [];
                    if(el.value!=''){
                        this.city_p.grade_ids.push(el.value)
                        this.area_p.grade_ids.push(el.value)
                        this.school_p.grade_ids.push(el.value)
                    }

                    this.deal_data(this.filter_city(this.city_process_list), 'city', 'tubiao_5');
                    this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                    this.deal_data(this.school_process_list, 'school', 'tubiao_3')
                },
                sel_change_area:function (el) {
                    if (el.value == '') {
                        this.area_p.district_name = ''
                    } else {
                        this.area_p.district_name = el.name;
                    }
                    this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                },
                sel_change_area_2: function (el) {
                    this.school_p.school_name = '';
                    if (el.value == '') {
                        this.school_p.district_name = ''
                    } else {
                        this.school_p.district_name = el.name;
                    }
                    this.search();
                },

                //市 渲染数据
                city_process_list: [],
                //区 渲染数据
                area_process_list: [],
                //县 渲染数据
                school_process_list: [],
                class_process_list:[],
                grade_name:'',
                //初始数据
                init: function () {
                    if (this.grade_list.length > 0) {//默认查询所有年级
                        var arr = new Array()
                        for (idx in this.grade_list) {
                            if (this.grade_list[idx].value == "")continue;
                            arr.push(Number(this.grade_list[idx].value));
                        }
                        this.grade_all = arr;
                    }
                    this.get_data();
                },
                search: function () {
                    // this.school_process_list = this.filter_old_school(this.old_school_process_list)
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')
                },
                search_class:function () {
                    this.class_process_list = this.filter_old_class(this.old_class_process_list)
                    this.deal_data(this.filter_old_class(this.class_process_list), 'class', 'tubiao_4')
                },
                //初始前期数据
                init_data: function () {
                    this.user = cloud.user_user();
                    this.grade_list = cloud.grade_list_graduation();
                    this.grade_list.unshift({
                        name:'全部',
                        value:''
                    })
                    // this.fk_grade_id = this.grade_list[0].value;
                    // this.grade_name = this.grade_list[0].name;
                    this.area_list = cloud.sel_area_list();
                    this.user_level = cloud.user_level();
                },
                //页面数据过滤
                filter_city: make_filter(function (line) {
                    if (
                        vm.city_p.grade_ids.indexOf("" + line.detail.fk_grade_id) >= 0 || vm.city_p.grade_ids.length == 0
                    )
                        return true;
                    return false;
                }),
                filter_area: make_filter(function (line) {
                    if (
                        (vm.area_p.grade_ids.indexOf("" + line.detail.fk_grade_id) >= 0 || vm.area_p.grade_ids.length == 0)
                        &&
                        (line.district_name == vm.area_p.district_name || vm.area_p.district_name == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_school: make_filter(function (line) {
                    if (
                        (vm.school_p.grade_ids.indexOf("" + line.detail.fk_grade_id) >= 0 || vm.school_p.grade_ids.length == 0)
                        &&
                        (line.school_name.indexOf(vm.school_p.school_name) >= 0 || vm.school_p.school_name == "")

                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_old_school: make_filter(function (line) {
                    if (
                        (vm.school_p.grade_ids.indexOf("" + line.fk_grade_id) >= 0 || vm.school_p.grade_ids.length == 0)
                        &&
                        (line.district_name == vm.school_p.district_name || vm.school_p.district_name == "")
                        &&
                        (line.school_name.indexOf(vm.school_p.fk_school_id) >= 0 || vm.school_p.fk_school_id == "")
                        &&
                        (line.school_name.indexOf(vm.school_p.school_name) >= 0)
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_old_class:make_filter(function (line) {
                    if (
                        (vm.school_p.grade_ids.indexOf("" + line.fk_grade_id) >= 0 || vm.school_p.grade_ids.length == 0)
                        &&
                        (line.district_name == vm.school_p.district_name || vm.school_p.district_name == "")
                        &&
                        (line.school_name.indexOf(vm.school_p.fk_school_id) >= 0 || vm.school_p.fk_school_id == "")
                        &&
                        (line.school_name.indexOf(vm.school_p.school_name) >= 0)
                    ) {
                        return true;
                    }
                    return false;
                }),

                filter_class: make_filter(function (line) {
                    if (
                        (vm.school_p.grade_ids.indexOf("" + line.fk_grade_id) >= 0 || vm.school_p.grade_ids.length == 0)
                        &&
                        (line.district_name == vm.school_p.district_name || vm.school_p.district_name == "")
                        &&
                        (line.school_name.indexOf(vm.school_p.fk_school_id) >= 0 || vm.school_p.fk_school_id == "")
                        &&
                        (line.fk_class_id.indexOf(vm.school_p.fk_class_id) >= 0)
                    ) {
                        return true;
                    }
                    return false;
                }),
                row_length: 0,
                //获取市进度数据
                get_data: function () {
                    ajax_post(msg_api, {sta_type:1}, this);
                },

                old_school_process_list: [],
                old_class_process_list:[],
                deal_data: function (data, type, div_id) {
                    var legend_arr = [];
                    var y_axis = [];
                    var obj = {};
                    for(var i=0;i<data.length;i++){
                        var sub_list = data[i].detail.sub_list;
                        for(var k=0;k<sub_list.length;k++){
                            var rank = sub_list[k].djmc;
                            if(legend_arr.indexOf(rank)==-1){
                                legend_arr.push(rank)
                            }
                            if(!obj.hasOwnProperty(rank)){
                                obj[rank] = [];
                            }
                            obj[rank].push(sub_list[k].rszb);
                        }
                        var y_name = '';
                        if(type=='city'){
                            y_name = data[i].city_name;
                        }
                        if(type=='district'){
                            y_name = data[i].district_name;
                        }
                        if(type=='school'){
                            y_name = data[i].school_name;
                        }
                        if(type=='class'){
                            y_name = data[i].status+data[i].class_name;
                        }
                        y_axis.push(y_name)
                    }
                    var series_arr = [];
                    for(var i=0;i<legend_arr.length;i++){
                        var key = legend_arr[i];
                        obj[key].reverse();
                        var series_obj = {
                            name: key,
                            type: 'bar',
                            stack: '总量',
                            data: obj[key]
                        }
                        series_arr.push(series_obj);
                    }
                   y_axis.reverse();
                    var new_obj = {
                        "legend_arr":legend_arr,
                        "y_axis":y_axis,
                        "series_arr":series_arr,
                        "div":div_id
                    }
                    var default_hegith = undefined;
                    if(type=='city'|| data.length==1)
                        default_hegith = 130;
                    this.draw_img(new_obj,default_hegith);
                },
                draw_img:function (obj,default_height) {
                    var line_height = 44;
                    var height = obj.series_arr[0].data.length*line_height+38+'px';
                    var tubiao = document.getElementById(obj.div);

                    if(default_height){
                        tubiao.style.height = default_height+'px';
                    }else {
                        tubiao.style.height = height;
                    }
                    var myChart = echarts.init(document.getElementById(obj.div));
                    myChart.clear();
                    var option = {
                        color: ['#efa35a','#8fee7d','#7bb6ed', '#059fd6','red','green'],
                        tooltip : {
                            trigger: 'axis',
                            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                            }
                        },
                        legend: {
                            data: obj.legend_arr
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis:  {
                            type: 'value',
                            show:false
                        },
                        yAxis: {
                            type: 'category',
                            data: obj.y_axis
                        },
                        series:obj.series_arr
                    };
                    myChart.setOption(option);
                    myChart.resize();
                },
                search_by_school_id: function () {
                    this.school_p.fk_school_id = $("#func_list").val();
                    this.get_school_tbale_list();
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
                get_grade_name: function (arr) {
                    var city_length = arr.length;
                    var grade_list_length = this.grade_list.length;
                    for (var i = 0; i < city_length; i++) {
                        var grade_id = arr[i].grade_id;
                        arr[i].wwc = Number(arr[i].wwc).toFixed(2);
                        arr[i].jh = Number(arr[i].jh).toFixed(2);
                        arr[i].yb = Number(arr[i].yb).toFixed(2);
                        arr[i].pjdf = Number(arr[i].pjdf).toFixed(2);
                        for (var j = 0; j < grade_list_length; j++) {
                            if (grade_id == this.grade_list[j].value) {
                                arr[i].grade_name = this.grade_list[j].name;
                                break;
                            }
                        }
                    }
                    return arr;
                },
                deal_sub_list:function (cnt) {
                    var class_cnt = cnt
                    var arr = []
                    for(var i=0;i<class_cnt.length;i++){
                        for(var j=0;j<class_cnt[i].sub_list.length;j++){
                            sort_by(class_cnt[i].sub_list,['+djmc'])
                            var djmc = class_cnt[i].sub_list[j].djmc;
                            if(arr.indexOf(djmc)==-1){
                                arr.push(djmc);
                            }
                        }
                        for(var g=0;g<this.grade_list.length;g++){
                            if(this.grade_list[g].value==class_cnt[i].fk_grade_id){
                                class_cnt[i].grade_name = this.grade_list[g].name;
                                break;
                            }
                        }
                    }
                    for(var i=0;i<class_cnt.length;i++){
                        if(class_cnt[i].sub_list.length<arr.length){
                            var sub_list = class_cnt[i].sub_list;
                            for(var k=0;k<arr.length;k++){
                                var key = arr[k];
                                var obj = {
                                    djmc:key,
                                    djrs:0,
                                    rszb:0
                                }
                                if(!sub_list[k] || sub_list[k].djmc!=key){
                                    class_cnt[i].sub_list.splice(k,0,obj)
                                }
                            }
                        }
                    }

                    return class_cnt;
                },
                //处理获取的页面数据
                deal_msg: function (data) {
                    if (!data.data)
                        return;
                    this.area_process_list = [];
                    if(data.data.city_cnt&&data.data.city_cnt.length>0){
                        var city_cnt = this.deal_sub_list(data.data.city_cnt)

                        var arr = [];
                        for(var i=0;i<city_cnt.length;i++){
                            if(arr.indexOf(city_cnt[i].grade_name)==-1){
                                arr.push(city_cnt[i].grade_name)
                            }
                        }
                        var new_cnt = complate_data(city_cnt,['city_name'],'grade_name',arr,0);

                        this.city_process_list = new_cnt;
                        if (this.user_level < 4)
                            this.deal_data(this.filter_city(this.city_process_list), 'city', 'tubiao_5');
                    }


                    if (data.data.district_cnt&&data.data.district_cnt.length>0) {
                        var district_cnt = this.deal_sub_list(data.data.district_cnt)
                        var arr = [];
                        for(var i=0;i<district_cnt.length;i++){
                            if(arr.indexOf(district_cnt[i].grade_name)==-1){
                                arr.push(district_cnt[i].grade_name)
                            }
                        }
                        var new_cnt = complate_data(district_cnt,['district_name'],'grade_name',arr,0);

                        this.area_process_list = new_cnt;
                        if (this.user_level < 4)
                            this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                    }
                    this.school_process_list = [];
                    if (data.data.school_cnt&&data.data.school_cnt.length>0) {
                        var school_cnt = this.deal_sub_list(data.data.school_cnt)

                        var arr = [];
                        for(var i=0;i<school_cnt.length;i++){
                            if(arr.indexOf(school_cnt[i].grade_name)==-1){
                                arr.push(school_cnt[i].grade_name)
                            }
                        }
                        var new_cnt = complate_data(school_cnt,['fk_school_id','school_name'],'grade_name',arr,0);
                        this.school_process_list = new_cnt;
                        this.old_school_process_list = new_cnt;
                        this.deal_data(this.school_process_list, 'school', 'tubiao_3')
                    }
                    this.class_process_list = [];
                    if(data.data.class_cnt&&data.data.class_cnt.length>0){

                        var class_cnt = this.deal_sub_list(data.data.class_cnt)

                        this.class_process_list = class_cnt;
                        this.old_class_process_list = class_cnt;
                        this.deal_data(this.class_process_list, 'class', 'tubiao_4')
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
