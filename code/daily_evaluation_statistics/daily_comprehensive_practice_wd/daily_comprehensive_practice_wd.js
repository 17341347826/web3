define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_evaluation_statistics', 'daily_comprehensive_practice_wd/daily_comprehensive_practice_wd', 'html!'),
        C.Co('daily_evaluation_statistics', 'daily_comprehensive_practice_wd/daily_comprehensive_practice_wd', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {
        var avalon_define = function (arg) {
            var sta_type = arg.sta_type;
            var module_type = arg.module_type;
            var vm = avalon.define({
                $id: "daily_comprehensive_practice",
                html_display:0,
                page_arr:{
                    'not_school':['daily_target','daily_award','daily_comprehensive_practice','daily_special'],
                    'school':['daily_target_school','daily_award_school','daily_practice_school','daily_special_school']
                },
                fk_semester_name:'',
                semester_list:[],
                grade_list:[],
                grade_list_all:[],
                tit:'',
                grade_item:{
                    name: '全部',
                    value: -1
                },
                city_headers:[],
                city_analyze_list:[],
                //  区县维度头
                district_headers:[],
                district_analyze_list:[],

                school_headers:[],
                school_analyze_list:[],

                class_headers:[],
                class_analyze_list:[],

                form:{
                    fk_semester_id:0,
                    module_type:module_type,
                    sta_type:sta_type
                },
                school_p: {
                    grade_ids: [],//年级
                    district_name: "",//区县
                    fk_school_id: "",//学校
                    school_name: '',//学校名称
                },
                count:count,
                filter_undefined:filter_undefined,
                filter_school: make_filter(function (line) {
                    if (
                        (vm.school_p.grade_ids.indexOf("" + line.detail.grade_id) >= 0 || vm.school_p.grade_ids.length == 0)
                        &&
                        (line.district == vm.school_p.district_name || vm.school_p.district_name == "")
                        &&
                        (line.schoolname.indexOf(vm.school_p.school_name) >= 0 || vm.school_p.school_name == "")

                    ) {
                        return true;
                    }
                    return false;
                }),

                to_page:function (url) {
                    window.location.href = '#'+url;
                },
                // 保留一位小数四舍五入
                ceil:function (num) {
                    return (Math.round(num*10)/10).toFixed(1);
                },
                // 年级id转化为年级name
                to_grade_name:function (id) {
                    for(var i = 0;i<this.grade_list.length;i++){
                        if(this.grade_list[i].value == id){
                            return this.grade_list[i].name;
                        }
                    }
                    return '';
                },
                pages:[],
                init: function () {
                    if(module_type==4){
                        this.tit = '综合实践活动';
                    }else if(module_type==3){
                        this.tit = '获奖情况';
                    }else if(module_type==8){
                        this.tit = '日常表现与个性特长';
                    }
                    this.pages = this.page_arr[arg.page]
                    this.html_display = sta_type;
                    this.semester_list = cloud.semester_all_list();
                    this.fk_semester_name = this.semester_list[0].name;
                    this.form.fk_semester_id = Number(this.semester_list[0].value.split("|")[0]);
                    this.grade_list = cloud.grade_all_list();
                    var obj = {
                        name: '全部',
                        value: -1
                    };
                    if(this.grade_list.length<=0){
                        this.grade_list_all.push(obj);
                        return;
                    }
                    var list = JSON.parse(JSON.stringify(this.grade_list.$model));
                    list.unshift(obj);
                    this.grade_list_all = list;
                    this.query();
                },
                // select 选择的条件
                sel_change_semester: function (el) {
                    var sem_id = Number(el.value.split("|")[0]);
                    this.form.fk_semester_id = sem_id;
                    this.query();
                },
                sel_change_grade: function (el) {
                    var arr = new Array();
                    this.grade_item.value = Number(el.value);
                    this.grade_item.name = el.name;
                    if(el==''){
                        this.school_p.grade_ids = '';
                    }else {
                        arr.push(el.value)
                        this.school_p.grade_ids = arr;
                    }
                },
                get_default: function (c_data) {
                    var obj = [];
                    for (var key in c_data) {
                        obj[key] = 0;
                        if (key == 'sub_list') {
                            obj[key] = [];
                            for (var i = 0; i < c_data[key].length; i++) {
                                var jbmc = c_data[key][i].jbmc;
                                var sub_obj = {};
                                sub_obj.jbmc = jbmc;
                                sub_obj.rj_cl = 0;
                                obj[key].push(sub_obj);
                            }
                        }
                    }
                    return obj;
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
                deal_cnt: function (cnt) {
                    var arr = []
                    for (var i = 0; i < cnt.length; i++) {
                        for (var j = 0; j < cnt[i].sub_list.length; j++) {
                            sort_by(cnt[i].sub_list, ['+zb_mc'])
                            var jbmc = cnt[i].sub_list[j].zb_mc;
                            if (arr.indexOf(jbmc) == -1) {
                                arr.push(jbmc);
                            }
                        }
                    }
                    arr.sort();
                    for (var i = 0; i < cnt.length; i++) {
                        cnt[i].sub_list = sort_by(cnt[i].sub_list,'zb_mc');
                        if (cnt[i].sub_list.length < arr.length) {
                            var sub_list = cnt[i].sub_list;

                            for (var k = 0; k < arr.length; k++) {
                                var key = arr[k];
                                var obj = {
                                    zb_mc: key,
                                    zb_pjf: 0,
                                    rs:0,
                                    fk_semester_id:-1
                                }
                                if (!sub_list[k] || sub_list[k].zb_mc != key) {
                                    cnt[i].sub_list.splice(k, 0, obj)
                                }
                            }
                        }
                    }
                    return cnt;
                },
                sublist:[],
                sublist_count:0,
                query:function () {
                    cloud.rcpj_hx_wd(this.form.$model, function (url, args, ret, is_suc, msg) {
                        var default_sub_item = {rs: "", zb_pjf: "0", zb_mc: "0", fk_semester_id: ""};
                        vm.district_headers.clear();
                        vm.school_headers.clear();
                        vm.class_headers.clear();
                        vm.district_analyze_list.clear();
                        vm.school_analyze_list.clear();
                        vm.class_analyze_list.clear();
                        if(ret){
                            //抽离市数据
                            if(ret.city_cnt&&ret.city_cnt.length>0){
                                var city_zb = abstract(ret.city_cnt,'sub_list');
                                city_zb = concat(city_zb);
                                city_zb = abstract(city_zb,'zb_mc');
                                vm.city_headers = unique(city_zb);
                                if(vm.city_headers.length>0){
                                    ret.city_cnt = padding_obj_obj(ret.city_cnt,'fk_grade_id','value',vm.grade_list.$model,{
                                        fk_grade_id:0,
                                        sub_list:[]
                                    });
                                    ret.city_cnt = padding_f(ret.city_cnt,vm.grade_list.$model,'fk_grade_id','value');
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
                                        data.sub_list = padding_obj_obj(data.sub_list,'fk_grade_id','value',vm.grade_list.$model,{
                                            fk_grade_id:0,
                                            sub_list:[],
                                        })
                                        data.sub_list = padding_f(data.sub_list, vm.grade_list.$model, 'fk_grade_id','value');
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
                                var cnt = vm.deal_cnt(ret.school_cnt)
                                var student = cloud.student_count_in_semester({
                                    dj: 4,
                                    fk_xq_id: vm.form.fk_semester_id
                                });
                                var obj = vm.get_default(cnt[0]);
                                student = merge_table(student, ["school_id", "grade_id"], cnt, ["fk_school_id", "fk_grade_id"], "school_cnt", obj);
                                vm.sublist = JSON.parse(JSON.stringify(student[0].school_cnt.sub_list));
                                vm.sublist_count = vm.sublist.length;
                                var arr = [];
                                for(var i=0;i<student.length;i++){
                                    if(arr.indexOf(student[i].grade_name)==-1){
                                        arr.push(student[i].grade_name)
                                    }
                                }
                                var new_cnt = complate_data(student,['district','school_id','schoolname'],'grade_name',arr,0);
                                sort_by(new_cnt, ["+district", "+school_id", "+status"]);
                                vm.school_analyze_list = new_cnt;
                            }


                            // 抽离班级数据
                            if(ret.school_class_cnt&&ret.school_class_cnt.length>0){
                                var cls_zb = abstract(ret.school_class_cnt, "sub_list");
                                cls_zb = concat(cls_zb);
                                cls_zb = abstract(cls_zb, "zb_mc");
                                vm.class_headers = unique(cls_zb);
                                ret.school_class_cnt = vm.to_Two_structure(ret.school_class_cnt,'fk_grade_id');
                                ret.school_class_cnt = padding_obj_obj(ret.school_class_cnt,'fk_grade_id','value',vm.grade_list.$model,{
                                    fk_grade_id:0,
                                    sub_list:[],
                                });
                                ret.school_class_cnt = padding_f(ret.school_class_cnt,vm.grade_list.$model,'fk_grade_id','value');
                                var cut = 0;
                                var class_list = ret.school_class_cnt;
                                ret.school_class_cnt.forEach(function (data) {
                                    if(data&&data.sub_list){
                                        cloud.sem_class_list({fk_nj_id:Number(data.fk_grade_id),fk_xq_id:vm.form.fk_semester_id},function (url, args, ret, is_suc, msg) {
                                            cut++;
                                            if(is_suc){
                                                data.class_list = ret.list;
                                                data.sub_list = padding_obj_obj(data.sub_list,'fk_class_id','fk_bj_id',data.class_list,{
                                                    'fk_class_id':0,
                                                    sub_list:[]
                                                });
                                                data.sub_list = padding_f(data.sub_list,data.class_list,'class_name','bjmc');
                                                data.sub_list = padding_f(data.sub_list,data.class_list,'fk_class_id','fk_bj_id');
                                                data.sub_list.forEach(function (item, ind) {
                                                    item.sub_list = padding(item.sub_list,'zb_mc',vm.class_headers.$model,default_sub_item)
                                                })
                                            }
                                            if(cut == class_list.length){
                                                vm.class_analyze_list = class_list;
                                            }
                                        })
                                    }
                                });
                            }

                        }
                        if(!is_suc){
                            toastr.error(msg)
                        }
                    });
                },
                grade_is_checked:function (id) {
                    if(this.grade_item.value==-1){
                        return true;
                    }else {
                        if(this.grade_item.value==id){
                            return true;
                        }else {
                            return false;
                        }
                    }
                },

                //等级，维度，要素切换
                presentation_change:function (num) {
                    var dis = num;
                    switch (dis){
                        case 1:
                            switch (module_type){
                                case '3':
                                    this.to_page(this.pages[1]);
                                    break;
                                case '4':
                                    this.to_page(this.pages[2]);
                                    break;
                                case '8':
                                    this.to_page(this.pages[3]);
                                    break;
                            }
                            break;
                        case 2:
                            this.to_page('daily_comprehensive_practice_wd?sta_type=2&module_type='+module_type+'&page='+arg.page);
                            break;
                        case 3:
                            this.to_page('daily_comprehensive_practice_ys?sta_type=3&module_type='+module_type+'&page='+arg.page);
                            break;
                        default:
                            break;
                    }
                },
            });
            // vm.$watch('onReady', function () {
                // require(['/Growth/code/evaluation_supervision/e_s_public.js'], function () {
                //     vm.init();
                // })
            // });
            vm.init();
            return vm;
        };
        return {
            repaint:true,
            view: html,
            define: avalon_define
        }
    });
