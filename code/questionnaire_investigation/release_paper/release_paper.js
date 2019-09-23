define(["jquery",
        C.CLF('avalon.js'),
        "layer",
        C.Co("questionnaire_investigation", "release_paper/release_paper", "css!"),
        C.Co("questionnaire_investigation", "release_paper/release_paper", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "date_zh",
        C.CM("three_menu_module")

    ],
    function ($, avalon, layer, css, html, x, data_center, date_zh,three_menu_module) {
        //获取角色
        var get_roles_api = api.api + "base/user_role/init_or_defined_role";
        //发布
        var release_paper_api = api.api+"ques_naire/issuance_questionnaire";
        //获取年级列表
        var getGrade_api = api.api + "base/grade/findGrades.action";
        var avalon_define = function (par) {
            var vm = avalon.define({
                $id: "add_papers",
                //获取的所有的角色
                role_list: [],
                //判断是否为错误时间
                error_time:false,
                //发布接口需要传输的数据
                data: {
                    start_time: '',
                    end_time: '',
                    power: [],
                    _id: par.id,
                    gradeIds:[]
                },
                //获取的年级
                grade_list:[],
                //判断是否显示年级
                is_show_grade:false,
                init: function () {
                    this.get_roles();
                    //获取年级列表
                    this.showGradeList();
                },
                showGradeList: function () {
                    ajax_post(getGrade_api, {status: 1}, this)
                },
                //点击发布
                release_btn: function () {
                    if(this.data.start_time==''){
                        toastr.warning('开始时间不能为空');
                        return;
                    }
                    if(this.data.end_time==''){
                        toastr.warning('结束时间不能为空');
                        return;
                    }
                    if(this.data.start_time>this.data.end_time){
                        toastr.warning('开始时间不能大于结束时间');
                        return;
                    }
                    if(this.error_time){
                        toastr.warning('开始时间错误，请重新选择');
                        return;
                    }
                    if(this.data.power.length==0){
                        toastr.warning('请选择主体');
                        return;
                    }
                    if(this.is_show_grade&&this.data.gradeIds.length==0){
                        toastr.warning('请选择年级');
                        return;
                    }
                    ajax_post(release_paper_api,this.data.$model,this);

                },
                //获取所有角色
                get_roles: function () {
                    ajax_post(get_roles_api, {}, this);
                },
                change_check:function () {
                    var is_show_grade_index1 = this.data.power.indexOf(7);
                    var is_show_grade_index2 = this.data.power.indexOf(8);
                    var is_show_grade_index3 = this.data.power.indexOf(9);
                    var is_show_grade_index4 = this.data.power.indexOf(10);
                    if(is_show_grade_index1==-1&&is_show_grade_index2==-1&&
                        is_show_grade_index3==-1&&is_show_grade_index4==-1){
                        this.is_show_grade = false;
                    }else {
                        this.is_show_grade = true;
                    }

                },
                //开始时间
                get_start_date: function () {
                    var self = this;
                    $('#start_time_input')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            var start_value = e.currentTarget.value;
                            if (self.data.end_time != '') {
                                if (start_value > self.data.end_time) {
                                    toastr.warning('开始时间不能大于结束时间');
                                    this.error_time = true;
                                }else {
                                    self.error_time = false;
                                }
                            }else {
                                self.error_time = false;
                            }
                            self.data.start_time = start_value;

                        });
                },
                //结束时间
                get_end_date: function () {
                    var self = this;
                    $('#end_time_input')
                        .datetimepicker()
                        .on('changeDate', function (e) {
                            var end_value = e.currentTarget.value;
                            var now_time = self.get_current_time();
                            if(new Date(now_time).getTime()>new Date(end_value).getTime()){
                                toastr.warning('结束时间应大于当前时间');
                                self.error_time = true;
                            }else if (self.data.start_time != '') {
                                if (self.data.start_time > end_value) {
                                    toastr.warning('开始时间不能大于结束时间');
                                    self.error_time = true;
                                } else {
                                    self.error_time = false;
                                    self.data.end_time = end_value;
                                }
                            }else {
                                self.error_time = false;
                            }
                            self.data.end_time = end_value;
                        });
                },
                get_current_time:function () {
                    var date = new Date();
                    var seperator1 = "-";
                    var seperator2 = ":";
                    var month = date.getMonth() + 1;
                    var strDate = date.getDate();
                    if (month >= 1 && month <= 9) {
                        month = "0" + month;
                    }
                    if (strDate >= 0 && strDate <= 9) {
                        strDate = "0" + strDate;
                    }
                    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
                        + " " + date.getHours() + seperator2 + date.getMinutes()
                        + seperator2 + date.getSeconds();
                    return currentdate;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case get_roles_api:
                                if (data.data && data.data.list) {
                                    this.role_list = data.data.list;
                                }
                                break;
                            case release_paper_api:
                                window.location.href = "#papers_list";
                                break;
                            case getGrade_api:
                                if(data.data){
                                    this.grade_list = data.data;
                                }
                                break;

                        }
                    } else {
                        toastr.error(msg)
                    }
                }
            });
            vm.$watch('onReady', function () {
                vm.init();

                $('#start_time_input').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii:ss',
                    language: 'zh-CN'
                });
                $('#end_time_input').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii:ss',
                    language: 'zh-CN'
                });

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });