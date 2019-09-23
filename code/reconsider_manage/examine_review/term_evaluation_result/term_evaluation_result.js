/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('reconsider_manage/examine_review', 'term_evaluation_result/term_evaluation_result', 'html!'),
        C.Co('reconsider_manage/examine_review', 'term_evaluation_result/term_evaluation_result', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly"),
        C.CM("tuploader")
    ],
    function ($, avalon, layer, html, css, data_center, three_menu_module, select_assembly, tuploader) {

    var avalon_define = function () {
            var grade_list = [];
            var semester_full = [];
            var uploader = null;

            function request_after(a, b, c, is_suc, msg) {
                if (!is_suc) {
                    toastr.error(msg)
                }else{
                    vm.init();
                }
            }

            function yy_treat(form) {
                var is_school_user = cloud.is_school_user();
                var distict_id = '';
                if (is_school_user) {
                    distict_id = cloud.school_user_distict_id().district_id;
                }
                var user = cloud.user_user();

                form.district_id = distict_id;
                form.district = user.district;
                form.fk_school_id = user.fk_school_id;
                form.school_name = user.school_name;
                form.account = user.account;
                form.name = user.name;
                form.fk_grade_id = vm.audited_one.fk_grade_id;
                form.grade_name = vm.audited_one.grade_name;
                form.fk_class_id = vm.audited_one.fk_class_id;
                form.class_name = vm.audited_one.class_name;
                form.student_num = vm.audited_one.code;
                form.student_name = vm.audited_one.name;

                cloud.add_audit(form, request_after);
            }

            var vm = avalon.define({
                $id: "term_evaluation_result",
                //图片是否展开（注：如果数据是循环出来，不能用这种方式）
                is_open: false,
                // 接口中未返回区县信息， 暂时使用用户所在区县
                district: "",
                //核查意见
                opinion: '',
                //更正结果
                correct:"",
                // 图片显示相关支持
                user_photo: cloud.user_photo,
                url_img: url_img,
                //学期
                semester_name:"",
                //下拉列表是否初始化
                is_init_sel: true,
                head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期", project: "请选择项目"},
                project_list: [],
                filter: {code: "", name: ""},
                filter_show: function (el) {
                    if (this.filter.name == "" && el.stu_num.indexOf(this.filter.code) >= 0) return true;
                    else if (this.filter.code == "" && el.stu_name.indexOf(this.filter.name) >= 0) return true;
                    else if (this.filter.name == "" && this.filter.code == "") return true;
                    else if (el.stu_num.indexOf(this.filter.code) && el.stu_name.indexOf(this.filter.name)) return true;
                    return false;
                },
                form_list: {
                    city:"",
                    classId:"",
                    district:"",
                    gradeId:"",
                    offset:0,
                    rows:9999999,
                    schoolId:"",
                    semesterId:"",
                    state:3,
                    studentName:"",
                    studentNum:"",
                    /*=================================*/
                    subjectId: ""
                },
                headers:[],
                list: [],
                change_project:function (value, index) {
                    this.form_list.subjectId = value.value;
                    // 查询项目表头
                    cloud.pj_headers({subjectId:value.value}, function (url,args,data) {
                        vm.headers = data;
                    });
                    data_center.scope("term_eva_opt_project", function (p) {
                        p.head_value = value.name;
                        vm.semester_name = value.name;
                    });
                },
                change_grade: function (value, index) {
                    this.form_list.gradeId = Number(value.value);
                    var ori_class = grade_list[index].class_list;

                    // 获取班级列表
                    var sel_class_ls = any_2_select(ori_class, {name: "class_name", value: ["class_id"]})
                    this.class_list = sel_class_ls;

                    // 修改对应显示信息
                    data_center.scope("term_eva_opt_grade", function (p) {
                        p.head_value = value.name;
                    });


                    // 查看该年级的评价报告项目列表
                    var full_project_list  = cloud.get_semeter_pj_project({ca_gradeid:this.form_list.gradeId, state:5, ca_workid:vm.form_list.schoolId});
                    vm.project_list = any_2_select(full_project_list, {name:"ca_name", value:["id"]});
                    if(vm.project_list.length == 0){
                        toastr.warning('未发现评价项目');
                        return;
                    }
                    vm.change_project(vm.project_list[0], 0);
                    this.change_class(this.class_list[0], 0);
                },
                change_class: function (value, index) {
                    data_center.scope("term_eva_opt_class", function (p) {
                        p.head_value = value.name;
                    });
                    // this.form_list.class_id = value.value;
                    // 获取有异议的列表
                    this.form_list.classId = value.value;
                    this.list=[]
                    // 获取审核列表
                    cloud.xq_sh_list(this.form_list.$model, function (url, arg, data) {
                        var count = 0
                        // 针对列表获取对应的异议
                        if(!data.list||data.list.length==0)
                            return;
                        data.list.forEach(function (value, index) {
                            var info = cloud.user_info({guid: value.studentId});
                            value = $.extend(value, info);
                            value.percentileOne = value.percentileOne.split(",");
                            cloud.fy_jdbg({subjectId: value.subjectId, nameId2: value.studentId}, function (url, arg, ret) {
                                value.dissent = ret;
                                vm.list.push(value)
                            });
                        })
                    });
                },
                grade_list: [],
                class_list: [],
                current_type: "0",
                //弹出框，选择的文件名
                file_name: '请选择文件',
                type_arr: [
                    {value: "0", "name": "全部类型"},
                    {value: "1", "name": "品德发展"},
                    {value: "2", "name": "艺术素养"},
                    {value: "3", "name": "社会实践"},
                    {value: "4", "name": "学业水平"},
                    {value: "5", "name": "身体健康"},
                    {value: "6", "name": "成就奖励"},
                    {value: "7", "name": "日常表现"},
                ],
                init: function () {
                    cloud.semester_current({}, function (url, ars, data) {
                        vm.form_list.semesterId = data.id;
                        setTimeout(function (args) {
                            vm.district = cloud.user_district();
                            vm.form_list.city = cloud.user_city();
                            vm.form_list.district = vm.district;
                            vm.form_list.schoolId = cloud.user_depart_id();
                            // -> 不同的身份，获取的班级，年级列表不一样
                            grade_list = cloud.auto_grade_list({});

                            vm.grade_list = any_2_select(grade_list, {name: "grade_name", value: ["grade_id"]});
                            vm.change_grade(vm.grade_list[0], 0);
                        }, 0);
                    });

                },
                //
                change_type: function (value, index) {
                    this.current_type = value.value;
                },
                //跳转页面
                change_page: function (page) {
                    window.location = "#" + page;
                },
                //展开或收起图片（注：如果数据是循环出来，不能用这种方式）
                open_close: function (w) {
                    if (w == 1) {
                        this.is_open = true;
                    } else {
                        this.is_open = false;
                    }
                },
                audited_one:{},
                //异议无效
                disagree: function (el) {
                    //缺附件 缺更正结果
                    var form = {
                    auditOpinion:"0",
                    auditResult:"",
                    correct:"",
                    material:"",
                    name:D("user.user.name"),
                    nameId:D("user.user.guid"),
                    remark:"处理的意见记录字符串",
                    stuId:el.studentId,
                    // stuName:el.studentName,
                    subjectId:el.subjectId
                    }
                    layer.confirm('确定异议无效吗？', {
                        btn: ['确定', '取消'] //按钮
                    }, function () {
                        vm.audited_one = el;
                        yy_treat(form);
                        layer.closeAll();
                    }, function () {
                    });
                },
                //异议成立
                establish: function (el) {
                    //选的文件初始化
                    $('#file').change(function (e) {
                        self.file_name = e.currentTarget.files[0].name;
                    });
                    uploader.cb = function (up, data, status) {
                        var status = data[0].status;
                        if (status == "success") {
                            var form = {
                                auditOpinion:"1",
                                auditResult:vm.opinion,
                                correct:vm.correct,
                                material:"",
                                name:D("user.user.name"),
                                nameId:D("user.user.guid"),
                                remark:"处理的意见记录字符串",
                                stuId:el.studentId,
                                // stuName:el.studentName,
                                subjectId:el.subjectId
                            }
                            form.material=JSON.stringify(data[0])
                            tuploader.clear(uploader);
                            vm.audited_one = el;
                            yy_treat(form);
                            vm.opinion = "";
                        } else {
                            toastr.error("附件上传失败")
                        }
                    };
                    layer.open({
                        title: '核查意见', type: 1, area: ['700px', '450px'], content: $('#v_layer'), btn: ['确定', '取消'],
                        yes: function (index, layero) {
                            if (uploader.files.length != 0) {
                                uploader.start();
                                layer.closeAll();
                            }
                            else {
                                toastr.warning("请设置照片");
                            }
                        }, cancel: function () {
                            //右上角关闭回调
                        }
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });

            vm.$watch("onReady", function () {
                var token = sessionStorage.getItem("token");
                uploader = tuploader.init("file", token, undefined, false);
                vm.init();

            });
            return vm;
        }

        return {
            view: html,
            define: avalon_define
        }
    });
