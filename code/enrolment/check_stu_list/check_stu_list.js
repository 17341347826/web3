/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('enrolment', 'check_stu_list/check_stu_list', 'html!'),
        C.Co('enrolment', 'check_stu_list/check_stu_list', 'css!'),
        C.CMF("data_center.js"),
        C.CMF("zy.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly"),
        C.CM("table")
    ],
    function ($, avalon, layer, html, css, data_center,zy, three_menu_module, select_assembly,table) {
        var avalon_define = function () {
            //查询数据
            var api_get_data = api.api + "Indexmaintain/dw_find_student_files";
            //查志愿
            var api_get_batch = api.api + "Indexmaintain/query_all_voluntary_batch_name";
            var vm = avalon.define({
                $id: "check_stu_list",
                url:api_get_data,
                type_arr:[],
                remember:false,
                is_init:false,
                city:"",
                district:"",
                school_id:"",
                area_arr:[],
                school_list:[],
                grade_arr:[],
                is_city_user:false,
                is_district_user:false,
                is_school_user:false,
                get_zy:function () {
                    ajax_post(api_get_batch,{city_name:this.extend.city_name},this);
                },
                extend: {
                    city_name: '',
                    district_name:"",
                    fk_grade_id: '',
                    fk_school_id:"",
                    remark:"",
                    stu_name:"",
                    stu_num:"",
                    __hash__: ""
                },
                data: {
                    offset: 0,
                    rows: 15
                },
                // 表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "区县",
                        type: "text",
                        from: "district_name"
                    },
                    {
                        title: "毕业学校名称",
                        type: "text",
                        from: "school_name"
                    },
                    {
                        title: "考生",
                        type: "text",
                        from: "stu_name"
                    },
                    {
                        title: "学籍号",
                        type: "text",
                        from: "stu_num"
                    },
                    /**/
                    {
                        title: "年级",
                        type: "text",
                        from: "grade_name"
                    },
                    {
                        title: "班级",
                        type: "text",
                        from: "class_name"
                    },
                    {
                        title: "分数",
                        type: "text",
                        from: "score"
                    },
                    {
                        title: "操作",
                        type: "html",
                        from: "<a class='tab-btn tab-details-btn' ms-on-click='@oncbopt({current:$idx, type:1})' title='查看成长档案'></a>"+
                        "<a class='tab-btn tab-detail-btn' ms-on-click='@oncbopt({current:$idx, type:2})' title='查看毕业档案'></a>"
                    }
                ],
                check_data:{
                    class_id:'',
                    grade_id:'',
                    guid:'',
                    school_id:'',
                    tar_year:'',
                    token:''
                },
                cbopt:function(params) {
                    vm.check_data.class_id = params.data.class_id;
                    vm.check_data.grade_id = params.data.grade_id;
                    vm.check_data.guid = params.data.stu_id;
                    vm.check_data.school_id = params.data.school_id;
                    vm.check_data.token = sessionStorage.getItem('token');
                    vm.check_data.tar_year = Number(params.data.grade_name.substr(1, 4));
                    if(params.type == 1){//查看成长档案
                        data_center.set_key('grow_export_data',JSON.stringify(vm.check_data));
                        window.location='#file_details?guid=' + vm.check_data.guid;

                    }else if(params.type == 2){//查看毕业档案
                        var portfolio_stu = params.data.stu_id + '|' + params.data.grade_name + '|' + params.data.grade_id + '|' + params.data.fk_school_id + '|' +
                            params.data.sex + '|' + params.data.province + '|' + params.data.city + '|' + params.data.district + '|' + params.data.class_id + '|' + params.data.code;
                        var param = {
                            class_id: params.data.class_id,
                            grade_id: params.data.grade_id,
                            stu_num: params.data.account,
                            school_id:params.data.fk_school_id
                        };
                        cloud.get_bybg_count_result_list(param, function (url, args, data) {
                            if (data == null || data.list.length == 0) {
                                toastr.warning("该学生还未生成毕业评价数据!")
                            } else {
                                sessionStorage.setItem('portfolio_stu', portfolio_stu);
                                sessionStorage.setItem('g_export_data',JSON.stringify(vm.check_data));
                                window.location = '#graduation_file';
                            }
                        });
                        return;
                    }
                },
                get_info:function () {
                    this.extend.__hash__ = new Date();
                    this.is_init = true;
                },
                init: function () {
                    this.extend.city_name = cloud.user_city();
                    this.extend.district_name = cloud.user_district();
                    this.is_city_user = cloud.is_city_leader();
                    this.is_school_user = cloud.is_school_user();
                    this.is_district_user = cloud.is_district_leader();
                    this.get_zy();
                },
                refresh_area:function () {
                    var area_list = cloud.area_list({city:this.city});
                    area_list = [{district:"请选择区县",id:""}].concat(area_list);
                    this.area_arr = any_2_select(area_list, {name:"district", value:["id"]});
                    this.get_info();
                },
                refresh_school:function () {
                    var school_list = cloud.school_list({"district":vm.district});
                    school_list = [{schoolname:'请选择学校', id:''}].concat(school_list);
                    this.school_list = any_2_select(school_list, {name:"schoolname", value:["id"]});
                    this.get_info();
                },
                refresh_grade:function () {
                    var grade_list = cloud.grade_list({"school_id":vm.school_id});
                    grade_list = [{grade_name:'请选择年级', grade_id:''}].concat(grade_list);
                    this.grade_arr = any_2_select(grade_list, {name:"grade_name", value:["grade_id"]});
                    this.get_info();

                },
                //切换区县
                area_sel:function (el) {
                    if(el.value==""){
                        this.extend.district_name = "";
                        this.school_list = [];
                        this.class_arr = [];
                        return;
                    }else{
                        this.extend.district_name = el.name;
                        this.refresh_school();
                    }
                },
                //切换学校
                school_sel:function (el) {
                    if(el.value == ""){
                        this.extend.fk_school_id = '';

                    }else{
                        this.school_id = Number(el.value);
                        this.extend.fk_school_id = Number(el.value);
                        this.refresh_grade();
                    }
                },
                //切换年级
                grade_sel:function (el) {
                    if(el.value == ''){
                        this.extend.fk_grade_id = '';
                    }else{
                        this.extend.fk_grade_id = Number(el.value);
                        this.get_info();
                    }
                },
                //切换志愿
                type_sel:function (el) {
                    if(el.value == ''){
                        this.extend.remark = '';
                    }else{
                        this.extend.remark = Number(el.value);
                        this.get_info();
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_batch:
                                this.complete_get_batch(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_get_batch:function (data) {
                    var data = data.data;
                    this.type_arr = zhi_yuan(data);
                    if(this.is_city_user){
                        this.refresh_area();
                    }else if(this.is_district_user){
                        this.district = cloud.user_district();
                        this.refresh_school();
                    }
                    else if(this.is_school_user){
                        this.school_id = cloud.user_school_id();
                        this.refresh_grade();
                    }
                }
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
