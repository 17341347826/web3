/**
 * Created by Administrator on 2018/6/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('promise', 'promise_list/promise_list','html!'),
        C.Co('promise', 'promise_list/promise_list','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        C.CM("table")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,three_menu_module,table) {
        var avalon_define = function () {
            var api_cn_list = api.api + "GrowthRecordBag/query_goodFaithCommitment_list";
            var api_pdf = api.api + "GrowthRecordBag/export_goodFaithCommitment_pdf";
            var vm = avalon.define({
                $id: "promise_list",
                type:"",
                url:api_cn_list,
                user_num:0,
                //highest_level 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师 7个体
                user_list:[],
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                is_init: false,
                remember:false,
                only_hash:true,
                theadTh:[],
                // 市级用户
                area_thead: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "区县",
                    type: "text",
                    from: "district"
                }, {
                    title: "帐号",
                    type: "text",
                    from: "account"
                }, {
                    title: "姓名",
                    type: "text",
                    from: "school_name"
                },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='查看'></a>"+
                        "<a class='tab-btn tab-export-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='导出'></a>"
                    }
                ],
                //区县用户
                school_thead: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "区县",
                    type: "text",
                    from: "district"
                }, {
                    title: "帐号",
                    type: "text",
                    from: "account"
                }, {
                    title: "姓名",
                    type: "text",
                    from: "user_name"
                },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='查看'></a>"+
                        "<a class='tab-btn tab-export-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='导出'></a>"
                    }
                ],
                //校级
                grade_thead: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "区县",
                    type: "text",
                    from: "district"
                }, {
                    title: "帐号",
                    type: "text",
                    from: "account"
                }, {
                    title: "姓名",
                    type: "text",
                    from: "user_name"
                } , {
                    title: "学校",
                    type: "text",
                    from: "school_name"
                }
                    , {
                        title: "年级",
                        type: "text",
                        from: "grade_name"
                    }
                    , {
                        title: "班级",
                        type: "text",
                        from: "class_name"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='查看'></a>"+
                        "<a class='tab-btn tab-export-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='导出'></a>"
                    }
                ],
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
                data_list:[],
                extend:{
                    clazz_id:"",
                    district:"",
                    grad_id:"",
                    schol_id:"",
                    syr_dj:"",//使用人等级
                    syr_lx:"",//使用人类型
                    __hash__: ""
                },
                fill_do:"",
                fill_did:"",
                te_grade:[],
                init: function () {
                    var level = cloud.user_level();
                    vm.login_level = level;
                    var district = cloud.user_district();
                    var grade_all_list = [];
                    if(level == 4){
                        this.user_list = [
                            {name:"学校管理用户",highest_level:4,user_type:'',type:2},
                            {name:"教师",highest_level:6,user_type:1,type:3},
                            {name:"学生",highest_level:7,user_type:2,type:4},
                            {name:"家长",highest_level:7,user_type:3,type:5}
                        ];
                        var auto_grade_list = cloud.auto_grade_list();
                        auto_grade_list = [{grade_name:'全部', grade_id:''}].concat(auto_grade_list);
                        vm.grade_list = any_2_select(auto_grade_list, {name:"grade_name", value:["grade_id"]});
                        vm.extend.district_id = cloud.school_user_distict_id();
                        vm.extend.school_id = cloud.user_school_id();
                        vm.class_list = [{name:"全部",value:""}];

                    }else if(level == 2 || level == 3){
                        this.user_list = [
                            {name:"县(区)管理用户",highest_level:3,user_type:'',type:1},
                            {name:"学校管理用户",highest_level:4,user_type:'',type:2},
                            {name:"教师",highest_level:6,user_type:1,type:3},
                            {name:"学生",highest_level:7,user_type:2,type:4},
                            {name:"家长",highest_level:7,user_type:3,type:5}
                        ];
                        this.extend.syr_dj = 3;
                        this.extend.syr_lx = '0,1';
                        var school_list = [];
                        if(level == 2){
                            var area_list = cloud.sel_area_list();
                            area_list.unshift({name:"全部",value:""});
                            vm.area_list = area_list;
                            school_list = cloud.sel_school_list();
                            school_list.unshift({name:"全部",value:""});
                            vm.school_list = school_list;
                            vm.head_value.area = "全部";
                        }else if(level == 3){
                            var district_id = cloud.user_school_id();
                            this.extend.district = district;
                            vm.area_list =[{name:district,value:district_id}];
                            vm.school(district,district_id);
                            vm.head_value.area = district;
                            vm.school(district,district_id);
                        }
                        grade_all_list = cloud.grade_all_list();
                        grade_all_list.unshift({name:"全部",value:""});
                        vm.grade_list = grade_all_list;
                        vm.class_list = [{name:"全部",value:""}];
                    } else if(level == 6){
                        this.user_list = [
                            {name:"学生",highest_level:7,user_type:2,type:4},
                            {name:"家长",highest_level:7,user_type:3,type:5}
                        ];
                        this.extend.syr_dj = 7;
                        this.extend.syr_lx = '2';
                        this.te_grade = cloud.lead_class_list();
                        grade_all_list = cloud.lead_class_list();
                        var te_class = this.te_grade[0].class_list;

                        for(var i = 0; i < te_class.length; i++){
                            var obj = {name:"",value:""};
                            obj.value = te_class[i].class_id;
                            obj.name = te_class[i].class_name;
                            this.class_list.push(obj);
                        }
                        grade_all_list = any_2_select(grade_all_list, {name: "grade_name", value: ["grade_id"]});
                        grade_all_list.unshift({name:"全部",value:""});
                        vm.grade_list = grade_all_list;
                        this.extend.schol_id = cloud.user_school_id();
                        this.extend.district = district;
                    }
                    this.type = this.user_list[0].type;
                    vm.head_value.type = "全部";
                    vm.head_value.school = "全部";
                    vm.head_value.grade = "全部";
                    vm.head_value.class = "全部";
                    vm.check();
                },
                user_change:function ($index,el) {
                    this.only_hash = true;
                    this.user_num = $index;
                    var highest_level = el.highest_level;
                    this.type = el.type;
                    if(this.type == 1){
                        this.extend.schol_id = "";
                        this.extend.grad_id = "";
                        this.extend.clazz_id = "";
                    }
                    if(this.type == 2){
                        this.extend.grad_id = "";
                        this.extend.clazz_id = "";
                    }
                    if(highest_level == 3 || highest_level == 4){
                        this.extend.syr_lx = '0,1';
                    }else{
                        this.extend.syr_lx = el.user_type;
                    }
                    this.extend.syr_dj = highest_level;
                    this.check();
                },
                school:function (value,id) {
                    // vm.extend.district_id = id;
                    school_list = cloud.school_list({"district":value});
                    school_list = [{schoolname:'全部', id:''}].concat(school_list);
                    vm.school_list = any_2_select(school_list, {name:"schoolname", value:["id"]});
                    vm.check();
                },
                /*区县切换*/
                change_area:function (el) {
                    if(el.name != "全部"){
                        vm.school(el.name,el.value);
                        this.extend.district = el.name;
                    }else{
                        this.extend.district = '';
                    }
                },
                /*学校切换*/
                change_school:function (el) {
                    var value = el.value;
                    vm.extend.schol_id = value.split("|")[0];
                    if(vm.extend.grade_id != '' && this.type != 2){
                        vm.class();
                    }
                    vm.check();
                },
                class:function () {
                    var class_list = cloud.find_class_simple({fk_grade_id:vm.extend.grad_id,fk_school_id:vm.extend.schol_id});
                    class_list = [{class_name:'全部', id:''}].concat(class_list);
                    vm.class_list = any_2_select(class_list, {name:"class_name", value:["id"]});
                    vm.check();
                },
                /*年级切换*/
                change_grade:function (el) {
                    vm.extend.grad_id = el.value;
                    if(this.login_level == 6){
                        var grade = this.te_grade.$model;
                        var length = grade.length;
                        if(length > 1){
                            for(var i = 0; i < length; i++){
                                if(el.value = grade[i].grade_id){
                                    var te_class = grade[i].class_list;
                                }
                            }
                            for(var i = 0; i < te_class.length; i++){
                                var obj = {name:"",value:""};
                                obj.value = te_class[i].class_id;
                                obj.name = te_class[i].class_name;
                                this.class_list.push(obj);
                            }
                        }
                    }
                    else if(vm.extend.schol_id != ''){
                        vm.class();
                    }

                },
                /*班级切换*/
                change_class:function (el) {
                    vm.extend.clazz_id = el.value;
                    vm.check();
                },
                check:function () {
                    if(this.type == 1){//区级
                        this.theadTh = this.area_thead;
                    }else if(this.type == 2){//校级
                        this.theadTh = this.school_thead;
                    }else if(this.type == 3 || this.type == 4 || this.type == 5){//教师
                        this.theadTh = this.grade_thead;
                    }
                    this.only_hash = false;
                    this.is_init = true;
                    this.extend.__hash__ = new Date();
                },
                cbopt: function (params) {
                    if (params.type == 1) {//查看
                        window.location = "#promise_detail?user_type=" + params.data.user_type +
                                "&user_level=" + params.data.user_level +
                                "&img_address=" + params.data.img_address;
                    }else{//导出
                        var token = sessionStorage.getItem("token");
                        var url = api_pdf+"?user_id=" + params.data.user_id + "&token=" + token;
                        window.open(url)

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
            define: avalon_define
        }
    });