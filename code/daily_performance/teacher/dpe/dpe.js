/**
 * Created by Administrator on 2018/5/25.
 */
define([
        C.CLF('avalon.js'),
        "jquery",
        'layer',
        C.Co('daily_performance/teacher', 'dpe/dpe', 'html!'),
        C.Co('daily_performance/teacher', 'dpe/dpe', 'css!'),
        C.CMF("data_center.js"),
        C.CMF("table/table.js"),
        C.CM("three_menu_module"),
        "select2",
        "selecr2_zh_CN",
        C.CMF("uploader/uploader.js"), C.CMF("formatUtil.js")

    ],
    function (avalon, $, layer, html, css, data_center, table, three_menu_module, select2, selecr2_zh_CN, uploader,formatUtil) {
        //文件上传
        var api_file_uploader = api.api + "file/uploader";
        //获取学生信息
        var api_art_evaluation_get_student_info = api.api + "base/student/class_used_stu";
        //指标查询
        var api_index_check = api.api + "Indexmaintain/indexmaintain_findByIndexName";
        //描述查询
        var api_find_by_description = api.api + "Indexmaintain/indexmaintain_findbydescription";
        //保存录入
        var api_save_daily_performance = api.api + "everyday/save_or_update_everyday";
        //修改回显数据
        var api_get_daily_by_id = api.api + "everyday/get_everyday";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "dpe",
                module_index: "",
                checkbox_arr: [],
                module_student_arr: [],
                is_disabled: false,
                module_class_id: "",
                type: "",
                description_textarea: 1,//隐藏
                files: [],
                get_class_id: "",
                get_grade_id: "",
                index_flag: "",
                grade_list: [],
                class_list: [],
                description_arr: [],//表现描述
                class_is_show: false,
                is_show: true,
                save_click_dis: false,
                first_index: "",
                second_index: "",
                response_data: {
                    fk_class_id: "",
                    third_index_form: {
                        index_rank: 3,
                        index_apply: "日常表现",
                    }
                },
                student_arr: "",
                item_index_arr: "",
                //学生信息
                student_info: [],

                //指标信息
                first_info: "",
                second_info: "",
                item_info: "",
                //回显指标
                second_index_name: "",
                second_index_idx: "",
                item_index_name: "",
                item_index_idx: "",
                //分数
                score: "",
                description_index: "",
                request_data: {
                    uploader_url: api_file_uploader,
                    form: {
                        attachment: "",
                        class_name: "",
                        code: "",
                        //描述
                        description: "",
                        //日常表现时间
                        everyday_date: "",
                        fk_class_id: "",
                        fk_grade_id: "",
                        fk_school_id: "",
                        frist_index: "",
                        frist_index_id: "",
                        grade_name: "",

                        student_list: [],
                        //评价项
                        item: "",
                        item_id: "",
                        //加分类型 1加分2减分
                        mark_type: "1",

                        school_name: "",
                        score: "",
                        second_index: "",
                        second_index_id: ""
                    }
                },
                is_id: "",
                //修改回显数据
                getId: function () {
                    this.request_data.form.id = pmx.my_add_list; //编辑
                    if (this.request_data.form.id) {//修改
                        this.is_id = 1;
                    } else {//添加
                        this.is_id = 2;
                    }
                },

                inputLimits:function (e) {
                    e.currentTarget.value=e.currentTarget.value.replace(/^\D*(\d*(?:\.\d{0,1})?).*$/g, '$1')
                },

                getType: function () {
                    this.type = data_center.get_key("params_type");
                },
                daily_modify: function () {
                    ajax_post(api_get_daily_by_id, {id: this.request_data.form.id}, this);
                },
                rules: {required: true, number: true},
                //选择年级
                gradeChange: function (data) {
                    var get_grade_id = this.get_grade_id;
                    if (get_grade_id == 0) {
                        toastr.warning("请先选择年级");
                    } else {
                        this.request_data.form.fk_grade_id = get_grade_id;
                        for (var i = 0; i < this.grade_list.length; i++) {
                            if (get_grade_id == this.grade_list[i].grade_id) {
                                this.class_list = this.grade_list[i].class_list;
                            }
                        }
                    }

                },
                //获取班级
                classChange: function () {
                    if (this.get_class_id == 0) {
                        toastr.warning("请先选择班级");
                    } else {
                        this.request_data.form.fk_class_id = this.get_class_id;
                    }
                    //获取学生信息
                    ajax_post(api_art_evaluation_get_student_info, {fk_class_id: this.get_class_id}, this);

                },
                url_for: function (get_guid) {
                    return url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + get_guid
                },
                getDate: function () {
                    $("#my-datepicker").on("change", function (event) {
                        vm.request_data.form.everyday_date = event.delegateTarget.defaultValue;
                    });
                    $('#my-datepicker').datepicker('open');
                },
                //获取评价项
                get_item_index: function () {
                    this.index_flag = 1;
                    ajax_post(api_index_check, this.response_data.third_index_form, this);
                },
                save_daily: function (e) { /*提交*/
                    if (!vm.request_data.form.id) {
                        if (this.request_data.form.student_list.length == 0) {
                            this.request_data.form.student_list = [];
                            for (var i = 0; i < this.student_info.length; i++) {
                                var stu_info = this.student_info[i];
                                var obj = {
                                    "guid": Number(stu_info.split("|")[0]),
                                    "name": stu_info.split("|")[1],
                                    "code": stu_info.split("|")[2]
                                };
                                this.request_data.form.student_list.push(obj);
                            }
                        }
                    }
                    this.request_data.form.mark_type = Number(this.request_data.form.mark_type);
                    this.request_data.form.score = Number(this.score);
                    var uploaderWorks = data_center.ctrl("uploader_add_daily");
                    var is_complete = uploaderWorks.is_finished();
                    if (this.request_data.form.student_list.length == 0) {
                        toastr.warning('请选择学生');
                        return;
                    }
                    if ($.trim(this.request_data.form.everyday_date) == '') {
                        toastr.warning('请选择日期');
                        return;
                    }
                    if ($.trim(this.request_data.form.item) == '') {
                        toastr.warning('请选择评价项');
                        return;
                    }
                    if ($.trim(this.request_data.form.description) == '') {
                        toastr.warning('请填写表现描述');
                        return;
                    }
                    if (this.request_data.form.mark_type == 0) {
                        toastr.warning('请选择加分还是减分')
                        return;
                    }
                    var max_score;
                    if(this.request_data.form.mark_type == 1){//加分
                        max_score = this.index_end_interval;
                    }else if(this.request_data.form.mark_type == 2){//减分
                        max_score = Math.abs(this.index_start_interval);
                    }
                    if(this.index_value < 0.1 || this.index_value>max_score){
                        toastr.warning('分值必须在0.1-'+max_score+'之间');
                        return;
                    }
                    var s = this.index_value;
                    var is_num = parseInt(s);//如果变量val是字符类型的数则转换为int类型 如果不是则ival为NaN
                    if (!isNaN(is_num)) {
                        s = Number(s);
                        var get_score = s.toFixed(1);
                        // if (get_score < this.index_start_interval || get_score > this.index_end_interval) {
                        //         toastr.warning('分数只能在' + this.index_start_interval + '-' + this.index_end_interval + '之间');
                        //         return false;
                        // } else {
                        //     if (this.request_data.form.mark_type == "2") {//减分
                        //         this.request_data.form.score = "-" + get_score;
                        //     } else {
                        //         this.request_data.form.score = get_score;
                        //     }
                        // }
                        if (this.request_data.form.mark_type == "2") {//减分
                            this.request_data.form.score = "-" + get_score;
                        } else {
                            this.request_data.form.score = get_score;
                        }
                        if (is_complete == true) {
                            var files = uploaderWorks.get_files();
                            this.request_data.form.attachment = JSON.stringify(files);
                            ajax_post(api_save_daily_performance, this.request_data.form, this);
                        }
                    }
                },
                score_format: function () {
                    if (this.index_value != '' && this.index_value != 0)
                        this.index_value = this.index_value.toFixed(2);
                    if (this.index_value < 0.1) {
                        toastr.warning('分值必须在0.1-1之间')
                    }
                    if (this.index_value > 1) {
                        toastr.warning('分值必须在0.1-1之间')
                    }
                },
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        var userType = data.data.user_type;
                        var tUserData = JSON.parse(data.data["user"]);
                        cArr = tUserData.lead_class_list;
                        if (userType == "1") {//老师
                            if (cArr.length == 1 && cArr[0].class_list.length == 1) {//一个年级一个班主任
                                self.request_data.form.fk_class_id = Number(cArr[0]['class_list'][0].class_id);
                                self.request_data.form.fk_grade_id = Number(cArr[0].grade_id);
                                self.request_data.form.fk_school_id = Number(cArr[0].school_id);
                                self.request_data.form.class_name = cArr[0]['class_list'][0].class_name;
                                self.request_data.form.school_name = cArr[0].school_name;
                                self.request_data.form.grade_name = cArr[0].grade_name;
                                self.response_data.fk_class_id = cArr[0]['class_list'][0].class_id;
                                // self.response_data.third_index_form.index_workid = Number(cArr[0].school_id);
                                //获取学生信息
                                ajax_post(api_art_evaluation_get_student_info, {fk_class_id: self.response_data.fk_class_id}, self);

                            } else {
                                self.request_data.form.fk_school_id = Number(cArr[0].school_id);
                                self.class_is_show = true;
                                self.grade_list = cArr;
                            }
                        }
                        else if (userType == "2") {
                            self.response_data.fk_class_id = tUserData.fk_class_id;
                            self.request_data.form.fk_class_id = Number(tUserData.fk_class_id);
                            self.request_data.form.fk_grade_id = Number(tUserData.fk_grade_id);
                            self.request_data.form.fk_school_id = Number(tUserData.fk_school_id);
                            self.request_data.form.class_name = tUserData.class_name;
                            self.request_data.form.school_name = tUserData.school_name;
                            self.request_data.form.grade_name = tUserData.grade_name;
                            //获取学生信息
                            ajax_post(api_art_evaluation_get_student_info, {fk_class_id: self.response_data.fk_class_id}, self);
                        }
                        self.get_item_index();
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取学生信息
                            case api_art_evaluation_get_student_info:
                                if (this.module_index == 1) {
                                    this.complete_module_get_student(data);

                                } else {
                                    this.complete_art_evaluation_get_student_info(data);

                                }
                                break;
                            //获取指标
                            case api_index_check:
                                if (this.index_flag == 1) {//页面一加载查询评价项
                                    if (data.data.length != 0) {
                                        this.item_index_arr = data.data;
                                        if (this.request_data.form.item) {
                                            for (var i = 0; i < this.item_index_arr.length; i++) {
                                                if (this.request_data.form.item == this.item_index_arr[i].index_name) {
                                                    this.index_start_interval = this.item_index_arr[i].index_start_interval;
                                                    this.index_end_interval = this.item_index_arr[i].index_end_interval;
                                                }
                                            }
                                        }

                                    } else {
                                        this.item_index_arr = [];
                                    }
                                } else if (this.index_flag == 2) {//根据评价项查一二级
                                    this.first_index = data.data[0].index_parent;
                                    this.second_index = data.data[0].index_secondary;
                                    this.request_data.form.frist_index = data.data[0].index_parent;
                                    this.request_data.form.second_index = data.data[0].index_secondary;
                                    this.request_data.form.frist_index_id = data.data[0].index_parentid;
                                    this.request_data.form.second_index_id = data.data[0].index_secondaryid;
                                    this.description_index = 1;
                                    ajax_post(api_find_by_description, {
                                        description: '',
                                        index_id: vm.request_data.form.item_id
                                    }, vm);
                                }
                                break;
                            case api_find_by_description:
                                if (this.description_index == 1) {
                                    this.complete_find_by_description_first(data);
                                } else {
                                    this.complete_find_by_description_second(data);
                                }
                                break;
                            case api_save_daily_performance:
                                this.complete_save_daily_performance(data);
                                break;
                            case api_get_daily_by_id:
                                this.complete_get_daily_by_id(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_art_evaluation_get_student_info: function (data) {
                    if (data.data.list == "") {
                        toastr.warning("暂无学生信息");
                        this.student_arr = [];
                    } else {
                        this.student_arr = data.data.list;
                    }
                },
                complete_save_daily_performance: function (data) {
                    toastr.success('添加成功！');
                    window.location = "#daily_perform_see";
                },
                back: function () {
                    window.location = "#daily_perform_see";
                },
                //查询描述
                complete_find_by_description_first: function (data) {
                    this.description_arr = data.data;
                    // var get_description_val = $("#description_select").val();
                    // get_description_val = 0;
                    // if (get_description_val == 0) {
                    //     this.description_textarea = 2;
                    //     this.request_data.form.description = "";
                    // } else {
                    //     this.description_textarea = 1;
                    //     this.request_data.form.description = $("#description_select").val();
                    // }
                },

                teacherNameDemand: function () {
                    var val = this.request_data.form.description;
                    var obj = $("#description");
                    this.nameSearch(val, obj);
                },
                is_show_desc: false,
                desc_focus: function () {
                    this.is_show_desc = true;
                },
                click_li: function (description) {
                    this.request_data.form.description = description;
                    this.is_show_desc = false;
                },
                nameFlag: false,
                teacherNameTrue: function () {
                    this.nameFlag = true;
                },
                teacherNameFalse: function () {
                    this.nameFlag = false;
                },
                desc_blur: function () {
                    if (this.nameFlag == false) {
                        this.is_show_desc = false;
                    }
                },

                nameSearch: function (name, obj) {
                    var val = name;
                    var lis = obj.find("li");
                    var str = "";
                    if (val != null && val.length > 0) {
                        for (var i = 0; i < lis.length; i++) {
                            var index = lis.eq(i).text().indexOf(val);
                            if (index >= 0) {
                                lis.eq(i).show();
                                str += i;
                            } else {
                                lis.eq(i).hide();
                            }
                        }
                    } else {
                        lis.show();
                        str = "";
                    }
                },
                complete_find_by_description_second: function (data) {
                    this.description_arr = data.data;
                    var dataLength = data.data.length;
                    for (var i = 0; i < dataLength; i++) {
                        if (data.data[i].description == this.request_data.form.description) {
                            $("#select2-description_select-container").text(data.data[i].description)
                        }
                    }
                },

                //修改数据回显
                complete_get_daily_by_id: function (data) {
                    this.request_data.form = data.data;
                    this.request_data.form.student_list = [];
                    var str = this.request_data.form.guid + '|' + this.request_data.form.name + '|' + this.request_data.form.code;
                    this.student_info.push(str);
                    // $('.select2-search__field').val(this.request_data.form.name);
                    var obj = {
                        "guid": this.request_data.form.guid,
                        "name": this.request_data.form.name,
                        "code": this.request_data.form.code
                    };
                    this.request_data.form.student_list.push(obj);
                    var score = data.data.score.toString();
                    if (score.indexOf("-") == -1) {
                        this.index_value = score;
                    } else {
                        this.index_value = score.substring(1, score.length)
                    }
                    this.files = this.request_data.form.attachment;
                    if (data.data.status == 2) {
                        this.request_data.form.status = 1;
                    }
                    this.request_data.form.item = data.data.item;
                    this.request_data.form.item_id = data.data.item_id;
                    $("#select2-item_select-container").text(this.request_data.form.item);
                    this.show_score = true;


                    this.is_disabled = true;
                    this.request_data.form.frist_index = data.data.frist_index;
                    this.first_index = data.data.frist_index;
                    this.request_data.form.frist_index_id = data.data.frist_index_id;
                    this.request_data.form.second_index = data.data.second_index;
                    this.second_index = data.data.second_index;
                    this.request_data.form.second_index_id = data.data.second_index_id;
                    //回显表现描述
                    this.description_index = 2;
                    this.request_data.form.description = data.data.description;
                    ajax_post(api_find_by_description, {index_id: this.request_data.form.item_id}, this);
                },
                module_click: function () {
                    if (this.response_data.fk_class_id) {
                        this.module_class_id = this.response_data.fk_class_id;
                        this.module_index = 1;
                        $("#add-confirm").modal({
                            closeOnConfirm: false
                        });
                        ajax_post(api_art_evaluation_get_student_info, {fk_class_id: this.module_class_id}, this);
                    } else {
                        toastr.warning('哪个班级的')
                    }
                },
                batch_selection: function () {
                    if (this.response_data.fk_class_id) {
                        this.module_class_id = this.response_data.fk_class_id;
                        this.module_index = 1;
                        var self = this;
                        this.checkbox_arr = this.student_info;
                        layer.open({
                            title: '批量选择',
                            type: 1,
                            area: ['1000px', '474px'],
                            content: $('#dpe-layer')
                            , btn: ['确定', '取消']
                            , yes: function (index, layero) {
                                self.add_student();
                            }
                            , cancel: function () {
                                //右上角关闭回调
                            }
                        });
                        ajax_post(api_art_evaluation_get_student_info, {fk_class_id: this.module_class_id}, this);
                    } else {
                        toastr.warning('哪个班级的')
                    }
                },
                complete_module_get_student: function (data) {
                    this.module_student_arr = data.data.list;
                },
                module_stu: false,
                //全选
                all_change: function () {
                    var student_list = [];
                    var module_length = this.module_student_arr.length;
                    if (this.module_stu == true) {
                        this.checkbox_arr = [];
                        for (var i = 0; i < module_length; i++) {
                            var stu_info = this.module_student_arr[i];
                            student_list.push(stu_info.guid + "|" + stu_info.name + "|" + stu_info.code);
                        }
                        this.checkbox_arr = student_list;
                        this.select_name = true;
                    } else {
                        this.checkbox_arr = [];
                        this.select_name = false;
                    }
                },
                select_name: true,
                //模态框确定
                add_student: function () {
                    this.student_info = this.checkbox_arr;
                    $("#student_select").val(this.student_info).trigger('change');
                    ;
                    layer.closeAll();
                },
                index_start_interval: "",
                index_end_interval: "",
                index_value: "",
                show_score: false,
                placeholder: ""
            });
            vm.$watch('onReady', function () {
                this.cb();
                $(".js-example-basic-single").select2();
                this.getType();
                this.getId();
                if (vm.request_data.form.id) { /*有id是修改*/
                    vm.cb();
                    vm.daily_modify();
                }
                $("#student_select").select2({
                    tokenSeparators: [',', ' '],   //分隔符
                    placeholder: "请选择或输入姓名",  //提示语
                    // maximumSelectionLength :10,   //限制搜索的个数
                    tags: true                //可以手动添加，若限制手动添加，设置为false
                })
                $("#student_select").on("change", function (e) {
                    vm.is_show = false;
                    if($("#student_select").val()==null){
                        vm.student_info = [];
                        return;
                    }
                    vm.student_info = $("#student_select").val();
                });

                $("#item_select").select2({
                    language: {
                        noResults: function (params) {
                            return "未找到结果";
                        }
                    }
                })
                //选择评价项
                $("#item_select").on("change", function (e) {
                    vm.item_info = $("#item_select").val();
                    var item_arr = vm.item_info;
                    if (item_arr == 0) {
                        vm.request_data.form.item = '';
                        vm.request_data.form.description = '';
                        vm.description_arr = [];
                    } else {
                        vm.request_data.form.item_id = Number(item_arr.split("|")[0]);
                        vm.request_data.form.item = item_arr.split("|")[1];
                        //日常表现分值开始区间
                        vm.index_start_interval = Number(item_arr.split("|")[2]);
                        //日常表现分值结束区间
                        vm.index_end_interval = Number(item_arr.split("|")[3]);
                        //当只有加分或者减分的时候，判断选中
                        if(vm.index_start_interval >= 0){//加分
                            vm.request_data.form.mark_type = 1
                        }
                        if(vm.index_end_interval <= 0){//减分
                            vm.request_data.form.mark_type = 2
                        }
                        // vm.index_value = Number(item_arr.split("|")[4]);
                        vm.index_value = 0.1;
                        vm.placeholder = '请直接输入数字,分值在' + vm.index_start_interval + "-" + vm.index_end_interval + '之间';
                        vm.show_score = true;
                        vm.index_flag = 2;
                        ajax_post(api_index_check, {id: vm.request_data.form.item_id}, vm);
                    }
                });
                //选择描述
                $("#description_select").on("change", function (e) {
                    var get_description_val = $("#description_select").val();
                    if (get_description_val == 0) {
                        vm.description_textarea = 2;
                        vm.request_data.form.description = "";
                    } else {
                        vm.description_textarea = 1;
                        vm.request_data.form.description = $("#description_select").val();
                    }
                });
            });
            vm.$watch("request_data.form.description", function () {
                if ($.trim(vm.request_data.form.description) != '' && vm.request_data.form.description.length > 0) {
                    var value = '%' + vm.request_data.form.description + '%';
                    ajax_post(api_find_by_description, {
                        description: value,
                        index_id: vm.request_data.form.item_id
                    }, vm);
                }

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define,
            date_input: {startDate: "my-datepicker", type: 3}
        }
    });
