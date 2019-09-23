/**
 * Created by Administrator on 2018/6/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('eval_statistical_analysis/daily_eval_statistics', 'stu_integral_statistics/pers_situation_analysis/pers_situation_analysis', 'html!'),
        C.Co('eval_statistical_analysis/daily_eval_statistics', 'stu_integral_statistics/pers_situation_analysis/pers_situation_analysis', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, three_menu_module) {
        //获取学年学期集合
        var api_get_semester = api.user + "semester/used_list.action";
        //获取学校下对应的年级班级集合
        var api_grade_class = api.api + "base/class/school_class.action";
        //日常表现学生积分统计--时间段
        var api_time_slot = api.api + 'everyday/statistics_score';
        //日常表现学生积分统计--周次
        var api_week_integral = api.api + 'everyday/query_week_list';
        //日常表现学生积分统计--月份
        var api_month_integral = api.api + 'everyday/student_integral_statisticsByMonth';
        //日常表现班级积分统计--时间段
        var api_teacher_time = api.api + 'everyday/stu_integral_statisticsByTime';
        //日常表现班级积分统计--周次
        var api_teacher_week = api.api + 'everyday/stu_integral_statisticsByZc';
        //日常表现班级积分统计--月份
        var api_teacher_month = api.api + 'everyday/stu_integral_statisticsByMonth';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "pers_situation_analysis",
                //登陆者身份
                ident_type: '',
                //查询分类：1-个人情况、2-班级情况
                sit_type: 1,
                //时间分类:1-按时间段、2-按周、3-按月
                time_type: 1,
                //学校id
                school_id: '',
                //学年学期
                sem_list: [],
                sem_info: '',
                //年级
                grade_list: [],
                //班级
                class_list: [],
                //表头列表
                thead_list: [],
                //返回数据
                data_list: [],
                //学籍号
                stu_num: '',
                //姓名
                stu_name: '',
                form: {
                    //公有的参数
                    fk_class_id: '',
                    fk_grade_id: '',
                    fk_school_id: '',
                    //时间段需要传的参数
                    end_date: '',
                    start_date: '',
                    //周次接口需要传的参数
                    // semester_id:'',
                    stu_name: '',
                    stu_num: '',
                    offset: 0,
                    rows: 10,
                },
                //加载
                index: '',
                //分页
                // 数据总数
                count: "",
                /*总页数*/
                totalPage: "",
                // 计算分页数组
                totalPageArr: [],
                /*当前是第几页*/
                currentPage: 1,
                //跳转页码
                pageNo: "",
                filter_undefined:filter_undefined,
                //获取总页数+当前显示分页数组
                set_total_page: function (count) {
                    if (count == 0) {
                        this.totalPageArr = new Array(this.totalPage);
                    } else {
                        //向上取证
                        this.totalPage = Math.ceil(count / this.form.rows);
                        this.get_page_ary(this.currentPage, this.totalPage);
                    }
                },
                //计算分页数组(前提count>0)
                get_page_ary: function (c_page, t_page) {//当前页数，总页数
                    this.totalPageArr = [];
                    var p_ary = [];
                    if (t_page <= 5) {//总页数小于5
                        for (var i = 0; i < t_page; i++) {
                            p_ary[i] = i + 1;
                        }
                    } else if (c_page == 0 && t_page > 5) {
                        for (var i = 0; i < 5; i++) {
                            p_ary[i] = i + 1;
                        }
                    } else if (c_page + 2 >= t_page) {//
                        var base = t_page - 4;
                        for (var i = 0; i < 5; i++) {
                            p_ary[i] = base + i;
                        }
                    } else {//c_page+2<t_page
                        //显示的第一个页数
                        var base = Math.abs(c_page - 2) == 0 ? 1 : Math.abs(c_page - 2);
                        for (var i = 0; i < 5; i++) {
                            p_ary[i] = base + i;
                        }
                    }
                    this.totalPageArr = p_ary;
                    // console.log(this.totalPageArr);
                },
                //当前页面跳转
                currentPageDate: function (num) {
                    this.currentPage = num;
                    this.form.offset = (num - 1) * this.form.rows;
                    //获取数据
                    this.get_table_data();
                },
                //序号改变
                set_index: function (idx, c_page) {
                    var index = idx + (c_page - 1) * this.form.rows;
                    return index;
                },
                //跳转操作
                pageNOSure: function (num) {
                    if (num < 1) {
                        layer.alert('请输入正确的页码', {
                            closeBtn: 0
                            , anim: 4 //动画类型
                        });
                    } else if (num > this.totalPage) {
                        layer.alert('超出总页数', {
                            closeBtn: 0
                            , anim: 4 //动画类型
                        });
                    } else {
                        this.currentPage = Math.ceil(num);
                        this.form.offset = (this.currentPage - 1) * this.form.rows;
                        //获取数据
                        this.get_table_data();
                    }
                },
                //分页

                //查询变化
                sit_change: function (num) {
                    this.sit_type = num;
                    this.data_list = [];
                    this.thead_list = [];
                    this.stu_num = '';
                    this.stu_name = '';
                    this.form.stu_num = '';
                    this.form.stu_name = '';
                    //请求表格数据
                    this.get_table_data();
                },
                //字符串转数组
                str_ary: function (a) {
                    var ary = a.split(',');
                    ary.pop();
                    return ary;
                },
                //学年学期改变
                sem_change: function () {
                    //表格数据
                    this.get_table_data();
                },
                //年级改变
                grade_change: function () {
                    this.stu_num = '';
                    this.stu_name = '';
                    this.form.stu_num = '';
                    this.form.stu_name = '';
                    this.form.fk_class_id = '';
                    var g_id = this.form.fk_grade_id;
                    for (var i = 0; i < this.grade_list.length; i++) {
                        var id = this.grade_list[i].grade_id;
                        if (g_id == id) {
                            this.class_list = this.grade_list[i].class_list;
                        }
                    }
                    //表格数据
                    this.get_table_data();
                },
                //班级改变
                class_change: function () {
                    this.stu_num = '';
                    this.stu_name = '';
                    this.form.stu_num = '';
                    this.form.stu_name = '';
                    //表格数据
                    this.get_table_data();
                },
                //学籍号模糊查询
                num_search: function () {
                    if (this.stu_num == '') {
                        this.form.stu_num = '';
                    } else {
                        this.form.stu_num = '%' + this.stu_num + '%';
                    }
                    this.count = '';
                    // //获取总页数+当前显示分页数组
                    // this.set_total_page(this.count);
                    // //周次集合
                    // this.thead_list=data.data.message.split(',');
                    this.data_list = '';
                    //表格数据
                    this.get_table_data();
                },
                //姓名模糊查询
                name_search: function () {
                    if (this.stu_name == '') {
                        this.form.stu_name = '';
                    } else {
                        this.form.stu_name = '%' + this.stu_name + '%';
                    }
                    //表格数据
                    this.get_table_data();
                },
                //开始时间改变
                get_start_time: function () {
                    // $("#start_time").on("change", function(event) {
                    //     vm.form.start_date = event.delegateTarget.defaultValue;
                    // });
                    // $('#start_time').datepicker('close');
                    $("#start_time").datepicker().on('changeDate.datepicker.amui', function (event) {
                        vm.form.start_date = event.delegateTarget.defaultValue;
                    });
                },
                //结束时间改变
                get_end_time: function () {
                    $("#end_time").on("change", function (event) {
                        vm.form.end_date = event.delegateTarget.defaultValue;
                    });
                    $('#end_time').datepicker('close');
                },
                //查看详情
                detail_turn: function (el) {
                    window.location = "#student_detail?code=" + el.code + "&start_date=" + el.start_date + "&end_date=" + el.end_date +
                        "&name=" + el.name + '&start_date=' + this.form.start_date + '&end_date=' + this.form.end_date;
                },
                //初始化
                cd: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        //user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var ident_type = data.data.highest_level;
                        self.ident_type = ident_type;
                        var tUser = JSON.parse(data.data.user);
                        self.form.fk_school_id = tUser.fk_school_id;
                        //登陆者身份判断
                        if (ident_type == '4') {//校级

                        } else if (ident_type == '6') {//教师
                            var t_grade = tUser.teach_class_list;
                            var l_grade = tUser.lead_class_list;
                            self.grade_list = self.teacherCombinClass(l_grade,t_grade);
                            self.form.fk_grade_id = self.grade_list[0].grade_id;
                            self.class_list = self.grade_list[0].class_list;
                            self.form.fk_class_id = self.class_list[0].class_id;
                            //表格数据
                            self.get_table_data();
                        }
                        //统计时间方式判断
                        if (self.time_type == 1 && ident_type == 4) {
                            //请求年级班级
                            ajax_post(api_grade_class, {school_id: self.form.fk_school_id}, self);
                        } else if (self.time_type == 2 || self.time_type == 3) {
                            //学年学期请求
                            ajax_post(api_get_semester, {status: '1'}, self);
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
                teacherCombinClass:function(l_data,c_data){
                    if(l_data.length == 0) return c_data;
                    if(c_data.length == 0) return l_data;
                    let com_grade = [];
                    let self = this;
                    l_data.forEach(function(el){
                        //在任课里面取出当前班主任年级信息
                        let c_gradeId_info = self.base_filter(c_data,'garde_id',el.garde_id);
                        if(c_gradeId_info.length == 0){
                            // c_data.push(el);
                            c_data.unshift(el);
                        }else{
                            let l_class = el.class_list;
                            let c_class = c_gradeId_info[0].class_list;
                            l_class.forEach(function(al){
                                //获取任课里面当前年级下的班级信息
                                let c_class_info = self.base_filter(c_class,'class_id',al.class_id);
                                if(c_class_info.length == 0)
                                    // c_gradeId_info[0].class_list.push(al);
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
                base_filter:function (data, col_name, value) {
                    var ret = [];
                    for (var x = 0; x < data.length; x++) {
                        if (data[x][col_name] == value) {
                            ret.push(data[x]);
                        }
                    }
                    return ret;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        layer.close(this.index);
                        switch (cmd) {
                            //学年学期
                            case api_get_semester:
                                this.complete_get_semester(data);
                                break;
                            //年级班级
                            case api_grade_class:
                                this.complete_grade_class(data);
                                break;
                            //时间段-学生
                            case api_time_slot:
                                this.complete_time_slot(data);
                                break;
                            //周次-学生
                            case api_week_integral:
                                this.complete_week_integral(data);
                                break;
                            //月份-学生
                            case api_month_integral:
                                this.complete_month_integral(data);
                                break;
                            //时间段-班级
                            case api_teacher_time:
                                this.complete_teacher_time(data);
                                break;
                            //周次-班级
                            case api_teacher_week:
                                this.complete_teacher_week(data);
                                break;
                            //月份-班级
                            case api_teacher_month:
                                this.complete_teacher_month(data);
                                break;
                        }
                    } else {
                        layer.close(this.index);
                        toastr.error(msg);
                    }
                },
                //初始化操作
                // new_data:function(){
                //     this.data_list = [];
                //     this.thead_list = [];
                //     this.stu_num = '';
                //     this.stu_name = '';
                //     this.form.stu_num = '';
                //     this.form.stu_name = '';
                //     this.form.fk_class_id = '';
                //     this.form.fk_grade_id = this.grade_list[0].grade_id;
                //     //时间段需要传的参数
                //     this.form.end_date = '';
                //     this.form.start_date = '';
                //     if(this.sem_list.length>0){
                //         this.sem_info = this.sem_list[0].id+'|'+this.sem_list[0].semester_name+
                //             '|'+this.sem_list[0].start_date+'|'+this.sem_list[0].end_date;
                //     }
                // },
                //请求获取表格数据
                get_table_data: function () {
                    //初始化
                    // this.new_data();
                    this.index = layer.load(1, {shade:[0.3,'#121212']});
                    //查询分类：1-个人情况、2-班级情况
                    //时间分类:1-按时间段、2-按周、3-按月
                    if (this.time_type == 2 || this.time_type == 3) {
                        var sem_id = this.sem_info.split('|')[0];
                        var sem_end = this.timeChuo(this.sem_info.split('|')[3]);
                        var sem_start = this.timeChuo(this.sem_info.split('|')[2]);
                    }
                    if (this.sit_type == 1 && this.time_type == 1) {//1-个人情况 1-按时间段
                        ajax_post(api_time_slot, this.form.$model, this);
                    } else if (this.sit_type == 1 && this.time_type == 2) {//1-个人情况 2-按周
                        ajax_post(api_week_integral, {
                            fk_class_id: this.form.fk_class_id,
                            fk_grade_id: this.form.fk_grade_id,
                            school_id: this.form.fk_school_id,
                            semester_id: sem_id,
                            semester_end_date: sem_end,
                            semester_start_date: sem_start,
                            stu_name: this.form.stu_name,
                            stu_num: this.form.stu_num,
                            offset: this.form.offset,
                            rows: this.form.rows,
                        }, this);
                    } else if (this.sit_type == 1 && this.time_type == 3) {//1-个人情况 3-按月
                        ajax_post(api_month_integral, {
                            fk_class_id: this.form.fk_class_id,
                            fk_grade_id: this.form.fk_grade_id,
                            school_id: this.form.fk_school_id,
                            semester_end_date: sem_end,
                            semester_start_date: sem_start,
                            semester_id: sem_id,
                            stu_name: this.form.stu_name,
                            stu_num: this.form.stu_num,
                            offset: this.form.offset,
                            rows: this.form.rows,
                        }, this);
                    } else if (this.sit_type == 2 && this.time_type == 1) {//2-班级情况  1-时间段
                        ajax_post(api_teacher_time, {
                            fk_class_id: this.form.fk_class_id,
                            fk_grade_id: this.form.fk_grade_id,
                            school_id: this.form.fk_school_id,
                            start_date: this.form.start_date,
                            end_date: this.form.end_date,
                        }, this);
                    } else if (this.sit_type == 2 && this.time_type == 2) {//2-班级情况  2-周次
                        ajax_post(api_teacher_week, {
                            fk_class_id: this.form.fk_class_id,
                            fk_grade_id: this.form.fk_grade_id,
                            school_id: this.form.fk_school_id,
                            semester_id: sem_id,
                            semester_end_date: sem_end,
                            semester_start_date: sem_start,
                        }, this);
                    } else if (this.sit_type == 2 && this.time_type == 3) {//2-班级情况  3-月份
                        ajax_post(api_teacher_month, {
                            fk_class_id: this.form.fk_class_id,
                            fk_grade_id: this.form.fk_grade_id,
                            school_id: this.form.fk_school_id,
                            semester_id: sem_id,
                            semester_end_date: sem_end,
                            semester_start_date: sem_start,
                        }, this);
                    }
                },
                //学年学期
                complete_get_semester: function (data) {
                    this.sem_list = data.data;
                    this.sem_info = this.sem_list[0].id + '|' + this.sem_list[0].semester_name +
                        '|' + this.sem_list[0].start_date + '|' + this.sem_list[0].end_date;
                    if (this.ident_type == '4') {//校
                        //请求年级班级、
                        ajax_post(api_grade_class, {school_id: this.form.fk_school_id}, this);
                    } else if (this.ident_type == '6') {//教师
                        this.get_table_data();
                    }
                },
                //年级
                complete_grade_class: function (data) {
                    this.grade_list = data.data;
                    this.form.fk_grade_id = this.grade_list[0].grade_id;
                    // this.form.fk_grade_id = 38;
                    this.class_list = this.grade_list[0].class_list;
                    // this.form.fk_class_id=71;
                    //表格数据
                    this.get_table_data();
                },
                //时间段-学生
                complete_time_slot: function (data) {
                    if (data.data == null || data.data == undefined || data.data.length == 0)
                        return;
                    this.thead_list = [
                        {id: 1, name: '加分'},
                        {id: 2, name: '减分'},
                        {id: 3, name: '总积分'},
                    ];
                    this.data_list = data.data.list;
                    this.count = data.data.count;
                    //获取总页数+当前显示分页数组
                    this.set_total_page(this.count);
                },
                //周次-学生
                complete_week_integral: function (data) {
                    if (data.data == null || data.data == undefined || data.data.length == 0)
                        return;
                    this.count = data.data.count;
                    //获取总页数+当前显示分页数组
                    this.set_total_page(this.count);
                    //周次集合
                    this.thead_list = data.data.message.split(',');
                    this.data_list = data.data.list;
                },
                //获取周次里面的分值匹配
                // get_data:function(el,name){
                //      //周次
                //      var zc=el.zc;
                //     //周次分：’12,34‘
                //     var zcf=el.zcf.split(',');
                //     if(zc == '' || zc == undefined)
                //         return '';
                //     if(zc.indexOf(name)<0)
                //         return '';
                //     var zc_ary=zc.split(',');
                //     for(var i=0;i<zc_ary.length;i++){
                //         if(name == zc_ary[i])
                //             return zcf[i];
                //     }
                // },
                // //获取月份里面的分值匹配
                // get_month_data:function(el,name){
                //     //周次
                //     var zc=el.month;
                //     //周次分：’12,34‘
                //     var zcf=el.df.split(',');
                //     if(zc == '' || zc == undefined)
                //         return '';
                //     if(zc.indexOf(name)<0)
                //         return '';
                //     var zc_ary=zc.split(',');
                //     for(var i=0;i<zc_ary.length;i++){
                //         if(name == zc_ary[i])
                //             return zcf[i];
                //     }
                // },
                //月份-学生
                complete_month_integral: function (data) {
                    if (data.data == null || data.data == undefined || data.data.length == 0)
                        return;
                    this.count = data.data.count;
                    //获取总页数+当前显示分页数组
                    this.set_total_page(this.count);
                    this.thead_list = data.data.message.split(',');
                    this.data_list = data.data.list;
                },
                //时间段-班级
                complete_teacher_time: function (data) {
                    if (data.data == null || data.data == undefined || data.data.length == 0)
                        return;
                    this.totalPageArr = [];
                    this.thead_list = [
                        {id: 1, name: '加分'},
                        {id: 2, name: '减分'},
                        {id: 3, name: '总积分'},
                    ];
                    this.data_list = data.data;
                },
                //周次-班级
                complete_teacher_week: function (data) {
                    if (data.data == null || data.data == undefined || data.data.length == 0)
                        return;
                    this.totalPageArr = [];
                    this.thead_list = data.data.message.split(',');
                    this.data_list = data.data.list;
                },
                //月份-班级
                complete_teacher_month: function (data) {
                    if (data.data == null || data.data == undefined || data.data.length == 0)
                        return;
                    this.totalPageArr = [];
                    this.thead_list = data.data.message.split(',');
                    this.data_list = data.data.list;
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
                    };
                    var getTimeIs = newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                }
            });
            //监听积分统计方式
            vm.$watch('time_type', function () {
                //初始化
                // this.new_data();
                this.data_list = [];
                this.thead_list = [];
                this.stu_num = '';
                this.stu_name = '';
                this.form.stu_num = '';
                this.form.stu_name = '';
                this.form.fk_grade_id = this.grade_list[0].grade_id;
                //时间段需要传的参数
                this.form.end_date = '';
                this.form.start_date = '';
                if (this.sem_list.length > 0) {
                    this.sem_info = this.sem_list[0].id + '|' + this.sem_list[0].semester_name +
                        '|' + this.sem_list[0].start_date + '|' + this.sem_list[0].end_date;
                }
                if (this.ident_type == '4') { //校
                    this.form.fk_class_id = '';
                } else if (this.ident_type == '6') {//教师
                    this.form.fk_class_id = this.class_list[0].class_id;
                }
                // vm.cd();
                if (this.time_type == 1 && this.ident_type == '4') {
                    //请求年级班级
                    ajax_post(api_grade_class, {school_id: this.form.fk_school_id}, this);
                    // self.thead_list=[
                    //     {id:1,name:'加分'},
                    //     {id:2,name:'减分'},
                    //     {id:3,name:'总积分'},
                    // ];
                } else if (this.time_type == 1 && this.ident_type == '6') {
                    this.get_table_data();
                } else if (this.time_type == 2 || this.time_type == 3) {
                    //学年学期请求
                    ajax_post(api_get_semester, {status: '1'}, this);
                }
            });
            //监听开始时间
            vm.$watch('form.start_date', function () {
                //查询数据
                vm.get_table_data();
            });
            //监听结束时间
            vm.$watch('form.end_date', function () {
                //查询数据
                vm.get_table_data();
            });
            vm.cd();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });