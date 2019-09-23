/**
 * Created by Administrator on 2018/6/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('eval_statistical_analysis', 'index_statistical_integral/index_statistical_integral','html!'),
        C.Co('eval_statistical_analysis', 'index_statistical_integral/index_statistical_integral','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,three_menu_module) {
        //学生列表
        var get_info = api.api + "everyday/everyday_bx_trace";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "index_statistical_integral",
                index_list:[],
                checked_first_index:0,
                user_level:"",
                head_value:{
                    semester:"",
                    grade:"",
                    class:""
                },
                time_type:1,
                grade_list:[],
                sem_list:[],
                class_list:[],
                time_data:{
                    type:"",
                    class_id:"",
                    end_date:"",
                    grade_id:"",
                    start_date:"",
                    school_id:""
                },
                w_m_data:{
                    type:"",
                    fk_class_id:"",
                    fk_grade_id:"",
                    semester_end_date:"",
                    semester_id:"",
                    semester_start_date:"",
                    school_id:""
                },
                timeInfo:[],
                week_or_month_info:[],
                check:function () {
                    this.timeInfo = [];
                    this.week_or_month_info = [];
                    if(this.time_type == 1){//时间段
                        cloud.daily_by_time(vm.time_data.$model,function (url, ars, data) {
                            vm.timeInfo = data;
                        });
                    }else if(this.time_type == 2){//周次
                        cloud.daily_by_week(vm.w_m_data.$model,function (url, ars, data) {
                            vm.re_data(1,data);
                        });
                    }else{
                        cloud.daily_by_month(vm.w_m_data.$model,function (url, ars, data) {
                            vm.re_data(2,data);
                        });
                    }

                },
                re_data:function (num,data) {
                    var data = data;
                    var message = data.message;
                    data.message = message.split(",");
                    for(var i = 0;i < data.message.length; i++){
                        if(num == 1){
                            data.message[i] = '第' + data.message[i] + '周'
                        }else{
                            data.message[i] = data.message[i]+'月'
                        }
                    }
                    var list = data.list;
                    var length = list.length;
                    for(var i = 0; i < length; i++){
                        list[i].df = list[i].df.split(",");
                    }
                    console.log(data);
                    vm.week_or_month_info = data;
                },
                click_first_index:function ($idx,el) {
                    this.checked_first_index = $idx;
                    if(el.index_name == '评价维度'){
                        this.time_data.type = '1';
                        this.w_m_data.type = '1';
                    }else  if(el.index_name == '评价要素'){
                        this.time_data.type = '2';
                        this.w_m_data.type = '2';
                    }else{
                        this.time_data.type = '3';
                        this.w_m_data.type = '3';
                    }
                    this.check();
                },
                init: function () {
                    var school_id = cloud.user_school_id();
                    this.time_data.school_id = school_id;
                    this.w_m_data.school_id = school_id;
                    this.index_list = [
                        {index_name:"评价维度"},{index_name:"评价要素"},{index_name:"关键表现"}
                    ];
                    var login_level = cloud.user_level();
                    this.user_level = login_level;
                    var dataList = cloud.auto_grade_list();
                    var dataLength = dataList.length;
                    for(var i = 0;i<dataLength;i++){
                        dataList[i]['name'] = dataList[i].grade_name;
                        dataList[i]['value'] = dataList[i].grade_id;
                        for(var j = 0;j<dataList[i].class_list.length;j++){
                            dataList[i].class_list[j]['name'] = dataList[i].class_list[j].class_name
                        }
                    }
                    this.grade_list = dataList;
                    this.head_value.grade = this.grade_list[0].name;
                    this.class_list = dataList[0].class_list;
                    if(login_level == 4){
                        this.class_list.unshift({name:"全部",class_id:""});
                    }
                    this.head_value.class = this.class_list[0].name;
                    this.time_data.grade_id = this.grade_list[0].value + "";
                    this.time_data.class_id = this.class_list[0].class_id + "";
                    this.w_m_data.fk_grade_id = this.grade_list[0].value + "";
                    this.w_m_data.fk_class_id = this.class_list[0].class_id + "";
                    this.load_term();

                },
                load_term:function () {
                    var semester = cloud.grade_semester_list({grade_id:this.time_data.grade_id});
                    this.sem_list = any_2_select(semester, {name: "semester_name", value: ["start_date","end_date","id"]});
                    this.head_value.semester = this.sem_list[0].name;
                    var date = this.sem_list[0].value;
                    this.w_m_data.semester_id = date.split("|")[2];
                    var s_date = date.split("|")[0];
                    var e_date = date.split("|")[1];
                    this.time_data.start_date = time_2_str(s_date);
                    this.time_data.end_date = time_2_str(e_date);
                    this.w_m_data.semester_start_date = time_2_str(s_date);
                    this.w_m_data.semester_end_date = time_2_str(e_date);
                    if(this.checked_first_index == 0){
                        this.time_data.type = '1';
                        this.w_m_data.type = '1';
                    }else if(this.checked_first_index == 1){
                        this.time_data.type = '2';
                        this.w_m_data.type = '2';
                    }else{
                        this.time_data.type = '3';
                        this.w_m_data.type = '3';
                    }
                    this.check();
                },
                typeChange:function () {
                    var num = this.time_type;
                    if(num == 1){//按时间段
                        this.now_date();
                        this.check();
                    }else{
                        this.check();
                    }
                },
                getCompleteDate: function () {
                    var datepicker = $("#my-datepicker");
                    datepicker.on("change", function (event) {
                        var old = event.delegateTarget.defaultValue;
                        if(old != vm.time_data.start_date && vm.time_data.end_date > old != ''){
                            vm.time_data.start_date = old;
                            vm.check();
                        }
                    });
                    datepicker.datepicker('open');

                },
                getCompleteDates: function () {
                    var datepicker = $("#my-datepickers");
                    datepicker.on("change", function (event) {
                        var old = event.delegateTarget.defaultValue;
                        if(old != vm.time_data.end_date && vm.time_data.end_date > old != ''){
                            vm.time_data.end_date = old;
                            vm.check();
                        }
                    });
                    datepicker.datepicker('open');

                },
                now_date: function () {
                    //获取当前日期
                    var myDate = new Date();
                    var nowY = myDate.getFullYear();
                    var nowM = myDate.getMonth()+1;
                    var nowD = myDate.getDate();
                    var now_date = nowY+"-"+(nowM<10 ? "0" + nowM : nowM)+"-"+(nowD<10 ? "0"+ nowD : nowD);//当前日期

                    //获取三十天前日期
                    var lw = new Date(myDate - 1000 * 60 * 60 * 24 * 60);//最后一个数字30可改，30天的意思
                    var lastY = lw.getFullYear();
                    var lastM = lw.getMonth()+1;
                    var lastD = lw.getDate();
                    var old_date=lastY+"-"+(lastM<10 ? "0" + lastM : lastM)+"-"+(lastD<10 ? "0"+ lastD : lastD);//三十天之前日期
                    this.time_data.start_date = old_date;
                    this.time_data.end_date = now_date;
                },
                change_grade:function (el) {
                    this.time_data.grade_id = el.value + "";
                    this.w_m_data.fk_grade_id = el.value + "";
                    this.class_list = el.class_list;
                    this.check();
                },
                change_class:function (el) {
                    this.time_data.class_id = el.class_id + "";
                    this.w_m_data.fk_class_id = el.class_id + "";
                    this.check();
                },
                change_sem:function (el) {
                    var value = el.value;
                    this.w_m_data.semester_id = value.split("|")[2];
                    var s_date = value.split("|")[0];
                    var e_date = value.split("|")[1];
                    this.time_data.start_date = time_2_str(s_date);
                    this.time_data.end_date = time_2_str(e_date);
                    this.w_m_data.semester_start_date = time_2_str(s_date);
                    this.w_m_data.semester_end_date = time_2_str(e_date);
                    this.check();
                }
            });
            vm.$watch('onReady', function(){
                vm.now_date();
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define,
            date_input: { startDate: "my-datepicker", endDate: "my-datepickers", type: 1 }
        }
    });