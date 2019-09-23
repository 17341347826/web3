define([
        C.CLF('avalon.js'),
        'layer',
        "date_zh",
        C.Co('self_evaluation_management', 'my_comprehensive_practice/add_practice/add_practice', 'html!'),
        C.Co('self_evaluation_management', 'my_comprehensive_practice/add_practice/add_practice', 'css!'),
        C.CMF("data_center.js"),
        C.CMF("viewer/viewer.js"),
        C.CMF("uploader/uploader.js"),
        C.CM("select_assembly")
    ],
    function (avalon, layer, date_zh, html, css, data_center, viewer, uploader, select_assembly) {
        //审核公式管控-查询
        var api_query_pub = api.api + 'GrowthRecordBag/publicity_audit_query';
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
        var avalon_define = function (pmx) {
            //提价按钮是否可以点击1：可以点击，2：不可点击
            const CLICK_DISABLED = {
                ABLE:1,
                DISABLED:2
            };
            var vm = avalon.define({
                $id: "add-practice",
                wd_list_selected: 999,
                wd_list: [
                    {value: 2, name: '思想品德'},
                    {value: 6, name: '学业水平'},
                    {value: 7, name: '身心健康'},
                    {value: 5, name: '艺术素养'},
                    {value: 4, name: '社会实践'}
                ],
                is_update: false,//是否是修改
                update_id: "",//修改时的记录id
                disabled: {'disabled': true},
                files: [],
                //重复提交：1-可以请求接口，2-不可以请求接口
                is_click: CLICK_DISABLED.ABLE,
                uploader_url: api_file_uploader,
                personality_list: [],
                get_f_index: "",
                get_e_index: "",
                //说明显示
                explain_display: true,
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
                //开始时间
                get_start_date: function () {
                    if (vm.data.end != '') {
                        $('#start_time').datetimepicker('setEndDate', vm.data.end);
                    }
                    $('#start_time')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            vm.data.start = e.currentTarget.value;
                        });
                },
                start_click: function () {
                    $('#start_time').datetimepicker('show');

                },
                end_click: function () {
                    $('#end_time').datetimepicker('show');

                },
                //结束时间
                get_end_date: function () {
                    $('#end_time').datetimepicker('setStartDate', vm.data.start);
                    $('#end_time')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            vm.data.end = e.currentTarget.value;
                        });
                },
                //选择模块
                moduleChange: function (el, $index) {
                    //在模块切换的时候就清空之前的活动类型列表，以免出现因为网络延迟，活动类型错乱的问题
                    this.activity_type = [];
                    this.explain_display = false;
                    if (this.is_update == true) {
                        ajax_post(type_list_api, {type: this.module_type}, this);
                        ajax_post(api_get_personality_list, {fk_realistic_moduletid: this.module_type}, this);
                    } else {
                        this.wd_list_selected = $index;
                        this.module_type = Number(el.value);
                        //公示审核管控
                        ajax_post(api_query_pub, {}, this);
                    }

                },
                onBlack: function () {
                    console.log(window.location.hash)
                    if (window.location.hash !== '#add_practice') {
                        window.history.go(-1);
                        return;
                    }
                    this.explain_display = true;
                    this.module_type = 0;
                },
                //保存
                save_data: function () {
                    var uploaderWorks = data_center.ctrl("uploader_practice");
                    var is_complete = uploaderWorks.is_finished();
                    if (this.module_type == 6) {
                        if ($.trim(this.data.name) == '') {
                            toastr.warning('请填写活动名称');
                            return;
                        } else if (this.data.activity_type == '') {
                            toastr.warning('请选择活动类型');
                            return;
                        } else if (this.data.start == '') {
                            toastr.warning('请选择活动开始时间');
                            return;
                        } else if (this.data.end == '') {
                            toastr.warning('请选择活动结束时间');
                            return;
                        } else if (this.data.end < this.data.start) {
                            toastr.warning('活动开始时间应该小于活动结束时间');
                            return;
                        } else if (this.data.place == '') {
                            toastr.warning('请填写活动地点');
                            return;
                        } else if (this.data.member == '') {
                            toastr.warning('请填写活动参与成员');
                            return;
                        } else if ($.trim(this.data.teacher) == '') {
                            toastr.warning('请填写指导老师');
                            return;
                        } else if (this.data.role == '') {
                            toastr.warning('请填写担任角色');
                            return;
                        } else if (this.data.task == '') {
                            toastr.warning('请填写承担任务');
                            return;
                        } else if (this.data.theme == '') {
                            toastr.warning('请填写主题');
                            return;
                        } else if (this.data.describe == '') {
                            toastr.warning('请填写活动详细描述');
                            return;
                        } else if (this.data.thoughts == '') {
                            toastr.warning('请填写收获感想');
                            return;
                        } else if ($.trim(this.data.name).length > 60) {
                            toastr.warning('输入的活动名称不能超过60个字符');
                            return;
                        } else if (this.data.place.length > 60) {
                            toastr.warning('输入的活动地点不能超过60个字符');
                            return;
                        } else if (this.data.member.length > 60) {
                            toastr.warning('输入的活动参与成员不能超过60个字符');
                            return;
                        } else if ($.trim(this.data.teacher).length > 60) {
                            toastr.warning('输入的指导老师不能超过60个字符');
                            return;
                        } else if (this.data.role.length > 60) {
                            toastr.warning('输入的担任角色不能超过60个字符');
                            return;
                        } else if (this.data.task.length > 60) {
                            toastr.warning('输入的承担任务不能超过60个字符');
                            return;
                        } else if (this.data.theme.length > 60) {
                            toastr.warning('输入的主题不能超过60个字符');
                            return;
                        } else if (this.data.describe.length > 200) {
                            toastr.warning('输入的活动详细描述不能超过60个字符');
                            return;
                        } else if (this.data.thoughts.length > 200) {
                            toastr.warning('输入的收获感想不能超过60个字符');
                            return;
                        }
                    } else {
                        if ($.trim(this.data.name) == '') {
                            toastr.warning('请填写活动名称');
                            return;
                        } else if (this.data.activity_type == '') {
                            toastr.warning('请选择活动类型');
                            return;
                        } else if (this.data.start == '') {
                            toastr.warning('请选择活动开始时间');
                            return;
                        } else if (this.data.end == '') {
                            toastr.warning('请选择活动结束时间');
                            return;
                        } else if (this.data.end < this.data.start) {
                            toastr.warning('活动开始时间应该小于活动结束时间');
                            return;
                        } else if (this.data.place == '') {
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
                        } else if ($.trim(this.data.name).length > 60) {
                            toastr.warning('输入的活动名称不能超过60个字符');
                            return;
                        } else if (this.data.place.length > 60) {
                            toastr.warning('输入的活动地点不能超过60个字符');
                            return;
                        } else if (this.data.member.length > 60) {
                            toastr.warning('输入的活动参与成员不能超过60个字符');
                            return;
                        } else if (this.data.describe.length > 200) {
                            toastr.warning('输入的活动详细描述不能超过60个字符');
                            return;
                        } else if (this.data.thoughts.length > 200) {
                            toastr.warning('输入的收获感想不能超过60个字符');
                            return;
                        }
                    }
                    if (is_complete == true) {
                        var files = uploaderWorks.get_files();
                        this.data.attachment = JSON.stringify(files);
                        var self = this;
                        if (files.length == 0) {
                            layer.confirm('同学:该条记录需要上传相关证实材料，若无佐证材料将不能进行遴选!是否确认提交？', {
                                    btn: ['取消', '确定'] //按钮
                                }, function () {
                                    layer.closeAll();
                                }, function () {
                                    if (self.is_click == CLICK_DISABLED.ABLE) {
                                        self.is_click = CLICK_DISABLED.DISABLED;
                                        self.ajax_add_fn();
                                    }
                                }
                            );
                        } else {
                            if (self.is_click == CLICK_DISABLED.ABLE) {
                                self.is_click = CLICK_DISABLED.DISABLED;
                                self.ajax_add_fn();
                            }
                        }


                    }

                },
                //添加
                ajax_add_fn: function () {
                    // vm.is_click = 2;
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
                                if (is_suc) {
                                    if (vm.is_update == true) {
                                        toastr.success('修改成功');
                                    } else {
                                        toastr.success('添加成功');
                                    }
                                    vm.reset_page()
                                } else {
                                    vm.is_click = CLICK_DISABLED.ABLE;
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
                            obj.theme = this.data.theme;
                            obj.duty = this.data.task;
                            obj.role = this.data.role;
                            obj.tutor = this.data.teacher;
                            obj.status = status;
                            obj.frist_index = this.get_f_index;
                            obj.second_index = this.get_e_index;
                            cloud.add_or_modify_study(obj, function (url, args, ret, is_suc, msg) {
                                if (is_suc) {
                                    if (vm.is_update == true) {
                                        toastr.success('修改成功');
                                    } else {
                                        toastr.success('添加成功');
                                    }
                                    vm.reset_page()
                                } else {
                                    vm.is_click = CLICK_DISABLED.ABLE;
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
                                if (is_suc) {
                                    if (vm.is_update == true) {
                                        toastr.success('修改成功');
                                    } else {
                                        toastr.success('添加成功');
                                    }
                                    vm.reset_page()
                                } else {
                                    vm.is_click = CLICK_DISABLED.ABLE;
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
                                if (is_suc) {
                                    if (vm.is_update == true) {
                                        toastr.success('修改成功');
                                    } else {
                                        toastr.success('添加成功');
                                    }
                                    vm.reset_page()
                                } else {
                                    vm.is_click = CLICK_DISABLED.ABLE;
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
                                if (is_suc) {
                                    if (vm.is_update == true) {
                                        toastr.success('修改成功');
                                    } else {
                                        toastr.success('添加成功');
                                    }
                                vm.reset_page()
                                } else {
                                    vm.is_click = CLICK_DISABLED.ABLE;
                                    toastr.error(msg);
                                }
                            });
                            break;
                    }
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
                            "id": i + 1,
                            "value": name,
                            "type_name": name
                        };
                        this.activity_type.push(obj);
                    }
                },
                reset_page: function () {
                    this.explain_display = true;
                    this.module_type = 0;
                    this.is_update = false;
                    this.is_click = CLICK_DISABLED.ABLE;
                    this.wd_list_selected = -1;
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
                            case api_get_server_time:
                                this.complete_get_server_time(data);
                                break;
                            case api_get_personality_list:
                                this.complete_get_personality_list(data);
                                break;
                            case type_list_api:
                                this.deal_types(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //公示审核管控
                complete_query_pub: function (data) {
                    var type = false;
                    var list = data.data;
                    if (list != null && list.length > 0) {
                        //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                        //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                        //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                        //xsqr（学生确认）：0否1是
                        for (var i = 0; i < list.length; i++) {
                            var mkid = list[i].mkid;
                            if (mkid == 2) {//综合实践活动
                                type = true;
                                break;
                            }
                        }
                    }
                    if (type == true) {
                        if (this.is_update == false) {
                            data_center.ctrl("uploader_practice").clear();
                        }
                        //1:作品 2:品德 3:成就 4:实践 5:艺术活动 6:研究型学习 7:身心健康 8:日常表现
                        this.personality_list = [];
                        ajax_post(type_list_api, {type: this.module_type}, this);
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
                        ajax_post(api_get_personality_list, {fk_realistic_moduletid: this.module_type}, this);
                    } else {
                        toastr.warning('市管理员公示审核管控还未设置');
                    }
                },
                typeChange: function () {
                    ajax_post(api_get_index, {type: this.module_type}, this);
                },
                complete_get_index: function (data) {
                    var select_ = this.data.activity_type;
                    var dataList = data.data;
                    var dataLength = dataList.length;
                    for (var i = 0; i < dataLength; i++) {
                        if (select_ == dataList[i].type_name) {
                            this.get_f_index = dataList[i].first_index_name;
                            this.get_e_index = dataList[i].second_index_name;
                        }
                    }
                },
                complete_get_personality_list: function (data) {
                    this.personality_list = []
                    var dataList = data.data;
                    var dataLength = dataList.length;
                    for (var i = 0; i < dataLength; i++) {
                        this.personality_list.push(dataList[i].ps_type_name);
                    }
                },
                hx_type: "",
                //数据回显
                get_info: function () {
                    var mk = pmx.mk;
                    if (mk != undefined) {
                        this.is_update = true;
                        var id = Number(pmx.id);
                        this.update_id = id;
                        //模块1品德 2艺术活动3社会实践4学业水平5身心健康6成就奖励7日常表现
                        if (mk == 1) {//思想品德
                            this.module_type = 2;
                            this.hx_type = 2;
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
                            this.hx_type = 6;
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
                                vm.data.teacher = data.tutor;
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

                        } else if (mk == 5) {//身心健康
                            this.module_type = 7;
                            this.hx_type = 7;
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
                            this.hx_type = 5;
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
                            this.hx_type = 4;
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
                        this.moduleChange();
                    } else {
                        this.is_update = false;
                    }
                },
                current_time: function () {
                    ajax_post(api_get_server_time, {}, this);
                },
                complete_get_server_time: function (data) {
                    var time = data.data.time_str;
                    $('#end_time').datetimepicker({
                        format: 'yyyy-mm-dd hh:ii',
                        language: 'zh-CN'

                    });
                    $('#start_time').datetimepicker({
                        format: 'yyyy-mm-dd hh:ii',
                        language: 'zh-CN'
                    });
                    $('#start_time').datetimepicker('setEndDate', time);
                    $('#end_time').datetimepicker('setEndDate', time);
                }
            });
            vm.$watch('onReady', function () {
                vm.get_info();
                $(function () {
                    vm.current_time();
                })

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });