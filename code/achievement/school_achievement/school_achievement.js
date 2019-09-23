define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('achievement', 'school_achievement/school_achievement', 'html!'),
        C.Co('achievement', 'school_achievement/school_achievement', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM('three_menu_module'),
        C.CM("agent_table")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, three_menu_module, agent_table) {
        //审核公式管控-查询
        var api_query_pub = api.api + 'GrowthRecordBag/publicity_audit_query';
        //获取学年学期
        var api_get_semester_name = api.api + "base/semester/used_list.action";
        //获取年级
        var api_get_grade = api.PCPlayer + "class/school_class.action";
        //获取初2016年级是几年级
        var api_get_grade_class = api.api + "base/grade/findGrades.action";
        //获取学生信息
        var api_art_evaluation_get_student_info = api.PCPlayer + "baseUser/studentlist.action";
        //获取成绩集合
        var api_get_art_evaluation_list_score = api.api + "score/list_score";
        //保存
        var api_art_evaluation_save_or_update = api.api + "score/save_or_update_score";
        //提交公示
        var api_save_pub = api.api + "score/course_group_make_pub";
        //上传成绩
        var api_uploader_cj = api.api + 'score/upload_score_file_v2';
        //整个年级成绩导入
        var api_uploader_cj_v2 = api.api + 'score/upload_score_file_v2';
        var avalon_define = function (args) {

            var subject_id = args.sid;
            if (subject_id == undefined) {
                subject_id = "1000"
            }
            avalon.filters.code_format = function (str) {
                return '...' + str.substring(16);
            };
            var semester_full = [];
            var grade_list = [];
            var vm = avalon.define({
                $id: "subject_score",
                sid:"",
                //公示按钮
                show_public_click: true,
                grade_list: [],
                class_list: [],
                sem_list: [],
                score_list: [],
                headers: [],
                head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期"},

                data:{rows:15, offset:0},
                form_list_score: {
                    __hash__:true,
                    fk_class_id: "",
                    fk_grade_id: "",
                    fk_school_id: "",
                    phase: "",
                    semester_id: "",
                    subject_id: subject_id,
                    province: "",
                    city: "",
                    district: "",
                    class_name: "",
                    grade_name: "",
                    code: "",
                    name: ""
                },
                pipe: [
                    {
                        "type": "query",
                        "url": "base/baseUser/studentlist.action",
                        // "url": "base/student/class_used_stu",
                        "pms": [
                            "fk_class_id@int", "rows@int", "offset@int", "name@str", "code@str"
                            // "fk_class_id@int"
                        ],
                        "path": "data",
                        "save_as": "student"
                    }, {
                        "type": "query",
                        "url": "score/list_score_v2",
                        "pms": [
                            "fk_class_id@str",
                            "subject_id@str",
                            "fk_grade_id@str",
                            "phase@str",
                            "fk_school_id@str",
                            "year_end@str",
                            "year_start@str",
                            "semester_id@str"
                        ],
                        "path": "data",
                        "save_as": "score"
                    },
                    {
                        "type": "merge",
                        "src": "score.list",
                        "dst": "student.list",
                        "src_key": [
                            "code"
                        ],
                        "dst_key": [
                            "code"
                        ]
                    },
                    {
                        "type": "update_head",
                        "from": "score.columns"
                    },
                    {
                        "type": "out",
                        "out": [
                            {
                                "src": "student.list",
                                "as": "body"
                            },
                            {
                                "src": "student.count",
                                "as": "count"
                            },
                            {
                                "src": "pms_pool.current_page",
                                "as": "current_page"
                            },
                            {
                                "src": "pms_pool.rows",
                                "as": "rows"
                            }
                        ]
                    }
                ],
                //表头
                header: [{
                    "title": "序号",
                    "type": "index",
                    "from": "id"
                }, {
                    "title": "姓名",
                    "type": "text",
                    "from": "name"
                }, {
                    "title": "学籍号",
                    "type": "truncate",
                    "from": "code",
                    "before":3,
                    "behind":3
                }],
                // 模态框 -- 批量上传那些事。
                file_name: "",
                modal: {
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: ""
                },
                user_level: "",
                init: function () {
                    if(subject_id == "10000"){
                        vm.show_public_click = false;
                    }
                    if(args.sid == 10000){
                        this.sid = 10000;
                    }
                    setTimeout(function (args) {
                        vm.user_level = cloud.user_level();
                        if(vm.user_level != '4'){
                            vm.show_public_click = false;
                        }
                        vm.form_list_score.fk_school_id = String(cloud.user_depart_id());
                        vm.form_list_score.province = cloud.user_province();
                        vm.form_list_score.city = cloud.user_city();
                        vm.form_list_score.district = cloud.user_district();
                        grade_list = cloud.auto_grade_list({});
                        vm.grade_list = any_2_select(grade_list, {name: "grade_name", value: ["grade_id"]});
                        vm.change_grade(vm.grade_list[0], 0);
                        vm.query_score();
                    }, 0);
                },
                change_class: function (value, index) {
                    this.form_list_score.fk_class_id = value.value;
                    this.form_list_score.class_name = value.name;
                },
                change_sems: function (value, index) {
                    this.form_list_score.semester_id = value.value;
                    this.form_list_score.phase = (semester_full[index].semester_index - 1).toString();
                },
                query_score: function () {
                    this.form_list_score.__hash__ =! this.form_list_score.__hash__;
                },
                input_score: function () {
                    //公式管控
                    ajax_post(api_query_pub, {}, this);
                },
                isEmptyObject:$.isEmptyObject,
                change_grade: function (value, index) {
                    var grade_ls = grade_list;
                    var ori_class = grade_ls[index].class_list;

                    // 获取班级列表
                    var sel_class_ls = any_2_select(ori_class, {name: "class_name", value: ["class_id"]})
                    this.class_list = sel_class_ls;
                    this.change_class(sel_class_ls[0], 0);

                    // 获取年级的学期列表
                    semester_full = cloud.grade_semester_list({grade_id: Number(value.value)});
                    this.sem_list = any_2_select(semester_full, {name: "semester_name", value: ["id"]});
                    this.form_list_score.grade_id = value.value;
                    this.change_sems(this.sem_list[0], 0);

                    // 查询参数
                    this.form_list_score.fk_grade_id = value.value;
                    this.form_list_score.grade_name = value.name;
                    this.form_list_score.fk_class_id = sel_class_ls[0].value;
                    this.form_list_score.class_name = sel_class_ls[0].name;
                    this.form_list_score.semester_id = this.sem_list[0].value;
                    this.form_list_score.phase = (semester_full[0].semester_index - 1).toString();

                    // 修改对应显示信息
                    data_center.scope("score_edit_opt_grade", function (p) {
                        p.head_value = value.name;
                    });
                    data_center.scope("score_edit_opt_class", function (p) {
                        p.head_value = ori_class[0].class_name;
                    });
                    data_center.scope("score_edit_opt_sem", function (p) {
                        p.head_value = semester_full[0].semester_name;
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //公示审核管控
                            case api_query_pub:
                                this.complete_query_pub(data);
                                break;
                            // 上传
                            case api_uploader_cj:
                                $("#file-uploading").modal({
                                    closeOnConfirm: true
                                });
                                window.location.reload();
                            //this.checkBtn();
                                break;
                            // 上传
                            case api_uploader_cj_v2:
                                $("#file-uploading").modal({
                                    closeOnConfirm: true
                                });
                                window.location.reload();
                                //this.checkBtn();
                                break;
                        }
                    }else{
                        if(cmd == api_uploader_cj || cmd == api_uploader_cj_v2){
                            this.modal.msg = msg;
                        }else{
                            toastr.error(msg);
                        }
                    }
                },
                //公式光控
                complete_query_pub: function (data) {
                    var list = data.data;
                    if (list.length > 0) {
                        for (var i = 0; i < list.length; i++) {
                            //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                            //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                            //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                            //xsqr（学生确认）：0否1是
                            var mkid = list[i].mkid;
                            if (mkid == 4) {//学业成绩
                                location.href = "#sch_ach_entering?fk_class_id=" +
                                    this.form_list_score.fk_class_id + "&fk_grade_id=" +
                                    this.form_list_score.fk_grade_id + "&fk_school_id=" +
                                    this.form_list_score.fk_school_id.toString() + "&semester_id=" +
                                    this.form_list_score.semester_id + "&sid=" + subject_id;
                                return;
                            }
                        }
                    }
                    layer.alert('市管理员公示审核管控还未设置', {
                        closeBtn: 0
                        , anim: 4 //动画类型
                    });
                },
                //下载模版
                down_score: function () {
                    var subject_id = this.form_list_score.subject_id;
                    var subject_name = 'msqmks';
                    var fk_school_id = this.form_list_score.fk_school_id;
                    var get_token = sessionStorage.getItem('token');
                    window.open(api.api+'score/down_score_template?subject_id=' + subject_id + "&subject_name=" + subject_name + "&fk_school_id=" + fk_school_id + '&token=' + get_token);
                },
                //批量导入
                uploading: function () {
                    var files = this.file_name;
                    // var subFile = files.substring(files.indexOf(".") + 1, files.length);
                    var a=files.split(""); //先拆分成数组
                    var b=files.split("").reverse(); //再反转，但还是数组
                    var c=files.split("").reverse().join("");//最后把数组变成字符串
                    var subFile=c.substring(0,c.indexOf("."));
                    if (subFile == "xslx" || subFile == "slx") {
                        this.modal.msg = "正在上传，请勿取消";
                        if (subject_id == 10000 && this.user_level == 4) {//校领导上传艺术测评
                            var old_fki =this.form_list_score.fk_class_id ;
                            this.form_list_score.fk_class_id = '';
                            fileUpload(api_uploader_cj_v2, this);
                            this.form_list_score.fk_class_id = old_fki;
                        } else {
                            fileUpload(api_uploader_cj, this);
                        }
                    } else {
                        this.modal.msg = "请上传Excel文件";
                    }
                },
                uploadingModal: function () {
                    $("#file").val("");
                    this.file_name = "";
                    this.modal.msg = "";
                    $("#file-uploading").modal({
                        closeOnConfirm: false
                    });

                },
                //公示提交
                make_pub: function () {
                    var form = {
                        semester_id: vm.form_list_score.semester_id + '',
                    };
                    if(!cloud.is_school_leader()){
                        form["fk_class_id"] = vm.form_list_score.fk_class_id + ''
                    }else{
                        form["fk_class_id"] = "";
                    }
                    cloud.make_pub_xy(form, function (url, args, data, is_suc, msg) {
                        if(!is_suc){
                            toastr.error(msg);
                        }else{
                            toastr.success("公示成功");
                        }
                    });
                },
                //公示按钮
                public_click: function (el) {
                    var self = this;
                    var unvalid_score_list = base_filter(this.score_list, "has_score", false);
                    var msg_unvalid = join_ex(unvalid_score_list, ",", function (v, i) {
                        return v.name;
                    });
                    if (unvalid_score_list.length != 0) {
                        layer.confirm(msg_unvalid + ' 这' + '【' + unvalid_score_list.length + '】' + '位同学还没有上传成绩,是否继续进行公示', {
                            btn: ['继续', '取消'] //按钮
                        }, function () {
                            vm.make_pub();
                        }, function () {
                            layer.closeAll();
                        });
                    } else {
                        vm.make_pub();
                    }
                },
                //撤销公示
                cancel_click:function(){
                    layer.confirm('是否撤销公示', {
                        btn: ['继续', '取消'] //按钮
                    }, function () {
                        var form = {
                            semester_id: vm.form_list_score.semester_id + '',
                            fk_school_id: vm.form_list_score.fk_school_id+ '',
                            fk_grade_id: vm.form_list_score.fk_grade_id+ ''
                        };
                        if(!cloud.is_school_leader()){
                            form["fk_class_id"] = vm.form_list_score.fk_class_id + ''
                        }else{
                            form["fk_class_id"] = "";
                        }

                        cloud.make_cancel_pub_xy(form, function (url, args, data, is_suc, msg) {
                            if(!is_suc){
                                toastr.error(msg);
                            }else{
                                layer.closeAll();
                                toastr.success("撤销公示成功");
                            }
                        });
                    }, function () {
                        layer.closeAll();
                    });
                },
            });
            vm.$watch("onReady", function () {
                $(".am-dimmer").css("display", "none");
                // this.cb();
            });
            vm.init()
            return vm;
        }


        return {
            view: html,
            define: avalon_define,
            repaint:true,
        }
    });