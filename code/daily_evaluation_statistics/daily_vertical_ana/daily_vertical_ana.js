/**
 * Created by uptang on 2017/6/5.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("daily_evaluation_statistics", "daily_vertical_ana/daily_vertical_ana", "css!"),
        C.Co("daily_evaluation_statistics", "daily_vertical_ana/daily_vertical_ana", "html!"),
        C.CMF("data_center.js"),
        "layer",
        C.CM("three_menu_module"), "highcharts"],
    function ($, avalon, css, html, data_center, layer, three_menu_module, highcharts) {

        var avalon_define = function (arg) {

            var sta_type = arg.sta_type;
            var module_type = arg.module_type;

            var vm = avalon.define({
                $id: "vm",
                html_display:0,
                module_type:module_type,

                user:{},
                user_level:'',
                // 表头
                city_headers:[],
                district_headers:[],
                school_headers:[],
                class_headers:[],

                // 渲染数据
                city_analyze_list:[],
                district_analyze_list:[],
                school_analyze_list:[],
                class_analyze_list:[],

                //区域列表
                area_list:[],
                // 学校列表
                school_list:[],
                // 年级列表
                grade_list:[],
                // 班级列表
                class_list:[],
                // 学期列表
                semester_list:[],
                form:{
                    grade_index:0,
                    school_index:0,
                    area_index:0,
                    area_index1:0,
                    class_index:0,
                },

                has_data:{
                    city:0,
                    district:0,
                    school:0,
                    class:0
                },

                tit:'',
                level:'全市',
                area_change:function () {
                    for(var i = 0;i<this.district_analyze_list.length;i++){
                        if(this.district_analyze_list[i].district_name==this.area_list[this.form.area_index].district){
                            if(this.district_analyze_list[i].sub_list.length>0){
                                this.has_data.district = 1;
                            }else {
                                this.has_data.district = 0;
                            }
                        }
                    }
                },
                area_change1:function () {
                    this.school_list.clear();
                    this.form.school_index = 0;
                    this.school_list = cloud.school_list({district:this.area_list[this.form.area_index1].district});
                },
                grade_change:function () {
                    if(cloud.is_school_leader()){
                        this.class_list = cloud.find_class_simple({
                            fk_grade_id:vm.grade_list[vm.form.grade_index].value,
                            fk_school_id:vm.user.school_id
                        });
                    }
                    this.query();
                },
                school_change:function () {
                    for(var i = 0;i<this.school_analyze_list.length;i++){
                        if(this.school_analyze_list[i].fk_school_id==this.school_list[this.form.school_index].id){
                            if(this.school_analyze_list[i].sub_list.length>0){
                                this.has_data.school = 1;
                            }else {
                                this.has_data.school = 0;
                            }
                        }
                    }
                },
                class_change:function () {
                    for(var i = 0;i<this.class_analyze_list.length;i++){
                        if(this.class_analyze_list[i].fk_class_id==this.class_list[this.form.class_index].id){
                            if(this.class_analyze_list[i].sub_list.length>0){
                                this.has_data.class = 1;
                            }else {
                                this.has_data.class = 0;
                            }
                        }
                    }
                },
                init:function () {
                    if(module_type==4){
                        this.tit = '综合实践活动';
                    }else if(module_type==3){
                        this.tit = '获奖情况';
                    }else if(module_type==8){
                        this.tit = '日常表现与个性特长';
                    }
                    this.html_display = sta_type;
                    //用户所在单位，是或者区县或学校
                    this.school_id = cloud.user_user().fk_school_id;
                    this.user = cloud.user_user();
                    this.user_level = cloud.user_level();
                    var user_city = cloud.user_city();
                    // 市
                    if(cloud.is_city_leader()){
                        this.grade_list = sort_by(cloud.grade_all_list(), ["-name"]);
                        vm.area_list = cloud.area_list();
                        vm.school_list = cloud.school_list({district:this.area_list[0].district});
                    }else if(cloud.is_district_leader()){//区县
                        this.grade_list = sort_by(cloud.grade_all_list(), ["-name"]);
                        vm.area_list.push({
                            district:this.user.district
                        });
                        vm.school_list = cloud.school_list({district:this.user.district});
                    }else if(cloud.is_school_leader()){//学校
                        this.grade_list = sort_by(cloud.school_to_grade(), ["-name"]);
                        this.school_list.push({
                            id:this.school_id
                        });
                        this.class_list = cloud.find_class_simple({
                            fk_grade_id:vm.grade_list[vm.form.grade_index].value,
                            fk_school_id:vm.user.school_id
                        });
                    }
                    this.query();
                },
                query: function () {
                    var obj = {
                        fk_grade_id:Number(vm.grade_list[vm.form.grade_index].value),
                        module_type:module_type,
                        sta_type:sta_type
                    };
                    cloud.rcpj_zx_list(obj, function (url, arg, ret,is_suc,msg) {
                        var default_sub_item = {rs: "", zb_pjf: "0", zb_mc: "0", fk_semester_id: ""};
                        if(ret){
                            vm.semester_list.clear();
                            vm.semester_list = sort_by(cloud.grade_semester_list({
                                grade_id:vm.grade_list[vm.form.grade_index].value
                            }), ["-semester_name"]);
                            if(is_suc){
                                vm.city_analyze_list.clear();
                                vm.district_analyze_list.clear();
                                vm.school_analyze_list.clear();
                                vm.class_analyze_list.clear();
                                vm.class_headers.clear();
                                vm.school_headers.clear();
                                vm.district_headers.clear();
                                vm.city_headers.clear();
                                vm.has_data.class = 0;
                                vm.has_data.school = 0;
                                vm.has_data.district = 0;
                                vm.has_data.city = 0;
                            }
                            if(ret.city_cnt&&ret.city_cnt.length>0){
                                var city_hea = abstract(ret.city_cnt[0].sub_list,'zb_mc');
                                vm.city_headers = unique(city_hea);
                                var semester_list = vm.to_Two_structure(ret.city_cnt[0].sub_list,'fk_semester_id');
                                semester_list = padding_obj_obj(semester_list,'fk_semester_id','id',vm.semester_list.$model,{
                                    fk_semester_id:0,
                                    sub_list:[]
                                });
                                semester_list = padding_f(semester_list,vm.semester_list.$model,'semester_name','semester_name');
                                semester_list = sort_by(semester_list,'+semester_name');
                                ret.city_cnt[0].semester_list = semester_list;
                                ret.city_cnt[0].semester_list.forEach(function (data, index) {
                                    data.sub_list = padding(data.sub_list,'zb_mc',vm.city_headers.$model,default_sub_item);
                                    // data.sub_list = padding_f(data.sub_list,vm.semester_list.$model,'fk_semester_id','id');
                                });
                                if(ret.city_cnt[0].sub_list.length>0){
                                    vm.has_data.city = 1;
                                }
                                vm.city_analyze_list = ret.city_cnt;
                            }
                            if(ret.district_cnt&&ret.district_cnt.length>0){
                                var district_hea = abstract(ret.district_cnt,'sub_list');
                                district_hea = concat(district_hea);
                                district_hea = abstract(district_hea,'zb_mc');
                                vm.district_headers = unique(district_hea);
                                ret.district_cnt.forEach(function (data,index) {
                                    data.semester_list = vm.to_Two_structure(data.sub_list,'fk_semester_id');
                                    data.semester_list = padding_obj_obj(data.semester_list,'fk_semester_id','id',vm.semester_list.$model,{
                                        fk_semester_id:0,
                                        sub_list:[]
                                    });
                                    data.semester_list = padding_f(data.semester_list,vm.semester_list.$model,'semester_name','semester_name');
                                    data.semester_list = sort_by(data.semester_list,'semester_name');
                                    data.semester_list.forEach(function (item) {
                                        item.sub_list = padding(item.sub_list,'zb_mc',vm.district_headers.$model,default_sub_item);
                                    });
                                    if(data.district_name==vm.area_list[vm.form.area_index].district){
                                        if(data.sub_list.length>0){
                                            vm.has_data.district = 1;
                                        }
                                    }
                                });
                                vm.district_analyze_list = ret.district_cnt;
                            }
                            if(ret.school_cnt&&ret.school_cnt.length>0){
                                var school_header = abstract(ret.school_cnt,'sub_list');
                                school_header = concat(school_header);
                                school_header = abstract(school_header,'zb_mc');
                                vm.school_headers = unique(school_header);
                                ret.school_cnt.forEach(function (data,index) {
                                    data.semester_list = vm.to_Two_structure(data.sub_list,'fk_semester_id');
                                    data.semester_list = padding_obj_obj(data.semester_list,'fk_semester_id','id',vm.semester_list.$model,{
                                        fk_semester_id:0,
                                        sub_list:[]
                                    });
                                    data.semester_list = padding_f(data.semester_list,vm.semester_list.$model,'semester_name','semester_name');
                                    data.semester_list = sort_by(data.semester_list,'semester_name');
                                    data.semester_list.forEach(function (item) {
                                        item.sub_list = padding(item.sub_list,'zb_mc',vm.school_headers.$model,default_sub_item);
                                    });
                                    if(data.fk_school_id==vm.school_list[vm.form.school_index].id){
                                        if(data.sub_list.length>0){
                                            vm.has_data.school = 1;
                                        }
                                    }
                                });
                                vm.school_analyze_list = ret.school_cnt;
                            }
                            if(ret.school_class_cnt&&ret.school_class_cnt.length>0){
                                var class_header = abstract(ret.school_class_cnt,'sub_list');
                                class_header = concat(class_header);
                                class_header = abstract(class_header,'zb_mc');
                                vm.class_headers = unique(class_header);
                                ret.school_class_cnt.forEach(function (data,index) {
                                    data.semester_list = vm.to_Two_structure(data.sub_list,'fk_semester_id');
                                    data.semester_list = padding_obj_obj(data.semester_list,'fk_semester_id','id',vm.semester_list.$model,{
                                        fk_semester_id:0,
                                        sub_list:[]
                                    });
                                    data.semester_list = padding_f(data.semester_list,vm.semester_list.$model,'semester_name','semester_name');
                                    data.semester_list = sort_by(data.semester_list,'semester_name');
                                    data.semester_list.forEach(function (item) {
                                        item.sub_list = padding(item.sub_list,'zb_mc',vm.class_headers.$model,default_sub_item);
                                    });
                                    data.semester_list.forEach(function (item) {
                                        item.sub_list = padding(item.sub_list,'zb_mc',vm.class_headers.$model,default_sub_item);
                                    });
                                    if(data.fk_class_id==vm.class_list[vm.form.class_index].id){
                                        if(data.sub_list.length>0){
                                            vm.has_data.class = 1;
                                        }
                                    }
                                });
                                vm.class_analyze_list = ret.school_class_cnt;
                            }
                        }
                        if(!is_suc){
                            toastr.error(msg)
                        }
                        console.log(11111111111111111111);
                        console.log(ret)
                    })
                },
                // 保留一位小数四舍五入
                ceil:function (num) {
                    return (Math.round(num*10)/10).toFixed(1);
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
                init11111: function () {
                    if(module_type==4){
                        this.tit = '综合实践活动';
                    }else if(module_type==3){
                        this.tit = '获奖情况';
                    }else if(module_type==8){
                        this.tit = '日常表现与个性特长';
                    }
                    this.html_display = sta_type;
                    if(cloud.is_city_leader()||cloud.is_district_leader()){
                        this.grade_list = sort_by(cloud.grade_all_list(), ["+name"]);
                    }else if(cloud.is_school_leader()){
                        this.grade_list = sort_by(cloud.school_to_grade(), ["+name"]);
                    }
                    this.school_id = cloud.user_user().fk_school_id;
                    var user_city = cloud.user_city();
                    if(cloud.is_city_leader()){
                        var area_list = cloud.area_list();
                        area_list.unshift({
                            district:user_city,
                            id:vm.school_id
                        });
                        vm.area_list = area_list;
                    }
                    if(cloud.is_city_leader()||cloud.is_district_leader()){
                        var school_list = cloud.school_list();
                        school_list.unshift({
                            schoolname:'全部',
                            id:this.school_id
                        })
                        vm.school_list = school_list;
                    }else if(cloud.is_school_leader()){
                        vm.school_list.push({
                            schoolname:'全部',
                            id:this.school_id
                        });
                        var class_list = cloud.find_class_simple({
                            fk_grade_id:Number(vm.grade_list[vm.form.grade_index].value),
                            fk_school_id:vm.school_list[vm.form.school_index].id
                        });
                        if(class_list.length<=0){
                            return;
                        }
                        this.class_list = class_list;
                        class_list = JSON.parse(JSON.stringify(class_list));
                        class_list.unshift({
                            id:-1,
                            class_name:'全部'
                        })
                        this.class_list_all = class_list;
                    }
                    vm.grade_change();
                    this.query()

                },
                find_semester_name:function (id) {
                    for(var i=0;i<this.semester_list.length;i++){
                        if(id==this.semester_list.$model[i].id){
                            return this.semester_list[i].semester_name;
                        }
                    }
                    return '';
                },
                //等级，维度，要素切换
                presentation_change:function (num) {
                    var dis = num;
                    switch (dis){
                        case 1:
                            switch (module_type){
                                case '3':
                                    this.to_page('daily_portrait_award');
                                    break;
                                case '4':
                                    this.to_page('daily_portrait_practice');
                                    break;
                                case '8':
                                    this.to_page('daily_portrait_special');
                                    break;
                            }
                            break;
                        case 2:
                            this.to_page('daily_vertical_ana?sta_type=2&module_type='+module_type);
                            break;
                        case 3:
                            this.to_page('daily_vertical_ana?sta_type=3&module_type='+module_type);
                            break;
                        default:
                            break;
                    }
                },
                to_page:function (url) {
                    window.location.href = '#' + url;
                },
            });
            vm.init();
            return vm;
        };
        return {
            repaint:true,
            view: html,
            define: avalon_define
        }
    });