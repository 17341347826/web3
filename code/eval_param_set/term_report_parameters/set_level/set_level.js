define(
    [
        C.CLF('avalon.js'),
        "layer",
        C.Co('eval_param_set', 'term_report_parameters/set_level/set_level', 'html!'),
        C.Co('eval_param_set', 'term_report_parameters/set_level/set_level', 'css!'),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, x, data_center, three_menu_module) {
        var avalon_define = function () {
            //查看参数
            var rule_api = api.api + "score/get_statis_rule";
            //保存
            var save_api = api.api + "score/edit_statis_rule";
            //下载模板
            var down_template = api.api + 'score/mould_download_lv';
            var upload_api = api.api + "score/upload_lv_partition";
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
                all_grade_list:[],
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
                            "fk_class_id":'-1',
                            'class_name':'全部班级',
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
                now_grade_name:'',
                //年级下标
                grade_index:0,
                init: function () {
                    this.grade_list = cloud.grade_all_list();
                    this.all_grade_list = cloud.grade_list();
                    this.now_grade_name = this.grade_list[this.grade_index].name;
                    this.rule_extend.fk_grade_id = parseInt(this.grade_list[this.grade_index].value);
                    this.rule_extend.unit_lv = parseInt(cloud.user_level());
                    this.rule_extend.fk_unit_id = parseInt(cloud.user_depart_id());
                    this.user_level = cloud.user_level();
                    this.depart_name = cloud.user_school();
                    this.get_rule();
                },
                get_rule: function () {
                    ajax_post(rule_api, this.rule_extend.$model, this)
                },
                //保存或修改
                change_state: function () {
                    if (this.division_method == '' || this.standard == '') {
                        layer.alert('划分方式和标准必选！', {
                            icon: 2,
                            skin: 'layer-ext-moon'
                        });
                        return;
                    }
                    if (this.level_count == 1) {
                        layer.alert('至少设置两个等级', {
                            icon: 2,
                            skin: 'layer-ext-moon'
                        });
                        return;
                    }
                    var lv_partition_length = this.level_list.lv_partition.length;
                    if (this.lv_type == 1 || this.lv_type == 2 || this.lv_type==5) {
                        if (this.level_list.full_score == '') {
                            layer.alert('请先设置总分！', {
                                icon: 2,
                                skin: 'layer-ext-moon'
                            });
                            return;
                        }
                        if (this.level_list.full_score == 0) {
                            layer.alert('总分不能为零！', {
                                icon: 2,
                                skin: 'layer-ext-moon'
                            });
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
                            for (let i = 0; i < score_lv_length; i++) {
                                if (score_lv[i].tall_score === '' || score_lv[i].low_score === '') {
                                    layer.alert('每个分数输入框不能为空！', {
                                        icon: 2,
                                        skin: 'layer-ext-moon'
                                    });
                                    return;
                                }
                            }
                            first_tall_score = score_lv[0].tall_score;
                            last_low_score = score_lv[score_lv_length - 1].low_score;
                            var name = this.level_list.lv_partition[i].school_name;
                            if(this.user_level==4){
                                name = this.level_list.lv_partition[i].class_name;
                            }
                            if (first_tall_score != this.level_list.full_score) {
                                layer.alert(name + ':A等级最高分应该和设置的最高分相等！', {
                                    icon: 2,
                                    skin: 'layer-ext-moon'
                                });
                                return;
                            }
                            if (last_low_score != 0) {
                                layer.alert(name + ':最后一个等级最低分必须为0！', {
                                    icon: 2,
                                    skin: 'layer-ext-moon'
                                });
                                return;
                            }
                            for (var j = 0; j < score_lv_length - 1; j++) {
                                var low_score = score_lv[j].low_score;
                                var tall_score = score_lv[j + 1].tall_score;
                                if (low_score != tall_score) {
                                    layer.alert(name + ':上一个等级最低分必须和下一个等级最高分相等！', {
                                        icon: 2,
                                        skin: 'layer-ext-moon'
                                    });
                                    return;
                                }
                            }
                        }
                    }
                    if (this.lv_type == 3 || this.lv_type == 4 || this.lv_type==6) {
                        for (var i = 0; i < lv_partition_length; i++) {
                            var ratio_lv = this.level_list.lv_partition[i].ratio_lv;
                            this.level_list.lv_partition[i].score_lv = [];
                            var ratio_lv_length = ratio_lv.length;
                            var now_school_all_ratio = 0;
                            for (var j = 0; j < ratio_lv_length; j++) {
                                if (ratio_lv[j].ratio === '') {
                                    layer.alert('每个分数输入框不能为空！', {
                                        icon: 2,
                                        skin: 'layer-ext-moon'
                                    });
                                    return;
                                }
                                now_school_all_ratio += Number(ratio_lv[j].ratio)
                            }
                            var now_name = this.level_list.lv_partition[i].school_name;
                            if(this.user_level==4){
                                now_name = this.level_list.lv_partition[i].class_name;
                            }
                            if (now_school_all_ratio != 100) {
                                layer.alert(now_name + ':总比例必须为100！', {
                                    icon: 2,
                                    skin: 'layer-ext-moon'
                                });
                                return;
                            }
                        }
                    }
                    this.level_list.lv_type = this.lv_type;
                    this.level_list.index_ratio = this.default_data.index_ratio;
                    this.level_list.main_ratio = this.default_data.main_ratio;
                    // console.log( this.level_list);
                    ajax_post(save_api, this.level_list.$model, this);
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
                    if (this.lv_type == 1 || this.lv_type == 2 || this.lv_type==5) {
                        level_length = this.level_list.lv_partition[0].score_lv.length;
                    }
                    //按分数划分
                    if (this.lv_type == 3 || this.lv_type == 4 || this.lv_type==6) {
                        level_length = this.level_list.lv_partition[0].ratio_lv.length;
                    }
                    var new_count = Math.abs(count - level_length);
                    //数量减小
                    var lv_partition_length = this.level_list.lv_partition.length;
                    if (level_length > count) {
                        //按分数划分减等级个数
                        if (this.lv_type == 1 || this.lv_type == 2 || this.lv_type==5) {
                            for (var i = 0; i < lv_partition_length; i++) {
                                this.level_list.lv_partition[i].score_lv.splice(count);
                            }
                        }
                        //按比例划分减等级个数
                        if (this.lv_type == 3 || this.lv_type == 4 || this.lv_type==6) {
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
                        if (this.lv_type == 1 || this.lv_type == 2 || this.lv_type==5) {
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
                        if (this.lv_type == 3 || this.lv_type == 4 || this.lv_type==6) {
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
                    if (this.lv_type == 1 || (this.user_level>3 && this.lv_type==2)) {
                        if (!this.level_list.lv_partition[0].hasOwnProperty('score_lv') || this.level_list.lv_partition[0].score_lv.length == 0) {
                            this.level_list.lv_partition = this.copy_json(this.default_data.lv_partition);
                        }
                        if (this.level_list.lv_partition.length > 1) {
                            this.level_list.lv_partition.splice(1);
                        }
                        return;
                    }
                    //按市统一--等级划分
                    if (this.lv_type == 3 || (this.user_level>3 && this.lv_type==4)) {
                        if (!this.level_list.lv_partition[0].hasOwnProperty('ratio_lv') || this.level_list.lv_partition[0].ratio_lv.length == 0) {
                            this.level_list.lv_partition = this.copy_json(this.default_data.lv_partition);
                        }
                        if (this.level_list.lv_partition.length > 1) {
                            this.level_list.lv_partition.splice(1);
                        }
                        return;
                    }

                    //按学校划分或者按年级统一
                    if(this.lv_type==4 || this.lv_type==2){
                        //按学校划分
                        var district = cloud.user_district();
                        var school_list = cloud.school_list({district:district});
                        var school_length = school_list.length;
                        if (lv_partition_length == 0 || (lv_partition_length == 1 && this.level_list.lv_partition[0].fk_school_id == -1)) {
                            this.level_list.lv_partition = [];
                            if(this.user_level>3){
                                var school_name = cloud.user_school();
                                var obj_grade = {
                                    'fk_school_id': '-1',
                                    'school_name': school_name,
                                    "fk_class_id":'-1',
                                    'class_name':'全部班级',
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
                                    "fk_class_id":'-1',
                                    'class_name':'全部班级',
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
                    if(this.lv_type==5 || this.lv_type==6){
                        if (lv_partition_length == 0 || (lv_partition_length == 1 && this.level_list.lv_partition[0].fk_class_id == -1)) {
                            this.level_list.lv_partition = [];
                            var grade_list = this.all_grade_list;
                            for(var i=0;i<grade_list.length;i++){
                                if(grade_list[i].grade_id==this.rule_extend.fk_grade_id){
                                    var class_list = grade_list[i].class_list;
                                    for(var j=0;j<class_list.length;j++){
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
                    this.default_data.index_ratio = '';
                    this.default_data.main_ratio = '';
                    if (!data.data)
                        return;
                    var is_empty_obj = $.isEmptyObject(data.data);
                    if(!is_empty_obj){//有数据的时候就赋值
                        this.default_data.index_ratio = data.data.index_ratio;
                        this.default_data.main_ratio = data.data.main_ratio;
                    }
                    if (is_empty_obj || !data.data.lv_type || data.data.lv_type == '') {
                        this.level_list = [];
                        this.lv_type = '';//等级划分类型
                        this.division_method = '';//划分方式
                        this.standard = '';//划分标准
                        return;
                    }
                    this.level_list = data.data;
                    this.recombination();
                },
                update_range: function () {
                    if(this.level_list.lv_type&&this.level_list.lv_type==2){
                        toastr.info('已审核，不可修改');
                        return
                    }

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
                copy_json:function (data) {
                    return JSON.parse(JSON.stringify(data));
                },
                get_level_count: function () {
                    if (this.lv_type == 1 || this.lv_type == 2 || this.lv_type==5) {
                        this.level_count = this.level_list.lv_partition[0].score_lv.length;
                    }
                    if (this.lv_type == 3 || this.lv_type == 4 || this.lv_type==6) {
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

                    if (this.division_method == 1 && this.standard == 1) {
                        this.lv_type = 1;
                        return;
                    }
                    if (this.division_method == 1 && (this.standard == 2 || this.standard==3)) {
                        this.lv_type = 2;
                        return;
                    }
                    if (this.division_method == 2 && this.standard == 1) {
                        this.lv_type = 3;
                        return;
                    }
                    if (this.division_method == 2 && (this.standard == 2 || this.standard==3)) {
                        this.lv_type = 4;
                    }
                   if(this.division_method==1 && this.standard==4){
                        this.lv_type = 5;
                   }
                   if(this.division_method==2 && this.standard==4){
                       this.lv_type = 6;
                   }

                },
                inputLimits:function (e, idx, ratio_lv, el2) {
                    if (idx === '') {
                        e.currentTarget.value=e.currentTarget.value.replace(/^[0]+[0-9]*$/gi,"");
                        if (el2 !== '') {
                            if (Number(e.currentTarget.value) === Number(el2.low_score) && Number(e.currentTarget.value) !== 0) {
                                e.currentTarget.value = e.currentTarget.value.substring(0, e.currentTarget.value.length-1);
                                layer.alert('请勿设置相同分数', {
                                    icon: 2,
                                    skin: 'layer-ext-moon'
                                });
                            }
                        }
                        return;
                    }
                    if (idx !== '' && ratio_lv !== '') {
                        if (ratio_lv.length > idx + 1) {
                            e.currentTarget.value=e.currentTarget.value.replace(/^[0]+[0-9]*$/gi,"");
                        }
                        if (el2 !== '') {
                            if (Number(e.currentTarget.value) === Number(el2.tall_score) && Number(el2.tall_score) !== 0) {
                                e.currentTarget.value = e.currentTarget.value.substring(0, e.currentTarget.value.length-1);
                                layer.alert('请勿设置相同分数', {
                                    icon: 2,
                                    skin: 'layer-ext-moon'
                                });
                            }
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
                            if(this.user_level>3){
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
                            if(this.user_level>3){
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
                            case save_api:
                                this.page_state = 1;
                                toastr.success('修改成功');
                                break;
                            case upload_api:
                                this.page_state = 1;
                                $("#file-uploading").modal({
                                    closeOnConfirm: true
                                });
                                this.get_rule();
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },

                //年级改变
                grade_change:function () {
                    var grade_id = this.rule_extend.fk_grade_id;
                    for(var i=0;i<this.grade_list.length;i++){
                        if(grade_id==this.grade_list[i].value){
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
                        layer.alert('请先选择等级个数！', {
                            icon: 2,
                            skin: 'layer-ext-moon'
                        });
                        return
                    }
                    if (lv_type == '') {
                        layer.alert('请先选择划分方式和标准', {
                            icon: 2,
                            skin: 'layer-ext-moon'
                        });
                        return;
                    }
                    var token = sessionStorage.getItem('token');
                    var user = cloud.user_user();
                    var school_code = user.school_code;
                    var url = down_template + '?fk_school_id=' + this.rule_extend.fk_unit_id +
                        "&lv_length=" + this.level_count + "&lv_type=" + lv_type +
                        '&school_name=' + this.depart_name + '&fk_grade_id='+this.rule_extend.fk_grade_id+
                            '&school_code='+school_code+
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