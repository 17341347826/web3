define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("health", "public_health_test/ph_test_list/ph_test_list", "css!"),
        C.Co("health", "public_health_test/ph_check_list/ph_check_list", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM('page_title'),
        C.CM("table")
    ],
    function ($, avalon, layer, css, html, x, data_center, page_title, tab) {
        //体质测试列表
        var table_list_api = api.api + "score/health_dissent_list";
        //获取学生信息
        var student_list_api = api.PCPlayer + "baseUser/studentlist.action";
        //获取项目
        var get_project_api = api.api +"score/health_project_list";
        //手动触发公示结束
        var sub_end = api.api+"score/score_pub_end";

        //获取学年学期列表
        var api_get_semester_name= api.api+"base/semester/used_list.action";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "table",
                extend: {
                    fk_school_id: '',
                    fk_grade_id: '',
                    fk_class_id: '',
                    // project: '',
                    semester_id:''
                    // current_process: '公示中'
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
                //项目列表
                project_list:[],
                //选择的项目
                selected_project:'',
                //学年学期列表
                semesters:[],
                //学年学期id

                // 表头名称
                init: function () {
                    //获取数据（需删除）
                    // this.get_data();
                    //获取学年学期
                    this.get_semester();

                },
                //获取数据，需删除
                get_data:function () {
                    ajax_post(sub_end,{},this)
                },
                get_semester:function () {
                  ajax_post(api_get_semester_name,{
                      status:1
                  },this)
                },
                get_login_user: function () {
                    var self = this;
                    //初始化下拉列表数据
                    self.select_list = [];
                    data_center.uin(function (data) {
                        var user_type = data.data.user_type;
                        if (user_type != 1 && user_type != 2) {
                            toastr.warning('登录用户没有权限');
                            return;
                        }
                        self.user_type = user_type;
                        self.only_hash = true;
                        var user = JSON.parse(data.data["user"]);
                        self.extend.fk_school_id = user.fk_school_id.toString();
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
                        // self.get_project(self.extend.fk_grade_id,true)

                    });
                },
                //年级班级改变
                grade_change: function () {
                    var arr = this.selected_grade.split(',');
                    this.extend.fk_grade_id = arr[0].toString();
                    this.extend.fk_class_id = arr[2].toString();
                    this.get_student_list();
                },
                //学年学期改变
                semester_change:function () {
                    this.get_title_score();
                },
                //获取学生列表
                get_student_list: function () {
                    ajax_post(student_list_api, {fk_class_id: this.extend.fk_class_id}, this);
                },
                //获取项目
                get_project:function (grade,is_true) {
                    ajax_post(get_project_api,{
                        due_grade:grade.toString(),
                        end:'',
                        is_runing:is_true,
                        name__icontains:'',
                        offset:'',
                        phase:'',
                        rows:'',
                        start:''
                    },this)
                },
                project_change:function () {
                    if(this.extend.project=='')
                        return
                    this.get_title_score();
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
                    if (!data.data || !data.data.score_list || data.data.score_list.length == 0)
                        return;
                    this.table_list = [];
                    var score_list = data.data.score_list;
                    var score_list_length = score_list.length;
                    var student_arr_length = this.student_arr.length;
                    for (var i = 0; i < score_list_length; i++) {
                        var obj = {};
                        var guid = score_list[i].guid;
                        obj.code = score_list[i].code;
                        obj.id = score_list[i]._id;
                        obj.dissent_length = score_list[i].dissent_num;
                        for (var j = 0; j < student_arr_length; j++) {
                            if(this.student_arr[j].guid==guid){
                                obj.name = this.student_arr[j].name;
                                break;
                            }
                        }
                        this.table_list.push(obj);
                    }
                },
                to_examine: function (id) {
                    window.location = "#ph_check_detail?id="+id+"&school_id="+this.extend.fk_school_id;
                },
                //处理项目数据
                deal_project:function (data) {
                    if(!data.data||data.data==null||data.data.list.length==0)
                        return;
                    this.project_list = [];
                    this.project_list = data.data.list;
                    this.extend.project = data.data.list[0]._id;
                    this.get_student_list();
                },
                //处理学年学期数据
                deal_semester:function (data) {
                    console.dir(data);
                    if(!data.data)
                        return
                    this.semesters = data.data;
                    this.extend.semester_id = data.data[0].id.toString();
                    this.get_login_user();
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
                            case get_project_api:
                                this.deal_project(data);
                                break;
                            case api_get_semester_name:
                                this.deal_semester(data);
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