/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('character_evaluation_result/result_check', 'result_check_list/result_check_list', 'html!'),
        C.Co('character_evaluation_result/result_generation', 'result_list/result_list', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly"),
        'echarts'
    ],
    function ($, avalon, layer, html, css, data_center, three_menu_module, select_assembly, echarts) {
        var avalon_define = function () {
            //特色报告结果数据数据
            var api_get_data = api.api + "score/page_final_data";
            //特色报告统计项目列表
            var report_list_api = api.api + "score/list_feature_project";
            //获取等级列表数据
            var rank_count_api = api.api + "score/feature_count_abcd";

            //获取等级列表
            var rank_list_api = api.api+"score/feature_project_lv";
            var all_grade = [];
            var all_project = [];
            var vm = avalon.define({
                $id: "result_check_list",

                remember: false,
                extend: {
                    project_id: '',
                    class_id: '',
                    lv: '',
                    offset: 0,
                    rows: 15
                },
                fk_grade_id: '',
                fk_semester_id: '',
                fk_grade_name: '',

                //年级，班级，学年学期，项目列表
                grade_list: [],
                semester_list: [],
                class_list: [],
                project_list: [],
                //等级列表
                rank_list: [],
                //当前学年学期
                current_semester: '',
                semester_defalut: '',
                //等级表格数据
                rank_table: [],
                //结果数据
                result_data: [],
                //默认醒目
                project_default: '',
                //当前项目序号
                current_project_index:0,
                //分页

                /*总页数*/
                totalPage: "",
                // 计算分页数组
                totalPageArr: [],
                /*当前是第几页*/
                currentPage: 1,
                //跳转页码
                pageNo: "",
                //获取总页数+当前显示分页数组
                set_total_page:function(count){
                    this.totalPage = 0;
                    if(count==0){
                        this.totalPageArr=new Array(this.totalPage);
                    }else{
                        //向上取证
                        this.totalPage=Math.ceil(count/this.extend.rows);
                        this.get_page_ary(this.currentPage,this.totalPage);
                    }
                },
                //计算分页数组(前提count>0)
                get_page_ary:function(c_page,t_page){//当前页数，总页数
                    this.totalPageArr=[];
                    var p_ary=[];
                    if(t_page<=5){//总页数小于5
                        for(var i=0;i<t_page;i++){
                            p_ary[i]=i+1;
                        }
                    }else if(c_page==0 && t_page>5){
                        for(var i=0;i<5;i++){
                            p_ary[i]=i+1;
                        }
                    }else if(c_page+2>=t_page){//
                        var base=t_page-4;
                        for(var i=0;i<5;i++){
                            p_ary[i]=base+i;
                        }
                    }else{//c_page+2<t_page
                        //显示的第一个页数
                        var base=Math.abs(c_page-2)==0 ? 1 : Math.abs(c_page-2);
                        for(var i=0;i<5;i++){
                            p_ary[i]=base+i;
                        }
                    }
                    this.totalPageArr=p_ary;
                    // console.log(this.totalPageArr);
                },
                //当前页面跳转
                currentPageDate:function(num){
                    this.currentPage=num;
                    this.extend.offset=(num-1)*this.extend.rows;
                    //获取数据
                    this.get_data();
                },
                //序号改变
                set_index:function(idx,c_page){
                    var index=idx+(c_page-1)*this.extend.rows;
                    return index;
                },
                //跳转操作
                pageNOSure:function(num){
                    if(num<1){
                        layer.alert('请输入正确的页码', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                    }else if(num>this.totalPage){
                        layer.alert('超出总页数', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                    }else{
                        this.currentPage=Math.ceil(num);
                        this.extend.offset=(this.currentPage-1)*this.extend.rows;
                        //获取数据
                       this.get_data();
                    }
                },

                init: function () {
                    this.grade_list = cloud.grade_all_list();
                    this.fk_grade_id = this.grade_list[0].value;
                    this.fk_grade_name = this.grade_list[0].name;
                    all_grade = cloud.grade_list();
                    this.get_class_list();
                    this.semester_list = cloud.semester_all_list();
                    this.semester_defalut = this.semester_list[0].name;
                    this.fk_semester_id = this.semester_list[0].value.toString();
                    cloud.semester_current({}, function (url, ars, data) {
                        vm.current_semester = data;
                        for (var i = 0; i < vm.semester_list.length; i++) {
                            var id = vm.semester_list[i].value.split('|')[0];
                            if (id == vm.current_semester.id) {
                                vm.semester_defalut = vm.current_semester.semester_name;
                                vm.fk_semester_id = vm.current_semester.id.toString();

                                break;
                            }
                        }
                        vm.get_report_list();
                    });
                },
                get_report_list: function () {
                    ajax_post(report_list_api, {
                        fk_grade_id: this.fk_grade_id,
                        fk_semester_id: this.fk_semester_id,
                        node: 2
                    }, this)
                },
                rank_count: function () {
                    ajax_post(rank_count_api, {
                        project_id: this.extend.project_id,
                        class_id: this.extend.class_id
                    }, this)
                },
                //切换年级
                grade_sel: function (el, index) {
                    this.fk_grade_id = el.value;
                    this.fk_grade_name = el.name;
                    this.get_class_list();
                    this.get_report_list();
                },
                get_class_list: function () {
                    for (var i = 0; i < all_grade.length; i++) {
                        if (this.fk_grade_id == all_grade[i].grade_id) {
                            var class_list = all_grade[i].class_list;
                            if (!class_list || class_list.length == 0)
                                return;
                            this.class_list = any_2_select(class_list, {name: "class_name", value: ["class_id"]});
                            this.class_list.unshift({
                                name: '全部',
                                value: ''
                            });
                            break;
                        }
                    }
                },
                //切换学年学期
                semester_sel: function (el, index) {
                    this.fk_semester_id = el.value.split('|')[0];
                    this.get_report_list();
                },
                //等级列表筛选
                rank_sel: function (el,index) {
                    this.extend.lv = el.value;
                    this.get_data();
                },
                go_create: function () {
                    window.location = '#create_result_generation'
                },
                //选择项目列表
                project_sel: function (el, index) {
                    this.extend.project_id = el.value;
                    this.current_project_index = index;
                    this.get_rank_list()
                    this.get_data();
                    this.rank_count();
                },
                class_sel: function (el, index) {
                    this.extend.class_id = el.value;
                    this.get_data();
                    this.rank_count();
                },
                get_data: function () {
                    ajax_post(api_get_data, this.extend.$model, this)
                },
                get_rank_list:function () {
                  ajax_post(rank_list_api,{project_id:this.extend.project_id},this)
                },
                deal_report: function (data) {
                    this.project_list = [];
                    this.project_default = '';
                    if (!data.data || data.data.length == 0) {
                        toastr.warning('暂无项目');
                        this.rank_list = [];
                        this.result_data = [];
                        this.rank_table = [];
                        return;
                    }
                    all_project = data.data;
                    this.project_list = any_2_select(data.data, {name: "project_name", value: ["_id"]});
                    this.extend.project_id = this.project_list[0].value;
                    this.project_default = this.project_list[0].name;
                    this.get_rank_list();
                    this.get_data();
                    this.rank_count();
                },
                deal_rank: function (data) {
                    this.rank_table = [];
                    if (!data.data || data.data.length == 0)
                        return;
                    var rank_table = data.data;
                    var all_num = 0;
                    for (var i = 0; i < rank_table.length; i++) {
                        if (!rank_table[i].num)
                            rank_table[i].num = 0;
                        all_num += rank_table[i].num;
                    }
                    var rank_name_arr = [];
                    var rank_num_arr = [];
                    for (var j = 0; j < rank_table.length; j++) {
                        rank_table[j].bfb = rank_table[j].num / all_num;
                        rank_name_arr.push(rank_table[j].lv);
                        rank_num_arr.push(rank_table[j].num.toFixed(2))
                    }
                    this.rank_table = rank_table;

                    this.draw_bar(rank_name_arr,rank_num_arr)
                },
                check_detail:function (el) {
                    var export_extend = {};
                    export_extend.token = sessionStorage.getItem('token')
                    export_extend.semester_id = this.fk_semester_id;
                    export_extend.project_id = el.project_id;
                    var semester_list = cloud.semester_list();
                    for(var i=0;i<semester_list.length;i++){
                        if (export_extend.semester_id == semester_list[i].id) {
                            export_extend.phase = semester_list[i].semester_index;
                            break;
                        }
                    }
                    export_extend.start_time = all_project[this.current_project_index].start_date_time.substr(0,10);
                    export_extend.end_time = all_project[this.current_project_index].end_date_time.substr(0,10);
                    export_extend.year = export_extend.start_time.substr(0, 4);
                    export_extend.guid = el.student_guid;
                    export_extend.school_id =el.fk_school_id;
                    export_extend.grade_id = el.grade_id;
                    export_extend.class_id = el.class_id;

                    var num_obj = {
                        '一年级': 1,
                        '二年级': 2,
                        '三年级': 3,
                        '四年级': 4,
                        '五年级': 5,
                        '六年级': 6,
                        '七年级': 7,
                        '八年级': 8,
                        '九年级': 9
                    }
                    for(var i=0;i<all_grade.length;i++){
                        if(this.fk_grade_id==all_grade[i].grade_id){
                            var remark = all_grade[i].remark;
                            export_extend.due_grade = num_obj[remark]
                            break;
                        }
                    }
                    export_extend.district_id = cloud.school_user_distict_id().district_id;

                    var href = "guid=" + export_extend.guid + "&s=" + export_extend.start_time + "&e=" + export_extend.end_time +
                        "&sid=" + el.project_id + "&smsid=" + this.fk_semester_id;
                    data_center.set_key('export_data', JSON.stringify(export_extend))
                    window.location = '#character_evaluation_report?' + href;

                },
                deal_result_data: function (data) {
                    this.result_data = [];
                    this.set_total_page(data.data.count)
                    if (!data.data || !data.data.list || data.data.list.length == 0)
                        return;

                    this.result_data = data.data.list;
                },
                draw_bar: function (rank_name_arr,rank_num_arr) {
                    var myChart = echarts.init(document.getElementById('rank_img'));
                    var option = {
                        color: '#1e88e5',
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow'
                            }
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis: [
                            {
                                type: 'category',
                                data: rank_name_arr,
                                axisTick: {
                                    alignWithLabel: true
                                }
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                max: 100,
                                axisLabel: {
                                    formatter: '{value} %'
                                }
                            }
                        ],
                        series: [
                            {
                                name: '等级分布',
                                type: 'bar',
                                barWidth: '30px',
                                data: rank_num_arr
                            }
                        ]
                    };
                    myChart.clear();
                    myChart.setOption(option);
                    myChart.resize();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case report_list_api:
                                this.deal_report(data);
                                break;
                            case rank_count_api:
                                this.deal_rank(data);
                                break;
                            case api_get_data:
                                this.deal_result_data(data);
                                break;
                            case rank_list_api:
                                if(!data.data){
                                    this.rank_list = [];
                                    return;
                                }
                                var rank_list =[];
                                for(var i=0;i<data.data.length;i++){
                                    var obj = {
                                        name:data.data[i]+'等',
                                        value:data.data[i]
                                    }
                                    rank_list.push(obj);
                                }
                                this.rank_list = rank_list;
                                this.rank_list.unshift({
                                    name:'全部',
                                    value:''
                                })
                                break;

                        }
                    } else {
                        toastr.error(msg);
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
