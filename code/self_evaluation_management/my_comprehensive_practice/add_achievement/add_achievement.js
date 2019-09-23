define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('self_evaluation_management', 'my_comprehensive_practice/add_achievement/add_achievement', 'html!'),
        C.Co('self_evaluation_management', 'my_comprehensive_practice/add_achievement/add_achievement', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CMF("viewer/viewer.js"),
        C.CMF("uploader/uploader.js"),
        C.CM("select_assembly"),
        "date_zh"
    ],
    function (avalon, layer, html, css, data_center, three_menu_module, viewer, uploader, select_assembly, date_zh) {
        //审核公式管控-查询
        var api_query_pub = api.api + 'GrowthRecordBag/publicity_audit_query';
        //文件上传
        var api_file_uploader = api.api + "file/uploader";
        //成就修改
        var api_save_or_updateAchievement = api.growth + "achievement_updateAchievement";
        //添加成就
        var api_save_or_update_achievement = api.growth + "achievement_addAchievement";
        //成就详细-修改是调用
        var api_get_achievement_detail_by_id = api.growth + "achievement_findByAchievementID";
        //查询成就类型（实际是成就性质）
        var ach_type = api.growth + 'list_ach_type';
        //查询type_name（实际是成就类型）
        var api_get_type_name = api.api + "GrowthRecordBag/list_type";
        //根据成就类型查询成就级别
        var ach_level = api.growth + "list_ach_level";
        //根据成就奖励类型+等级查询成就等级
        var ach_rank = api.growth + 'list_ach_rank';
        //查询个性特长设置
        var api_get_personality_list = api.api + "GrowthRecordBag/find_personality_set_list";
        var avalon_define = function (pxm) {
            var vm = avalon.define({
                $id: "add_achievement",
                type: "",
                files: [],
                disabled: true,
                save_click_dis: false,
                //成就奖励公示
                achieve_pub: false,
                //避免重复提交：true-可以提交，false-不可以提交
                btn_had:true,
                is_click: 1,
                data: {
                    uploader_url: api_file_uploader,
                    form: {
                        id: "",
                        ach_state: 1,
                        /*作品状态*/
                        //-1:删除1:待审核2:提交草稿3:未通过4:审核通过
                        ach_enclosure: [],
                        //传附件
                        xz: "",
                        /*成就类型*/
                        ach_name: "",
                        /*成就名称*/
                        ach_date: "",
                        /*完成时间*/
                        ach_level: "",
                        /*成就级别*/
                        ach_rank: "",
                        /*成就等级*/
                        ach_feel: "", /*感想描述*/
                        ach_type: "",
                        sftc: 0
                    },
                    //成就性质
                    achievementType: [],
                    //成就类型
                    typeList: [],
                    //成就级别
                    achievementLevel: [],
                    //成就等级
                    achievementRank: [],
                },
                sftc_arr: [],
                //是否显示标注个性特长:false-不显示，true-显示
                speciality_show:false,
                checkboxChange: function () {
                    if (this.sftc_arr.length == 1) {
                        this.data.form.sftc = 1;
                    } else {
                        this.data.form.sftc = 0;
                    }
                },
                //成就类型
                get_ach_type: function () {
                    ajax_post(ach_type, {}, this);
                },
                //成就性质改变
                ach_xz_change: function () {
                    var ach_type = this.data.form.xz;
                    this.data.achievementLevel = [];
                    this.data.form.ach_level = '';
                    this.data.achievementRank = [];
                    this.data.form.ach_rank = '';
                    if (ach_type != '') {
                        //成就级别
                        ajax_post(ach_level, {ach_type: ach_type}, this);
                        ajax_post(api_get_type_name, {type: 3, xz: ach_type}, this);
                        this.data.form.ach_level = '';
                        this.data.achievementLevel = [];
                    }
                },
                //成就类型点击
                ach_type_click:function (){
                    if(this.data.form.xz == 0 || this.data.form.xz == ''){
                        toastr.info('请选择成就性质');
                    }
                    var type = this.data.form.ach_type;
                    if(this.personality_list.indexOf(type) > -1){
                        this.speciality_show = true;
                    }else{
                        this.speciality_show = false;
                    }
                },
                //成就级别改变
                ach_level_change: function () {
                    var ach_type = this.data.form.xz;
                    var ach_level = this.data.form.ach_level;
                    this.data.achievementRank = [];
                    this.data.form.ach_rank = '';
                    if (ach_type != '' && ach_level != '') {
                        //成就等级
                        ajax_post(ach_rank, {ach_type: ach_type, ach_level: ach_level}, this);
                    }
                },
                //成就级别点击
                ach_level_click: function(){
                    if(this.data.form.xz == 0 || this.data.form.xz == ''){
                        toastr.info('请选择成就性质');
                    }
                },
                //初始化
                init: function () {
                    ajax_post(api_query_pub, {}, this);
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        self.get_ach_type();
                    });
                },
                rules: {required: true, number: true},
                getType: function () {
                    this.type = pxm.params_type;
                },
                getId: function () {
                    this.data.form.id = pxm.achieve_id; //编辑
                },
                url_for: function (get_guid) {
                    return url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + get_guid;
                },
                getCompleteDate: function () {
                    $('#my-datepicker').datetimepicker().on('changeDate', function (e) {
                        vm.data.form.ach_date = e.currentTarget.value;
                    });
                },
                //成就等级选项改变
                rankChange: function () {
                    if (this.data.form.ach_rank == 0) {
                        this.data.form.ach_rank = '';
                        this.data.form.ach_level = 0;
                    }
                },
                /*
                * 成就等级点击:
                * 必须成就性质和成就级别选择了才能出现数据
                * */
                rankClick:function(){
                    if(this.data.form.xz == 0 || this.data.form.xz == '' || this.data.form.ach_level == '' || this.data.form.ach_level == 0){
                        toastr.info('请先选择成就性质和成就级别');
                    }
                },
                save_data: function (e) { /*提交*/
                    //判断公示管控是否设置
                    if (this.achieve_pub == false) {
                        layer.alert('市管理员公示审核管控还未设置', {
                            closeBtn: 0
                            , anim: 4 //动画类型
                        });
                        return;
                    }
                    var achievement = data_center.ctrl("achievement");
                    var files_complete;
                    var is_complete = achievement.is_finished();
                    var type = this.data.form.xz;
                    var type_rank = this.data.form.ach_rank;
                    var type_level = this.data.form.ach_level;
                    if (type == '参赛获奖') {
                        for (var i = 0; i < this.data.achievementRank.length; i++) {
                            if (type_rank == this.data.achievementRank[i].ach_rank) {
                                this.data.form.score = this.data.achievementRank[i].score;
                            }
                        }
                    } else if (type == '荣誉称号') {
                        for (var i = 0; i < this.data.achievementLevel.length; i++) {
                            if (type_level == this.data.achievementLevel[i].ach_level) {
                                this.data.form.score = this.data.achievementLevel[i].score;
                            }
                        }
                    }
                    if ($.trim(this.data.form.ach_name) == "") {
                        toastr.warning('请填写成就名称');
                        return;
                    } else if ($.trim(this.data.form.ach_name).length > 60) {
                        toastr.warning('输入的成就名称不能超过60个字符');
                        return;
                    } else if (this.data.form.ach_date == "") {
                        toastr.warning('请填写获得时间');
                        return;
                    } else if (this.data.form.xz == "") {
                        toastr.warning('请选择成就性质');
                        return;
                    } else if (this.data.form.ach_type == 0) {
                        toastr.warning('请选择成就类型');
                        return;
                    }else if (this.data.form.ach_level == "") {
                        toastr.warning('请填写成就级别');
                        return;
                    } else if (this.data.form.xz != "荣誉称号" && this.data.form.ach_rank == "") {
                        toastr.warning('请填写成就等级');
                        return;
                    } else if ($.trim(this.data.form.ach_feel) == "") {
                        toastr.warning('请填写成就感想');
                        return;
                    } else if (is_complete == true) {
                        var files = achievement.get_files();
                        this.save_click_dis = true;
                        this.data.form.ach_enclosure = JSON.stringify(files);
                        var self = this;
                        if (vm.data.form.id) {
                            if (files.length == 0) {
                                layer.confirm('同学:该条记录需要上传相关证据，如无证据将不能进入选成长记录袋，影响您的成长报告!是否确认提交？', {
                                    btn: ['取消', '确定'] //按钮
                                }, function () {
                                    self.save_click_dis = false;
                                    layer.closeAll();
                                }, function () {
                                    self.btn_had = false;
                                    //修改
                                    ajax_post(api_save_or_updateAchievement, self.data.form, self);
                                    layer.closeAll();
                                });
                            } else {
                                self.btn_had = false;
                                ajax_post(api_save_or_updateAchievement, self.data.form, self);
                            }

                        } else {
                            if (files.length == 0) {
                                layer.confirm('同学:该条记录需要上传相关证据，如无证据将不能进入选成长记录袋，影响您的成长报告!是否确认提交？', {
                                    btn: ['取消', '确定'] //按钮
                                }, function () {
                                    self.save_click_dis = false;

                                    layer.closeAll();
                                }, function () {
                                    self.btn_had = false;
                                    //添加
                                    ajax_post(api_save_or_update_achievement, self.data.form, self);
                                    vm.is_click = 0;

                                    layer.closeAll();
                                });
                            } else {
                                self.btn_had = false;
                                ajax_post(api_save_or_update_achievement, self.data.form, self);
                                vm.is_click = 0;
                            }

                        }
                    }
                },
                /*修改--回显数据*/
                product_modify: function () {
                    ajax_post(api_get_achievement_detail_by_id, {id: this.data.form.id}, this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询公式管控
                            case api_query_pub:
                                this.complete_query_pub(data);
                                break;
                            case api_save_or_update_achievement:
                                complete_saveOrUpdateAchievement(data);
                                break;
                            //成就详细-修改是调用
                            case api_get_achievement_detail_by_id:
                                complete_achievement_detail_by_id(data);
                                break;
                            case api_save_or_updateAchievement:
                                complete_saveOrUpdateAchievement(data);
                                break;
                            //成就类型
                            case ach_type:
                                this.data.achievementType = data.data;
                                break;
                            //成就级别
                            case ach_level:
                                this.data.achievementLevel = data.data;
                                break;
                            //成就等级
                            case ach_rank:
                                this.data.achievementRank = data.data;
                                break;
                            case api_get_personality_list:
                                this.complete_get_personality_list(data);
                                break;
                            case api_get_type_name:
                                // this.data.form.ach_type = data.data[0].type_name;
                                this.data.typeList = data.data;
                                break;

                        }
                    } else {
                        if(cmd==api_save_or_update_achievement){
                            this.is_click = 1;
                            this.btn_had = true;
                        }
                        toastr.error(msg)
                        $("#saveProduct").modal('open');
                        // $(".am-modal-bd").text(msg);
                    }

                },
                //查询
                find_per: function () {
                    ajax_post(api_get_personality_list, {fk_realistic_moduletid: 3}, this);
                },
                //公式管控查询
                complete_query_pub: function (data) {
                    var self = this;
                    var list = data.data;
                    if (list != null && list.length > 0) {
                        for (var i = 0; i < list.length; i++) {
                            //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                            //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                            //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                            //xsqr（学生确认）：0否1是
                            var mkid = list[i].mkid;
                            if (mkid == 3) {//成就奖励
                                self.achieve_pub = true;
                                self.cds();
                                return;
                            }
                        }
                    }
                    layer.alert('市管理员公示审核管控还未设置', {
                        closeBtn: 0
                        , anim: 4 //动画类型
                    });
                },
                personality_list: [],
                complete_get_personality_list: function (data) {
                    var dataList = data.data;
                    var dataLength = dataList.length;
                    for (var i = 0; i < dataLength; i++) {
                        // var obj = {name: dataList[i].ps_type_name};
                        // this.personality_list.push(obj);
                        this.personality_list.push(dataList[i].ps_type_name);
                        // console.log(this.personality_list);
                    }
                    //判断是否是修改
                    if (vm.data.form.id) { /*有id是修改*/
                        vm.product_modify();
                    }
                }
            });

            /*提交成功回调方法*/
            complete_saveOrUpdateAchievement = function (data) {
                toastr.success('提交成功,等待审核');
                vm.is_click = 1;
                if (vm.data.form.id) {//修改
                    window.location = '#honor_reward';
                } else {
                    vm.data.form.id = "";
                    vm.data.form.ach_state = 1;
                    vm.data.form.ach_enclosure = [];
                    vm.data.form.xz = "";
                    vm.data.form.ach_name = "";
                    vm.data.form.ach_date = "";
                    vm.data.form.ach_level = "";
                    vm.data.achievementLevel = [];
                    vm.data.form.ach_rank = "";
                    vm.data.form.ach_feel = "";
                    vm.data.typeList = [];
                    vm.data.form.ach_type = "";
                    vm.data.form.sftc = 0;
                    data_center.ctrl("achievement").clear();
                }
                // window.location = "#achieveSuccessList";
                //
            };
            /*修改 获取数据回调方法*/
            complete_achievement_detail_by_id = function (data) {
                vm.data.form.id            = data.data.id;
                vm.data.form.ach_state     = data.data.ach_state;
                /*作品状态*/
                //-1:删除1:待审核2:提交草稿3:未通过4:审核通过
                vm.data.form.ach_enclosure = data.data.ach_enclosure;
                //传附件
                vm.data.form.xz            = data.data.xz;
                /*成就类型*/
                vm.data.form.ach_name      = data.data.ach_name;
                vm.data.form.ach_date      = data.data.ach_date;
                vm.data.form.ach_level     = data.data.ach_level;
                vm.data.form.ach_rank      = data.data.ach_rank;
                vm.data.form.ach_feel      = data.data.ach_feel;
                vm.data.form.ach_type      = data.data.ach_type;
                var type = vm.data.form.ach_type;
                if(vm.personality_list.indexOf(type) > -1){ vm.speciality_show = true; }
                else{ vm.speciality_show = false; }
                vm.data.form.sftc          = data.data.sftc;
                if (data.data.sftc ===1) { $('#option1')[0].checked = true; }
                // vm.data.form = data.data;
                vm.files = data.data.ach_enclosures;
                ajax_post(api_get_type_name, {type: 3, xz: data.data.xz}, vm);
                //成就级别
                ajax_post(ach_level, {ach_type: data.data.xz}, vm);
                if (data.data.ach_type != "荣誉称号") {
                    vm.data.form.ach_rank = data.data.ach_rank;
                    //成就等级
                    //{"ach_type":"参赛获奖","ach_level":"区县级"}
                    ajax_post(ach_rank, {ach_type: data.data.xz, ach_level: data.data.ach_level}, vm);

                }

            };
            vm.$watch('onReady', function () {
                this.find_per();
                this.getType();
                this.getId();
                // if (vm.data.form.id) { /*有id是修改*/
                //     vm.product_modify();
                // }
                // $('#my-datepicker').datepicker({format: 'yyyy-mm-dd'});

                $('#my-datepicker').datetimepicker({
                    format: 'yyyy-mm-dd',
                    minView: "month",//设置只显示到月份
                    autoclose:true,//选中关闭
                    language: 'zh-CN'
                });
                var end_time = cloud.get_current_time()
                $('#my-datepicker').datetimepicker('setEndDate', end_time.time_str);

            })
            vm.init();
            // vm.cds();
            return vm;
        }
        return {
            view: html,
            define: avalon_define
            // date_input: {startDate: "my-datepicker", type: 2}

        }
    })