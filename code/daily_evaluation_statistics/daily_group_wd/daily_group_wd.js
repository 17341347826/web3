define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_evaluation_statistics', 'daily_group_wd/daily_group_wd', 'html!'),
        C.Co('daily_evaluation_statistics', 'daily_group_wd/daily_group_wd', 'css!'),
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

                fk_semester_name:'',
                semester_list:[],
                grade_list:[],
                tit:'',
                //
                district_headers:[],
                zsqk_list:[],

                school_headers:[],
                sex_list:[],

                class_headers:[],
                class_analyze_list:[],

                form:{
                    fk_grade_id:0,
                    fk_semester_id:0,
                    module_type:module_type,
                    sta_type:sta_type,
                    sta_mode:3
                },
                to_page:function (url) {
                    window.location.href = '#'+url;
                },
                init: function () {
                    if(module_type==4){
                        this.tit = '综合实践活动分析';
                    }else if(module_type==3){
                        this.tit = '获奖情况分析';
                    }else if(module_type==8){
                        this.tit = '日常表现与个性特长分析';
                    }
                    this.html_display = sta_type;
                    this.semester_list = cloud.semester_all_list();
                    this.fk_semester_name = this.semester_list[0].name;
                    this.form.fk_semester_id = Number(this.semester_list[0].value.split("|")[0]);
                    this.grade_list = cloud.grade_all_list();
                    this.form.grade_name = this.grade_list[0].name;
                    this.form.fk_grade_id = Number(this.grade_list[0].value);
                    console.log(this.form.$model);
                    this.query();
                },
                // select 选择的条件
                sel_change_semester: function (el) {
                    var ary_sem = el.value.split("|");
                    var sem_id = Number(el.value.split("|")[0]);
                    this.form.fk_semester_id = sem_id;
                    this.query();
                },
                sel_change_grade: function (el) {
                    this.form.fk_grade_id = Number(el.value);
                    this.form.grade_name = el.name;
                    this.query();
                },
                // 一维数组组装为二维结构
                to_Two_structure:function (src, key) {
                    var re = [];
                    if(src.hasOwnProperty('length')){
                        src.forEach(function (item) {
                            var flag = false;
                            if(item){
                                for(var i = 0;i<re.length;i++){
                                    if(re[i]['type']===item[key]){
                                        flag = true;
                                        re[i]['sub_list'].push(item);
                                    }
                                }
                                if(!flag){
                                    re.push({sub_list:[]});
                                    re[re.length-1]['type'] = item[key];
                                    re[re.length-1]['sub_list'].push(item);
                                }
                            }
                        })
                    }
                    return re;
                },
                query:function () {
                    cloud.rcpj_qt_wd(this.form.$model, function (url, args, ret, is_suc, msg) {
                        var default_sub_item = {rs: "", zb_pjf: "0", zb_mc: "0", fk_semester_id: ""};
                        vm.zsqk_list.clear();
                        vm.sex_list.clear();
                        if(ret){
                            var zsqk = abstract(ret.zsqk_list,'zb_mc');
                            vm.zsqk_headers = unique(zsqk);
                            zsqk = vm.to_Two_structure(ret.zsqk_list,'zsqk');
                            zsqk.forEach(function (item) {
                                item['sub_list'] = padding(item.sub_list,'zb_mc',vm.zsqk_headers,default_sub_item);
                            })
                            vm.zsqk_list = zsqk;
                            var sex_list = abstract(ret.sex_list,'zb_mc');
                            vm.sex_headers = unique(sex_list);
                            sex_list = vm.to_Two_structure(ret.sex_list,'stu_sex');
                            sex_list.forEach(function (item) {
                                item['sub_list'] = padding(item.sub_list,'zb_mc',vm.sex_headers,default_sub_item);
                            })
                            vm.sex_list = sex_list;
                        }
                        if(!is_suc){
                            toastr.error(msg)
                        }
                    });
                },
                //等级，维度，要素切换
                presentation_change:function (num) {
                    var dis = num;
                    switch (dis){
                        case 1:
                            switch (module_type){
                                case '3':
                                    this.to_page('daily_group_award');
                                    break;
                                case '4':
                                    this.to_page('daily_group_practice');
                                    break;
                                case '8':
                                    this.to_page('daily_group_special');
                                    break;
                            }
                            break;
                        case 2:
                            this.to_page('daily_group_wd?sta_type=2&module_type='+module_type);
                            break;
                        case 3:
                            this.to_page('daily_group_ys?sta_type=3&module_type='+module_type);
                            break;
                        default:
                            break;
                    }
                },
                // 保留一位小数四舍五入
                ceil:function (num) {
                    return (Math.round(num*10)/10).toFixed(1);
                }
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
