/**
 * Created by uptang on 2017/6/5.
 */
define([
        "jquery", 'layer',
        C.CLF('avalon.js'),
        C.Co("daily_performance", "publicity/final_exam_public/final_exam_public", "css!"),
        C.Co("daily_performance", "publicity/final_exam_public/final_exam_public", "html!"),
        C.CM("table"),
        C.CMF("data_center.js"), "PCAS", C.CM('three_menu_module'),
        C.CMF('partial_loading/loading.js'),
    ],
    function ($, layer, avalon, css, html, table, data_center, PCAS, three_menu_module,pl) {
        //审核公式管控-查询
        var api_query_pub = api.api + 'GrowthRecordBag/publicity_audit_query';
        //校级公示-年级、班级
        var api_grade_class = api.user + 'class/school_class.action';
        //年级公示-班级
        var api_get_class = api.user + 'class/findClassSimple.action';
        //获取学年学期
        var api_get_semester_info = api.api + "base/semester/grade_opt_semester";
        //获取学生信息
        var api_art_evaluation_get_student_info = api.PCPlayer + "student/class_used_stu";
        //获取数据
        var api_get_info = api.api + "score/score_pub_list";
        //提异议
        var api_add_objection = api.api + "score/score_dissent";
        //公示结束
        // var api_end = api.api+"score/score_pub_end";
        //判断后台班级名称是否返回'班'
        avalon.filters.class_ban = function (name) {
            if (name.indexOf("班") != -1)
                return name;
            else
                return name + '班'
        };
        var content_pl = undefined;
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "final_exam_public",
                user_type: "",
                teach_class_list: [],
                class_list: [],
                semester_name_arr: [],
                fk_grade_id: "",
                thead: [],
                body_length: "0",
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had: false,
                form: {
                    fk_school_id: "",
                    semester_id: '',
                    fk_class_id: '',
                    current_process: '公示中',
                    guid__in: [],
                    // 学业成绩传1000 艺术成就传10000
                    subject_id: '1000'
                },
                //公示管控范围:0-未设置、不公示；1-全校可见；2-本年级可见；3-本班可见
                pub_range: 0,
                info_list: [],
                //初始化
                init: function () {
                    content_pl = new pl();
                    content_pl.init({
                       target:'#content_div',
                       type:1
                    });
                    content_pl.start();
                    //公示审核管控
                    ajax_post(api_query_pub, {}, this);
                },
                cb: function () {
                    var self = this;
                    //公示管控范围:0-未设置、不公示；1-全校可见；2-本年级可见；3-本班可见
                    var pub_range = self.pub_range;
                    data_center.uin(function (data) {
                        self.user_type = data.data.user_type;
                        var tUserData = JSON.parse(data.data["user"]);
                        if (self.user_type == "1") {//老师
                            self.form.fk_school_id = tUserData.fk_school_id + '';
                            if (pub_range == 1) {//全校可见
                                ajax_post(api_grade_class, {school_id: self.form.fk_school_id}, self);
                            } else if (pub_range == 2) {//本年级可见
                                self.teach_class_list = cloud.auto_grade_list({});
                                var grade_id = self.teach_class_list[0].grade_id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class, {
                                    fk_school_id: self.form.fk_school_id,
                                    fk_grade_id: grade_id
                                }, self);
                            } else if (pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                self.teach_class_list = cloud.auto_grade_list({});
                                self.class_list = self.teach_class_list[0].class_list;
                            }
                        } else if (self.user_type == "2") {//学生
                            self.form.fk_school_id = tUserData.fk_school_id + '';
                            if (pub_range == 1) {//全校可见
                                ajax_post(api_grade_class, {school_id: self.form.fk_school_id}, self);
                            } else if (pub_range == 2) {//本年级可见
                                //年级
                                var gb = {
                                    grade_id: tUserData.fk_grade_id,
                                    grade_name: tUserData.grade_name
                                };
                                self.teach_class_list.push(gb);
                                var grade_id = self.teach_class_list[0].grade_id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class, {
                                    fk_school_id: self.form.fk_school_id,
                                    fk_grade_id: grade_id
                                }, self);
                            } else if (pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                //年级
                                var gb = {
                                    grade_id: tUserData.fk_grade_id,
                                    grade_name: tUserData.grade_name
                                };
                                self.teach_class_list.push(gb);
                                //班级
                                var obj = {
                                    class_id: tUserData.fk_class_id,
                                    class_name: tUserData.class_name
                                };
                                self.class_list.push(obj);
                            }
                        } else if (self.user_type == "3") {//家长
                            var stuInfo = tUserData.student;
                            self.form.fk_school_id = stuInfo.fk_school_id + '';
                            if (pub_range == 1) {//全校可见
                                ajax_post(api_grade_class, {school_id: self.form.fk_school_id}, self);
                            } else if (pub_range == 2) {//本年级可见
                                //年级
                                var gb = {
                                    grade_id: stuInfo.fk_grade_id,
                                    grade_name: stuInfo.grade_name
                                };
                                self.teach_class_list.push(gb);
                                var grade_id = self.teach_class_list[0].grade_id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class, {
                                    fk_school_id: self.form.fk_school_id,
                                    fk_grade_id: grade_id
                                }, self);
                            } else if (pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                //年级
                                var gb = {
                                    grade_id: stuInfo.fk_grade_id,
                                    grade_name: stuInfo.grade_name
                                };
                                self.teach_class_list.push(gb);
                                //班级
                                var obj = {
                                    class_id: stuInfo.fk_class_id,
                                    class_name: stuInfo.class_name
                                };
                                self.class_list.push(obj);
                            }
                        }
                        if (pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                            self.fk_grade_id = self.teach_class_list[0].grade_id;
                            self.form.fk_class_id = self.class_list[0].class_id + '';
                            //学年学期
                            ajax_post(api_get_semester_info, {grade_id: self.teach_class_list[0].grade_id}, self);
                        }
                    });
                },

                /**
                 *  教师合并年级班级信息：
                 *  班级信息：任课班级+班主任班级
                 *  l_data:班主任年级班级信息
                 *  c_data:任课年级班级信息
                 *  unshift:为了让班主任查看的第一个是班主任班级
                 */
                teacherCombinClass: function (l_data, c_data) {
                    if (l_data.length == 0) return c_data;
                    if (c_data.length == 0) return l_data;
                    let com_grade = [];
                    let self = this;
                    l_data.forEach(function (el) {
                        //在任课里面取出当前班主任年级信息
                        let c_gradeId_info = self.base_filter(c_data, 'garde_id', el.garde_id);
                        if (c_gradeId_info.length == 0) {
                            // c_data.push(el);
                            c_data.unshift(el);
                        } else {
                            let l_class = el.class_list;
                            let c_class = c_gradeId_info[0].class_list;
                            l_class.forEach(function (al) {
                                //获取任课里面当前年级下的班级信息
                                let c_class_info = self.base_filter(c_class, 'class_id', al.class_id);
                                if (c_class_info.length == 0)
                                    c_gradeId_info[0].class_list.unshift(al);
                            })
                        }
                    });
                    return c_data;
                },
                /**
                 * 基础过滤器, 返回Array<Object>中，满 足Object<key>=value的子数组
                 * @param data
                 * @param col_name
                 * @param value
                 * @returns {Array}
                 */
                base_filter: function (data, col_name, value) {
                    var ret = [];
                    for (var x = 0; x < data.length; x++) {
                        if (data[x][col_name] == value) {
                            ret.push(data[x]);
                        }
                    }
                    return ret;
                },
                //判断是否需要调用班级接口还是直接调数据接口
                ajax_class: false,
                //切换年级
                gradeChange: function () {
                    content_pl.start();
                    this.body_length = 0;
                    this.data_had = false;
                    var get_grade_id = this.fk_grade_id;
                    var pub_range = this.pub_range;
                    if (pub_range == 2) {//年级公示
                        //获取指定学校年级的班级集合
                        ajax_post(api_get_class, {
                            fk_school_id: this.form.fk_school_id,
                            fk_grade_id: get_grade_id
                        }, this);
                        return;
                    }
                    var teach_class_list = this.teach_class_list;
                    var teach_class_list_length = teach_class_list.length;
                    for (var i = 0; i < teach_class_list_length; i++) {
                        if (get_grade_id == teach_class_list[i].grade_id) {
                            this.class_list = teach_class_list[i].class_list;
                            this.form.fk_class_id = this.class_list[0].class_id;
                        }
                    }
                    this.ajax_class = true;
                    ajax_post(api_get_semester_info, {grade_id: get_grade_id}, this);
                },
                //切换班级
                classChange: function () {
                    content_pl.start();
                    this.body_length = 0;
                    this.data_had = false;
                    ajax_post(api_art_evaluation_get_student_info, {fk_class_id: Number(this.form.fk_class_id)}, this);
                },
                //切换学年学期
                semesterChange: function () {
                    content_pl.start();
                    this.body_length = 0;
                    this.data_had = false;
                    if (this.ajax_class) {
                        this.ajax_class = false;
                        ajax_post(api_art_evaluation_get_student_info, {fk_class_id: Number(this.form.fk_class_id)}, this);
                    } else {
                        ajax_post(api_get_info, this.form, this);
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //公示审核管控
                            case api_query_pub:
                                this.complete_query_pub(data);
                                break;
                            //获取校下面的年级、班级
                            case api_grade_class:
                                this.complete_grade_class(data);
                                break;
                            //    获取指定学校年级的班级集合
                            case api_get_class:
                                this.complete_get_class(data);
                                break;
                            //获取学年学期
                            case api_get_semester_info:
                                this.complete_get_semester_info(data);
                                break;
                            //获取学生信息
                            case api_art_evaluation_get_student_info:
                                this.complete_art_evaluation_get_student_info(data);
                                break;
                            //获取数据
                            case api_get_info:
                                this.complete_get_info(data);
                                break;
                            //提异议
                            case api_add_objection:
                                toastr.success("提交异议成功");
                                break;
                        }
                    } else {
                        layer.closeAll();
                        content_pl.stop();
                        toastr.error(msg);
                    }
                },
                //公示审核管控
                complete_query_pub: function (data) {
                    var self = this;
                    var list = data.data;
                    if (list != null && list.length > 0) {
                        //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                        //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                        //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                        //xsqr（学生确认）：0否1是
                        for (var i = 0; i < list.length; i++) {
                            var mkid = list[i].mkid;
                            if (mkid == 4) {
                                self.pub_range = list[i].gsfw;
                                break;
                            }
                        }
                    }
                    self.cb();
                },
                //校下面年级班级
                complete_grade_class: function (data) {
                    var list = data.data;
                    this.teach_class_list = list;
                    this.class_list = this.teach_class_list[0].class_list;
                    //年级信息
                    this.fk_grade_id = this.teach_class_list[0].grade_id;
                    this.form.fk_class_id = this.class_list[0].class_id + '';
                    //学年学期
                    ajax_post(api_get_semester_info, {grade_id: this.teach_class_list[0].grade_id}, this);
                },
                //指定学校年级的班级集合
                complete_get_class: function (data) {
                    var list = data.data;
                    this.class_list = list;
                    //年级信息
                    this.fk_grade_id = this.teach_class_list[0].grade_id;
                    //班级id
                    this.form.fk_class_id = this.class_list[0].id + '';
                    //学年学期
                    ajax_post(api_get_semester_info, {grade_id: this.teach_class_list[0].grade_id}, this);
                },
                //获取学年学期
                complete_get_semester_info: function (data) {
                    this.semester_name_arr = data.data.list;
                    this.form.semester_id = data.data.list[0].id + '';
                    ajax_post(api_art_evaluation_get_student_info, {fk_class_id: Number(this.form.fk_class_id)}, this);

                },
                //学生信息回调
                stuList: [],
                complete_art_evaluation_get_student_info: function (data) {
                    if (data.data.list == "") {
                        toastr.warning("暂无公示信息");
                    } else {
                        this.stuList = data.data.list;
                    }
                    //获取数据
                    this.form.guid__in = abstract(data.data.list, "guid");
                    ajax_post(api_get_info, this.form, this);
                },
                json: function (x) {
                    return JSON.stringify(x);
                },
                //获取数据
                tbody: [],
                tbodyex: [],
                showDate: function (col_confi, row_data) {
                    if (col_confi.type == "html") {
                        return col_confi.from;
                    }
                    return row_data[col_confi.from]
                },
                complete_get_info: function (data) {
                    //表头
                    this.thead = [];
                    //数据
                    this.tbodyex = [];
                    //返回的公示列表信息
                    var score_list = data.data.score_list;
                    var score_length = data.data.score_list.length;
                    this.body_length = score_length;
                    this.data_had = true;
                    if (score_length == 0) {
                        content_pl.stop();
                        return;
                    }
                    //渲染表头
                    var theadTh = [];
                    var course_list = data.data.course_list;
                    var course_length = data.data.course_list.length;
                    for (var i = 0; i < course_length; i++) {
                        for (var key in course_list[i]) {
                            var obj = {};
                            obj.key = key;
                            obj.name = course_list[i][key];
                            obj.type = 'import';
                            theadTh.push(obj);
                        }
                    }
                    var obj_y = {};
                    obj_y['course_list'] = theadTh;
                    for (var i = 0; i < score_length; i++) {
                        obj_y[score_list[i].code] = score_list[i]
                    }
                    //渲染内容
                    //全班信息:这里这家把表头对应的值在js处理，html处理慢
                    var stuList = this.stuList.$model;
                    var tbody_score = obj_y;
                    for (var x = 0, len = stuList.length; x < len; x++) {
                        var student = stuList[x];
                        var scores = [];
                        if (tbody_score.hasOwnProperty(student.code)) {//学生有成绩
                            //后台返回当前学生成绩
                            var stuScore = tbody_score[student.code];
                            stuList[x]._id = stuScore._id;
                            //获取表头列表对应值
                            var titles = tbody_score.course_list;
                            for (var j = 0, tlen = titles.length; j < tlen; j++) {
                                var key = titles[j].key;
                                /**
                                 *  <span ms-if="!el[col.key].hasOwnProperty('value')">
                                 {{ el[col.key].level}}
                                 </span>
                                 <span ms-if="el[col.key].value!='' && el[col.key].hasOwnProperty('rate')">
                                 {{ el[col.key].value|number(1,".")}}
                                 </span>
                                 <span ms-if="!el[col.key].hasOwnProperty('rate')">
                                 {{ el[col.key].level }}
                                 </span>
                                 */
                                var s = stuScore[key];
                                if (JSON.stringify(s) == "{}" || s == undefined) {//判断这个对象是否存在或者为空
                                    scores.push('');
                                } else if (!s.hasOwnProperty('value')) {
                                    scores.push(s.level);
                                } else if (s.value != '' && s.hasOwnProperty('rate')) {
                                    var n = Number(s.value).toFixed(1);
                                    scores.push(n);
                                } else if (!s.hasOwnProperty('rate')) {
                                    scores.push(s.level);
                                }
                            }
                        } else {//学生没有成绩
                            student['no_score'] = '';
                        }
                        student.scores = scores;
                    }
                    //表头
                    this.thead = obj_y.course_list;
                    //数据
                    this.tbodyex = stuList;
                    content_pl.stop();
                },
                add_objection: {
                    _id: "",
                    content: ""
                },
                //提出异议
                dissentClick: function (el) {
                    this.add_objection._id = el._id;
                    var self = this;
                    layer.prompt({title: '请填写异议', formType: 2}, function (text, index) {
                        if ($.trim(text) != "") {
                            self.add_objection.content = text;
                            ajax_post(api_add_objection, self.add_objection, self);
                        }
                        layer.close(index);
                    });
                },

            });
            vm.$watch("onReady", function () {
                $(".am-dimmer").css("display", "none");
                this.init();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });