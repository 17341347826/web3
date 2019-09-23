/**
 * Created by uptang on 2017/6/5.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("evaluation_analysis", "comparative_analysis_wd/comparative_analysis_wd", "css!"),
        C.Co("evaluation_analysis", "comparative_analysis_wd/comparative_analysis_wd", "html!"),
        C.CMF("data_center.js"),
        "layer",
        'echarts',
        C.CM("three_menu_module"),
        C.CM("select_assembly"),
    ],
    function ($, avalon, css, html, data_center,
              layer,echarts, three_menu_module, select_assembly
    ) {
        var avalon_define = function (arg) {
            var sta_type = arg.sta_type;
            var vm = avalon.define({
                $id: "comparative_analysis",
                html_display:0,
                user:{},
                highest_level:"",

                semester_grade_mapping:[],
                grade_list:[],

                city_headers:[],
                city_analyze_list:[],
                //  区县维度头
                district_headers:[],
                district_analyze_list:[],

                school_headers:[],
                school_analyze_list:[],

                class_headers:[],
                class_analyze_list:[],
                //年级
                fk_grade_name:'',
                fk_semester_name:'',
                tit:'',

                form:{
                    semester_index:0,
                    grade_index:0
                },
                semester_change:function () {
                    this.query();
                },
                grade_change:function () {

                },
                cds: function () {
                    this.html_display = sta_type;
                    this.user = cloud.user_user();
                    var semester_grade_mapping=semester_grade_mapping = sort_by(cloud.semester_grade_mapping().list,'+semester_name');
                    for(var i = 0;i<semester_grade_mapping.length;i++){
                        sort_by(semester_grade_mapping[i].grades,'+semester_name');
                    }
                    this.semester_grade_mapping = semester_grade_mapping;
                    this.query();
                    // 1：省级；2：市州级；3：区县级；4：校级；5：年级
                    var self = this;
                    data_center.uin(function (data) {
                        self.highest_level = data.data.highest_level;
                    });
                },
                // 保留一位小数四舍五入
                ceil:function (num) {
                    return (Math.round(num*10)/10).toFixed(1);
                },

                to_page:function (url) {
                    location.href = url;
                },

                // 年级id转化为年级name
                to_grade_name:function (id) {
                    for(var i = 0;i<this.grade_list.length;i++){
                        if(this.grade_list[i].id == id){
                            return this.grade_list[i].grade_name;
                        }
                    }
                    return '';
                },
                // 一维数组组装为二维结构
                to_Two_structure:function (src, key) {
                    var re = [];
                    if(src.hasOwnProperty('length')){
                        src.forEach(function (item) {
                            var flag = false;
                            if(item){
                                for(var i = 0;i<re.length;i++){
                                    if(re[i][key]===item[key]){
                                        flag = true;
                                        re[i]['sub_list'].push(item);
                                    }
                                }
                                if(!flag){
                                    re.push({sub_list:[]});
                                    re[re.length-1][key] = item[key];
                                    re[re.length-1]['sub_list'].push(item);
                                }
                            }
                        })
                    }
                    return re;
                },
                grade_is_checked:function (id) {
                    if(this.form.grade_index==0){
                        return true;
                    }else {
                        if(this.grade_list[this.form.grade_index-1].id==id){
                            return true;
                        }else {
                            return false;
                        }
                    }
                },
                query:function () {
                    cloud.xqpj_hx_wd({
                        sta_type:this.html_display,
                        fk_semester_id:this.semester_grade_mapping[this.form.semester_index].id
                    }, function (url, args, ret, is_suc, msg) {
                        vm.form.grade_index = 0;
                        vm.grade_list.clear();
                        vm.grade_list = vm.semester_grade_mapping[vm.form.semester_index].grades;
                        vm.district_headers.clear();
                        vm.school_headers.clear();
                        vm.class_headers.clear();
                        vm.district_analyze_list.clear();
                        vm.school_analyze_list.clear();
                        vm.class_analyze_list.clear();
                        var default_sub_item = {rs: "", zb_pjf: "0", zb_mc: "0", fk_semester_id: ""};
                        if(ret){
                            //抽离市数据
                            if(ret.city_cnt&&ret.city_cnt.length>0){
                                var city_zb = abstract(ret.city_cnt,'sub_list');
                                city_zb = concat(city_zb);
                                city_zb = abstract(city_zb,'zb_mc');
                                vm.city_headers = unique(city_zb);
                                if(vm.city_headers.length>0){
                                    ret.city_cnt = padding_obj_obj(ret.city_cnt,'fk_grade_id','id',vm.grade_list.$model,{
                                        fk_grade_id:0,
                                        sub_list:[]
                                    });
                                    ret.city_cnt = padding_f(ret.city_cnt,vm.grade_list.$model,'fk_grade_id','id');
                                    ret.city_cnt.forEach(function (data) {
                                        if(data&&data.sub_list){
                                            data.sub_list = padding(data.sub_list, "zb_mc", vm.city_headers.$model, default_sub_item);
                                        }
                                    });
                                    vm.city_analyze_list = ret.city_cnt;
                                    // vm.deal_data(vm.district_analyze_list,'district','district_chart_id');
                                }
                            }

                            // 抽离区县数据
                            if(ret.district_cnt&&ret.district_cnt.length>0){
                                var dist_zb = abstract(ret.district_cnt, "sub_list");
                                dist_zb = concat(dist_zb);
                                dist_zb = abstract(dist_zb, "zb_mc");
                                vm.district_headers = unique(dist_zb);
                                ret.district_cnt = vm.to_Two_structure(ret.district_cnt,'district_name');
                                ret.district_cnt.forEach(function (data) {
                                    if(data&&data.sub_list){
                                        data.sub_list = padding_obj_obj(data.sub_list,'fk_grade_id','id',vm.grade_list.$model,{
                                            fk_grade_id:0,
                                            sub_list:[],
                                        })
                                        data.sub_list = padding_f(data.sub_list, vm.grade_list.$model, 'fk_grade_id','id');
                                        data.sub_list.forEach(function (item) {
                                            if(item&&item.sub_list){
                                                item.sub_list = padding(item.sub_list, "zb_mc", vm.district_headers.$model, default_sub_item);
                                            }
                                        });
                                    }
                                });
                                vm.district_analyze_list = ret.district_cnt;
                            }

                            // 抽离学校数据
                            if(ret.school_cnt&&ret.school_cnt.length>0){
                                var sch_zb = abstract(ret.school_cnt, "sub_list");
                                sch_zb = concat(sch_zb);
                                sch_zb = abstract(sch_zb, "zb_mc");
                                vm.school_headers = unique(sch_zb);
                                ret.school_cnt = vm.to_Two_structure(ret.school_cnt,'school_name');
                                ret.school_cnt.forEach(function (data) {
                                    if(data&&data.sub_list){
                                        data.sub_list = padding_obj_obj(data.sub_list,'fk_grade_id','id',vm.grade_list.$model,{
                                            fk_grade_id:0,
                                            sub_list:[],
                                        })
                                        data.sub_list = padding_f(data.sub_list, vm.grade_list.$model, 'fk_grade_id','id');
                                        data.sub_list.forEach(function (item) {
                                            if(item&&item.sub_list){
                                                item.sub_list = padding(item.sub_list, "zb_mc", vm.school_headers.$model, default_sub_item);
                                            }
                                        });
                                    }
                                });
                                vm.school_analyze_list = ret.school_cnt;
                            }


                            // 抽离班级数据
                            if(ret.school_class_cnt&&ret.school_class_cnt.length>0){
                                var cls_zb = abstract(ret.school_class_cnt, "sub_list");
                                cls_zb = concat(cls_zb);
                                cls_zb = abstract(cls_zb, "zb_mc");
                                vm.class_headers = unique(cls_zb);
                                ret.school_class_cnt = vm.to_Two_structure(ret.school_class_cnt,'fk_grade_id');
                                ret.school_class_cnt = padding_obj_obj(ret.school_class_cnt,'fk_grade_id','id',vm.grade_list.$model,{
                                    fk_grade_id:0,
                                    sub_list:[],
                                });
                                ret.school_class_cnt = padding_f(ret.school_class_cnt,vm.grade_list.$model,'fk_grade_id','id');
                                var cut = 0;
                                var class_list = ret.school_class_cnt;
                                ret.school_class_cnt.forEach(function (data) {
                                    if(data&&data.sub_list){
                                        data.class_list = cloud.find_class_simple({
                                            fk_grade_id:data.fk_grade_id,
                                            fk_school_id:vm.user.school_id
                                        });
                                        data.sub_list = padding_obj_obj(data.sub_list,'fk_class_id','id',data.class_list,{
                                            'fk_class_id':0,
                                            sub_list:[]
                                        });
                                        data.sub_list = padding_f(data.sub_list,data.class_list,'class_name','class_name');
                                        data.sub_list = padding_f(data.sub_list,data.class_list,'fk_class_id','id');
                                        data.sub_list.forEach(function (item, ind) {
                                            item.sub_list = padding(item.sub_list,'zb_mc',vm.class_headers.$model,default_sub_item)
                                        })
                                        // cloud.sem_class_list({
                                        //     fk_nj_id:Number(data.fk_grade_id),fk_xq_id:vm.form.fk_semester_id
                                        // },function (url, args, ret, is_suc, msg) {
                                        //     cut++;
                                        //     if(is_suc){
                                        //         data.class_list = ret.list;
                                        //         data.sub_list = padding_obj_obj(data.sub_list,'fk_class_id','fk_bj_id',data.class_list,{
                                        //             'fk_class_id':0,
                                        //             sub_list:[]
                                        //         });
                                        //         data.sub_list = padding_f(data.sub_list,data.class_list,'class_name','bjmc');
                                        //         data.sub_list = padding_f(data.sub_list,data.class_list,'fk_class_id','fk_bj_id');
                                        //         data.sub_list.forEach(function (item, ind) {
                                        //             item.sub_list = padding(item.sub_list,'zb_mc',vm.class_headers.$model,default_sub_item)
                                        //         })
                                        //     }
                                        //     if(cut == class_list.length){
                                        //         console.log(JSON.parse(JSON.stringify(class_list)))
                                        //         vm.class_analyze_list = class_list;
                                        //     }
                                        // });

                                    }
                                });
                                vm.class_analyze_list = class_list;
                            }

                        }
                        if(!is_suc){
                            toastr.error(msg)
                        }
                    });
                },

            });
            vm.cds();
            return vm;
        };
        return {
            repaint:true,
            view: html,
            define: avalon_define
        }
    });