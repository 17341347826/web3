/**
 * Created by Administrator on 2018/5/25.
 */
define([
        'jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_performance/teacher', 'teacher_review/teacher_review', 'html!'),
        C.Co('daily_performance/teacher', 'teacher_review/teacher_review', 'css!'),
        C.CMF("data_center.js"),
        C.CMF("table/table.js"),
        C.CM("select_assembly")
    ],
    function ($, avalon, layer, html, css, data_center, table, select_assembly) {
        //根据审核状态是否显示审核数量
        avalon.filters.count_filter = function (count, is_show) {
            if (!is_show)
                return '*';
            return count;
        };
        //增加过滤器：处理null
        avalon.filters.nullSpace = function(str){
            if(str == null || str == 'null'){
                return '';
            }
            return str;
        };
        //根据类型名称和模块查询 详情
        var get_index_api = api.api + "GrowthRecordBag/get_index_by_type";
        //判断是否标注为特长材料
        var person_list_api = api.api + "GrowthRecordBag/find_personality_set_list";
        //思想品德
        var api_morality_listCheck = api.api + 'GrowthRecordBag/morality_listCheck';
        //学业水平
        var api_study_listCheck = api.api + 'GrowthRecordBag/study_list_check';
        //身心健康
        var api_health_listCheck = api.api + 'GrowthRecordBag/healthActivity_findByTeaHealthActivity';
        //艺术素养
        var api_activity_listCheck = api.api + 'GrowthRecordBag/artactivity_findByTeaArtactivity';
        //社会实践
        var api_practice_listCheck = api.api + 'GrowthRecordBag/practice_list_check';
        //日常表现
        var api_daily_listCheck = api.api + 'everyday/list_everyday';
        //成就奖励
        var api_achievement_listCheck = api.api + 'GrowthRecordBag/achievement_findByAchievements';
        //审核状态接口：1作品2品德3成就4实践5艺术活动 6研究型学习7身心健康8日常表
        var type_change = {
            0: 2,
            1: 6,
            2: 7,
            3: 5,
            4: 4,
            5: 8,
            6: 3,
        };
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "new_teacher_review",
                //区县
                district: '',
                //页面首次:true-是，false-不是
                pd_first_enter:true,
                xy_first_enter:true,
                sx_first_enter:true,
                ys_first_enter:true,
                sj_first_enter:true,
                rc_first_enter:true,
                cj_first_enter:true,
                //当前查询班级序号
                class_index:0,
                //班级列表
                class_list: [],
                //模块集合
                module_list:[
                    {id:1,module_name:'思想品德',hand_cout:0,nopass_count:'',},
                    {id:2,module_name:'学业水平',hand_cout:0,nopass_count:'',},
                    {id:3,module_name:'身心健康',hand_cout:0,nopass_count:'',},
                    {id:4,module_name:'艺术素养',hand_cout:0,nopass_count:'',},
                    {id:5,module_name:'社会实践',hand_cout:0,nopass_count:'',},
                    {id:6,module_name:'日常表现',hand_cout:0,nopass_count:'',},
                    {id:7,module_name:'成就奖励',hand_cout:0,nopass_count:'',},
                ],
                //前一次请求的滚动条高度
                old_scroll_top: '',
                //数据列表
                list: [],
                //材料类型集合
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                //模块选中：0-思想品德，1-学业水平，2-身心健康，3-艺术素养，4-社会实践，5-日常表现，6-成就奖励
                checked_module_index:'0',
                //审核状态：待审核-1，审核未通过-2
                tab_state:1,
                //审核状态下的审核数量
                current_count:0,
                //特长材料集合
                person_types: [],
                //当前查询列表数据
                current_list:[],
                //当前查询列表的部分公有参数
                current_extend:{
                    offset:0,
                    rows:5,
                    name:'',
                    code:'',
                },
                //思想品德列表
                pd_list:[],
                //品德审核请求参数
                pd_extend:{
                    activity_type:"",
                    end_time:"",
                    offset:0,
                    rows:5,
                    start_time:"",
                    // -1草稿 0删除 1待审核 2审核通过 3审核不通过4归档
                    status:1,
                    title:"",
                    student_num:"",
                    student_name:"",
                    fk_class_id:'',
                },
                //学业水平列表
                xy_list:[],
                //学业水平请求参数
                xy_extend:{
                    course_name:'',
                    course_type:'',
                    end_time:'',
                    offset:0,
                    rows:5,
                    start_time:'',
                    //状态 -0草稿 1删除 1待审核 2审核通过 3审核不通过4归档
                    status:1,
                    fk_class_id:'',
                    student_num:"",
                    student_name:"",
                },
                //身心健康列表
                sx_list:[],
                //身心健康请求参数
                sx_extend:{
                    hea_activityType:"",
                    hea_endDate:"",
                    hea_startDate:"",
                    //-1:删除 1:待审核2:提交草稿3:未通过4:审核通过5:归档
                    hea_state:1,
                    offset:0,
                    rows:5,
                    hea_classid:'',
                    hea_studentname:'',
                    hea_studentnum:'',
                },
                //艺术素养列表
                ys_list:[],
                //艺术素养请求参数
                ys_extend:{
                    art_end_date:"",
                    art_start_date:"",
                    //-1:删除 1:待审核2:提交草稿3:未通过4:审核通过5:归档
                    art_state:1,
                    art_type:"",
                    offset:0,
                    rows:5,
                    art_classid:'',
                    art_studentnum:'',
                    art_studentname:'',
                },
                //社会实践列表
                sj_list:[],
                //社会实践请求参数
                sj_extend:{
                    activity_type:'',
                    create_time:'',
                    offset:0,
                    rows:5,
                    start_time:'',
                    //-1删除0草稿 1待审核 2审核通过 3审核不通过4归档
                    status:1,
                    title:'',
                    fk_class_id:'',
                    student_num:'',
                    student_name:'',
                },
                //日常表现列表
                rc_list:[],
                //日常表现请求参数
                rc_extend:{
                    end_date:'',
                    guid:'',
                    mark_type:'',
                    start_date:'',
                    //-1删除  1待审核 2审核不通过 3待确认 4已确认(公示) 5归档
                    status:1,
                    offset:0,
                    rows:5,
                    fk_class_id:'',
                    code:'',
                    name:'',
                },
                //成就奖励列表
                cj_list:[],
                //成就奖励请求参数
                cj_extend:{
                    ach_classid:'',
                    // ach_end_dates:'',
                    ach_gradeid:'',
                    ach_schoolid:'',
                    // ach_start_dates:'',
                    fk_semester_id:'',
                    //-1:删除 1:待审核2:提交草稿3:未通过4:审核通过5:归档
                    ach_state:1,
                    ach_type:'',
                    offset:0,
                    rows:5,
                    xz:'',
                    ach_studentnum:'',
                    ach_studentname:'',
                },
                //头像
                url_img: url_img,
                user_photo: cloud.user_photo,
                //点击通过参数请求
                request_data: {},
                //点击未通过理由
                no_pass_msg: '',
                init: function () {
                    this.district = cloud.user_district();
                    //获取班主任所教的班级
                    var msg = cloud.lead_class_list();
                    for(var i=0;i<msg.length;i++){
                        Array.prototype.push.apply(this.class_list,msg[i].class_list);
                    }
                    this.listen_scroll();
                    this.get_person_list();
                },
                uninit: function () {
                    $(window).unbind('scroll');
                },
                //模块切换
                click_module_index:function(index,el){
                    //初始化列表
                    this.current_list = [];
                    this.current_extend.offset = 0;
                    this.current_extend.code = '';
                    this.current_extend.name = '';
                    this.old_scroll_top = 0;
                    this.checked_module_index = index;
                    this.tab_state = 1;
                    if(index == 0){
                        this.pd_extend.status = 1;
                    }else if(index == 1){
                        this.xy_extend.status = 1;
                    }else if(index == 2){
                        this.sx_extend.hea_state = 1;
                    }else if(index == 3){
                        this.ys_extend.art_state = 1;
                    }else if(index == 4){
                        this.sj_extend.status = 1;
                    }else if(index == 5){
                        this.rc_extend.status = 1;
                    }else if(index == 6){
                        this.cj_extend.ach_state = 1;
                    }
                    this.get_classes();
                },
                //状态切换：待审核（tab==1）；审核未通过（tab==2）
                change_tab: function (tab) {
                    this.tab_state = tab;
                    //初始化列表
                    this.current_list = [];
                    this.current_extend.offset = 0;
                    this.current_extend.code = '';
                    this.current_extend.name = '';
                    this.old_scroll_top = 0;
                    if(tab == 1){
                        this.pd_extend.status = 1;
                        this.xy_extend.status = 1;
                        this.sx_extend.hea_state = 1;
                        this.ys_extend.art_state = 1;
                        this.sj_extend.status = 1;
                        this.rc_extend.status = 1;
                        this.cj_extend.ach_state = 1;
                    }else if(tab == 2){
                        this.pd_extend.status = 3;
                        this.xy_extend.status = 3;
                        this.sx_extend.hea_state = 3;
                        this.ys_extend.art_state = 3;
                        this.sj_extend.status = 3;
                        this.rc_extend.status = 2;
                        this.cj_extend.ach_state = 3;
                    }
                    this.get_classes();
                },
                //图片展开或收起，注：如果数据循环出来，逻辑不一定这么写
                open_close: function (w,index) {
                    if (w == 'open') {
                        this.current_list[index].is_open = true;
                    } else {
                        this.current_list[index].is_open = false;
                    }
                },
                //学籍号和姓名切换
                search: function () {
                    this.current_list = [];
                    this.current_extend.offset = 0;
                    this.old_scroll_top = 0;
                    this.get_classes();
                },
                //请求特长材料
                get_person_list: function () {
                    ajax_post(person_list_api, {
                        fk_realistic_moduletid: ''
                    }, this)
                },
                //页面第一次请求：需要把7个模块都查询出来
                first_loading:function(){
                    ajax_post(api_morality_listCheck,this.pd_extend.$model,this);
                    ajax_post(api_study_listCheck,this.xy_extend.$model,this);
                    ajax_post(api_health_listCheck,this.sx_extend.$model,this);
                    ajax_post(api_activity_listCheck,this.ys_extend.$model,this);
                    ajax_post(api_practice_listCheck,this.sj_extend.$model,this);
                    ajax_post(api_daily_listCheck,this.rc_extend.$model,this);
                    ajax_post(api_achievement_listCheck,this.cj_extend.$model,this);
                },
                //滚动请求数据
                listen_scroll: function () {
                    var self = this;
                    $(window).scroll(function () {
                        var h = $(document.body).height();//网页文档的高度
                        var c = $(document).scrollTop();//滚动条距离网页顶部的高度
                        var wh = $(window).height(); //页面可视化区域高度
                        if (Math.ceil(wh + c) >= h) {
                            if (self.current_list.length < self.current_extend.offset)
                                return;
                            self.current_extend.offset += 5;
                            self.old_scroll_top = h;
                            self.get_classes();
                        }
                    })

                },
                //获取教师教的班级
                get_classes: function () {
                    // layer.closeAll();
                    // layer.load(1, {shade:[0.3,'#121212']});
                    var class_id = this.class_list[this.class_index].class_id;
                    this.pd_extend.fk_class_id = class_id;
                    this.xy_extend.fk_class_id = class_id;
                    this.sx_extend.hea_classid = class_id;
                    this.ys_extend.art_classid = class_id;
                    this.sj_extend.fk_class_id = class_id;
                    this.rc_extend.fk_class_id = class_id;
                    this.cj_extend.ach_classid = class_id;
                    //判断是否是首次进入或者刷新页面
                    if(this.pd_first_enter){
                        this.first_loading();
                        return;
                    }
                    //审核材料接口调用
                    this.get_daily_data(class_id);
                },
                //获取审核材料数据
                get_daily_data: function (class_id) {
                    //模块选中：0-思想品德，1-学业水平，2-身心健康，3-艺术素养，4-社会实践，5-日常表现，6-成就奖励
                    var type = Number(this.checked_module_index);
                    switch (type) {
                        case 0:
                            this.pd_extend.offset = this.current_extend.offset;
                            // this.pd_extend.rows = this.current_extend.rows;
                            this.pd_extend.student_num = this.current_extend.code;
                            this.pd_extend.student_name = this.current_extend.name;
                            ajax_post(api_morality_listCheck,this.pd_extend.$model,this);
                            break;
                        case 1:
                            this.xy_extend.offset = this.current_extend.offset;
                            // this.xy_extend.rows = this.current_extend.rows;
                            this.xy_extend.student_num = this.current_extend.code;
                            this.xy_extend.student_name = this.current_extend.name;
                            ajax_post(api_study_listCheck,this.xy_extend.$model,this);
                            break;
                        case 2:
                            this.sx_extend.offset = this.current_extend.offset;
                            // this.sx_extend.rows = this.current_extend.rows;
                            this.sx_extend.hea_studentnum = this.current_extend.code;
                            this.sx_extend.hea_studentname = this.current_extend.name;
                            ajax_post(api_health_listCheck,this.sx_extend.$model,this);
                            break;
                        case 3:
                            this.ys_extend.offset = this.current_extend.offset;
                            // this.ys_extend.rows = this.current_extend.rows;
                            this.ys_extend.art_studentnum = this.current_extend.code;
                            this.ys_extend.art_studentname = this.current_extend.name;
                            ajax_post(api_activity_listCheck,this.ys_extend.$model,this);
                            break;
                        case 4:
                            this.sj_extend.offset = this.current_extend.offset;
                            // this.sj_extend.rows = this.current_extend.rows;
                            this.sj_extend.student_num = this.current_extend.code;
                            this.sj_extend.student_name = this.current_extend.name;
                            ajax_post(api_practice_listCheck,this.sj_extend.$model,this);
                            break;
                        case 5:
                            this.rc_extend.offset = this.current_extend.offset;
                            // this.rc_extend.rows = this.current_extend.rows;
                            this.rc_extend.code = this.current_extend.code;
                            this.rc_extend.name = this.current_extend.name;
                            ajax_post(api_daily_listCheck,this.rc_extend.$model,this);
                            break;
                        case 6:
                            this.cj_extend.offset = this.current_extend.offset;
                            // this.cj_extend.rows = this.current_extend.rows;
                            this.cj_extend.ach_studentnum = this.current_extend.code;
                            this.cj_extend.ach_studentname = this.current_extend.name;
                            ajax_post(api_achievement_listCheck,this.cj_extend.$model,this);
                            break;
                    }
                },
                //防止重复提交判断:true-可以提交，false-不可提交，不能点击
                btn_had:true,
                //点击通过
                pass: function (el, index) {
                    var checked_module = this.checked_module_index;
                    if (el.hasOwnProperty('score') && !el.score && checked_module != 5 && checked_module != 6) {
                        layer.alert('请对该学生进行评价');
                        return;
                    }
                    if(this.btn_had){
                        this.btn_had = false;
                        this.deal_audit(el, index, true);
                    }
                },
                //通过给参数赋值
                deal_audit: function (el, index, is_pass) {
                    if (!this.current_list[index])
                        return;
                    if (el.tc_check) {
                        this.current_list[index].sftc = 1;
                    } else {
                        this.current_list[index].sftc = 0;
                    }
                    var request = {};
                    var module_index = Number(this.checked_module_index);
                    //类型
                    var type_name = '';
                    switch (module_index) {
                        case 0://品德发展
                            type_name = el.activity_type;
                            request = {
                                id: el.id,
                                frist_index: el.frist_index,
                                second_index: el.second_index,
                                status: 2,
                                score: el.score,
                                sftc: el.sftc,
                                isTypical: 1
                            };
                            if (!is_pass) {
                                request.status = 3;
                                request.check_opinion = this.no_pass_msg;
                            }
                            break;
                        case 1://学业水平
                            type_name = el.course_type;
                            request = {
                                id: el.id,
                                frist_index: el.frist_index,
                                second_index: el.second_index,
                                status:2,
                                score: el.score,
                                sftc: el.sftc,
                                isTypical: 1
                            };
                            if (!is_pass) {
                                request.status = 3;
                                request.check_opinion = this.no_pass_msg;
                            }
                            break;
                        case 2://身心健康
                            type_name = el.hea_activityType;
                            request = {
                                id: el.id,
                                hea_first_level_index: el.hea_first_level_index,
                                hea_two_level_index: el.hea_two_level_index,
                                hea_state:4,
                                score: el.score,
                                sftc: el.sftc,
                                isTypical: 1
                            }
                            if (!is_pass) {
                                request.hea_state = 3;
                                request.hea_not_passed = this.no_pass_msg;
                            }
                            break;
                        case 3://艺术素养
                            type_name = el.art_type;
                            request = {
                                id: el.id,
                                art_first_level_index: el.art_first_level_index,
                                art_two_level_index: el.art_two_level_index,
                                art_state:4,
                                score: el.score,
                                sftc: el.sftc,
                                isTypical: 1
                            };
                            if (!is_pass) {
                                request.art_state = 3;
                                request.art_not_passed = this.no_pass_msg;
                            }
                            break;
                        case 4://社会实践
                            type_name = el.activity_type;
                            request = {
                                id: el.id,
                                frist_index: el.frist_index,
                                second_index: el.second_index,
                                status: 2,
                                score: el.score,
                                sftc: el.sftc,
                                isTypical: 1
                            };
                            if (!is_pass) {
                                request.status = 3;
                                request.check_opinion = this.no_pass_msg;
                            }
                            break;
                        case 5://日常表现
                            type_name = el.mkmc;
                            request = {
                                id: el.id,
                                status: 4
                            }
                            if (!is_pass) {
                                request.status = 2;
                            }
                            break;
                        case 6://成就奖励
                            type_name = el.ach_type;
                            request = {
                                id: el.id,
                                ach_first_level_index: el.ach_first_level_index,
                                ach_two_level_index: el.ach_two_level_index,
                                ach_state:4,
                                score: el.score,
                                sftc: el.sftc,
                                isTypical: 1
                            }
                            if (!is_pass) {
                                request.ach_state = 3;
                                request.ach_not_passed = this.no_pass_msg;
                            }
                            break;
                        default:
                            break;
                    }
                    this.request_data = request;
                    var type = type_change[module_index];
                    //这层判断主要为了处理成就奖励没有成就类型的特殊处理
                    if(type_name != null && type_name != '' && type_name != undefined){
                        ajax_post(get_index_api, {
                            type: type,
                            type_name: type_name
                        }, this)
                    }else{
                        cloud.audit_achievement(this.request_data.$model, function (url, args, data,is_suc,msg) {
                            if(is_suc){
                                vm.had_checked(vm.request_data.id);
                            }else{
                                toastr.error(msg);
                                vm.btn_had = true;
                            }
                        });
                    }
                },
                //不通过执行的方法
                no_pass: function (el, index) {
                    var self = this;
                    self.no_pass_msg = '';
                    layer.prompt({
                        title: '理由',
                        formType: 2,
                        yes: function (index1, layero) {
                            var val = layero.find(".layui-layer-input").val();
                            if($.trim(val)==''){
                                toastr.warning('请输入不通过理由')
                            }else{
                                vm.no_pass_msg = val;
                                if(self.btn_had){
                                    self.btn_had = false;
                                    self.deal_audit(el, index, false);
                                }
                            }
                            layer.closeAll();
                        },
                        cancel: function () {
                            //右上角关闭回调
                        }
                    });
                },
                //处理审核数据
                deal_index: function (data) {
                    if (!data.data)
                        return;
                    var self = this;
                    // layer.load(1);
                    //模块选中：0-思想品德，1-学业水平，2-身心健康，3-艺术素养，4-社会实践，5-日常表现，6-成就奖励
                    var module_index = Number(this.checked_module_index);
                    switch (module_index) {
                        case 0://思想品德
                            this.request_data.frist_index = data.data.first_index_name;
                            this.request_data.second_index = data.data.second_index_name;
                            cloud.audit_morality(this.request_data.$model, function (url, args, data,is_suc,msg) {
                                if(is_suc){
                                    vm.had_checked(vm.request_data.id);
                                }else{
                                    toastr.error(msg);
                                    vm.btn_had = true;
                                }
                            });
                            break;
                        case 1://学业水平
                            this.request_data.frist_index = data.data.first_index_name;
                            this.request_data.second_index = data.data.second_index_name;
                            cloud.audit_study(this.request_data.$model, function (url, args, data,is_suc,msg) {
                                if(is_suc){
                                    vm.had_checked(vm.request_data.id);
                                }else{
                                    toastr.error(msg);
                                    vm.btn_had = true;
                                }
                            });
                            break;
                        case 2://身心健康
                            this.request_data.hea_first_level_index = data.data.first_index_name;
                            this.request_data.hea_two_level_index = data.data.second_index_name;
                            cloud.audit_health_activity(this.request_data.$model, function (url, args, data,is_suc,msg) {
                                if(is_suc){
                                    vm.had_checked(vm.request_data.id);
                                }else{
                                    toastr.error(msg);
                                    vm.btn_had = true;
                                }
                            });
                            break;
                        case 3://艺术素养
                            this.request_data.art_first_level_index = data.data.first_index_name;
                            this.request_data.art_two_level_index = data.data.second_index_name;
                            cloud.audit_artactivity(this.request_data.$model, function (url, args, data,is_suc,msg) {
                                if(is_suc){
                                    vm.had_checked(vm.request_data.id);
                                }else{
                                    toastr.error(msg);
                                    vm.btn_had = true;
                                }
                            });
                            break;
                        case 4://社会实践
                            this.request_data.frist_index = data.data.first_index_name;
                            this.request_data.second_index = data.data.second_index_name;
                            cloud.audit_practice(this.request_data.$model, function (url, args, data,is_suc,msg) {
                                if(is_suc){
                                    vm.had_checked(vm.request_data.id);
                                }else{
                                    toastr.error(msg);
                                    vm.btn_had = true;
                                }
                            });
                            break;
                        case 5://日常表现
                            cloud.audit_everyday(this.request_data.$model, function (url, args, data,is_suc,msg) {
                                if(is_suc){
                                    vm.had_checked(vm.request_data.id);
                                }else{
                                    toastr.error(msg);
                                    vm.btn_had = true;
                                }
                            });
                            break;
                        case 6://成就奖励
                            this.request_data.ach_first_level_index = data.data.first_index_name;
                            this.request_data.ach_two_level_index = data.data.second_index_name;
                            cloud.audit_achievement(this.request_data.$model, function (url, args, data,is_suc,msg) {
                                if(is_suc){
                                    vm.had_checked(vm.request_data.id);
                                }else{
                                    toastr.error(msg);
                                    vm.btn_had = true;
                                }
                            });
                            break;
                        default:
                            break;
                    }
                },
                //审核通过后数据处理:id-数据id
                had_checked:function(id){
                    var list = this.current_list;
                    this.current_count --;
                    this.btn_had = true;
                    //当数据低于3条的时候调用接口
                    if(list.length<3){
                        this.current_extend.offset = 0;
                        if(this.current_count<3){
                            this.current_list = [];
                            this.current_extend.offset = 0;
                            this.old_scroll_top = 0;
                        }
                        this.get_classes();
                        return;
                    }
                    //当前数据大于3条进行手动数据删除
                    this.delectAryOption(list,'id',id);
                    this.module_list[this.checked_module_index].hand_cout --;
                },
                /**
                 * 根据参数删除数组中的某一项
                 * ary-数组，name-键，value-值
                 * */
                delectAryOption:function(ary,name,value){
                    for(var i=0,len=ary.length;i<len;i++){
                        if(ary[i][name] == value){
                            ary.splice(i, 1);
                            return ary;
                        }
                    }
                    return ary;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //特长材料
                            case person_list_api:
                                this.person_types = data.data;
                                this.get_classes();
                                break;
                            // 思想品德
                            case api_morality_listCheck:
                                this.complete_morality_listCheck(data);
                                break;
                            //学业水平
                            case api_study_listCheck:
                                this.complete_study_listCheck(data);
                                break;
                            //        身心健康
                            case api_health_listCheck:
                                this.complete_health_listCheck(data);
                                break;
                            //        艺术素养
                            case api_activity_listCheck:
                                this.complete_activity_listCheck(data);
                                break;
                            //        社会实践
                            case api_practice_listCheck:
                                this.complete_practice_listCheck(data);
                                break;
                            //        日常表现
                            case api_daily_listCheck:
                                this.complete_daily_listCheck(data);
                                break;
                            //        成就奖励
                            case api_achievement_listCheck:
                                this.complete_achievement_listCheck(data);
                                break;
                            //   审核材料（通过和不通过）
                            case get_index_api:
                                // toastr.success('操作成功！');
                                this.deal_index(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //处理请求过来的数据
                deal_data: function (data) {
                    if (!data || data.length==0)
                        return;
                    var token = sessionStorage.getItem("token");
                    for (var i = 0; i < data.length; i++) {
                        //判断列表是否存在'score'字段名字
                        if(data[i].score){

                        }else{
                            data[i].score = '';
                        }
                        data[i].is_open = false;
                        //将附件统一改为fjdz
                        if(this.checked_module_index == 0){//思想品德
                            data[i].fjdz = data[i].attachment;
                            data[i].mkmc = '思想品德';
                        }else if(this.checked_module_index == 1){//学业水平
                            data[i].fjdz = data[i].attachment;
                            data[i].mkmc = '学业水平';
                        }else if(this.checked_module_index == 2){//身心健康
                            data[i].fjdz = data[i].hea_enclosure;
                            data[i].mkmc = '身心健康';
                        }else if(this.checked_module_index == 3){//艺术素养
                            data[i].fjdz = data[i].art_enclosure;
                            data[i].mkmc = '艺术素养';
                        }else if(this.checked_module_index == 4){//社会实践
                            data[i].fjdz = data[i].attachment;
                            data[i].mkmc = '社会实践';
                        }else if(this.checked_module_index == 5){//日常表现
                            data[i].fjdz = data[i].attachment;
                            data[i].mkmc = '日常表现';
                        }else if(this.checked_module_index == 6){//成就奖励
                            data[i].fjdz = data[i].ach_enclosure;
                            data[i].mkmc = '成就奖励';
                        }
                        //将材料文件不全的清空
                        if(data[i].fjdz.indexOf(']') != -1){

                        }else{
                            data[i].fjdz = '[]';
                        }
                        data[i].photo_guid = JSON.parse(data[i].fjdz);
                        data[i].tc_check = false;
                        if (data[i].sftc && data[i].sftc == 1) {
                            data[i].tc_check = true;
                        }
                        data[i].is_show = false;
                        for (var k = 0; k < this.person_types.length; k++) {
                            var id = this.person_types[k].id;
                            var ps_type_name = this.person_types[k].ps_type_name;
                            var realistic_modulet = this.person_types[k].realistic_modulet;
                            if (data[i].mkmc == realistic_modulet && data[i].lx == ps_type_name) {
                                data[i].is_show = true;
                                break;
                            }
                        }
                        var fjdz = JSON.parse(data[i].fjdz);
                        data[i].img_arr = [];
                        data[i].video_arr = [];
                        data[i].file_arr = [];
                        for (var j = 0; j < fjdz.length; j++) {
                            var file_name = '';
                            if (fjdz[j].hasOwnProperty('name')) {
                                file_name = fjdz[j].name;
                            }
                            else {
                                file_name = fjdz[j].inner_name;
                            }
                            fjdz[j].down_href = api.api+'file/download_file?img=' + fjdz[j].guid + "&token="+ token;
                            var suffix_index = file_name.lastIndexOf('.');
                            var suffix = file_name.substr(suffix_index + 1);
                            suffix = suffix.toLowerCase();
                            if (vm.suffix_video.indexOf(suffix) != -1) {//视频
                                data[i].video_arr.push(fjdz[j]);
                                continue;
                            }
                            if (vm.suffix_img.indexOf(suffix) != -1) {
                                data[i].img_arr.push(fjdz[j]);
                                continue;
                            }
                            data[i].file_arr.push(fjdz[j]);
                        }


                    }
                    this.current_list = this.current_list.concat(data);
                    if (this.old_scroll_top > 0) {
                        $(window).scrollTop(this.old_scroll_top);
                    }
                    layer.closeAll();
                },
                get_photos:function(list,key){
                    if(list && list.length>0){
                        ready_photo(list,key);
                    }
                },
                //    思想品德
                complete_morality_listCheck:function(data){
                    //首次或者刷新
                    if(this.pd_first_enter){
                        this.pd_first_enter = false;
                    }
                    this.get_photos(data.data.list,'owner')
                    this.deal_data(data.data.list);
                    this.current_count = data.data.count;
                    if(this.pd_extend.status == 1){
                        this.module_list[0].hand_cout = data.data.count;
                    }else if(this.pd_extend.status == 3){
                        this.module_list[0].nopass_count = data.data.count;
                    }
                },
                //    学业水平
                complete_study_listCheck:function(data){
                    if(this.xy_extend.status == 1){
                        this.module_list[1].hand_cout = data.data.count;
                    }else if(this.xy_extend.status == 3){
                        this.module_list[1].nopass_count = data.data.count;
                    }

                    //首次或者刷新
                    if(this.xy_first_enter){
                        this.xy_first_enter = false;
                        return;
                    }
                    this.get_photos(data.data.list,'owner')
                    this.current_count = data.data.count;
                    this.deal_data(data.data.list);
                },
                //    身心健康
                complete_health_listCheck:function(data){
                    if(this.sx_extend.hea_state == 1){
                        this.module_list[2].hand_cout = data.data.count;
                    }else if(this.sx_extend.hea_state == 3){
                        this.module_list[2].nopass_count = data.data.count;
                    }
                    //首次或者刷新
                    if(this.sx_first_enter){
                        this.sx_first_enter = false;
                        return;
                    }
                    this.get_photos(data.data.list,'hea_ownerid')
                    this.current_count = data.data.count;
                    this.deal_data(data.data.list);
                },
                //    艺术素养
                complete_activity_listCheck:function(data){
                    if(this.ys_extend.art_state == 1){
                        this.module_list[3].hand_cout = data.data.count;
                    }else if(this.ys_extend.art_state == 3){
                        this.module_list[3].nopass_count = data.data.count;
                    }
                    //首次或者刷新
                    if(this.ys_first_enter){
                        this.ys_first_enter = false;
                        return;
                    }
                    this.get_photos(data.data.list,'fk_xsyh_id')
                    this.current_count = data.data.count;
                    this.deal_data(data.data.list);
                },
                //    社会实践
                complete_practice_listCheck:function(data){
                    if(this.sj_extend.status == 1){
                        this.module_list[4].hand_cout = data.data.count;
                    }else if(this.sj_extend.status == 3){
                        this.module_list[4].nopass_count = data.data.count;
                    }
                    //首次或者刷新
                    if(this.sj_first_enter){
                        this.sj_first_enter = false;
                        return;
                    }
                    this.get_photos(data.data.list,'owner')
                    this.current_count = data.data.count;
                    this.deal_data(data.data.list);
                },
                //    日常表现
                complete_daily_listCheck:function(data){
                    if(this.rc_extend.status == 1){
                        this.module_list[5].hand_cout = data.data.count;
                    }else if(this.rc_extend.status == 3){
                        this.module_list[5].nopass_count = data.data.count;
                    }
                    //首次或者刷新
                    if(this.rc_first_enter){
                        this.rc_first_enter = false;
                        return;
                    }
                    this.get_photos(data.data.list,'fk_xsyh_id')
                    this.current_count = data.data.count;
                    this.deal_data(data.data.list);
                },
                //    成就奖励
                complete_achievement_listCheck:function(data){
                    if(this.cj_extend.ach_state == 1){
                        this.module_list[6].hand_cout = data.data.count;
                    }else if(this.cj_extend.ach_state == 3){
                        this.module_list[6].nopass_count = data.data.count;
                    }
                    //首次或者刷新
                    if(this.cj_first_enter){
                        this.cj_first_enter = false;
                        return;
                    }
                    this.get_photos(data.data.list,'guid')
                    this.current_count = data.data.count;
                    this.deal_data(data.data.list);
                },
                //时间戳
                timeChuo:function(h){
                    var timestamp3 = h/1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function(format) {
                        var date = {
                            "M+": this.getMonth() + 1,
                            "d+": this.getDate(),
                            "h+": this.getHours(),
                            "m+": this.getMinutes(),
                            "s+": this.getSeconds(),
                            "q+": Math.floor((this.getMonth() + 3) / 3),
                            "S+": this.getMilliseconds()
                        };
                        if (/(y+)/i.test(format)) {
                            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
                        }
                        for (var k in date) {
                            if (new RegExp("(" + k + ")").test(format)) {
                                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                                    ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                            }
                        }
                        return format;
                    };
                    var getTimeIs=newDate.format('yyyy-MM-dd');
                    return getTimeIs;
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
