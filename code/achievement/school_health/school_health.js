define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('achievement', 'school_health/school_health', 'html!'),
        C.Co('achievement', 'school_health/school_health', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM('three_menu_module'),
        C.CMF("formatUtil.js")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, three_menu_module, fmt) {
        //审核公式管控-查询
        var api_query_pub = api.api+'GrowthRecordBag/publicity_audit_query';
        var avalon_define = function (args) {
            //上传成绩
            var api_uploader_cj = api.api + 'score/upload_score_file';
            avalon.filters.code_format = function (str) {
                return '...' + str.substring(16);
            };
            var semester_full = [];
            var grade_list = [];
            var vm = avalon.define({
                $id: "subject_score",
                // 体质测评项目
                health_project: {
                    "_id": "",
                    "check_status": -1,
                    "due_grade": "",
                    "end": "",
                    "fk_school_id": -1,
                    "for_id": "",
                    "for_name": "",
                    "grade_status": 0,
                    "join": "",
                    "last": "",
                    "name": "",
                    "phase": "1",
                    "process": "",
                    "solution": "",
                    "start": "",
                    "status": 0
                },
                //判断是否存在项目
                is_valid: false,
                //下拉列表是否显示初始值
                is_init: true,
                current_sems_index: 0,
                grade_list: [],
                class_list: [],
                sem_list: [],
                score_list: [],
                headers: [],
                //免测按钮是否可以点击
                free_btn: false,
                //免测信息提示
                free_msg: '',
                head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期"},
                filter: {code: "", name: ""},
                form_list_score: {
                    _id: "",
                    fk_class_id: "",
                    fk_school_id: "",
                },
                form_uploader: {
                    province: "",
                    city: "",
                    district: "",
                    class_name: "",
                    grade_name: "",
                    phase: 0,
                    subject_id: 12,
                    year_start: "",
                    year_end: "",
                    subject_name: "体质测评",
                    semester_id: ""
                },
                // 模态框 -- 批量上传那些事。
                file_name: "",
                modal: {
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: ""
                },
                login_level: "",//当前登录人角色
                make_pub: function () {
                    layer.closeAll();
                    if (!vm.is_valid) {
                        toastr.warning("公示失败，该学期没有体质测评项目");
                        return;
                    }
                    var form = {
                        project: this.form_list_score._id,
                    }
                    if(!cloud.is_school_leader()){
                        form["fk_class_id"] = vm.form_list_score.fk_class_id + ''
                    }else{
                        form["fk_class_id"] = "";
                    }
                    cloud.make_pub_tz(form, function (url, args, data, is_suc, msg) {
                        if(!is_suc){
                            toastr.error(msg);
                        }else{
                            toastr.success('设置成功');
                        }


                    });
                },
                publicity: function (el) {
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
                init: function () {
                    setTimeout(function (args) {
                        vm.login_level = cloud.user_level();
                        //1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        if (vm.login_level == 4) {
                            var dataList = cloud.grade_list();
                            grade_list = dataList;
                            var dataLength = dataList.length;
                            for (var i = 0; i < dataLength; i++) {
                                dataList[i]['name'] = dataList[i].grade_name;
                                dataList[i]['value'] = dataList[i].grade_id;
                                for (var j = 0; j < dataList[i].class_list.length; j++) {
                                    dataList[i].class_list[j]['name'] = dataList[i].class_list[j].class_name
                                }
                            }
                            vm.grade_list = dataList;
                            vm.class_list = dataList[0].class_list;
                        } else {
                            grade_list = cloud.auto_grade_list({});
                            vm.grade_list = any_2_select(grade_list, {name: "grade_name", value: ["grade_id"]});
                        }
                        vm.form_list_score.fk_school_id = String(cloud.user_depart_id());
                        vm.form_uploader.province = cloud.user_province();
                        vm.form_uploader.city = cloud.user_city();
                        vm.form_uploader.district = cloud.user_district();
                        vm.change_grade(vm.grade_list[0], 0);
                    }, 0);
                },
                change_class: function (value, index) {
                    this.form_list_score.fk_class_id = value.value;
                    this.form_uploader.class_name = value.name;
                },
                change_sems: function (value, index) {
                    // 查询学期下的体质测评
                    var due_grade = index;
                    this.current_sems_index = index;
                    this.form_uploader.semester_id = value.value;
                    this.form_uploader.phase = (semester_full[index].semester_index - 1).toString();
                    this.form_uploader.year_start = time_2_str(semester_full[index].start_date);
                    this.form_uploader.year_end = time_2_str(semester_full[index].end_date);

                    cloud.health_project_list({due_grade: (7 + due_grade).toString()}, function (url, args, data) {
                        // console.assert(data.length <= 1, "快找产品，一学期出现两个评价项目啦");
                        if (data.length > 1) {
                            toastr.warning(value.name + "体质测评项目重复，请联系管理员");
                            vm.free_msg = value.name + '体质测评项目重复，请联系管理员';
                            vm.health_project.status == -1;
                            return;
                        }
                        if (data.length == 0) {
                            toastr.warning(value.name + "不存在体质测评项目");
                            vm.free_msg = '暂无体质测评项目';
                            vm.health_project.status == -1;
                            vm.is_valid = false;
                            return;
                        }

                        vm.is_valid = true;

                        vm.free_btn = true;
                        vm.form_list_score._id = data[0]._id;
                        vm.health_project = data[0];
                        if (vm.is_init) {
                            vm.is_init = false;
                            vm.query_score();
                        }

                    });
                },
                query_score: function () {
                    this.filter.code = "";
                    this.filter.name = "";
                    if (vm.health_project.status == -1) {
                        toastr.warning("该学期暂无项目");
                        return;
                    }
                    var index = layer.load(1, {shade:[0.3,'#121212']});
                    cloud.health_score_list(this.form_list_score.$model, function (data, headers) {
                        vm.headers = headers;
                        vm.score_list = data;
                        layer.close(index);
                    });
                },
                input_score: function () {
                    //公式管控
                    ajax_post(api_query_pub,{},this);
                },
                change_grade: function (value, index) {
                    var grade_ls = grade_list;
                    var ori_class = grade_ls[index].class_list;

                    // 获取班级列表
                    var sel_class_ls = any_2_select(ori_class, {name: "class_name", value: ["class_id"]})
                    this.class_list = sel_class_ls;
                    this.change_class(sel_class_ls[0], 0);

                    // 获取年级的学期列表
                    semester_full = cloud.grade_semester_list({grade_id: Number(value.value)});
                    sort_by(semester_full, ["+start_date"]);
                    // 两两合并
                    semester_full = semester_full.filter(function (v, i) {
                        //这种分割学年学期的方式无法判断分隔符是中文（还是英文(
                        // v.semester_name = v.semester_name.substr(0, v.semester_name.indexOf("("));
                        v.semester_name = v.semester_name.substr(0, 11);
                        return i % 2 == 0;
                    })

                    this.sem_list = any_2_select(semester_full, {name: "semester_name", value: ["id"]});
                    this.change_sems(this.sem_list[0], 0);

                    // 查询参数
                    this.form_list_score.fk_class_id = sel_class_ls[0].value;

                    // 上传参数
                    this.form_uploader.fk_grade_id = value.value;
                    this.form_uploader.grade_name = value.name;
                    this.form_uploader.class_name = sel_class_ls[0].name;
                    this.form_uploader.semester_id = this.sem_list[0].value;
                    this.form_uploader.phase = (semester_full[0].semester_index - 1).toString();
                    this.form_uploader.year_start = time_2_str(semester_full[0].start_date);
                    this.form_uploader.year_end = time_2_str(semester_full[0].end_date);


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
                            //上传
                            case api_uploader_cj:
                                $("#file-uploading").modal({
                                    closeOnConfirm: true
                                });
                                window.location.reload();
                                break;
                        }
                    }else{
                        if(cmd == api_uploader_cj){
                            this.modal.msg = msg;
                        }else{
                            toastr.error(msg);
                        }
                    }
                    // if (!is_suc) {
                    //     toastr.error(msg);
                    //     this.modal.msg = "上传失败";
                    //     return;
                    // }
                    // if (cmd == api_uploader_cj) {
                    //     $("#file-uploading").modal({
                    //         closeOnConfirm: true
                    //     });
                    //     //this.checkBtn();
                    // }
                },
                //公式光控
                complete_query_pub:function(data){
                    var list = data.data;
                    if(list != null && list.length>0){
                        for(var i=0;i<list.length;i++){
                            //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                            //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                            //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                            //xsqr（学生确认）：0否1是
                            var mkid = list[i].mkid;
                            if(mkid == 5){//体质健康测评
                                location.href = "#school_health_edit?fk_class_id=" +
                                    this.form_list_score.fk_class_id + "&fk_school_id=" +
                                    this.form_list_score.fk_school_id.toString() + "&_id=" +
                                    this.form_list_score._id;
                                return;
                            }
                        }
                    }
                    layer.alert('市管理员公示审核管控还未设置', {
                        closeBtn: 0
                        ,anim: 4 //动画类型
                    });
                },
                //免测
                free_test: function () {
                    if (this.free_btn == false) {
                        toastr.warning(this.free_msg);
                        return;
                    }
                    var year_start = time_2_str(semester_full[this.current_sems_index].start_date);
                    var year_end = time_2_str(semester_full[this.current_sems_index].end_date);
                    location.href = "#free_test_based?year_start=" + year_start +
                        "&year_end=" + year_end + "&_id=" +
                        this.form_list_score._id + "&fk_class_id=" + this.form_list_score.fk_class_id +
                        "&fk_grade_id=" + this.form_uploader.fk_grade_id + "&fk_school_id=" + this.form_list_score.fk_school_id
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
                        if (vm.login_level == 4) {//校级
                            vm.form_list_score.fk_class_id = '';
                        }
                        this.modal.msg = "正在上传，请勿取消";
                        fileUpload(api_uploader_cj, this);
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
                //下载模版
                down_score: function () {
                    var subject_name = '体质测评';
                    var fk_school_id = this.form_uploader.fk_school_id;
                    var get_token = sessionStorage.getItem('token');
                    var project_id = vm.form_list_score._id;
                    window.open(api.api +'score/down_score_template?subject_id=' + '999' + "&subject_name=" + subject_name + "&fk_school_id=" + fk_school_id + '&project_id=' + project_id + '&token=' + get_token);

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
            define: avalon_define
        }
    });
