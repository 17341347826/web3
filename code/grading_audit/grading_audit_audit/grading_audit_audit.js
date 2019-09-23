define(
    ['jquery',
        C.CLF('avalon.js'),
        "layer",
        C.Co('grading_audit', 'grading_audit_audit/grading_audit_audit', 'html!'),
        C.Co('grading_audit', 'grading_audit_audit/grading_audit_audit', 'css!'),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, html, css, x, data_center, three_menu_module) {
        var avalon_define = function () {
            //查看参数
            var rule_api = api.api + "score/get_statis_rule";
            //审核等级划分
            var audit_api = api.api + "score/check_lv_partition";
            //修改
            var update_api = api.api + "score/edit_lv_partition";
            var vm = avalon.define({
                $id: "set_level",
                //如果page_state状态为1，为查看状态，如果为2，为修改状态
                page_state: 1,
                //年级下拉列表
                grade_list: [],
                //等级列表
                level_list: [],
                rule_extend: {
                    fk_grade_id: '',
                    fk_unit_id: '',
                    unit_lv: ''
                },
                //等级个数
                level_count: 0,
                //等级划分方式
                division_method: '',
                //标准
                standard: '',
                all_grade_list: [],
                opinion: '',
                default_data: {
                    "fk_grade_id": 37,
                    "fk_unit_id": 8,
                    "unit_lv": 2,
                    "full_score": 100,
                    "index_ratio": [],
                    "main_ratio": [],
                    "lv_partition": [
                        {
                            'fk_school_id': '-1',
                            "fk_class_id": '-1',
                            'class_name': '全部班级',
                            'school_name': '全部学校',
                            'ratio_lv': [
                                {
                                    'lv': 'A',
                                    'ratio': ''
                                }
                            ],
                            'score_lv': [
                                {
                                    'low_score': '',
                                    'lv': 'A',
                                    'tall_score': ''
                                }
                            ]
                        }

                    ],
                    'lv_type': '',
                    "index_type": [1, 2],
                    "module": [1, 2, 3, 4, 5, 6, 7]
                },
                //登录用户等级
                user_level: '',
                //等级划分方式和标准的集合
                lv_type: '',
                //单位id和单位名称
                depart_name: '',
                //上传状态显示
                modal_msg: '',
                //当前年级名称
                now_grade_name: '',
                //年级下标
                grade_index: 0,
                way: '',
                _id: '',
                school_name:'',
                grade_name:'',
                init: function () {
                    var grading_audit_audit = data_center.get_key('grading_audit_audit');
                    if (!grading_audit_audit)
                        return;
                    grading_audit_audit = JSON.parse(grading_audit_audit);
                    this.school_name = grading_audit_audit.school_name;
                    this.grade_name = grading_audit_audit.grade_name;
                    this.grade_list = cloud.grade_all_list({school_id: grading_audit_audit.fk_unit_id});
                    this.all_grade_list = cloud.grade_list({school_id: grading_audit_audit.fk_unit_id});
                    this.now_grade_name = this.grade_list[this.grade_index].name;
                    this.rule_extend.fk_grade_id = grading_audit_audit.fk_grade_id;
                    this.rule_extend.unit_lv = parseInt(cloud.user_level()) + 1;
                    this.rule_extend.fk_unit_id = grading_audit_audit.fk_unit_id;
                    this.way = grading_audit_audit.way;
                    if (this.way == 'update') {
                        this.page_state = 2;
                        this._id = grading_audit_audit._id;
                    }
                    this.user_level = cloud.user_level() + 1;
                    this.depart_name = cloud.user_school();
                    this.get_rule();
                },
                get_rule: function () {
                    ajax_post(rule_api, this.rule_extend.$model, this)
                },
                is_pass: function (is_pass) {
                    if (!is_pass) {
                        layer.open({
                            title: '审核意见',
                            type: 1,
                            area: ['600px', '360px'],
                            content: $('#grading_audit_audit_layer'),
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                ajax_post(audit_api, {
                                    fk_grade_id: vm.rule_extend.fk_grade_id,
                                    fk_unit_id: vm.rule_extend.fk_unit_id,
                                    is_pass: is_pass,
                                    lv_no_pass_msg: vm.opinion
                                }, vm)
                            }, cancel: function () {

                            }
                        });
                        return
                    }

                    ajax_post(audit_api, {
                        fk_grade_id: this.rule_extend.fk_grade_id,
                        fk_unit_id: this.rule_extend.fk_unit_id,
                        is_pass: is_pass,
                        lv_no_pass_msg: ''
                    }, this)

                },

                //保存或修改
                change_state: function () {
                    if (this.division_method == '' || this.standard == '') {
                        toastr.info('划分方式和标准必选!')
                        return;
                    }
                    if (this.level_count == 1) {
                        toastr.info('至少设置两个等级!')
                        return;
                    }
                    var lv_partition_length = this.level_list.lv_partition.length;
                    if (this.lv_type == 1 || this.lv_type == 2 || this.lv_type == 5) {
                        if (this.level_list.full_score == '') {
                            toastr.info('请先设置总分!')
                            return;
                        }
                        if (this.level_list.full_score == 0) {
                            toastr.info('总分不能为零!')

                            return;
                        }

                        var score_lv = '';
                        var score_lv_length = 0;
                        var first_tall_score = 0;
                        var last_low_score = 0;
                        for (var i = 0; i < lv_partition_length; i++) {
                            this.level_list.lv_partition[i].ratio_lv = [];
                            score_lv = this.level_list.lv_partition[i].score_lv;
                            score_lv_length = score_lv.length;
                            first_tall_score = score_lv[0].tall_score;
                            last_low_score = score_lv[score_lv_length - 1].low_score;
                            var name = this.level_list.lv_partition[i].school_name;
                            if (this.user_level == 4) {
                                name = this.level_list.lv_partition[i].class_name;
                            }
                            if (first_tall_score != this.level_list.full_score) {
                                toastr.info(name + ':A等级最高分应该和设置的最高分相等！')

                                return;
                            }
                            if (last_low_score != 0) {

                                toastr.info(name + ':最后一个等级最低分必须为0！')
                                return;
                            }
                            for (var j = 0; j < score_lv_length - 1; j++) {
                                var low_score = score_lv[j].low_score;
                                var tall_score = score_lv[j + 1].tall_score;
                                if (low_score != tall_score) {

                                    toastr.info(name + ':上一个等级最低分必须和下一个等级最高分相等！')

                                    return;
                                }
                            }
                        }
                    }
                    if (this.lv_type == 3 || this.lv_type == 4 || this.lv_type == 6) {
                        for (var i = 0; i < lv_partition_length; i++) {
                            var ratio_lv = this.level_list.lv_partition[i].ratio_lv;
                            this.level_list.lv_partition[i].score_lv = [];
                            var ratio_lv_length = ratio_lv.length;
                            var now_school_all_ratio = 0;
                            for (var j = 0; j < ratio_lv_length; j++) {
                                now_school_all_ratio += Number(ratio_lv[j].ratio)
                            }
                            var now_name = this.level_list.lv_partition[i].school_name;
                            if (this.user_level == 4) {
                                now_name = this.level_list.lv_partition[i].class_name;
                            }
                            if (now_school_all_ratio != 100) {

                                toastr.info(now_name + ':总比例必须为100！')
                                return;
                            }
                        }
                    }
                    this.level_list.lv_type = this.lv_type;
                    ajax_post(update_api, {
                        _id: this._id,
                        lv_partition: this.level_list.lv_partition,
                        lv_type: this.lv_type
                    }, this);
                },
                //设置等级个数
                count_change: function () {
                    //需要修改成的数量
                    var count = parseInt(this.level_count);
                    if (this.lv_type == '')
                        return;
                    //修改前的数量
                    var level_length = 0;
                    //按等级划分
                    if (this.lv_type == 1 || this.lv_type == 2 || this.lv_type == 5) {
                        level_length = this.level_list.lv_partition[0].score_lv.length;
                    }
                    //按分数划分
                    if (this.lv_type == 3 || this.lv_type == 4 || this.lv_type == 6) {
                        level_length = this.level_list.lv_partition[0].ratio_lv.length;
                    }
                    var new_count = Math.abs(count - level_length);
                    //数量减小
                    var lv_partition_length = this.level_list.lv_partition.length;
                    if (level_length > count) {
                        //按分数划分减等级个数
                        if (this.lv_type == 1 || this.lv_type == 2 || this.lv_type == 5) {
                            for (var i = 0; i < lv_partition_length; i++) {
                                this.level_list.lv_partition[i].score_lv.splice(count);
                            }
                        }
                        //按比例划分减等级个数
                        if (this.lv_type == 3 || this.lv_type == 4 || this.lv_type == 6) {
                            for (var i = 0; i < lv_partition_length; i++) {
                                this.level_list.lv_partition[i].ratio_lv.splice(count);
                            }
                        }
                        return;
                    }
                    //数量增大
                    var my_level = ['A', 'B', 'C', 'D', 'E'];
                    for (var i = 0; i < new_count; i++) {
                        //按分数划分加等级个数
                        if (this.lv_type == 1 || this.lv_type == 2 || this.lv_type == 5) {
                            var obj = {
                                low_score: '',
                                lv: my_level[level_length + i],
                                tall_score: ''
                            }
                            for (var j = 0; j < lv_partition_length; j++) {
                                this.level_list.lv_partition[j].score_lv.push(obj);
                            }
                        }
                        //按比例划分加等级个数
                        if (this.lv_type == 3 || this.lv_type == 4 || this.lv_type == 6) {
                            var obj = {
                                lv: my_level[level_length + i],
                                ratio: ''
                            }
                            for (var j = 0; j < lv_partition_length; j++) {
                                this.level_list.lv_partition[j].ratio_lv.push(obj);
                            }
                        }
                    }
                },
                back: function () {
                    window.history.back(-1)
                },
                //数据组合
                recombination: function (lv_type) {
                    //判断是否有lv_partition属性
                    if (!this.level_list.hasOwnProperty('lv_partition')) {
                        this.level_list.lv_partition = this.copy_json(this.default_data.lv_partition)
                    }
                    //判断lv_partition的长度是否为0
                    var lv_partition_length = this.level_list.lv_partition.length;
                    if (lv_partition_length == 0) {
                        this.level_list.lv_partition = this.copy_json(this.default_data.lv_partition);
                    }
                    //判断是否有lv_type属性
                    if (!this.level_list.hasOwnProperty('lv_type')) {
                        this.level_list.lv_type = '';
                        return;
                    }
                    if (!lv_type) {
                        this.lv_type = this.level_list.lv_type;
                        this.get_division_method_standard();
                        this.get_level_count();
                    }

                    if (this.lv_type == '')
                        return;
                    //按市统一分值划分
                    if (this.lv_type == 1 || (this.user_level > 3 && this.lv_type == 2)) {
                        if (!this.level_list.lv_partition[0].hasOwnProperty('score_lv') || this.level_list.lv_partition[0].score_lv.length == 0) {
                            this.level_list.lv_partition = this.copy_json(this.default_data.lv_partition);
                        }
                        if (this.level_list.lv_partition.length > 1) {
                            this.level_list.lv_partition.splice(1);
                        }
                        return;
                    }
                    //按市统一--等级划分
                    if (this.lv_type == 3 || (this.user_level > 3 && this.lv_type == 4)) {
                        if (!this.level_list.lv_partition[0].hasOwnProperty('ratio_lv') || this.level_list.lv_partition[0].ratio_lv.length == 0) {
                            this.level_list.lv_partition = this.copy_json(this.default_data.lv_partition);
                        }
                        if (this.level_list.lv_partition.length > 1) {
                            this.level_list.lv_partition.splice(1);
                        }
                        return;
                    }

                    //按学校划分或者按年级统一
                    if (this.lv_type == 4 || this.lv_type == 2) {
                        //按学校划分
                        var district = cloud.user_district();
                        var school_list = cloud.school_list({district: district});
                        var school_length = school_list.length;
                        if (lv_partition_length == 0 || (lv_partition_length == 1 && this.level_list.lv_partition[0].fk_school_id == -1 && this.level_list.lv_partition[0].score_lv.length == 1)) {
                            this.level_list.lv_partition = [];
                            if (this.user_level > 3) {
                                var school_name = cloud.user_school();
                                var obj_grade = {
                                    'fk_school_id': '-1',
                                    'school_name': school_name,
                                    "fk_class_id": '-1',
                                    'class_name': '全部班级',
                                    'ratio_lv': [
                                        {
                                            lv: 'A',
                                            ratio: ''
                                        }
                                    ],
                                    'score_lv': [
                                        {
                                            'low_score': '',
                                            'lv': 'A',
                                            'tall_score': ''
                                        }
                                    ]
                                };
                                this.level_list.lv_partition.push(obj_grade);
                                return;
                            }
                            for (var i = 0; i < school_length; i++) {
                                var obj = {
                                    'fk_school_id': school_list[i].id,
                                    'school_name': school_list[i].schoolname,
                                    "fk_class_id": '-1',
                                    'class_name': '全部班级',
                                    'ratio_lv': [
                                        {
                                            lv: 'A',
                                            ratio: ''
                                        }
                                    ],
                                    'score_lv': [
                                        {
                                            'low_score': '',
                                            'lv': 'A',
                                            'tall_score': ''
                                        }
                                    ]
                                };
                                this.level_list.lv_partition.push(obj);
                            }
                        }
                        return;
                    }
                    //按班级-分值划分
                    if (this.lv_type == 5 || this.lv_type == 6) {
                        if (lv_partition_length == 0 || (lv_partition_length == 1 && this.level_list.lv_partition[0].fk_class_id == -1)) {
                            this.level_list.lv_partition = [];
                            var grade_list = this.all_grade_list;
                            for (var i = 0; i < grade_list.length; i++) {
                                if (grade_list[i].grade_id == this.rule_extend.fk_grade_id) {
                                    var class_list = grade_list[i].class_list;
                                    for (var j = 0; j < class_list.length; j++) {
                                        var obj = {
                                            'fk_class_id': class_list[j].class_id,
                                            'class_name': class_list[j].class_name,
                                            'fk_school_id': '-1',
                                            'school_name': '全部学校',
                                            'ratio_lv': [
                                                {
                                                    lv: 'A',
                                                    ratio: ''
                                                }
                                            ],
                                            'score_lv': [
                                                {
                                                    'low_score': '',
                                                    'lv': 'A',
                                                    'tall_score': ''
                                                }
                                            ]
                                        };
                                        this.level_list.lv_partition.push(obj);
                                    }
                                    break;
                                }
                            }
                        }
                    }


                },
                level_msg: function (data) {
                    if (!data.data)
                        return;
                    var is_empty_obj = $.isEmptyObject(data.data);
                    if (is_empty_obj || !data.data.lv_type || data.data.lv_type == '') {
                        this.level_list = [];
                        this.lv_type = '';
                        this.division_method = '';
                        this.standard = '';
                        return;
                    }
                    this.level_list = data.data;
                    this.recombination();
                },
                update_range: function () {
                    this.page_state = 2;
                    if (this.lv_type == '') {
                        this.default_data.fk_grade_id = this.rule_extend.fk_grade_id;
                        this.default_data.unit_lv = this.rule_extend.unit_lv;
                        this.default_data.fk_unit_id = this.rule_extend.fk_unit_id;
                        this.level_list = this.copy_json(this.default_data);
                        this.level_count = 1;
                        return;
                    }
                    this.get_level_count();

                    this.get_division_method_standard();

                },
                copy_json: function (data) {
                    return JSON.parse(JSON.stringify(data));
                },
                get_level_count: function () {
                    if (this.lv_type == 1 || this.lv_type == 2 || this.lv_type == 5) {
                        this.level_count = this.level_list.lv_partition[0].score_lv.length;
                    }
                    if (this.lv_type == 3 || this.lv_type == 4 || this.lv_type == 6) {
                        this.level_count = this.level_list.lv_partition[0].ratio_lv.length;
                    }
                },
                //等级设置方式改变
                division_change: function () {
                    if (this.division_method == '')
                        return;

                    this.level_list.lv_partition = [];
                    this.get_lv_type();
                    this.level_count = 1;
                    this.recombination(this.lv_type);
                    this.count_change();
                },
                //标准设置改变
                standard_change: function () {
                    if (this.standard == '')
                        return;
                    this.level_list.lv_partition = [];
                    this.get_lv_type();
                    this.level_count = 1;
                    this.recombination(this.lv_type);
                    this.count_change();

                },
                get_lv_type: function () {

                    if (this.standard == 3) {
                        if (this.division_method == 1) {
                            this.lv_type = 2;
                        }
                        if (this.division_method == 2) {
                            this.lv_type = 4;
                        }
                    }
                    if (this.standard == 4) {
                        if (this.division_method == 1) {
                            this.lv_type = 5;
                        }
                        if (this.division_method == 2) {
                            this.lv_type = 6;
                        }
                    }


                },

                get_division_method_standard: function () {
                    switch (Number(this.lv_type)) {
                        case 1:
                            this.division_method = 1;
                            this.standard = 1;
                            break;
                        case 2:
                            this.division_method = 1;
                            this.standard = 2;
                            if (this.user_level > 3) {
                                this.standard = 3;
                            }
                            break;
                        case 3:
                            this.division_method = 2;
                            this.standard = 1;
                            break;
                        case 4:
                            this.division_method = 2;
                            this.standard = 2;
                            if (this.user_level > 3) {
                                this.standard = 3;
                            }
                            break;
                        case 5:
                            this.division_method = 1;
                            this.standard = 4;
                            break;
                        case 6:
                            this.division_method = 2;
                            this.standard = 4;
                            break;

                        default:
                            break;
                    }
                },

                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case rule_api:
                                this.level_msg(data);
                                break;
                            case audit_api:
                                layer.closeAll();
                                toastr.info('审核完成');
                                window.location = "#grading_audit_list";
                                break;
                            case update_api:
                                toastr.info('修改成功');
                                window.location = "#grading_audit_list"
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                        layer.closeAll();
                    }
                },

                //年级改变
                grade_change: function () {
                    var grade_id = this.rule_extend.fk_grade_id;
                    for (var i = 0; i < this.grade_list.length; i++) {
                        if (grade_id == this.grade_list[i].value) {
                            this.grade_index = i;
                            this.now_grade_name = this.grade_list[i].name;
                            break;
                        }
                    }
                    this.get_rule();
                },
                down_score: function () {
                    var lv_type = '';
                    if (this.division_method != '' || this.standard != '') {
                        lv_type = this.lv_type;
                    }
                    if (this.level_count < 2) {

                        toastr.info('请先选择等级个数！')
                        return
                    }
                    if (lv_type == '') {
                        toastr.info('请先选择划分方式和标准！')

                        return;
                    }
                    var token = sessionStorage.getItem('token');
                    var user = cloud.user_user();
                    var school_code = user.school_code;
                    var url = down_template + '?fk_school_id=' + this.rule_extend.fk_unit_id +
                        "&lv_length=" + this.level_count + "&lv_type=" + lv_type +
                        '&school_name=' + this.depart_name + '&fk_grade_id=' + this.rule_extend.fk_grade_id +
                        '&school_code=' + school_code +
                        '&token=' + token;
                    console.dir(url);
                    window.open(url);

                },
                uploading: function () {
                    var files_path = this.file_name;
                    var path_arr = files_path.split('.');
                    var sub_file = path_arr[path_arr.length - 1];
                    if (sub_file == '')
                        return;
                    if (sub_file != "xlsx" && sub_file != "xls") {
                        this.modal_msg = "请上传Excel文件";
                        return;
                    }
                    this.modal_msg = "正在上传，请勿取消";


                    fileUpload(upload_api, this);


                },
                file_name: '',
                import: function () {
                    $("#file").val("");
                    this.file_name = "";
                    $("#file-uploading").modal({
                        closeOnConfirm: false
                    });
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