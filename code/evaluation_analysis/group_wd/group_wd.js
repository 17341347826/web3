define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_analysis', 'group_wd/group_wd','html!'),
        C.Co('evaluation_analysis', 'group_wd/group_wd','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {
        var msg_api = api.api + "GrowthRecordBag/every_day_comprehensive_practical_activities";
        var user = {};
        var avalon_define = function (arg) {
            var sta_type = arg.sta_type;
            var vm = avalon.define({
                $id: "group_wd",

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

                sta_type:sta_type,
                form:{
                  grade_index:0,
                  semester_index:0
                },
                to_page:function (type) {
                    switch (type){
                        case 1:
                            window.location.href = '#co_analysis';
                            break;
                        case 2:
                            window.location.href = '#group_wd?sta_type=2';
                            break;
                        case 3:
                            window.location.href = '#group_ys?sta_type=3';
                            break;
                    }
                },
                init: function () {
                    this.sta_type = sta_type;
                    this.grade_list = cloud.grade_all_list();
                    this.semester_list = sort_by(cloud.grade_semester_list({
                        grade_id:Number(this.grade_list[this.form.grade_index].value)
                    }), ["-semester_name"]);
                    this.query();
                },
                // select 选择的条件
                semester_change: function (el) {
                    console.log(11)
                    this.query();
                },
                grade_change: function () {
                    this.form.semester_index = 0;
                    this.semester_list.clear();
                    vm.semester_list = sort_by(cloud.grade_semester_list({
                        grade_id:vm.grade_list[vm.form.grade_index].value
                    }), ["-semester_name"]);
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
                    var obj = {
                        fk_grade_id:this.grade_list[this.form.grade_index].value,
                        fk_semester_id:this.semester_list[this.form.semester_index].id,
                        sta_type:sta_type,
                        sta_mode:3
                    };
                    cloud.xqpj_qt_wd(obj, function (url, args, ret, is_suc, msg) {
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
