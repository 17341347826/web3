define([
        C.CLF('avalon.js'),
        'layer', "date_zh",
        C.Co('practice_management', 'add_pra_ma/add_pra_ma', 'html!'),
        C.Co('practice_management', 'add_pra_ma/add_pra_ma', 'css!'),
        C.CMF("data_center.js"),
        C.CMF("viewer/viewer.js"), C.CMF("uploader/uploader.js"), C.CM("select_assembly")
    ],
    function (avalon, layer, date_zh, html, css, data_center, viewer, uploader, select_assembly) {
        //审核公式管控-查询
        var api_query_pub = api.api+'GrowthRecordBag/publicity_audit_query';
        //文件上传
        var api_file_uploader = api.api + "file/uploader";
        //查询个性特长设置
        var api_get_personality_list = api.api + "GrowthRecordBag/find_personality_set_list";
        //获取活动类型列表
        var type_list_api = api.api + "GrowthRecordBag/page_list_type";
        //获取系统当前时间
        var api_get_server_time = api.api + 'base/baseUser/current_time';
        //根据类型名称和模块查询 详情
        var api_get_index = api.api + "GrowthRecordBag/list_type";
        //活动上传完调用
        var api_add_suc = api.api + "GrowthRecordBag/complete_hdrw";

        //根据活动id查询活动
        var api_get_activity = api.api + 'GrowthRecordBag/get_activity_manage';
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "add_pra_ma",
                is_update:false,
                update_id:"",
                files: [],
                uploader_url: api_file_uploader,
                personality_list: [],
                get_f_index:"",
                get_e_index:"",
                data: {
                    name: "",//作品名称
                    activity_type: "",//活动类型
                    start: "",//开始时间
                    end: "",//结束时间
                    place: "",//地点
                    member: "",//成员
                    teacher: "",//指导老师
                    role: "",//担任角色
                    task: "",//任务
                    theme: "",//主题
                    describe: "",//描述
                    thoughts: "",//感想
                    attachment: [],
                    sftc: 0,//是否为特长 0不是 1是
                    isTypical: 0//（-0不是 1是） 是特长 也是典型
                },
                //查询当前活动详情
                activity_info:[],
                sftc_arr: [],
                checkboxChange: function () {
                    if (this.sftc_arr.length == 1) {
                        this.data.sftc = 1;
                        this.data.isTypical = 1;
                    } else {
                        this.data.sftc = 0;
                        this.data.isTypical = 0;
                    }
                },
                //活动类型
                activity_type: [],
                module_type: 0,
                //保存
                save_data: function () {
                    var uploaderWorks = data_center.ctrl("add_pra_ma_uploader");
                    var is_complete = uploaderWorks.is_finished();
                    if (this.module_type == 6) {
                        if (this.data.role == '') {
                            toastr.warning('请填写担任角色');
                            return;
                        } else if (this.data.task == '') {
                            toastr.warning('请填写承担任务');
                            return;
                        }
                    }
                    if (this.data.place == '') {
                        toastr.warning('请填写活动地点');
                        return;
                    } else if (this.data.member == '') {
                        toastr.warning('请填写活动参与成员');
                        return;
                    } else if (this.data.describe == '') {
                        toastr.warning('请填写活动详细描述');
                        return;
                    } else if (this.data.thoughts == '') {
                        toastr.warning('请填写收获感想');
                        return;
                    }
                    else if (is_complete == true) {
                        var files = uploaderWorks.get_files();
                        this.data.attachment = JSON.stringify(files);
                        var self = this;
                        if (files.length == 0) {
                            layer.confirm('同学:该条记录需要上传相关证实材料，如无材料将不能入进行遴选!是否确认提交？', {
                                    btn: ['取消', '确定'] //按钮
                                }, function () {
                                    layer.closeAll();
                                }, function () {
                                    self.ajax_add_fn();
                                }
                            );
                        } else {
                            self.ajax_add_fn();

                        }


                    }

                },
                ajax_add_fn: function () {
                    var obj = {};
                    obj.fk_hd_id = vm.get_id;
                    var module_type = this.module_type;
                    var remark = this.data.sftc;
                    var status = 0;
                    if (remark == 0) {//不是特长
                        status = 0;//草稿
                        obj.isTypical = 0;
                    } else {
                        obj.isTypical = 1;
                        status = 1;//待审核
                    }
                    if (this.is_update == true) {
                        obj.id = this.update_id;
                    }
                    switch (module_type) {
                        case 2://思想品德
                            obj.activity_describe = this.data.describe;
                            obj.activity_type = this.data.activity_type;
                            obj.attachment = this.data.attachment;
                            obj.end_time = this.data.end;
                            obj.feel = this.data.thoughts;
                            obj.member = this.data.member;
                            obj.site = this.data.place;
                            obj.start_time = this.data.start;
                            obj.title = this.data.name;
                            obj.sftc = this.data.sftc;
                            obj.status = status;
                            obj.frist_index = this.get_f_index;
                            obj.second_index = this.get_e_index;
                            console.log(obj);
                            cloud.add_or_modify_morality(obj, function (url, args, ret, is_suc, msg,data) {
                                if(is_suc){
                                    ajax_post(api_add_suc,{fk_hd_id:vm.get_id,fk_ywb_id:ret.id},vm);
                                }else{
                                    toastr.error(msg);
                                }
                            });
                            break;
                        case 6://学业水平
                            obj.process = this.data.describe;
                            obj.course_type = this.data.activity_type;
                            obj.attachment = this.data.attachment;
                            obj.end_date = this.data.end;
                            obj.feel = this.data.thoughts;
                            obj.member = this.data.member;
                            obj.site = this.data.place;
                            obj.start_date = this.data.start;
                            obj.course_name = this.data.name;
                            obj.sftc = this.data.sftc;
                            obj.theme = this.data.name;
                            obj.duty = this.data.task;
                            obj.role = this.data.role;
                            obj.tutor = this.data.teacher;
                            obj.status = status;
                            obj.frist_index = this.get_f_index;
                            obj.second_index = this.get_e_index;
                            obj.tutor = this.activity_info.zdls_list[0].zdls;
                            cloud.add_or_modify_study(obj, function (url, args, ret, is_suc, msg) {
                                if(is_suc){
                                    ajax_post(api_add_suc,{fk_hd_id:vm.get_id,fk_ywb_id:ret.id},vm);
                                }else{
                                    toastr.error(msg);
                                }
                            });
                            break;
                        case 7://身心健康
                            if (status == 0) {
                                status = 2
                            }
                            obj.hea_activityDescribe = this.data.describe;
                            obj.hea_activityType = this.data.activity_type;
                            obj.hea_enclosure = this.data.attachment;
                            obj.hea_endDate = this.data.end;
                            obj.hea_activityFeel = this.data.thoughts;
                            obj.hea_member = this.data.member;
                            obj.hea_activityPlace = this.data.place;
                            obj.hea_startDate = this.data.start;
                            obj.hea_activityName = this.data.name;
                            obj.sftc = this.data.sftc;
                            obj.hea_state = status;
                            obj.hea_first_level_index = this.get_f_index;
                            obj.hea_two_level_index = this.get_e_index;
                            cloud.add_or_modify_health_activity(obj, function (url, args, ret, is_suc, msg) {
                                if(is_suc){
                                    ajax_post(api_add_suc,{fk_hd_id:vm.get_id,fk_ywb_id:ret.id},vm);
                                }else{
                                    toastr.error(msg);
                                }
                            });
                            break;
                        case 5://艺术素养
                            if (status == 0) {
                                status = 2
                            }
                            obj.art_describe = this.data.describe;
                            obj.art_type = this.data.activity_type;
                            obj.art_enclosure = this.data.attachment;
                            obj.art_end_time = this.data.end;
                            obj.art_feel = this.data.thoughts;
                            obj.art_member = this.data.member;
                            obj.art_place = this.data.place;
                            obj.art_start_time = this.data.start;
                            obj.art_name = this.data.name;
                            obj.sftc = this.data.sftc;
                            obj.art_state = status;
                            obj.art_first_level_index = this.get_f_index;
                            obj.art_two_level_index = this.get_e_index;
                            cloud.add_or_modify_artactivity(obj, function (url, args, ret, is_suc, msg) {
                                if(is_suc){
                                    ajax_post(api_add_suc,{fk_hd_id:vm.get_id,fk_ywb_id:ret.id},vm);
                                }else{
                                    toastr.error(msg);
                                }
                            });
                            break;
                        case 4://社会实践
                            obj.activity_describe = this.data.describe;
                            obj.activity_type = this.data.activity_type;
                            obj.attachment = this.data.attachment;
                            obj.end_date = this.data.end;
                            obj.feel = this.data.thoughts;
                            obj.member = this.data.member;
                            obj.site = this.data.place;
                            obj.start_date = this.data.start;
                            obj.title = this.data.name;
                            obj.sftc = this.data.sftc;
                            obj.status = status;
                            obj.frist_index = this.get_f_index;
                            obj.second_index = this.get_e_index;
                            cloud.add_or_modify_practice(obj, function (url, args, ret, is_suc, msg) {
                                if(is_suc){
                                    ajax_post(api_add_suc,{fk_hd_id:vm.get_id,fk_ywb_id:ret.id},vm);
                                }else{
                                    toastr.error(msg);
                                }
                            });
                            break;
                    };
                },
                deal_types: function (data) {
                    if (!data.data || !data.data.list)
                        return;
                    this.activity_type = [];
                    var list_length = data.data.list.length;
                    var obj_first = {"id": 0, "value": "", "type_name": "请选择"};
                    this.activity_type.push(obj_first);
                    for (var i = 0; i < list_length; i++) {
                        var name = data.data.list[i].type_name;
                        var obj = {
                            "id": i+1,
                            "value": name,
                            "type_name": name
                        };
                        this.activity_type.push(obj);
                    }

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //公示审核管控
                            case api_query_pub:
                                this.complete_query_pub(data);
                                break;
                            //查询指标
                            case api_get_index:
                                this.complete_get_index(data);
                                break;
                            case api_get_personality_list:
                                this.complete_get_personality_list(data);
                                break;
                            //    查询活动详情
                            case api_get_activity:
                                this.complete_get_activity(data);
                                break;
                            case type_list_api:
                                this.deal_types(data);
                                break;
                            case api_add_suc:
                                window.location = '#my_list';
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //公示审核管控
                complete_query_pub:function(data){
                    var type = false;
                    var list = data.data;
                    if(list != null && list.length>0){
                        //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                        //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                        //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                        //xsqr（学生确认）：0否1是
                        for(var i=0;i<list.length;i++){
                            var mkid = list[i].mkid;
                            if(mkid == 2){//综合实践活动
                                type = true;
                                break;
                            }
                        }
                    }
                    if(type == true){
                        //1:作品 2:品德 3:成就 4:实践 5:艺术活动 6:研究型学习 7:身心健康 8:日常表现
                        this.personality_list = [];
                        ajax_post(type_list_api, {type: this.module_type}, this);
                        ajax_post(api_get_personality_list, {fk_realistic_moduletid: this.module_type}, this);
                    }else{
                        layer.alert('市管理员公示审核管控还未设置', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                    }
                },
                complete_get_index:function (data) {
                    var select_ = '';
                    if(pmx.id){
                        select_ = this.data.activity_type;
                    }else{
                        select_ = this.get_lx;
                    }
                    var dataList = data.data;
                    var dataLength = dataList.length;
                    for(var i = 0; i < dataLength; i++){
                        if(select_ == dataList[i].type_name){
                            this.get_f_index = dataList[i].first_index_name;
                            this.get_e_index = dataList[i].second_index_name;
                        }
                    }
                    ajax_post(api_query_pub,{},this);
                },
                get_lx:"",
                get_id:"",
                tc:0,
                complete_get_personality_list: function (data) {
                    var s_x = '';
                    if(pmx.id){
                        s_x = this.data.activity_type;
                    }else{
                        s_x =  this.get_lx;
                    }
                    var dataList = data.data;
                    var dataLength = dataList.length;
                    for (var i = 0; i < dataLength; i++) {
                        if(dataList[i].ps_type_name == s_x){
                            this.tc = 1;
                        }
                    }
                    var get_el = JSON.parse(sessionStorage.getItem("uploading_material"));
                    var school_id = cloud.user_school_id();
                //    查询活动详情
                    ajax_post(api_get_activity,{fk_cjdw_id:school_id,id:get_el.id},this);
                },
                //查询活动详情
                complete_get_activity:function(data){
                    this.activity_info = data.data;
                },
                //数据回显
                get_info: function () {
                    if(pmx.id){//修改
                        this.is_update = true;
                        //模块1品德 2艺术活动3社会实践4学业水平5身心健康6成就奖励7日常表现
                        this.get_id = Number(pmx.fk_hd_id);
                        var mk = pmx.mk;
                        var id = Number(pmx.id);
                        this.update_id = id;
                        if (mk == 1) {//思想品德
                            this.module_type = 2;
                            cloud.get_morality_detial({id: id}, function (url, ars, data) {
                                vm.data.name = data.title;
                                vm.data.activity_type = data.activity_type;
                                vm.data.start = data.start_time;
                                vm.data.end = data.end_time;
                                vm.data.place = data.site;
                                vm.data.member = data.member;
                                vm.data.describe = data.activity_describe;
                                vm.data.attachment = data.attachment;
                                vm.data.thoughts = data.feel;
                                vm.get_f_index = data.frist_index;
                                vm.get_e_index = data.second_index;
                                if (data.sftc == 1) {
                                    vm.sftc_arr = ['11'];
                                    vm.data.isTypical = 1;
                                } else {
                                    vm.sftc_arr = [];
                                    vm.data.isTypical = 0
                                }

                                vm.files = data.attachment;
                            });
                        } else if (mk == 4) {//学业水平
                            this.module_type = 6;
                            cloud.get_study_detial({id: id}, function (url, ars, data) {
                                vm.data.name = data.course_name;
                                vm.data.activity_type = data.course_type;
                                vm.data.start = data.start_date;
                                vm.data.end = data.end_date;
                                vm.data.place = data.site;
                                vm.data.member = data.member;
                                vm.data.describe = data.process;
                                vm.data.attachment = data.attachment;
                                vm.data.theme = data.theme;
                                vm.data.role = data.role;
                                vm.data.task = data.duty;
                                vm.data.tutor = data.teacher;
                                vm.data.thoughts = data.feel;
                                vm.get_f_index = data.frist_index;
                                vm.get_e_index = data.second_index;
                                if (data.sftc == 1) {
                                    vm.sftc_arr = ['11'];
                                } else {
                                    vm.sftc_arr = [];
                                }
                                vm.files = data.art_enclosure;
                            });

                        } else if (mk == 5) {//身心健康
                            this.module_type = 7;
                            cloud.get_health_detial({id: id}, function (url, ars, data) {
                                vm.data.name = data.hea_activityName;
                                vm.data.activity_type = data.hea_activityType;
                                vm.data.start = data.hea_startDate;
                                vm.data.end = data.hea_endDate;
                                vm.data.place = data.hea_activityPlace;
                                vm.data.member = data.hea_member;
                                vm.data.describe = data.hea_activityDescribe;
                                vm.data.attachment = data.hea_enclosure;
                                vm.data.thoughts = data.hea_activityFeel;
                                vm.get_f_index = data.hea_two_level_index;
                                vm.get_e_index = data.second_index;
                                if (data.sftc == 1) {
                                    vm.sftc_arr = ['11'];
                                } else {
                                    vm.sftc_arr = [];
                                }
                                vm.files = data.hea_enclosure;
                            });

                        } else if (mk == 2) {//艺术素养
                            this.module_type = 5;
                            cloud.get_art_detial({id: id}, function (url, ars, data) {
                                vm.data.name = data.art_name;
                                vm.data.activity_type = data.art_type;
                                vm.data.start = data.art_start_time;
                                vm.data.end = data.art_end_time;
                                vm.data.place = data.art_place;
                                vm.data.member = data.art_member;
                                vm.data.describe = data.art_describe;
                                vm.data.attachment = data.art_enclosure;
                                vm.data.thoughts = data.art_feel;
                                vm.get_f_index = data.art_first_level_index;
                                vm.get_e_index = data.art_two_level_index;
                                if (data.sftc == 1) {
                                    vm.sftc_arr = ['11'];
                                } else {
                                    vm.sftc_arr = [];
                                }
                                vm.files = data.art_enclosure;
                            });

                        } else if (mk == 3) {//社会实践
                            this.module_type = 4;
                            cloud.get_social_detial({id: id}, function (url, ars, data) {
                                vm.data.name = data.title;
                                vm.data.activity_type = data.activity_type;
                                vm.data.start = data.start_date;
                                vm.data.end = data.end_date;
                                vm.data.place = data.site;
                                vm.data.member = data.member;
                                vm.data.describe = data.activity_describe;
                                vm.data.attachment = data.attachment;
                                vm.data.thoughts = data.feel;
                                vm.get_f_index = data.frist_index;
                                vm.get_e_index = data.second_index;
                                if (data.sftc == 1) {
                                    vm.sftc_arr = ['11'];
                                } else {
                                    vm.sftc_arr = [];
                                }
                                vm.files = data.attachment;
                            });
                        }
                        // //1:作品 2:品德 3:成就 4:实践 5:艺术活动 6:研究型学习 7:身心健康 8:日常表现
                        // this.personality_list = [];
                        // ajax_post(type_list_api, {type: this.module_type}, this);
                        // ajax_post(api_get_personality_list, {fk_realistic_moduletid: this.module_type}, this);
                    }else{
                        var get_el = sessionStorage.getItem("uploading_material");
                        get_el = JSON.parse(get_el);
                        this.get_lx = get_el.lx;
                        this.get_id = get_el.id;
                        console.log(get_el);
                        //记录类型 1作品2品德3成就4实践5艺术活动6研究型学习7身心健康8日常表现
                        this.module_type = get_el.jllx;
                        if(get_el.jllx == 6){
                            vm.data.name = get_el.bt;
                            vm.data.activity_type = get_el.lx;
                            vm.data.start = get_el.hd_kssj;
                            vm.data.end = get_el.hd_jssj;
                            vm.data.place = '';
                            vm.data.member = '';
                            vm.data.describe ='';
                            vm.data.attachment = '';
                            vm.data.role = '';
                            vm.data.task = '';
                            vm.data.tutor = '';
                            vm.data.thoughts = '';
                            vm.data.teacher = get_el.zdls;
                        }else{
                            vm.data.name = get_el.bt;
                            vm.data.activity_type = get_el.lx;
                            vm.data.start = get_el.hd_kssj;
                            vm.data.end = get_el.hd_jssj;
                            vm.data.place = '';
                            vm.data.member = '';
                            vm.data.describe = '';
                            vm.data.attachment = '';
                            vm.data.thoughts = '';
                        }
                    }
                    ajax_post(api_get_index,{type:this.module_type},this);

                }
            });
            vm.$watch('onReady', function () {
                vm.get_info();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });