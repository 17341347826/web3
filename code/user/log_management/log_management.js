/**
 * Created by Administrator on 2018/6/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('user', 'log_management/log_management','html!'),
        C.Co('user', 'log_management/log_management','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        C.CM("table")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,three_menu_module,table) {
        var api_check_log = api.api + "log/list_log";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "log_management",
                url:api_check_log,
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                is_init: false,
                // 列表表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "区县",
                    type: "text",
                    from: "district"
                }, {
                    title: "学校",
                    type: "text",
                    from: "school"
                }, {
                    title: "年级",
                    type: "text",
                    from: "grade"
                }, {
                    title: "班级",
                    type: "text",
                    from: "clazz"
                }, {
                    title: "操作用户帐号",
                    type: "text",
                    from: "account"
                }, {
                    title: "操作用户姓名",
                    type: "text",
                    from: "name"
                }, {
                    title: "操作类型",
                    type: "cover_text",
                    from: "opt_type",
                    dict: {
                        add: '增加',
                        del: '删除',
                        edit: '修改',
                        check: '查看',
                        export: '导出',
                        audite: '审核'
                    }
                }, {
                    title: "操作内容",
                    type: "text",
                    from: "content"
                }, {
                    title: "IP地址",
                    type: "text",
                    from: "ip"
                }, {
                    title: "操作时间",
                    type: "text",
                    from: "join"
                }, {
                    title: "影响用户姓名",
                    type: "text",
                    from: "act_name"
                }, {
                    title: "影响用户帐号",
                    type: "text",
                    from: "act_account"
                }],
                login_level:"",
                head_value:{
                    area:"",
                    school:"",
                    grade:"",
                    class:"",
                    type:""
                },
                area_list:[],
                school_list:[],
                grade_list:[],
                class_list:[],
                type_list:[],
                data_list:[],
                extend:{
                    account:"",//操作者账号
                    act_account:"",//被操作者账号
                    act_name:"",//被操作者名称
                    name:"",//操作者名称
                    district_id:"",
                    school_id:"",
                    grade_id:"",
                    class_id:"",
                    opt_type:"",
                    time_start:"",
                    time_end:"",
                    project_id:1,
                    __hash__: ""
                },
                fill_do:"",
                fill_did:"",
                init: function () {
                    vm.type_list = [
                        {name:"全部",value:''},
                        {name:"增加",value:'add'},
                        {name:"删除",value:'del'},
                        {name:"修改",value:'edit'},
                        {name:"查看",value:'check'},
                        {name:"导出",value:'export'}
                    ];
                    var level = cloud.user_level();
                    vm.login_level = level;
                    if(level == 4){
                        var auto_grade_list = cloud.auto_grade_list();
                        auto_grade_list = [{grade_name:'全部', grade_id:''}].concat(auto_grade_list);
                        vm.grade_list = any_2_select(auto_grade_list, {name:"grade_name", value:["grade_id"]});
                        var districtObj = cloud.school_user_distict_id();
                        vm.extend.district_id = districtObj.district_id;
                        vm.extend.school_id = cloud.user_school_id();
                    }else{
                        var school_list = [];
                        if(level == 2){
                            var area_list = cloud.sel_area_list();
                            area_list.unshift({name:"全部",value:""});
                            vm.area_list = area_list;
                            school_list = cloud.sel_school_list();
                            school_list.unshift({name:"全部",value:""});
                            vm.school_list = school_list;
                            // var city = cloud.user_city();
                            // vm.class_list = cloud.class_all_list({city:city});
                        }else if(level == 3){
                            var district = cloud.user_district();
                            var district_id = cloud.user_school_id();
                            vm.school(district,district_id);
                        }
                        var grade_all_list = cloud.grade_all_list();
                        grade_all_list.unshift({name:"全部",value:""});
                        vm.grade_list = grade_all_list;
                    }
                    vm.class_list = [{name:"请选择班级",value:""}];
                    vm.head_value.type = "请选择类型";
                    vm.head_value.area = "请选择区县";
                    vm.head_value.school = "请选择学校";
                    vm.head_value.grade = "请选择年级";
                    vm.head_value.class = "请选择班级";
                    vm.check();
                },
                school:function (value,id) {
                    vm.extend.district_id = id;
                    school_list = cloud.school_list({"district":value});
                    school_list = [{schoolname:'全部', id:''}].concat(school_list);
                    vm.school_list = any_2_select(school_list, {name:"schoolname", value:["id"]});
                    vm.check();
                },
                /*区县切换*/
                change_area:function (el) {
                    vm.school(el.name,el.value);
                    vm.check();
                },
                /*学校切换*/
                change_school:function (el) {
                    var value = el.value;
                    vm.extend.school_id = value.split("|")[0];
                    if(vm.extend.grade_id != ''){
                        vm.class();
                    }
                    vm.check();
                },

                class:function () {
                    var class_list = cloud.find_class_simple({fk_grade_id:vm.extend.grade_id,fk_school_id:vm.extend.school_id});
                    class_list = [{class_name:'全部', id:''}].concat(class_list);
                    vm.class_list = any_2_select(class_list, {name:"class_name", value:["id"]});
                    vm.check();
                },
                /*年级切换*/
                change_grade:function (el) {
                    vm.extend.grade_id = el.value;
                    if(vm.extend.school_id != ''){
                        vm.class();
                    }

                },
                /*班级切换*/
                change_class:function (el) {
                    vm.extend.class_id = el.value;
                    vm.check();
                },
                /*类型切换*/
                change_type:function (el) {
                   vm.extend.opt_type =  el.value;
                    vm.check();
                },
                getCompleteDate: function () {
                    $('#my-datepicker').datepicker('open');
                    $("#my-datepicker").on("change", function (event) {
                        vm.extend.time_start = event.delegateTarget.defaultValue;
                        vm.check();
                    });

                },
                getCompleteDates: function () {
                    $('#my-datepickers').datepicker('open');
                    $("#my-datepickers").on("change", function (event) {
                        vm.extend.time_end = event.delegateTarget.defaultValue;
                        vm.check();
                    });

                },
                check:function () {
                    vm.url = api_check_log;
                    vm.is_init = true;
                },
                click_do:function () {


                },
                click_did:function () {


                },
                search:function () {
                    var fill_do = vm.fill_do;
                    vm.reg_fun(fill_do,1);
                    var fill_did = vm.fill_did;
                    vm.reg_fun(fill_did,2);
                    vm.check();
                },
                reg_fun:function (value,num) {
                    var reg = /^[\u4e00-\u9fa5]+$/;
                    if (reg.test(value)) {//汉字
                        switch(num){
                            case 1:
                                vm.extend.name = value;
                                break;
                            case 2:
                                vm.extend.act_name = value;
                                break;
                        }
                    }else{//非汉字
                        switch(num){
                            case 1:
                                vm.extend.account = value;
                                break;
                            case 2:
                                vm.extend.act_account = value;
                                break;
                        }
                    }
                }
            });
            vm.$watch('onReady', function(){
                vm.init();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define,
            date_input: { startDate: "my-datepicker", endDate: "my-datepickers", type: 1 }
        }
    });