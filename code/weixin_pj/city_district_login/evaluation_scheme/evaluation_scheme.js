/**
 * Created by Administrator on 2018/5/24.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'city_district_login/evaluation_scheme/evaluation_scheme', 'html!'),
        C.Co('weixin_pj', 'city_district_login/evaluation_scheme/evaluation_scheme', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        "select2"
    ],
    function ($,avalon, layer, html, css, data_center, select_assembly, select2) {
        var avalon_define = function (args) {
            var mod = args.mod;
            //评价方案-民主评价
            var api_democratic_eval = api.api+'Indexmaintain/find_democratic_eval_list';
            //个性特长列表
            var api_personality = api.api+'GrowthRecordBag/find_personality_set_list';
            var grade_list = [], area_list = [], school_list = [];
            var vm = avalon.define({
                $id: "evaluation_scheme",
                mod: mod,
                head_value: {grade: "请选择年级", area: "请选择区县"},
                grade_list: [],
                grade_info:'',
                area_list: [],
                area_info:'',
                school_list: [],
                school_info:'',
                first_index_list: [],
                //民主评议
                mzpy_list:[],
                rcbx_list: [],
                zthd_list: [],
                bzxcg_list: [],
                //个性特长
                gxtc_list:[],
                checked_first_index: 0,
                fm: {
                    // 当前区
                    district: "", district_id: "",
                    // 当前学校
                    school: "",
                },
                form_rcpj: {
                    // 适用年级
                    synj: "",
                    // 指标ID
                    yjzb_id: "",
                    // 指标名称
                    zbmc: "",
                    // 创建人单位ID
                    cjrdw_id: ""
                },
                //民主评议
                form_mzpj:{
                    //单位等级	string	1:省级;2:市州级;3:区县级;4:校级
                    department_level:'',
                    //年级id	number
                    index_gradeid:'',
                    //评价维度id	number
                    index_parentid:'',
                    //单位id	number
                    index_workid:'',
                },
                //个性特长
                form_gxtc:{
                    fk_realistic_moduletid:'',
                    fk_yjzb_id:'',
                },
                is_nor_user:true,
                user_type:'',
                user_level: '',
                //页面刷新或者初次进来:true-是 false-不是
                first_in:true,
                init: function () {
                    setTimeout(function () {
                        vm.user_type = cloud.user_type();
                        vm.user_level = cloud.user_level();
                        grade_list = cloud.auto_grade_list({});
                        vm.is_nor_user = vm.user_level >= 4 && vm.user_level <= 7;
                        vm.grade_list = any_2_select(grade_list, {name: "grade_name", value: ["id"]});
                        $("#school_select").select2();
                        $("#school_select").on("select2:select", vm.change_school);

                        if (mod == 1 &&!vm.is_nor_user) {
                            // 一市一方案
                            vm.form_rcpj.cjrdw_id = cloud.user_depart_id();
                            vm.form_mzpj.index_workid = cloud.user_depart_id();
                            vm.form_mzpj.department_level = '2';
                        }

                        if (mod >= 2&&!vm.is_nor_user) {
                            // 一区一方案
                            area_list = cloud.area_list();
                            vm.area_list = any_2_select(area_list, {name: "district", value: ["id"]});
                            vm.area_info =  vm.area_list[0].name + '|' + vm.area_list[0].value + '|' + '0';
                            vm.change_area();
                            if (vm.user_level == 3 && mod == 2) {//登陆者为区县管理员
                                vm.form_rcpj.cjrdw_id = cloud.user_depart_id();
                                vm.form_mzpj.index_workid = cloud.user_depart_id();
                                vm.form_mzpj.department_level = '3';
                            }
                        }


                        if (mod >= 3) {
                            if (!cloud.is_school_user()){
                                if(cloud.is_city_leader()){//市
                                    vm.form_mzpj.department_level = '2';
                                }else if(cloud.is_district_leader()){//区县
                                    vm.form_mzpj.department_level = '3';
                                }else if(cloud.is_student() || cloud.is_teacher()){//教师、学生、家长
                                    vm.form_mzpj.department_level = '4';
                                    if(vm.user_type != 3){
                                        vm.form_rcpj.cjrdw_id = cloud.user_school_id();
                                        vm.form_mzpj.index_workid = cloud.user_school_id();
                                    }else{
                                        vm.form_rcpj.cjrdw_id = cloud.user_user().student.fk_school_id;
                                        vm.form_mzpj.index_workid = cloud.user_user().student.fk_school_id;
                                    }
                                }
                                if(!cloud.is_student() && !cloud.is_teacher()){
                                    vm.query_school();
                                }
                            }else {
                                vm.form_rcpj.cjrdw_id = cloud.user_depart_id();
                                vm.form_mzpj.index_workid = cloud.user_depart_id();
                                vm.form_mzpj.department_level = '4';
                            }

                        }
                        if(vm.user_type == 3){
                            vm.first_index_list = cloud.index_list_xz({index_workid:vm.form_mzpj.index_workid});
                        }else{
                            vm.first_index_list = cloud.index_list_xz({});
                        }
                        vm.first_index_list.reverse();
                        var ts_list = cloud.index_list_ts({index_rank: 1,index_workid:vm.form_mzpj.index_workid});
                        if(ts_list){
                            ts_list.forEach(function (data) {
                                var ft = base_filter(vm.first_index_list.$model, "index_name", data.index_name);
                                if(ft.length==0)
                                    vm.first_index_list.push(data);
                            });
                        }

                        //vm.first_index_list.pushArray(cloud.index_list_ts({index_rank: 1}));
                        vm.grade_info = '0' + '|' + vm.grade_list[0].value;
                        vm.change_grade();
                        // vm.click_first_index(0, vm.first_index_list[0]);
                    }, 0);
                },
                //str转parseFloat
                str_float:function(str){
                    if (!str || str == 'undefined' || str=='null'){
                        return 0;
                    }
                    return parseFloat(str);
                },
                str_json:function (data) {
                  return JSON.stringify(data)
                },
                //一级指标切换
                click_first_index: function (idx, el) {
                    this.checked_first_index = idx;
                    this.form_rcpj.zbmc = el.index_name;
                    this.form_rcpj.yjzb_id = el.id;
                    this.form_mzpj.index_parentid = el.id;
                    this.form_gxtc.fk_yjzb_id = el.id;
                    this.query_mzpy();
                    this.query_rcpj();
                    this.query_zthd();
                    this.query_bzxcg();
                    this.query_gxtc();
                },
                query_school: function (ind) {
                    school_list = cloud.school_list({district: vm.fm.district});
                    vm.school_list = school_list;
                    // console.log( vm.school_list);
                    vm.form_rcpj.cjrdw_id = vm.school_list[0].id;
                    vm.form_mzpj.index_workid = vm.school_list[0].id;
                    if(ind == -1){
                        this.query_mzpy();
                        this.query_rcpj();
                        this.query_zthd();
                        this.query_bzxcg();
                        this.query_gxtc();
                    }
                    $("#school_select").select2();
                },
                change_school: function () {
                    var school_index = this.school_info;
                    // var school_index = Number(e.target.value);
                    vm.fm.school = school_list[school_index].id;
                    if (mod == 3) {
                        vm.form_rcpj.cjrdw_id = vm.fm.school;
                        vm.form_mzpj.index_workid = vm.fm.school;
                    }
                    this.query_mzpy();
                    this.query_rcpj();
                    this.query_zthd();
                    this.query_bzxcg();
                    this.query_gxtc();
                },
                change_area: function () {
                    var info = this.area_info.split('|');
                    vm.fm.district_id = info[1];
                    vm.fm.district = info[0];
                    var index = info[2];
                    data_center.scope("eva_sch_opt_area", function (p) {
                        p.head_value = info[0];
                    });

                    if (mod == 2 && vm.user_level != 3) {//市级用户才能看到，user_level:3-区县
                        vm.form_rcpj.cjrdw_id = vm.fm.district_id;
                        vm.form_mzpj.index_workid = vm.fm.district_id;
                        vm.form_mzpj.department_level = '2';
                        if(index != -1){
                            this.query_mzpy();
                            this.query_rcpj();
                            this.query_zthd();
                            this.query_bzxcg();
                            this.query_gxtc();
                        }
                    } else {
                        if(index != -1){
                            vm.query_school(-1);
                        }
                    }
                },
                //年级转换成7,8,9
                grade_trans:function(name){
                  if(name == '七年级'){
                      return 7;
                  }else if(name == '八年级'){
                      return 8;
                  }else if(name == '九年级'){
                      return 9
                  }
                },
                //年级改变
                change_grade: function () {
                    // console.log(this.grade_info);
                    var info = this.grade_info.split('|');
                    var index = info[0];
                    data_center.scope("eva_sch_opt_grade", function (p) {
                        p.head_value = value.name;
                    });
                    if (grade_list[index].hasOwnProperty("remark")){
                        this.form_rcpj.synj = grade_list[index].remark;
                        this.form_mzpj.index_gradeid = this.grade_trans(grade_list[index].remark);
                    }else{
                        this.form_rcpj.synj = grade_list[index].detail.remark;
                        this.form_mzpj.index_gradeid = this.grade_trans(grade_list[index].detail.remark);
                    }
                    //指标
                    vm.click_first_index(0, vm.first_index_list[0]);

                },
                //查询民主评议
                query_mzpy:function(){
                    cloud.detail_mzpy(this.form_mzpj.$model, function (url, args, data) {
                        if (!data || data.length == 0) {
                            vm.mzpy_list = [{kcyd: "暂无数据", no_info: 1}]
                        } else {
                            vm.mzpy_list = data;
                        }
                    });
                },
                //查询日常评价
                query_rcpj: function () {
                    cloud.detail_rcpj(this.form_rcpj.$model, function (url, args, data) {
                        if (!data || data.length == 0) {
                            vm.rcbx_list = [{kcyd: "暂无数据", no_info: 1}]
                        } else {
                            vm.rcbx_list = data;
                        }
                    });
                },
                //综合实践活动
                query_zthd: function () {
                    // 阶段性评价详情-主题 活动
                    cloud.detail_zthd(this.form_rcpj.$model, function (url, args, data) {
                        if(!data) return;
                        vm.zthd_list = data;
                    });
                },
                query_bzxcg: function () {
                    //阶段性评价详情-标志性成果
                    cloud.detail_bzxcg(this.form_rcpj.$model, function (url, args, data) {
                        if(!data) return;
                        vm.bzxcg_list = data;
                    });
                },
                //    查询个性特长
                query_gxtc:function(){
                    // //评价方案--个性特长
                    cloud.detail_gxtc(this.form_gxtc.$model, function (url, args, data) {
                        if(!data) return;
                        vm.gxtc_list = data;
                    });
                },
            });

            vm.$watch("onReady", function () {
                vm.init();
                // $("#school_select").select2();
                // $("#school_select").on("select2:select", vm.change_school);
                // $("#school_select").select2();
                // //部门负责人
                // $("#school_select").on("change", function (e) {
                //     vm.change_school();
                // });
            })

            //vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define,
            repaint:true,
        }
    });
