/**
 * Created by Administrator on 2018/9/14.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('graduate_statistics_analysis', 'group_index_graduate_d/group_index_graduate_d','html!'),
        C.Co('graduate_statistics_analysis', 'group_index_graduate_d/group_index_graduate_d','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        "highcharts"
    ],
    function ($,avalon,layer,html,css,data_center,select_assembly,three_menu_module,highcharts) {
        //毕业评价群体分析维度要素
        var api_analysis = api.api + 'GrowthRecordBag/graduation_eval_dim_or_ele_population_analysis';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "group_index_graduate_d",
                title:"",
                //年级列表
                grade_list: [],
                //学年学期下拉列表上是否显示初始值
                is_init_sel: true,
                //年级下拉列表选择数据
                current_grade_name:"",
                gradeId:'',
                //男女数据
                sex_series:[],
                sex_xAxis:[],
                //走寄读数据
                post_series:[],
                post_xAxis:[],
                //请求参数
                extend:{
                    fk_grade_id:'',
                    //统计方式（必传）	number	3 群体男女 4 群体 走寄读 5 区域
                    sta_mode:'',
                    //统计类型（必传）	number	2 按维度 ；3 按要素
                    sta_type:2,
                },
                init:function(){
                    this.init_data();
                    if (this.is_init_sel && this.grade_list.length > 0) {
                        this.gradeId = this.grade_list[0].value;
                        this.current_grade_name = this.grade_list[0].name;
                        this.extend.fk_grade_id = Number(this.grade_list[0].value);
                    }
                    //男女
                    this.extend.sta_mode = 3;
                    ajax_post(api_analysis,this.extend.$model,this);
                },
                init_data:function () {
                    this.grade_list = sort_by(cloud.grade_all_list(),['+name']);
                    console.log(this.grade_list);
                    this.title = cloud.user_city();
                },
                //年级
                sel_change_grade: function (el) {
                    this.extend.fk_grade_id = Number(el.value);
                    //男女
                    this.extend.sta_mode = 3;
                    ajax_post(api_analysis,this.extend.$model,this);
                },
                //页面切换
                gra_change:function (num) {
                    if(num == 1) {//群体分析-综合实践
                        window.location = '#group_analysis_graduate';
                    }
                },
                //highchar
                chars:function(id,name_xAxis,name_series,title){//id--html里面容器id
                    var chart =  Highcharts.chart(id,{
                        chart: {
                            type: 'column'
                        },
                        title: {
                            text: title
                        },
                        subtitle: {
                            text: ''
                        },
                        //去掉logo
                        credits: {
                            enabled: false
                        },
                        //去掉打印按钮
                        exporting: {
                            enabled: false
                        },
                        tooltip: {
                            // head + 每个 point + footer 拼接成完整的 table
                            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
                            footerFormat: '</table>',
                            shared: true,
                            useHTML: true
                        },
                        plotOptions: {
                            column: {
                                borderWidth: 0
                            }
                        },
                        xAxis: {
                            categories:name_xAxis,
                            crosshair: true
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: ''
                            }
                        },
                        series:name_series,
                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                        //    分析
                            case api_analysis:
                               this.complete_analysis(data);
                               break;
                        }
                    } else {
                        layer.msg(msg);
                    }
                },
                complete_analysis:function(data){
                    // var data = {
                    //     sex_list:[
                    //         {stu_sex:1,zb_mc:'思想品德',zb_pjf:12},
                    //         {stu_sex:2,zb_mc:'思想品德',zb_pjf:22},
                    //         {stu_sex:1,zb_mc:'体质健康',zb_pjf:13},
                    //         {stu_sex:2,zb_mc:'体质健康',zb_pjf:23},
                    //         {stu_sex:1,zb_mc:'学业水平',zb_pjf:14},
                    //         {stu_sex:2,zb_mc:'学业水平',zb_pjf:24},
                    //         {stu_sex:1,zb_mc:'艺术素养',zb_pjf:15},
                    //         {stu_sex:2,zb_mc:'艺术素养',zb_pjf:25},
                    //         {stu_sex:1,zb_mc:'社会实践',zb_pjf:16},
                    //         {stu_sex:2,zb_mc:'社会实践',zb_pjf:26},
                    //     ],
                    //     zsqk_list:[
                    //         {zsqk:1,zb_mc:'思想品德',zb_pjf:12},
                    //         {zsqk:2,zb_mc:'思想品德',zb_pjf:22},
                    //         {zsqk:1,zb_mc:'体质健康',zb_pjf:13},
                    //         {zsqk:2,zb_mc:'体质健康',zb_pjf:23},
                    //         {zsqk:1,zb_mc:'学业水平',zb_pjf:14},
                    //         {zsqk:2,zb_mc:'学业水平',zb_pjf:24},
                    //         {zsqk:1,zb_mc:'艺术素养',zb_pjf:15},
                    //         {zsqk:2,zb_mc:'艺术素养',zb_pjf:25},
                    //         {zsqk:1,zb_mc:'社会实践',zb_pjf:16},
                    //         {zsqk:2,zb_mc:'社会实践',zb_pjf:26},
                    //     ]
                    // }
                    if(this.extend.sta_mode == 3){//男女
                        this.sex_xAxis = [];
                        this.sex_series = [];
                            //走寄读
                        this.extend.sta_mode = 4;
                        ajax_post(api_analysis,this.extend.$model,this);
                        if(data.data == null || data.data == undefined)
                            return;
                        var sex_list = data.data.sex_list;
                        if(sex_list.length == 0)
                            return;
                       // 抽取数据再去重
                       this.sex_xAxis = this.ary_deweighting(this.extract_fields(sex_list,'zb_mc'));
                        //获取男生
                        var boy_list = this.ary_class(sex_list,'stu_sex','男');
                        var boy_data = this.extract_fields(boy_list,'zb_pjf');
                        //获取女生
                        var girl_list = this.ary_class(sex_list,'stu_sex','女');
                        var girl_data = this.extract_fields(girl_list,'zb_pjf');
                        this.sex_series = [
                            {name:'男',data:boy_data},
                            {name:'女',data:girl_data},
                        ]
                        // console.log( this.sex_xAxis);
                        //highchar图
                        if(this.sex_xAxis.length>0){
                            this.chars('container1',this.sex_xAxis,this.sex_series,'男、女学生比较');
                        }
                    }else if(this.extend.sta_mode == 4){//走寄读
                        this.post_xAxis = [];
                        this.post_series = [];
                        if(data.data == null || data.data == undefined)
                            return;
                        var zsqk_list = data.data.zsqk_list;
                        if(zsqk_list.length == 0)
                            return;
                        // 抽取数据再去重
                        this.post_xAxis = this.ary_deweighting(this.extract_fields(zsqk_list,'zb_mc'));
                        //走读
                        var zd_list = this.ary_class(zsqk_list,'zsqk','走读');
                        var zd_data = this.extract_fields(zd_list,'zb_pjf');
                        //寄宿
                        var jd_list = this.ary_class(zsqk_list,'zsqk','寄宿');
                        var jd_data = this.extract_fields(jd_list,'zb_pjf');
                        this.post_series = [
                            {name:'走读',data:zd_data},
                            {name:'寄宿',data:jd_data},
                        ]
                        // console.log( this.sex_xAxis);
                        //highchar图
                        if(this.post_xAxis.length>0){
                            this.chars('container2',this.post_xAxis,this.post_series,'寄宿、走读学生比较');
                        }
                    }
                },
                //数组分类--根据字段将数组分成几个数组
                ary_class:function(arr,zd_name,class_name){
                    var ary = [];
                    for(var i=0;i<arr.length;i++){
                        if(class_name == arr[i][zd_name]){
                            ary.push(arr[i]);
                        }
                    }
                    return ary;
                },
                //抽取某个数组字段
                extract_fields:function(arr,name){
                    var ary = [];
                    for(var i=0;i<arr.length;i++){
                        ary.push(arr[i][name]);
                    }
                    return ary;
                },
                //简单数组去重: 借助新数组 通过indexOf方判断当前元素在数组中的索引如果与循环的下标相等则添加到新数组中
                ary_deweighting:function(arr){
                    var ary = [];
                    for(var i=0;i<arr.length;i++){
                       if(arr.indexOf(arr[i]) == i){
                           ary.push(arr[i]);
                       }
                    }
                    return ary;
                },
            });
            // require(['highcharts'], function () {
            //     require(['highcharts-more'], function () {
            //         require(['highcharts-zh_CN'], function () {
            //             vm.init();
            //         })
            //     })
            // });
            vm.$watch("onReady", function() {
                vm.init();
            })

            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });