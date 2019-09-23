/**
 * Created by Administrator on 2018/8/9.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("practice_management", "activity_statistics/activity_statistics", "css!"),
        C.Co("practice_management", "activity_statistics/activity_statistics", "html!"),
        C.CMF("data_center.js"),
        "layer",
        C.CM("three_menu_module"),"highcharts","highcharts-zh_CN"
    ],
    function ($, avalon, css, html, data_center,layer, three_menu_module,highcharts,zh_CN) {
        //年级列表
        var api_grade_list = api.user + "grade/findGrades.action";
        //获取学年学期集合--年级为全部
        var api_sem_list = api.user + "semester/used_list.action";
        //获取年级可操作学年学期--选了年级
        var api_grade_sem = api.user + 'semester/grade_opt_semester';
        //获取区县集合
        var api_area_list = api.user + 'school/arealist.action';
        //获取学校集合
        var api_school_list = api.user + 'school/schoolList.action';
        //活动统计-年级学年学期改变调用
        var api_activity_list = api.api+'GrowthRecordBag/student_activity';
        var avalon_define = function () {
            var table = avalon.define({
                $id: "activity_statistics",
                //区县改变:0-没有变化；1-区县表的改变；2-学校表的改变
                area_type:0,
                // //区县身份第一次进入:true-是，false-不是
                // area_ident:true,
                //当前身份等级：1：省级；2：市州级；3：区县级；4：校级；5：年级
                highest_level:"",
                //年级
                grade_list:[],
                grade_info:'',
                //学年学期
                sem_list:[],
                sem_info:'',
                //区县
                area_list:[],
                area_info:'',
                school_area_info:'',
                //学校
                school_list:[],
                school_info:'',
                //highchar图高度
                city_height:'',
                area_height:'',
                school_height:'',
                //活动统计返回数据
                activity_city:[],
                activity_area:[],
                activity_school:[],
                //活动统计参数
                extend:{
                    //市（必要的）	string
                    city:'',
                    //区县	string
                    district:'',
                    //学期id（必要的）	number
                    fk_xq_id:'',
                    //学校id	number
                    fk_xx_id:'',
                },
                //highcharts图数据
                city_xAxis:[],//市x轴
                city_series:[],//市数据
                area_xAxis:[],//区县x轴
                area_series:[],//区县数据
                school_xAxis:[],//学校x轴
                school_series:[],//学校数据
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        //当前身份等级：1：省级；2：市州级；3：区县级；4：校级；5：年级
                        self.highest_level = data.data.highest_level;
                        var highest_level = data.data.highest_level;
                        var user = JSON.parse(data.data.user);
                        self.extend.city = user.city;
                        //年级
                        ajax_post(api_grade_list,{status:1},self);
                        if(highest_level == '2'){//市
                            ajax_post(api_area_list,{city: self.extend.city},self)
                        }else if(highest_level == '3'){//区县
                            self.extend.district = user.district;
                             //学校
                            ajax_post(api_school_list,{district:self.extend.district},self);
                        }else if(highest_level == '4'){//校
                            self.extend.district = user.district;
                            self.extend.fk_xx_id = user.fk_school_id;
                        }
                    });
                },
                //返回数据重组：将相同的名称放在一起：比如学校表数据将相同的学校名称放在一起
                data_reorganization:function(ary,name){
                    var num = 0;
                    for(var i=num;i<ary.length;i++){
                        var f_name = ary[i][name];
                        if(num+2>ary.length)
                            break;
                        for(var j=num+2;j<ary.length;j++){
                            var obj = {};
                            var s_name = ary[j][name];
                            if(f_name == s_name){
                                //交换对象位置
                                obj = ary[j];
                                //删除原来的位置
                                ary.splice(j, 1);
                                //添加到新的位置
                                ary.splice(i+1,0,obj);
                            }
                        }
                        num++;
                    }
                    // console.log(ary);
                    return ary;
                },
                //table表合并行
                get_rowspan:function(idx,value,ary,name){
                    var count = 0;
                    //判断当前的值是否与前一个值想等，相等就不用在计算了
                    if(idx>0){
                        if(value == ary[idx-1][name])
                            return count;
                    }
                    for(var i=idx;i<ary.length;i++){
                        var a_value = ary[i][name];
                        if(value == a_value){
                            count++;
                        }
                    }
                    // console.log(count);
                    return count;
                },
                //计算百分比
                percentage_num:function(a,b){
                    //保留两位小数
                    return Math.round(a / b * 10000) / 100.00 + "%";
                    //保留一位小数
                    // return Math.round(a / b * 1000) / 10.00 + "%";
                },
                //年级改变数据重组
                deal_data:function(ary,ary_name,name){//ary-数组，ary_name-与name去判断相等的，name-筛选条件
                    var new_ary = [];
                    for(var i=0;i<ary.length;i++){
                        var a_name = ary[i][ary_name];
                        if(name == a_name){
                            new_ary.push(ary[i]);
                        }
                    }
                    return new_ary;
                },
                //年级改变
                grade_change:function(){
                    if(this.highest_level == 2){//市
                        this.extend.district = '';
                        this.area_info = '';
                        this.school_area_info = '';
                    }
                    if(this.highest_level == 2 || this.highest_level == 3){//市、区县
                        this.extend.fk_xx_id = '';
                    }
                    this.extend.fk_xq_id = '';
                    if(this.grade_info == ''){
                        //全部年级的学年学期
                        ajax_post(api_sem_list,{status:1},this);
                        return;
                    }
                    var id = this.grade_info.split('|')[0];
                    //指定年级的学年学期
                    ajax_post(api_grade_sem,{grade_id:id},this);
                },
                //学年学期改变
                sem_change:function(){
                    if(this.highest_level == 2){//市
                        this.extend.district = '';
                        this.area_info = '';
                        this.school_area_info = '';
                    }
                    if(this.highest_level == 2 || this.highest_level == 3){//市、区县
                        this.extend.fk_xx_id = '';
                    }
                    //活动统计
                    ajax_post(api_activity_list,this.extend.$model,this);
                },
                //区县改变-区县
                area_change:function(){
                    this.area_type = 1;
                    this.extend.district = this.area_info;
                    //活动统计-区县
                    ajax_post(api_activity_list,this.extend.$model,this);
                },
                //区县改变-学校
                school_area_change:function(){
                    this.area_type = 2;
                    this.extend.fk_xx_id = '';
                    this.school_list = [];
                    this.extend.district = this.school_area_info;
                    if(this.school_area_info == ''){
                        //活动统计-学校
                        ajax_post(api_activity_list,this.extend.$model,this);
                        return;
                    }
                    //学校
                    ajax_post(api_school_list,{district:this.extend.district},this);
                },
                //学校改变
                school_change:function(){
                    //活动统计-学校
                    ajax_post(api_activity_list,this.extend.$model,this);
                },
                // highcharts图-市、区县、校
                char:function(id,data_xAxis,data_series){
                    if(data_xAxis.length==0 || data_series.length==0) return
                    var chart = Highcharts.chart(id, {
                        chart:{
                            type:'bar'
                        },
                        title:{
                            text:''
                        },
                        //去掉logo
                        credits: {
                            enabled: false
                        },
                        //去掉打印按钮
                        exporting: {
                            enabled: false
                        },
                        xAxis:{
                            categories:data_xAxis,
                            title:{
                                text:''
                            }
                        },
                        yAxis:{
                            min:0,
                            title:{
                                text:null
                            }
                        },
                        plotOptions: {
                            bar: {
                                dataLabels: {
                                    enabled: true,
                                    allowOverlap: true // 允许数据标签重叠
                                }
                            }
                        },
                        legend: {
                            /* 图例显示顺序反转
                             * 这是因为堆叠的顺序默认是反转的，可以设置
                             * yAxis.reversedStacks = false 来达到类似的效果
                             */
                            align: "center", //程度标的目标地位
                            verticalAlign: "top", //垂直标的目标地位
                            x: 0, //间隔x轴的间隔
                            y: -5 ,//间隔Y轴的间隔
                            reversed: true
                        },
                        series:data_series
                    });
                },
                //获取highcharts图xAxis数据
                get_xAxis:function(ary,ary_name){//ary-数组，ary_name-需要去获取的值名称
                    var new_ary = [];
                    for(var i=0;i<ary.length;i++){
                        new_ary.push(ary[i][ary_name]);
                    }
                    /*数组去重（借助es6）:
                    * Set数据结构，它类似于数组，其成员的值都是唯一的。利用Array.from将Set结构转换成数组
                    * */
                    return Array.from(new Set(new_ary));
                },
                //获取highcharts图series数据
                get_series:function(ary,grade_name,num){//ary-数组，grade_name-series里面的name的获取值名称，num-series里面的datad的获取值名称
                    var new_ary = [];
                    for(var i=0;i<ary.length;i++){
                        var obj = {};
                        //获取name
                        obj.name = ary[i][grade_name];
                        //获取data
                        var d = [];
                        for(var j=0;j<ary.length;j++){
                            var g_name = ary[j][grade_name];
                            if(obj.name == g_name){
                                d.push(ary[j][num]);
                            }
                        }
                        obj.data = d;
                        new_ary.push(obj);
                    }
                    //数组对象去重：方法1：利用对象访问属性的方法，判断对象中是否存在key
                    var result = [];
                    var obj = {};
                    for(var i =0; i<new_ary.length; i++){
                        if(!obj[new_ary[i].name]){
                            result.push(new_ary[i]);
                            obj[new_ary[i].name] = true;
                        }
                    }
                    return result;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //年级
                            case api_grade_list:
                                this.complete_grade_list(data);
                                break;
                            //学年学期--年级全部
                            case api_sem_list:
                                this.complete_sem_list(data);
                                break;
                            //学年学期--指定年级
                            case api_grade_sem:
                                this.complete_grade_sem(data);
                                break;
                            //区县
                            case api_area_list:
                                this.complete_area_list(data);
                                break;
                            //学校
                            case api_school_list:
                                this.complete_school_list(data);
                                break;
                            //活动统计
                            case api_activity_list:
                                if(this.area_type == 0){
                                    this.complete_activity_list(data);
                                }else if(this.area_type == 1){
                                    this.complete_activity_list_area(data);
                                }else if(this.area_type == 2){
                                    this.complete_activity_list_school(data);
                                }
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //年级
                complete_grade_list:function(data){
                    this.grade_list = data.data;
                    //学年学期
                    ajax_post(api_sem_list,{status:1},this);
                },
                //学年学期-全部年级
                complete_sem_list:function(data){
                    this.sem_list = data.data;
                    this.extend.fk_xq_id = this.sem_list[0].id;
                    //活动统计
                    ajax_post(api_activity_list,this.extend.$model,this);
                },
                //学年学期-指定年级
                complete_grade_sem:function(data){
                    this.sem_list = data.data.list;
                    this.extend.fk_xq_id = this.sem_list[0].id;
                    //活动统计
                    ajax_post(api_activity_list,this.extend.$model,this);
                },
                //区县
                complete_area_list:function(data){
                    this.area_list = data.data.list;
                },
                //学校
                complete_school_list:function(data){
                    this.school_list = data.data.list;
                    // if(this.highest_level == 3 && this.area_ident == true){//是区县用户初次进入
                    //     this.area_ident = false;
                    //     return;
                    // }
                    //区县身份
                    if(this.highest_level == 3)
                        return;
                    //活动统计-学校
                    ajax_post(api_activity_list,this.extend.$model,this);
                },
                //活动统计
                complete_activity_list:function(data){
                    if(this.grade_info == ''){
                        this.activity_city = data.data.cs;
                        //重组数据，相同的学校放在一堆
                        var area = this.data_reorganization(data.data.qx,'district');
                        this.activity_area = area;
                        //重组数据，相同的学校放在一堆
                        var school = this.data_reorganization(data.data.xx,'school_name');
                        this.activity_school = school;
                        //highchart图高度
                        this.city_height = 100+40*this.activity_city.length;
                        this.area_height = 100+40*this.activity_area.length;
                        this.school_height = 100+40*this.activity_school.length;
                        //highcharts数据:
                        if(this.highest_level == 2){
                            //市
                            this.city_xAxis = this.get_xAxis(this.activity_city,'city');
                            this.city_series = this.get_series(this.activity_city,'grade_name','fbcs');
                            this.char('city_container',this.city_xAxis,this.city_series);
                        }
                        if(this.highest_level == 2 || this.highest_level == 3){
                            //区县
                            this.area_xAxis = this.get_xAxis(this.activity_area,'district');
                            this.area_series = this.get_series(this.activity_area,'grade_name','fbcs');
                            this.char('area_container',this.area_xAxis,this.area_series);
                        }
                        //校
                        this.school_xAxis = this.get_xAxis(this.activity_school,'school_name');
                        this.school_series = this.get_series(this.activity_school,'grade_name','fbcs');
                        this.char('school_container',this.school_xAxis,this.school_series);
                        return;
                    }
                    //获取年级名称做数据筛选
                    var g_name = this.grade_info.split('|')[1];
                    this.activity_city = this.deal_data(data.data.cs,'grade_name',g_name);
                    //重组数据，相同的学校放在一堆
                    var area = this.data_reorganization(data.data.qx,'district');
                    var deal_area = this.deal_data(area,'grade_name',g_name);
                    this.activity_area = deal_area;
                    //重组数据，相同的学校放在一堆
                    var school = this.data_reorganization(data.data.xx,'school_name');
                    var deal_school = this.deal_data(school,'grade_name',g_name);
                    this.activity_school = deal_school;
                    //highchart图高度
                    this.city_height = 100+40*this.activity_city.length;
                    this.area_height = 100+40*this.activity_area.length;
                    this.school_height = 100+40*this.activity_school.length;
                    //highcharts数据:
                    if(this.highest_level == 2){
                        //市
                        this.city_xAxis = this.get_xAxis(this.activity_city,'city');
                        this.city_series = this.get_series(this.activity_city,'grade_name','fbcs');
                        this.char('city_container',this.city_xAxis,this.city_series);
                    }
                    if(this.highest_level == 2 || this.highest_level == 3){
                        //区县
                        this.area_xAxis = this.get_xAxis(this.activity_area,'district');
                        this.area_series = this.get_series(this.activity_area,'grade_name','fbcs');
                        this.char('area_container',this.area_xAxis,this.area_series);
                    }
                    //校
                    this.school_xAxis = this.get_xAxis(this.activity_school,'school_name');
                    this.school_series = this.get_series(this.activity_school,'grade_name','fbcs');
                    this.char('school_container',this.school_xAxis,this.school_series);
                },
                //活动统计-区县表
                complete_activity_list_area:function(data){
                    this.area_type = 0;
                    if(this.grade_info == ''){
                        //重组数据，相同的区县放在一堆
                        var area = this.data_reorganization(data.data.qx,'district');
                        this.activity_area = area;
                        //highchart图高度
                        this.area_height = 100+40*this.activity_area.length;
                        //highcharts数据:
                        //区县
                        this.area_xAxis = this.get_xAxis(this.activity_area,'district');
                        this.area_series = this.get_series(this.activity_area,'grade_name','fbcs');
                        this.char('area_container',this.area_xAxis,this.area_series);
                        return;
                    }
                    //获取年级名称做数据筛选
                    var g_name = this.grade_info.split('|')[1];
                    //重组数据，相同的学校放在一堆
                    var area = this.data_reorganization(data.data.qx,'district');
                    var deal_area = this.deal_data(area,'grade_name',g_name);
                    this.activity_area = deal_area;
                    //highcharts数据:
                    //区县
                    this.area_xAxis = this.get_xAxis(this.activity_area,'district');
                    this.area_series = this.get_series(this.activity_area,'grade_name','fbcs');
                    this.char('area_container',this.area_xAxis,this.area_series);
                },
                //活动统计-学校表
                complete_activity_list_school:function(data){
                    this.area_type = 0;
                    if(this.grade_info == ''){
                        //重组数据，相同的学校放在一堆
                        var school = this.data_reorganization(data.data.xx,'school_name');
                        this.activity_school = school;
                        //highchart图高度
                        this.school_height = 100+40*this.activity_school.length;
                        //highcharts数据:
                        //校
                        this.school_xAxis = this.get_xAxis(this.activity_school,'school_name');
                        this.school_series = this.get_series(this.activity_school,'grade_name','fbcs');
                        this.char('school_container',this.school_xAxis,this.school_series);
                        return;
                    }
                    //获取年级名称做数据筛选
                    var g_name = this.grade_info.split('|')[1];
                    //重组数据，相同的学校放在一堆
                    var school = this.data_reorganization(data.data.xx,'school_name');
                    var deal_school = this.deal_data(school,'grade_name',g_name);
                    this.activity_school = deal_school;
                    // this.activity_school = this.deal_data(data.data.xx,'grade_name',g_name);
                    //highcharts数据:
                    //校
                    this.school_xAxis = this.get_xAxis(this.activity_school,'school_name');
                    this.school_series = this.get_series(this.activity_school,'grade_name','fbcs');
                    this.char('school_container',this.school_xAxis,this.school_series);
                },
            });
            table.$watch('onReady', function () {
                table.cds();
            });

            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });