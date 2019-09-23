/**
 * Created by Administrator on 2018/9/14.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('graduate_statistics_analysis', 'region_index_graduate_d/region_index_graduate_d','html!'),
        C.Co('graduate_statistics_analysis', 'region_index_graduate_d/region_index_graduate_d','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        "highcharts"
    ],
    function ($,avalon,layer,html,css,data_center,select_assembly,three_menu_module,highcharts) {
        //毕业评价区域分析维度要素
        var api_analysis = api.api + 'GrowthRecordBag/graduation_eval_dim_or_ele_area_analysis';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "region_index_graduate_d",
                title:"",
                //年级列表
                grade_list: [],
                //学年学期下拉列表上是否显示初始值
                is_init_sel: true,
                //年级下拉列表选择数据
                current_grade_name:"",
                gradeId:'',
                //男女数据
                area_series:[],
                area_xAxis:[],
                //请求参数
                extend:{
                    fk_grade_id:'',
                    //统计方式（必传）	number	3 群体男女 4 群体 走寄读 5 区域
                    sta_mode:5,
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
                    ajax_post(api_analysis,this.extend.$model,this);
                },
                init_data:function () {
                    this.grade_list = sort_by(cloud.grade_all_list(),['+name']);
                    this.title = cloud.user_city();
                },
                //年级
                sel_change_grade: function (el) {
                    this.extend.fk_grade_id = Number(el.value);
                    ajax_post(api_analysis,this.extend.$model,this);
                },
                //页面切换
                gra_change:function(num) {
                    if (num == 1) {
                        window.location = '#regional_analysis_graduate';
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
                    this.area_xAxis = [];
                    this.area_series = [];
                    if(data.data == null || data.data == undefined)
                        return;
                    var qysx_list = data.data.qysx_list;
                    if(qysx_list.length == 0)
                        return;
                    // 抽取数据再去重
                    this.area_xAxis = this.ary_deweighting(this.extract_fields(qysx_list,'zb_mc'));
                    //获取区域属性
                    var qy_name = this.ary_deweighting(this.extract_fields(qysx_list,'qysx'));
                    // console.log(qy_name);
                    //合并渲染数据
                    var ary = [];
                    for(var i=0;i<qy_name.length;i++){
                        var obj = {};
                        obj.name = qy_name[i];
                        var list1 = this.ary_class(qysx_list,'qysx',qy_name[i]);
                        obj.data = this.extract_fields(list1,'zb_pjf');
                        ary.push(obj);
                    }
                    this.area_series = ary;
                    // console.log(this.area_series);
                    // //highchar图
                    if(this.area_xAxis.length>0){
                        this.chars('container',this.area_xAxis,this.area_series,'');
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
                //数组去重: 借助新数组 通过indexOf方判断当前元素在数组中的索引如果与循环的下标相等则添加到新数组中
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