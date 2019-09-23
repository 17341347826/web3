define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("health", "public_health_test/ph_test_list/ph_test_list", "css!"),
        C.Co("health", "public_health_test/ph_test_list/ph_test_list", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM('page_title'),
        C.CM("table")
    ],
    function ($, avalon, layer, css, html, x, data_center, page_title, tab) {
        //体质测试列表
        var table_list_api = api.api + "score/health_pub_list";
        //获取学生信息
        var student_list_api = api.PCPlayer + "baseUser/studentlist.action";
        //提交异议
        var commit_dissent_api = api.api + "score/health_dissent";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "table",
                extend: {
                    fk_school_id: '',
                    fk_grade_id: '',
                    fk_class_id: '',
                    project: '',
                    current_process: '公示中'
                },
                user_type: '',
                //年级班级下拉列表
                select_list: [],
                //选择的年级班级
                selected_grade: '',
                //获取的学生列表
                student_arr: [],
                //表格中展示的数据
                table_list: [],
                //表格标题列表
                course_list: [],
                is_show_none:false,
                // 表头名称
                init: function () {
                    this.get_login_user();
                },
                get_login_user: function () {
                    var self = this;
                    //初始化下拉列表数据
                    self.select_list = [];
                    data_center.uin(function (data) {
                        var user_type = data.data.user_type;
                        if (user_type != 1 && user_type != 2) {
                            toastr.error('登录用户没有权限');
                            return;
                        }
                        self.user_type = user_type;
                        self.only_hash = true;
                        var user = JSON.parse(data.data["user"]);
                        self.extend.fk_school_id = user.fk_school_id.toString();
                        // self.extend.project = pmx.project_id;
                        var obj = {};
                        if (user_type == 1) {
                            var grade_list;
                            if(!user.teach_class_list||user.teach_class_list.length==0){
                                grade_list = user.lead_class_list;
                            }else {
                                grade_list = user.teach_class_list;
                            }
                            var grade_list_length = grade_list.length;
                            for (var i = 0; i < grade_list_length; i++) {
                                obj = {
                                    garde_id: '',
                                    grade_name: '',
                                    class_id: '',
                                    class_name: ''
                                };
                                obj.garde_id = grade_list[i].grade_id;
                                obj.grade_name = grade_list[i].grade_name;
                                var class_list = grade_list[i].class_list;
                                var class_list_length = class_list.length;
                                for (var j = 0; j < class_list_length; j++) {
                                    obj.class_id = class_list[j].class_id;
                                    obj.class_name = class_list[j].class_name;
                                    self.select_list.push(obj);
                                }
                            }
                            self.extend.fk_grade_id = self.select_list[0].garde_id.toString();
                            self.extend.fk_class_id = self.select_list[0].class_id.toString();
                        } else {
                            self.extend.fk_grade_id = user.fk_grade_id.toString();
                            self.extend.fk_class_id = user.fk_class_id.toString();
                            obj = {
                                garde_id: '',
                                grade_name: '',
                                class_id: '',
                                class_name: ''
                            };
                            obj.garde_id = user.fk_grade_id;
                            obj.grade_name = user.grade_name;
                            obj.class_id = user.fk_class_id;
                            obj.class_name = user.class_name;
                            self.select_list.push(obj);
                        }
                        self.get_student_list();
                    });
                },
                //年级班级改变
                grade_change: function () {
                    var arr = this.selected_grade.split(',');
                    this.extend.fk_grade_id = arr[0].toString();
                    this.extend.fk_class_id = arr[2].toString();
                    this.get_student_list();
                },
                //获取学生列表
                get_student_list: function () {
                    ajax_post(student_list_api, {fk_class_id: this.extend.fk_class_id}, this);
                },
                //处理学生数据
                deal_student: function (data) {
                    if (!data.data || !data.data.list || data.data.list.length == 0)
                        return;
                    this.student_arr = [];
                    this.student_arr = data.data.list;
                    this.get_title_score();
                },
                //获取标题和分数
                get_title_score: function () {
                    ajax_post(table_list_api, this.extend.$model, this);
                },
                //处理标题和分数
                deal_title_score: function (data) {
                    if (!data.data || data.data.course_list.length == 0)
                        return;
                    this.table_list = [];
                    var course_list = data.data.course_list;
                    this.course_list = course_list;
                    var score_list = data.data.score_list;
                    var course_list_length = course_list.length;
                    var score_list_length = score_list.length;
                    var student_arr_length = this.student_arr.length;
                    for (var i = 0; i < score_list_length; i++) {
                        var table_obj = {}
                        var guid = score_list[i].guid;
                        var id = score_list[i]._id;
                        for (var j = 0; j < course_list_length; j++) {
                            var key = course_list[j].alias;
                            var name = course_list[j].name;
                            table_obj[key] = {}
                            if (!score_list[i][key]) {
                                table_obj[key].name = name;
                                table_obj[key].addition = '';
                                table_obj[key].lev = '';
                                table_obj[key].rate = '';
                                table_obj[key].score = '';
                                table_obj[key].value = '';
                            } else {
                                table_obj[key].name = name;
                                table_obj[key].addition = score_list[i][key].addition;
                                table_obj[key].lev = score_list[i][key].lev;
                                table_obj[key].rate = score_list[i][key].rate;
                                table_obj[key].score = score_list[i][key].score;
                                table_obj[key].value = score_list[i][key].value;
                            }
                        }
                        for (var k = 0; k < student_arr_length; k++) {
                            if (this.student_arr[k].guid == guid) {
                                var obj = {
                                    guid: guid,
                                    id: id
                                };
                                obj.name = this.student_arr[k].name;
                                obj.code = this.student_arr[k].code;
                                obj.titles = table_obj;
                                this.table_list.push(obj);
                                break;
                            }
                        }

                    }

                    this.is_show_none = this.table_list.length==0?true:false;
                },
                raise_objection: function (id) {
                    var self = this;
                    layer.prompt({title: '请填写异议', formType: 2}, function (text, index) {
                        self.commit_dissent(id, text)
                    });
                },
                commit_dissent: function (id,text) {
                    ajax_post(commit_dissent_api, {
                        _id: id,
                        content:text
                    }, this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case student_list_api:
                                this.deal_student(data);
                                break;
                            case table_list_api:
                                this.deal_title_score(data);
                                break;
                            case commit_dissent_api:
                                layer.closeAll();
                                toastr.success('异议提交成功')
                                this.get_title_score();
                                break;
                            default:
                                break;

                        }
                    } else {
                        toastr.error(msg)
                    }
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