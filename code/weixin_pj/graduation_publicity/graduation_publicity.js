/**
 * Created by Administrator on 2018/4/25.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("weixin_pj", "term_publicity/term_publicity", "css!"),
        C.Co("weixin_pj", "graduation_publicity/graduation_publicity", "html!"),
        C.CMF("data_center.js"),
        "PCAS",
        C.CMF("formatUtil.js"),
        "jquery-weui"
    ],
    function ($, avalon, css, html, data_center, PCAS, formatUtil, weui) {
        //审核公式管控-查询
        var api_query_pub = api.api + 'GrowthRecordBag/publicity_audit_query';
        //校级公示-年级、班级
        var api_grade_class = api.user + 'class/school_class.action';
        //获取学校年级集合
        var api_school_grade = api.user + 'grade/school_grade';
        //获取指定学校年级的班级集合
        var api_get_class = api.user + 'class/findClassSimple.action';
        //查询等级设置个数
        var api_rank_count = api.api + 'Indexmaintain/bypj_find_rank_set';
        //获取表头
        var get_title_api = api.api + "Indexmaintain/bybg_get_all_index_name";
        //获取数据
        var api_result_view = api.api + 'Indexmaintain/bybg_operation_by_count_result_view';
        //评价结果异议-添加
        // var api_evaluation_dissent = api.api + 'Indexmaintain/graduation_evaluation_dissent';
        //评价结果异议-查询选中学生是否被当前登录者提过异议
        var api_query_dissent = api.api + 'Indexmaintain/query_graduation_evaluation_dissent';
        //获取系统当前时间
        var api_current_time = api.api + 'base/baseUser/current_time';
        avalon.filters.state_filter = function (state) {
            var str = '';
            if (state == 0) {
                str = '未发布';
                return str;
            }
            if (state == 5) {
                str = '已归档';
                return str;
            }
            str = '已发布';
            return str;
        };
        //判断后台班级名称是否返回'班'
        avalon.filters.class_ban = function (name) {
            if (name.indexOf("班") != -1)
                return name;
            else
                return name + '班'
        };
        var avalon_define = function () {
                var vm = avalon.define({
                        $id: "graduation_publicity",
                        //身份判断
                        user_type: '',
                        ident_type: '',
                        //公示管控范围:0-未设置、不公示；1-全校可见；2-本年级可见；3-本班可见
                        pub_range: 0,
                        //年级集合
                        grade_list: [],
                        //年级信息
                        grade_info: '',
                        //班级集合
                        class_list: [],
                        class_info: '',
                        //学籍号
                        stu_num: '',
                        //姓名
                        stu_name: '',
                        //等级列表
                        rank_list: [],
                        //发布状态:0-未发布；1-已发布
                        release_type: 0,
                        //列表数据请求参数
                        req_data: {
                            //number	年级id
                            grade_id: '',
                            class_id: '',
                            //string	要筛选的评价等级A,B,C,D
                            rank: '',
                            //是否发布	number	1，已发布，0未发布
                            is_publish: 1,
                            //是否归档	number	1，已归档0，未归档
                            is_file: 0,
                            //学生学号
                            stu_num: '',
                            publish_end_time: '',
                            //学生姓名
                            stu_name: '',
                            offset:0,
                            rows:999,
                        },
                        //列表表头
                        tbodyThead: [],
                        //列表数据
                        get_info: [],
                        //被提异议记录id
                        dissent_id: '',
                        //加载进度
                        index: '',
                        //能否提异议：公示-0（可以提异议）；归档-1（不可以提异议）
                        objection_btn: 0,
                        //系统当前时间
                        current_time: '',
                        //学校id
                        school_id: '',
                        //初始化
                        init: function () {
                            //公式管控
                            ajax_post(api_query_pub, {}, this);
                        },
                        cb: function () {
                            var self = this;
                            //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                            var pub_range = self.pub_range;
                            data_center.uin(function (data) {
                                var tUserData = JSON.parse(data.data["user"]);
                                self.user_type = data.data.user_type;//0：管理员；1：教师；2：学生；3：家长
                                self.ident_type = data.data.highest_level;//3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                                if (self.ident_type == '4') {//校级
                                    var school_id = Number(tUserData.fk_school_id);
                                    self.school_id = school_id;
                                    self.school_info = tUserData.fk_school_id + '|' + tUserData.school_name;
                                    //年级
                                    // ajax_post(api_school_grade, {school_id: school_id}, self);
                                } else if (self.user_type == '1' && (self.ident_type == '5' || self.ident_type == '6')) {//年级、班主任或普通任课教师
                                    self.school_info = tUserData.fk_school_id + '|' + tUserData.school_name;
                                    var school_id = tUserData.fk_school_id;
                                    self.school_id = school_id;
                                    //年级
                                    // ajax_post(api_school_grade, {school_id: school_id}, self);
                                    if (pub_range == 1) {//全校可见
                                        ajax_post(api_grade_class, {school_id: self.school_id}, self);
                                    } else if (pub_range == 2) {//本年级可见
                                        var t_grade = tUserData.teach_class_list;
                                        var l_grade = tUserData.lead_class_list;
                                        for (var i = 0; i < l_grade.length; i++) {
                                            var has = false;
                                            var g_id = l_grade[i].grade_id;
                                            for (var j = 0; j < t_grade.length; j++) {
                                                var id = t_grade[j].grade_id;
                                                var obj = {};
                                                if (g_id == id) {
                                                    has = true;
                                                    break;
                                                }
                                            }
                                            if (has == false) {
                                                t_grade.push(l_grade[i]);
                                            }
                                        }
                                        self.grade_list = t_grade;
                                        var grade_id = self.grade_list[0].grade_id;
                                        //获取指定学校年级的班级集合
                                        ajax_post(api_get_class, {
                                            fk_school_id: self.school_id,
                                            fk_grade_id: grade_id
                                        }, self);
                                    } else if (pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                        var t_grade = tUserData.teach_class_list;
                                        var l_grade = tUserData.lead_class_list;
                                        for (var i = 0; i < l_grade.length; i++) {
                                            var has = false;
                                            var g_id = l_grade[i].grade_id;
                                            for (var j = 0; j < t_grade.length; j++) {
                                                var id = t_grade[j].grade_id;
                                                var obj = {};
                                                if (g_id == id) {
                                                    has = true;
                                                    break;
                                                }
                                            }
                                            if (has == false) {
                                                t_grade.push(l_grade[i]);
                                            }
                                        }
                                        self.grade_list = t_grade;
                                        self.class_list = self.grade_list[0].class_list;
                                    }
                                } else if (self.user_type == '2') {//学生
                                    self.school_info = tUserData.fk_school_id + '|' + tUserData.school_name;
                                    var school_id = tUserData.fk_school_id;
                                    self.school_id = school_id;
                                    //年级
                                    // ajax_post(api_school_grade, {school_id: school_id}, self);
                                    if (pub_range == 1) {//全校可见
                                        ajax_post(api_grade_class, {school_id: self.school_id}, self);
                                    } else if (pub_range == 2) {//本年级可见
                                        //年级
                                        var gb = {
                                            grade_id: tUserData.fk_grade_id,
                                            grade_name: tUserData.grade_name
                                        };
                                        self.grade_list.push(gb);
                                        var grade_id = self.grade_list[0].grade_id;
                                        //获取指定学校年级的班级集合
                                        ajax_post(api_get_class, {
                                            fk_school_id: self.school_id,
                                            fk_grade_id: grade_id
                                        }, self);
                                    } else if (pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                        //年级
                                        var gb = {
                                            grade_id: tUserData.fk_grade_id,
                                            grade_name: tUserData.grade_name
                                        };
                                        self.grade_list.push(gb);
                                        //班级
                                        var obj = {
                                            class_id: tUserData.fk_class_id,
                                            class_name: tUserData.class_name
                                        };
                                        self.class_list.push(obj);
                                    }
                                } else if (self.user_type == '3') {//家长
                                    var stu = tUserData.student;
                                    self.school_info = stu.fk_school_id + '|' + stu.school_name;
                                    var school_id = stu.fk_school_id;
                                    self.school_id = school_id;
                                    //年级
                                    // ajax_post(api_school_grade, {school_id: school_id}, self);
                                    if (pub_range == 1) {//全校可见
                                        ajax_post(api_grade_class, {school_id: self.school_id}, self);
                                    } else if (pub_range == 2) {//本年级可见
                                        //年级
                                        var gb = {
                                            grade_id: stu.fk_grade_id,
                                            grade_name: stu.grade_name
                                        };
                                        self.grade_list.push(gb);
                                        var grade_id = self.grade_list[0].grade_id;
                                        //获取指定学校年级的班级集合
                                        ajax_post(api_get_class, {
                                            fk_school_id: self.school_id,
                                            fk_grade_id: grade_id
                                        }, self);
                                    } else if (pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                        //年级
                                        var gb = {
                                            grade_id: stu.fk_grade_id,
                                            grade_name: stu.grade_name
                                        };
                                        self.grade_list.push(gb);
                                        //班级
                                        var obj = {
                                            class_id: stu.fk_class_id,
                                            class_name: stu.class_name
                                        };
                                        self.class_list.push(obj);
                                    }
                                }
                                if (pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                    self.grade_info = self.grade_list[0].grade_id + '|' + self.grade_list[0].grade_name;
                                    var id = Number(self.grade_info.split('|')[0]);
                                    var school_id = Number(self.school_info.split('|')[0]);
                                    self.req_data.grade_id = id;
                                    self.class_info = self.class_list[0].class_id + '|' + self.class_list[0].class_name;
                                    self.req_data.class_id = Number(self.class_info.split('|')[0]);
                                    var id = Number(self.grade_info.split('|')[0]);
                                    //等级个数
                                    ajax_post(api_rank_count, {c_gradeid: id}, self)
                                }
                            });
                        },
                        //切换年级
                        gradeChange: function () {
                            this.rank_list = [];
                            this.class_list = [];
                            this.req_data.class_id = '';
                            this.req_data.rank = '';
                            var school_id = Number(this.school_info.split('|')[0]);
                            var grade_id = this.grade_info.split('|')[0];
                            this.req_data.grade_id = Number(grade_id);
                            var pub_range = this.pub_range;
                            if (pub_range == 2) {//年级公示
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class, {fk_school_id: school_id, fk_grade_id: this.req_data.grade_id}, this);
                                return;
                            }
                            for (var i = 0; i < this.grade_list.length; i++) {
                                var id = this.grade_list[i].grade_id;
                                if (grade_id == id) {
                                    this.class_list = this.grade_list[i].class_list;
                                    this.class_info = this.class_list[0].class_id + '|' + this.class_list[0].class_name;
                                    this.req_data.class_id = Number(this.class_info.split('|')[0]);
                                    //等级个数
                                    ajax_post(api_rank_count, {c_gradeid: Number(id)}, this)
                                }
                            }
                            // ajax_post(api_get_class, {fk_school_id: school_id, fk_grade_id: parseInt(grade_id)}, this);
                        },
                        //班级
                        classChange: function () {
                            this.rank_list = [];
                            this.req_data.rank = '';
                            this.req_data.class_id = Number(this.class_info.split('|')[0]);
                            //等级
                            ajax_post(api_rank_count, {c_gradeid: parseInt(this.req_data.grade_id)}, this)
                        },
                        //学籍号模糊查询
                        code_search: function () {
                            this.req_data.stu_num = '%' + this.stu_num + '%';
                            //等级
                            ajax_post(api_rank_count, {c_gradeid: parseInt(this.req_data.grade_id)}, this)
                        },
                        //姓名模糊查询
                        name_search: function () {
                            this.req_data.stu_name = '%' + this.stu_name + '%';
                            //等级
                            ajax_post(api_rank_count, {c_gradeid: parseInt(this.req_data.grade_id)}, this)
                        },
                        //等级切换
                        rankChange: function () {
                            $.showLoading();
                            ajax_post(get_title_api, {
                                grade_id: this.req_data.grade_id,
                                school_id: this.school_id,
                            }, this)
                        },
                        //结果查看
                        get_table_data: function () {
                            this.get_info = [];
                            ajax_post(api_result_view, this.req_data.$model, this);
                        },
                        on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                            if (is_suc) {
                                switch (cmd) {
                                    //公示审核管控
                                    case api_query_pub:
                                        this.complete_query_pub(data);
                                        break;
                                    // 校级公示-年级班级
                                    case api_grade_class:
                                        this.complete_grade_class(data);
                                        break;
                                    // //    年级公示-班级
                                    // case api_get_class:
                                    //     this.complete_get_class(data);
                                    //     break;
                                    //获取年级
                                    case api_school_grade:
                                        this.complete_school_grade(data);
                                        break;
                                    // 获取班级
                                    case api_get_class:
                                        this.complete_get_class(data);
                                        break;
                                    //等级个数
                                    case api_rank_count:
                                        this.complete_rank_count(data);
                                        break;
                                    //表头
                                    case get_title_api:
                                        $.hideLoading();
                                        this.complete_table_titles(data);
                                        break;
                                    //获取系统当前时间
                                    case api_current_time:
                                        this.complete_current_time(data);
                                        break;
                                    //结果数据查看
                                    case api_result_view:
                                        this.complete_result_view(data);
                                        break;
                                    //查询是否被异议
                                    case api_query_dissent:
                                        this.complete_query_dissent(data);
                                        break;
                                    //提异议
                                    // case api_evaluation_dissent:
                                    //     $.alert('提交异议成功')
                                    //     break;
                                }
                            } else {
                                $.hideLoading();
                                $.alert(msg)
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
                                    if (mkid == 8) {
                                        self.pub_range = list[i].gsfw;
                                        break;
                                    }
                                }
                            }
                            self.cb();
                        },
                        //校级公示-年级班级
                        complete_grade_class: function (data) {
                            var list = data.data;
                            this.grade_list = list;
                            this.grade_info = this.grade_list[0].grade_id + '|' + this.grade_list[0].grade_name;
                            var id = Number(this.grade_info.split('|')[0]);
                            this.req_data.grade_id = id;
                            this.class_list = this.grade_list[0].class_list;
                            this.class_info = this.class_list[0].class_id + '|' + this.class_list[0].class_name;
                            this.req_data.class_id = Number(this.class_info.split('|')[0]);
                            //等级个数
                            ajax_post(api_rank_count, {c_gradeid: id}, this)
                        },
                        //年级公示-班级
                        complete_get_class: function (data) {
                            var list = data.data;
                            this.class_list = list;
                            this.class_info = this.class_list[0].id + '|' + this.class_list[0].class_name;
                            this.req_data.class_id = Number(this.class_info.split('|')[0]);
                            this.grade_info = this.grade_list[0].grade_id + '|' + this.grade_list[0].grade_name;
                            this.req_data.grade_id = id;
                            var id = Number(this.grade_info.split('|')[0]);
                            //等级个数
                            ajax_post(api_rank_count, {c_gradeid: id}, this);
                        },
                        //等级
                        complete_rank_count: function (data) {
                            if (data.data && data.data.length != 0) {
                                this.rank_list = data.data.list;
                            }
                            $.showLoading();
                            //表头
                            ajax_post(get_title_api, {
                                grade_id: this.req_data.grade_id,
                                school_id: this.school_id,
                            }, this)
                        },
                        //处理表头数据
                        complete_table_titles: function (data) {
                            this.tbodyThead = [];
                            if (!data.data || data.data.zb_name == '')
                                return;
                            var name = data.data.zb_name;
                            this.tbodyThead = name.split(',');
                            //获取当前时间
                            ajax_post(api_current_time, {}, this);
                        },
                        //当前时间
                        complete_current_time: function (data) {
                            this.current_time = data.data.current_time;
                            this.req_data.publish_end_time = this.timeChuo(this.current_time);
                            this.get_table_data();
                        },
                        //数据
                        complete_result_view: function (data) {
                            // if (!data.data || !data.data.list || data.data.list.length == 0)
                            //     return;
                            if (data.data != null && data.data.list.length>0) {
                                var list = data.data.list;
                                var list_length = list.length;
                                //时间判断，能否提异议
                                var current_time = this.timeChuo(this.current_time);
                                var end_time = this.timeChuo(list[0].publish_end_time);
                                var date1 = new Date(current_time.replace(/-/g, "\/"));
                                var date2 = new Date(end_time.replace(/-/g, "\/"));
                                if (date1 < date2) {//公示
                                    this.objection_btn = 0;
                                } else {//归档
                                    this.objection_btn = 1;
                                }
                                //重组数据
                                for (var i = 0; i < list_length; i++) {
                                    var index_value = [];
                                    if (list[i].index_value == null || list[i].index_value == '') {
                                        var table_title_length = this.tbodyThead.length;
                                        for (var k = 0; k < table_title_length; k++) {
                                            var str = '';
                                            index_value.push(str);
                                        }
                                    } else {
                                        index_value = list[i].index_value.split(',');
                                        index_value.pop();
                                    }
                                    list[i].values = index_value;
                                }
                                this.get_info = list;
                            }
                            $.hideLoading();
                        },
                        //跳转状态:结果公示查看页面-0；直接登录-1；
                        publicity_result: '0',
                        //页面跳转传的参数
                        check: function (el) {
                            // console.log(el);
                            window.location = "#graduation_ssessment_report?guid=" + el.stu_id + '&code=' + el.stu_num +
                                '&class_id=' + el.class_id + '&fk_school_id=' + el.school_id + '&grade_id=' + el.grade_id +
                                '&values=' + el.values + '&score_plus=' + el.score_plus + '&zf=' + el.zf + '&rank=' + el.rank +
                                '&publicity_result=' + this.publicity_result;
                            // return;
                        },
                        dissent_stu: {},
                        //异议按钮
                        dissent_btn: function (el) {
                            // console.log(el);
                            this.dissent_id = el.id;
                            var id = el.id;
                            var stu_num = el.stu_num;
                            this.dissent_stu = el;
                            //查询选中学生是否被当前登录者提过异议:type:1,(表示单个用户，查一个人)2.表示查所有人
                            ajax_post(api_query_dissent, {synthesize_id: id, stu_num: stu_num, type: 1}, this);
                        },
                        //异议查询
                        complete_query_dissent: function (data) {
                            var self = this;
                            var is_school_user = cloud.is_school_user();
                            var distict_id = '';
                            if (is_school_user) {
                                distict_id = cloud.school_user_distict_id().district_id;
                            }
                            var user = cloud.user_user();
                            var grade_name = '';
                            for(var i=0;i<this.grade_list.length;i++){
                                if(vm.dissent_stu.grade_id==this.grade_list[i].grade_id){
                                    grade_name = this.grade_list[i].grade_name;
                                    break;
                                }
                            }
                            var class_name = '';
                            for(var j=0;j<this.class_list.length;j++){
                                if(vm.dissent_stu.class_id==this.class_list[j].class_id){
                                    class_name = this.class_list[j].class_name;
                                    break;
                                }
                            }
                            if (data.data.length == 0) {
                                var id = self.dissent_id;
                                var post_data = {
                                    content:'',
                                    synthesize_id:id,
                                    "district_id": distict_id,
                                    "district": user.district,
                                    "fk_school_id": user.fk_school_id,
                                    "school_name":user.school_name,
                                    "account": user.account,
                                    "name":user.name,
                                    "fk_grade_id": vm.dissent_stu.grade_id,
                                    "grade_name": grade_name,
                                    "fk_class_id": vm.dissent_stu.class_id,
                                    "class_name": class_name,
                                    "student_num": vm.dissent_stu.stu_num,
                                    "student_name": vm.dissent_stu.stu_name
                                }
                                var obj = {
                                    'stu':this.dissent_stu,
                                    'post_data':post_data
                                }
                                data_center.set_key('graduation_dissent_data',JSON.stringify(obj));
                                window.location.href = "#graduation_dissent"
                                // layer.prompt({title: '请填写异议', formType: 2}, function(text, index){
                                //     if($.trim(text)!=""){
                                //         ajax_post(api_evaluation_dissent,{content:text,synthesize_id:id},self);
                                //     }
                                //     layer.close(index);
                                // });
                            } else {
                                $.alert('不能重复提交异议');
                            }
                        },
                        //js把时间戳转为为普通日期格式
                        timeChuo: function (h) {
                            var timestamp3 = h / 1000;
                            var newDate = new Date();
                            newDate.setTime(timestamp3 * 1000);
                            Date.prototype.format = function (format) {
                                var date = {
                                    "M+": this.getMonth() + 1,
                                    "d+": this.getDate(),
                                    "h+": this.getHours(),
                                    "m+": this.getMinutes(),
                                    "s+": this.getSeconds(),
                                    "q+": Math.floor((this.getMonth() + 3) / 3),
                                    "S+": this.getMilliseconds()
                                };
                                if (/(y+)/i.test(format)) {
                                    format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
                                }
                                for (var k in date) {
                                    if (new RegExp("(" + k + ")").test(format)) {
                                        format = format.replace(RegExp.$1, RegExp.$1.length == 1
                                            ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                                    }
                                }
                                return format;
                            }
                            var getTimeIs = newDate.format('yyyy-MM-dd');
                            return getTimeIs;
                        },
                    }
                );
                vm.$watch("onReady", function () {
                    vm.init();
                    // this.cb();
                });
                return vm;
            }
        ;
        return {
            view: html,
            define: avalon_define
        }
    })
;