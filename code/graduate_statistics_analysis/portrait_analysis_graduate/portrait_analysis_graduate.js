/**
 * Created by Administrator on 2018/9/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('graduate_statistics_analysis', 'portrait_analysis_graduate/portrait_analysis_graduate', 'html!'),
        C.Co('graduate_statistics_analysis', 'portrait_analysis_graduate/portrait_analysis_graduate', 'css!'),
        C.CMF("data_center.js"),
        "select2",
        C.CM("three_menu_module")
    ],
    function ($,avalon, layer, html, css,data_center, select2, three_menu_module) {
        //获取区县
        var api_area_list = api.user + 'school/arealist.action';
        //获取学校
        var api_school_list = api.user + 'school/schoolList.action';
        //获取年级班级
        var api_grade_class = api.user + 'class/school_class.action';
        //毕业评价-维度-纵向分析
        var api_portrait_analysis = api.api + 'GrowthRecordBag/graduation_eval_longitudinal_analysis';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "portrait_analysis_graduate",
                //用户基本信息
                tUser:{},
                //用户身份类型
                ident_type:'',
                //市
                city_info:'',
                //区县
                area_list:'',
                area_info:'',
                //学校
                school_list:[],
                school_info:'',
                //年级
                grade_list:[],
                grade_info:'',
                //班级
                class_list:[],
                class_info:'',
                //表头
                head_list:[],
                //数据
                data_list:[],
                init: function () {
                    this.cd();
                },
                cd:function () {
                    //基本信息
                    var tUser = cloud.user_user();
                    this.tUser = tUser;
                    this.city_info = tUser.fk_school_id;
                    //user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                    var type = cloud.user_level();
                    this.ident_type = type;
                    if(type == 2){//市
                        ajax_post(api_area_list,{city:tUser.city},this);
                    }else if(type == 3){//区县
                        //学校
                        ajax_post(api_school_list,{district:tUser.district},this);
                    }else if(type == 4){//校
                        //    纵向分析
                        ajax_post(api_portrait_analysis,{fk_school_id:this.tUser.fk_school_id},this);
                    }
                },
                //区县改变
                area_change:function () {
                    var area_id = this.area_info.split('|')[0];
                    // 纵向分析
                    ajax_post(api_portrait_analysis,{fk_school_id:area_id},this);
                },
                //学校改变
                school_change:function(){
                    if(this.school_info != ''){
                        // 纵向分析
                        ajax_post(api_portrait_analysis,{fk_school_id:this.school_info},this);
                        return;
                    }
                    //学校筛选为全部时
                    if(this.ident_type == 2){//市
                        var area_id = this.area_info.split('|')[0];
                    }else if(this.ident_type == 3){//区县
                        var area_id = this.tUser.fk_school_id;
                    }
                    // 纵向分析
                    ajax_post(api_portrait_analysis,{fk_school_id:area_id},this);
                },
                //数组分类--根据字段将数组提取成新数组
                ary_class:function(arr,zd_name,class_name){//arr-数组，zd_name--字段名称，class_name--筛选值
                    var ary = [];
                    for(var i=0;i<arr.length;i++){
                        if(class_name == arr[i][zd_name]){
                            ary.push(arr[i]);
                        }
                    }
                    return ary;
                },
                //页面切换
                gra_change:function(num){
                    if(num == 1){//纵向分析-指标维度分析-毕业评价分析-评价维度
                        window.location = '#vertical_analysis_graduate';
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                        //    区县
                            case api_area_list:
                                this.complete_area_list(data);
                                break;
                        //        学校
                            case api_school_list:
                                this.complete_school_list(data);
                                break;
                        //        纵向分析
                            case api_portrait_analysis:
                                this.complete_portrait_analysis(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                //区县
                complete_area_list:function(data){
                    this.area_list = data.data.list;
                //    纵向分析
                    ajax_post(api_portrait_analysis,{fk_school_id:this.city_info},this);
                },
                //学校
                complete_school_list:function (data) {
                    this.school_list = data.data.list;
                    if(this.ident_type == 3){
                        //    纵向分析
                        ajax_post(api_portrait_analysis,{fk_school_id:this.tUser.fk_school_id},this);
                    }
                },
                //纵向分析
                complete_portrait_analysis:function(data){
                    //清空之前赋值
                    this.head_list = [];
                    this.data_list = [];
                    var list = data.data.wd_cnt;
                    // var list = [
                    //     {class_name:'001',fk_class_id:1,fk_grade_id:37,grade_name:'初2015级',
                    //      sub_list:[
                    //          {zb_mc:'思想品德',zb_pjf:'0.01'},
                    //          {zb_mc:'学业水平',zb_pjf:'0.36'},
                    //          {zb_mc:'身心健康',zb_pjf:'0.35'},
                    //          {zb_mc:'艺术素养',zb_pjf:'5.34'},
                    //          {zb_mc:'社会实践',zb_pjf:'5.34'},
                    //          ]
                    //     },
                    //     {class_name:'002',fk_class_id:2,fk_grade_id:37,grade_name:'初2015级',
                    //         sub_list:[
                    //             {zb_mc:'思想品德',zb_pjf:'0.01'},
                    //             {zb_mc:'学业水平',zb_pjf:'0.36'},
                    //             {zb_mc:'身心健康',zb_pjf:'0.35'},
                    //             {zb_mc:'艺术素养',zb_pjf:'5.34'},
                    //             {zb_mc:'社会实践',zb_pjf:'5.34'},
                    //         ]
                    //     },
                    //     {class_name:'003',fk_class_id:3,fk_grade_id:37,grade_name:'初2015级',
                    //         sub_list:[
                    //             {zb_mc:'思想品德',zb_pjf:'0.01'},
                    //             {zb_mc:'学业水平',zb_pjf:'0.36'},
                    //             {zb_mc:'身心健康',zb_pjf:'0.35'},
                    //             {zb_mc:'艺术素养',zb_pjf:'5.34'},
                    //             {zb_mc:'社会实践',zb_pjf:'5.34'},
                    //         ]
                    //     },
                    //     {class_name:'001',fk_class_id:4,fk_grade_id:38,grade_name:'初2016级',
                    //         sub_list:[
                    //             {zb_mc:'思想品德',zb_pjf:'0.01'},
                    //             {zb_mc:'学业水平',zb_pjf:'0.36'},
                    //             {zb_mc:'身心健康',zb_pjf:'0.35'},
                    //             {zb_mc:'艺术素养',zb_pjf:'5.34'},
                    //             {zb_mc:'社会实践',zb_pjf:'5.34'},
                    //         ]
                    //     },
                    //     {class_name:'002',fk_class_id:5,fk_grade_id:38,grade_name:'初2016级',
                    //         sub_list:[
                    //             {zb_mc:'思想品德',zb_pjf:'0.01'},
                    //             {zb_mc:'学业水平',zb_pjf:'0.36'},
                    //             {zb_mc:'身心健康',zb_pjf:'0.35'},
                    //             {zb_mc:'艺术素养',zb_pjf:'5.34'},
                    //             {zb_mc:'社会实践',zb_pjf:'5.34'},
                    //         ]
                    //     },
                    //     {class_name:'003',fk_class_id:6,fk_grade_id:38,grade_name:'初2016级',
                    //         sub_list:[
                    //             {zb_mc:'思想品德',zb_pjf:'0.01'},
                    //             {zb_mc:'学业水平',zb_pjf:'0.36'},
                    //             {zb_mc:'身心健康',zb_pjf:'0.35'},
                    //             {zb_mc:'艺术素养',zb_pjf:'5.34'},
                    //             {zb_mc:'社会实践',zb_pjf:'5.34'},
                    //         ]
                    //     },
                    //     {class_name:'001',fk_class_id:7,fk_grade_id:39,grade_name:'初2017级',
                    //         sub_list:[
                    //             {zb_mc:'思想品德',zb_pjf:'0.01'},
                    //             {zb_mc:'学业水平',zb_pjf:'0.36'},
                    //             {zb_mc:'身心健康',zb_pjf:'0.35'},
                    //             {zb_mc:'艺术素养',zb_pjf:'5.34'},
                    //             {zb_mc:'社会实践',zb_pjf:'5.34'},
                    //         ]
                    //     },
                    //     {class_name:'002',fk_class_id:8,fk_grade_id:39,grade_name:'初2017级',
                    //         sub_list:[
                    //             // {zb_mc:'思想品德',zb_pjf:'0.01'},
                    //             // {zb_mc:'学业水平',zb_pjf:'0.36'},
                    //             // {zb_mc:'身心健康',zb_pjf:'0.35'},
                    //             // {zb_mc:'艺术素养',zb_pjf:'5.34'},
                    //             // {zb_mc:'社会实践',zb_pjf:'5.34'},
                    //         ]
                    //     },
                    //     {class_name:'003',fk_class_id:9,fk_grade_id:39,grade_name:'初2017级',
                    //         sub_list:[
                    //             // {zb_mc:'思想品德',zb_pjf:'0.01'},
                    //             // {zb_mc:'学业水平',zb_pjf:'0.36'},
                    //             // {zb_mc:'身心健康',zb_pjf:'0.35'},
                    //             // {zb_mc:'艺术素养',zb_pjf:'5.34'},
                    //             // {zb_mc:'社会实践',zb_pjf:'5.34'},
                    //         ]
                    //     },
                    //     ];
                    //获取表头
                    var head_list = [];
                    for(var i=0;i<list.length;i++){
                        if(list[i].sub_list.length > 0){
                            this.head_list = list[i].sub_list;
                            break;
                        }

                    };
                    // console.log(this.head_list);
                    this.data_list = list;
                    if(this.area_info == '' || this.school_list.length > 0 || this.ident_type == 4)
                        return;
                    var area = this.area_info.split('|')[1];
                    //学校
                    ajax_post(api_school_list,{district:area},this);
                },
            });
            vm.$watch('onReady', function () {
                vm.init();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
