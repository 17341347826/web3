define([
        C.CLF('avalon.js'),
        'layer',"date_zh",
        C.CM("add_wx_practice_module", "html!"),
        C.CM("add_wx_practice_module", "css!"),
        C.CMF("data_center.js"),
        C.CMF("viewer/viewer.js"), C.CMF("uploader/uploader.js")
    ],
    function(avalon,layer,date_zh, html, css,data_center,viewer, uploader) {
        var pdetail = undefined;
        var vm = avalon.component('ms-add-wx-practice-module', {
            template: html,
            defaults: {
                //审核公式管控-查询
                api_query_pub : api.api+'GrowthRecordBag/publicity_audit_query',
                //文件上传
                api_file_uploader : api.api + "file/uploader",
                //查询个性特长设置
                api_get_personality_list : api.api + "GrowthRecordBag/find_personality_set_list",
                //获取活动类型列表
                type_list_api : api.api + "GrowthRecordBag/page_list_type",
                //获取系统当前时间
                api_get_server_time : api.api + 'base/baseUser/current_time',
                //根据类型名称和模块查询 详情
                api_get_index : api.api + "GrowthRecordBag/list_type",
                is_update: false,//是否是修改
                update_id: "",//修改时的记录id
                disabled: {'disabled': true},
                files: [],
                uploader_url: api.api + "file/uploader",
                pmx:"",
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
                sftc_arr: [],
                //当网络延迟的时候禁止再次提交或者快速点击多次提交禁止:false-能提交，true-不能提交
                btn_has:false,
                checkboxChange: function () {
                    if (this.sftc_arr.length == 1) {
                        this.data.sftc = 1;
                        this.data.isTypical = 1;
                    } else {
                        this.data.sftc = 0;
                        this.data.isTypical = 0;
                    }
                },
                type_focus:function(){
                    if(this.module_type=='0'){
                        $.alert('请先选择模块');
                    }
                },
                //活动类型
                activity_type: [],
                module_type: 0,
                //选择模块
                moduleChange: function () {
                    //在模块切换的时候就清空之前的活动类型列表，以免出现因为网络延迟，活动类型错乱的问题
                    this.activity_type = [];
                    if(this.is_update == true){
                        ajax_post(this.type_list_api, {type: this.module_type}, this);
                        ajax_post(this.api_get_personality_list, {fk_realistic_moduletid: this.module_type}, this);
                    }else{
                        //公示审核管控
                        ajax_post(this.api_query_pub,{},this);
                    }

                },
                //保存
                save_data: function () {
                    //当已经点击了保存不在走后面的流程
                    if(this.btn_has)
                        return;
                    var start_t = new Date(Date.parse(this.data.start.replace('/-/g','/'))).getTime();
                    var end_t = new Date(Date.parse(this.data.end.replace('/-/g','/'))).getTime();
                    var cur_time = cloud.get_current_time().current_time;
                    if (this.module_type == 6) {
                        if ($.trim(this.data.teacher) == '') {
                            $.alert('请填写指导老师');
                            return;
                        } else if (this.data.role == '') {
                            $.alert('请填写担任角色');
                            return;
                        } else if (this.data.task == '') {
                            $.alert('请填写承担任务');
                            return;
                        } else if (this.data.theme == '') {
                            $.alert('请填写主题');
                            return;
                        }
                    }
                    if ($.trim(this.data.name) == '') {
                        $.alert('请填写活动名称');
                        return;
                    } else if (this.data.activity_type == '') {
                        $.alert('请选择活动类型');
                        return;
                    } else if (this.data.start == '') {
                        $.alert('请选择活动开始时间');
                        return;
                    } else if (this.data.end == '') {
                        $.alert('请选择活动结束时间');
                        return;
                    }  else if (start_t > cur_time) {
                        $.alert('活动开始时间不能大于当前时间');
                        return;
                    } else if (end_t > cur_time) {
                        $.alert('活动结束时间不能大于当前时间');
                        return;
                    }else if (end_t <= start_t) {
                        $.alert('活动开始时间应该小于活动结束时间');
                        return;
                    } else if (this.data.place == '') {
                        $.alert('请填写活动地点');
                        return;
                    } else if (this.data.member == '') {
                        $.alert('请填写活动参与成员');
                        return;
                    } else if (this.data.describe == '') {
                        $.alert('请填写活动详细描述');
                        return;
                    } else if (this.data.thoughts == '') {
                        $.alert('请填写活动感想');
                        return;
                    }
                    else{
                        var str = '[';
                        for (var i = 0; i < this.files.length; i++) {

                            if (i == this.files.length - 1) {
                                str = str + this.files[i];
                            } else {
                                str = str + this.files[i] + ',';
                            }
                        }
                        str += ']';
                        this.data.attachment = str;
                        var self = this;
                        self.btn_has = true;
                        self.ajax_add_fn();
                    }

                },
                ajax_add_fn: function () {
                    var obj = {};
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
                            cloud.add_or_modify_morality(obj, function (url, args, ret, is_suc, msg) {
                               if(is_suc){
                                   window.location = '#stu_record_material';
                               }else{
                                   $.alert(msg);
                                   vm.btn_has = false;
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
                            obj.theme = this.data.theme;
                            obj.duty = this.data.task;
                            obj.role = this.data.role;
                            obj.tutor = this.data.teacher;
                            obj.status = status;
                            obj.frist_index = this.get_f_index;
                            obj.second_index = this.get_e_index;
                            cloud.add_or_modify_study(obj, function (url, args, ret, is_suc, msg) {
                                if(is_suc){
                                    window.location = '#stu_record_material';
                                }else{
                                    $.alert(msg);
                                    vm.btn_has = false;
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
                                    window.location = '#stu_record_material';
                                }else{
                                    $.alert(msg);
                                    vm.btn_has = false;
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
                                    window.location = '#stu_record_material';
                                }else{
                                    $.alert(msg);
                                    vm.btn_has = false;
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
                                    window.location = '#stu_record_material';
                                }else{
                                    $.alert(msg);
                                    vm.btn_has = false;
                                }
                            });
                            break;
                    };
                },
                deal_types: function (data) {
                    this.activity_type = [];
                    if (!data.data || !data.data.list)
                        return;
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
                            case this.api_query_pub:
                                this.complete_query_pub(data);
                                break;
                            //查询指标
                            case this.api_get_index:
                                this.complete_get_index(data);
                                break;
                            case this.api_get_server_time:
                                this.complete_get_server_time(data);
                                break;
                            case this.api_get_personality_list:
                                this.complete_get_personality_list(data);
                                break;
                            case this.type_list_api:
                                this.deal_types(data);
                                break;
                            case this.api_file_uploader:
                                this.load_success_index++;
                                if (this.load_success_index == this.all_load_index) {
                                    this.sub_disabled = false;
                                    $.hideLoading();
                                }
                                var file_data = data.data;
                                var file_data_str = JSON.stringify(file_data);
                                this.files.push(file_data_str);
                                break;
                        }
                    } else {
                        $.alert(msg);
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
                        if (this.is_update == false) {
                            // data_center.ctrl("uploader_practice").clear();
                        }
                        //1:作品 2:品德 3:成就 4:实践 5:艺术活动 6:研究型学习 7:身心健康 8:日常表现
                        this.personality_list = [];
                        ajax_post(this.type_list_api, {type: this.module_type}, this);
                        this.data.name = '';
                        this.data.activity_type = '';
                        this.data.start = '';
                        this.data.end = '';
                        this.data.place = '';
                        this.data.member = '';
                        this.data.teacher = '';
                        this.data.role = '';
                        this.data.task = '';
                        this.data.theme = '';
                        this.data.describe = '';
                        this.data.thoughts = '';
                        this.data.attachment = [];
                        this.data.sftc = 0;
                        ajax_post(this.api_get_personality_list, {fk_realistic_moduletid: this.module_type}, this);
                    }else{
                        $.alert('市管理员公示审核管控还未设置');
                    }
                },
                typeChange:function () {
                    ajax_post(this.api_get_index,{type:this.module_type},this);
                },
                complete_get_index:function (data) {
                    var select_ = this.data.activity_type;
                    var dataList = data.data;
                    var dataLength = dataList.length;
                    for(var i = 0; i < dataLength; i++){
                        if(select_ == dataList[i].type_name){
                            this.get_f_index = dataList[i].first_index_name;
                            this.get_e_index = dataList[i].second_index_name;
                        }
                    }
                },
                complete_get_personality_list: function (data) {
                    var dataList = data.data;
                    var dataLength = dataList.length;
                    for (var i = 0; i < dataLength; i++) {
                        this.personality_list.push(dataList[i].ps_type_name);
                    }
                },
                //数据回显
                get_info: function () {
                    this.file_uploader();
                    var mk = this.pmx.mk;
                    if (mk != undefined) {
                        this.is_update = true;
                        var id = Number(pmx.id);
                        this.update_id = id;
                        //模块1品德 2艺术活动3社会实践4学业水平5身心健康6成就奖励7日常表现
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
                            cloud.get_study_detial({id: id});
                            vm.data.name = data.title;
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
                            vm.files = JSON.parse(data.art_enclosure);
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
                                vm.files = JSON.parse(data.hea_enclosure);
                            });

                        } else if (mk == 2) {//艺术素养
                            this.module_type = 5;
                            this.moduleChange();
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
                                vm.files = JSON.parse(data.art_enclosure);
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
                                vm.files = JSON.parse(data.art_enclosure);
                            });

                        }
                        this.moduleChange();
                    } else {
                        this.is_update = false;
                    }
                },
                current_time:function () {
                    ajax_post(this.api_get_server_time, {}, this);
                },
                cur_time:'',
                complete_get_server_time:function (data) {
                    var time = data.data.time_str;
                    this.cur_time = data.data.current_time;
                    var self = this;
                    $("#start_time").datetimePicker({
                        max:time,
                        onChange:function(e){
                            // if(e.value.length>0){
                            //     var val = e.value[0]+'-'+e.value[1]+'-'+e.value[2]+' '+e.value[3]+':'+e.value[4];
                            // }
                            // var st = new Date(Date.parse(val .replace('/-/g','/'))).getTime();
                            // if(st>self.cur_time){
                            //     self.data.start = '';
                            //     this.value = [];
                            //     $.alert('开始时间不能大于当前时间');
                            //     return;
                            // }
                            // // console.log(self.data.start);
                            // if(self.data.end != ''){
                            //     var et = new Date(Date.parse(self.data.end .replace('/-/g','/'))).getTime();
                            //     if(st>=et){
                            //         self.data.start = '';
                            //         this.value = [];
                            //         $.alert('开始时间应该小于结束时间');
                            //         return;
                            //     }
                            // }
                        },
                    });
                    $("#end_time").datetimePicker({
                        max:this.cur_time,
                        onChange:function(e){
                            // if(e.value.length>0){
                            //     var val = e.value[0]+'-'+e.value[1]+'-'+e.value[2]+' '+e.value[3]+':'+e.value[4];
                            // }
                            // var et = new Date(Date.parse(val .replace('/-/g','/'))).getTime();
                            // if(et>self.cur_time){
                            //     self.data.end = '';
                            //     this.value = [];
                            //     $.alert('结束时间不能大于当前时间');
                            //     return;
                            // }
                            // // console.log(self.data.start);
                            // if(self.data.start != ''){
                            //     var st = new Date(Date.parse(self.data.start .replace('/-/g','/'))).getTime();
                            //     if(et<=st){
                            //         self.data.end = '';
                            //         this.value = [];
                            //         $.alert('结束时间应该大于开始时间');
                            //         return;
                            //     }
                            // }
                        },
                    });
                    // $('#end_time').datetimepicker({
                    //     format: 'yyyy-mm-dd hh:ii',
                    //     language: 'zh-CN'
                    //
                    // });
                    // $('#start_time').datetimepicker({
                    //     format: 'yyyy-mm-dd hh:ii',
                    //     language: 'zh-CN'
                    // });
                    // $('#start_time').datetimepicker('setEndDate', time);
                    // $('#end_time').datetimepicker('setEndDate', time);
                },
                //加载未完成按钮不能点击：true-不能点击，false-能够点击
                sub_disabled: false,
                disabled_class: 'disabled_class',
                all_load_index: 0,
                load_success_index: 0,
                can_hide_uploader: false,
                //判断是否是图片文件
                is_img_file: true,
                //是否确认上传文件
                not_up_loader: false,
                //判断是否重复文件上传
                file_name_arr: [],
                file_uploader: function () {
                    var self = this;
                    var $gallery = $("#gallery"), $galleryImg = $("#galleryImg");
                    var tmpl = '<li class="weui-uploader__file" style="background-image:url(#url#)"></li>',
                        $uploaderInput = $("#uploaderInput"),
                        $uploaderFiles = $("#uploaderFiles");
                    $uploaderInput.on("change", function (e) {

                        self.sub_disabled = true;
                        var src, url = window.URL || window.webkitURL || window.mozURL, files = e.target.files;

                        //初始化加载成功的数量
                        self.all_load_index = files.length;
                        self.load_success_index = 0;
                        for (var i = 0, len = files.length; i < len; ++i) {
                            var file = files[i];
                            if (url) {
                                src = url.createObjectURL(file);
                            } else {
                                src = e.target.result;
                            }
                            self.deal_file(file, tmpl, src, i, len);
                            if (self.not_up_loader) {
                                break;
                            }
                        }
                        if (self.not_up_loader) {
                            $("#uploaderInput").val('');
                            var uploader_files_length = $('#uploaderFiles').children().length;
                            if (uploader_files_length > 0) {
                                $("#uploaderFiles").empty();

                            }
                            if (self.file_arr.length > 0) {
                                self.file_arr = [];
                            }
                            $.hideLoading();
                            return;
                        }
                        for (var i = 0, len = files.length; i < len; ++i) {
                            var file = files[i];
                            var suffix_name_arr = file.name.split('.');
                            var suffix_name = suffix_name_arr[suffix_name_arr.length - 1];
                            if (suffix_name == 'jpg' || suffix_name == 'jpeg' || suffix_name == 'png') {
                                self.deal_img(file).then(function () {
                                    if (self.not_up_loader) {
                                        $("#uploaderInput").val('');
                                        self.file_name_arr = [];
                                        self.sub_disabled = false;
                                        var uploader_files_length = $('#uploaderFiles').children().length;
                                        if (uploader_files_length > 0) {
                                            $("#uploaderFiles").empty();
                                        }
                                        if (self.file_arr.length > 0) {
                                            self.file_arr = [];
                                        }
                                    }
                                })
                            }
                        }


                    });
                    $uploaderFiles.on("click", "li", function () {
                        $galleryImg.attr("style", this.getAttribute("style"));
                        $gallery.fadeIn(100);
                    });
                    $gallery.on("click", function () {
                        $gallery.fadeOut(100);
                    });


                },
                //判断图片大小
                deal_img: function (file) {
                    var self = this;
                    return new Promise(function (resolve, reject) {
                        var reader = new FileReader;
                        reader.readAsDataURL(file);
                        reader.onload = function (evt) {
                            var image = new Image();
                            image.onload = function () {
                                var width = this.width;
                                var height = this.height;
                                var ratio = width > height ? height / width : width / height;//长宽比
                                if (width < 300 || height < 300 || ratio < 0.5) {
                                    $.alert("图片长宽不合格");
                                    self.not_up_loader = true;
                                    resolve(self.not_up_loader);
                                } else {
                                    self.not_up_loader = false;
                                    resolve(self.not_up_loader);
                                }
                            }
                            image.src = evt.target.result;
                        }
                    })
                },
                //处理文件
                deal_file: function (file, tmpl, src, index, len) {
                    var self = this;
                    var valid_fmt = ['mp4', 'wmv', 'avi', 'rmvb', "pdf", "pptx", "doc",
                        "xls", "txt", "docx", "jpg", "jpeg", "png", "rar", "xlsx"];
                    var suffix_name_arr = file.name.split('.');
                    var suffix_name = suffix_name_arr[suffix_name_arr.length - 1];
                    suffix_name = suffix_name.toLowerCase();
                    if (valid_fmt.indexOf(suffix_name) < 0) {
                        $.alert("文件格式不支持");
                        self.file_name_arr = [];
                        self.sub_disabled = false;
                        self.not_up_loader = true;
                    } else if (file.size > 100 * 1024 * 1024) {
                        $.alert("文件过大");
                        self.sub_disabled = false;
                        self.file_name_arr = [];
                        self.not_up_loader = true;
                    } else {
                        if (suffix_name == 'jpg' || suffix_name == 'jpeg' || suffix_name == 'png') {
                            self.is_img_file = true;
                        } else {
                            self.is_img_file = false;
                        }
                        self.not_up_loader = false;
                        if (!self.not_up_loader) {
                            for (var i = 0; i < self.file_name_arr.length; i++) {
                                if (file.name == self.file_name_arr[i]) {
                                    self.sub_disabled = false;
                                    return
                                }
                            }
                            self.file_name_arr.push(file.name);
                            if (!self.is_img_file) {
                                $("#uploaderFiles").append($(tmpl.replace('#url#', 'common/images/file.png')));
                            } else {
                                $("#uploaderFiles").append($(tmpl.replace('#url#', src)));
                            }
                            var fm = new FormData();
                            fm.append("file", file, file.name);
                            fm.append("note", "from weixin");
                            fm.append("token", window.sessionStorage.getItem("token"));
                            if (index == 0) {
                                $.showLoading();
                            }
                            // if(index==len-1){
                            //     self.hide_uploader = true;
                            // }

                            fileUpload(this.api_file_uploader, self, fm);
                        }

                    }


                },
                onReady: function () {
                    // $("#start_time").datetimePicker();
                    // $("#end_time").datetimePicker();
                    this.get_info();
                    this.current_time();
                }
            }
        });
    })