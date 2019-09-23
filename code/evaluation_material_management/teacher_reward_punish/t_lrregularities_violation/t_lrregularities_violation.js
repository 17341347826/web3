/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_material_management', 'teacher_reward_punish/t_lrregularities_violation/t_lrregularities_violation', 'html!'),
        C.Co('evaluation_material_management', 'teacher_reward_punish/t_lrregularities_violation/t_lrregularities_violation', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, three_menu_module) {
        //获取指定学校的班级集合
        var api_grade_class = api.user + 'class/school_class.action';
        //获取学年学期集合
        var api_sem_list = api.user + 'semester/used_list.action';
        //惩戒处罚列表
        var api_punish_list = api.api + 'GrowthRecordBag/punish_findbyPunish';
        avalon.filters.deal_type = function (num) {
            if (num == 1) {
                return "警告"
            } else if (num == 2) {
                return '严重警告'
            } else if (num == 3) {
                return '记过'
            } else if (num == 4) {
                return '记大过'
            }
        };
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "t_lrregularities_violation",
                url_file: api.api + "file/get",//获取文件,
                //学生头像
                user_photo: cloud.user_photo,
                url_img: url_img,
                //身份
                ident_type: '',
                //显示方式：图文-1，表格-2
                html_display: 2,
                //表格显示：列表-1，详情-2
                list_detail: 1,
                //单个学生详情
                person_detail: {},
                //学生姓名
                stu_name: '',
                //学籍号
                stu_num: '',
                //学年学期列表
                sem_list: [],
                //年级列表
                grade_list: [],
                //班级列表
                class_list: [],
                //学年学期集合
                semester_list: [],
                //当前选中学年学期
                semester_remark: 0,
                //日常表现列表数据
                daily_list: [
                    {id: 1, name: '邹倩岚', yy: '只怪人太美'},
                    {id: 2, name: '杨秋琳'}
                ],
                //学校名称
                school_name: '',
                // 区县名称
                distrit_name: '',
                //处分返回数据
                punish_list: [],
                req_data: {
                    classid: '',
                    gradeid: '',
                    //被处罚人id
                    punished_person_id: '',
                    schoolid: '',
                    //学年学期结束时间
                    xqjssj: '',
                    //    学年学期开始时间
                    xqkssj: '',
                    //    学生姓名、
                    punish_name: '',
                    //    学籍号
                    punished_person_num: '',
                    classid_list:[]
                },
                url_for: function (id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                //string转json
                data_change: function (d) {
                    return JSON.parse(d);
                },
                radio_table: function () {
                    //表格显示：列表-1，详情-2
                    this.list_detail = 1;
                },
                //学年学期改变
                semesterChange: function (id, start, end) {
                    this.semester_remark = id;
                    //不是点击最新记录
                    if (id != -1) {
                        //切换成页面默认表格形式
                        this.html_display = 2;
                        this.list_detail = 1;
                        this.req_data.xqkssj = this.timeChuo(start);
                        this.req_data.xqjssj = this.timeChuo(end);
                        this.list_punish()
                    }
                },
                get_class_ids: function (id) {
                    var arr = [];
                    if(id!=''){
                        arr.push(id)
                        return arr
                    }
                    for (var i = 0, len = this.class_list.length; i < len; i++) {
                        arr.push(this.class_list[i].class_id)
                    }
                    return arr
                },
                //年级改变
                grade_change: function () {
                    if (this.ident_type == '6')
                        return;
                    //切换成页面默认表格形式
                    this.html_display = 2;
                    this.list_detail = 1;
                    var grade_id = this.req_data.gradeid;
                    for (var i = 0; i < this.grade_list.length; i++) {
                        var id = this.grade_list[i].grade_id;
                        if (grade_id == id) {
                            this.class_list = this.grade_list[i].class_list;
                        }
                    }
                    if (this.req_data.gradeid == 0) {
                        this.req_data.gradeid = '';
                        this.class_list = [];
                        console.log(123)
                    }
                    this.list_punish();
                    //惩戒列表
                },
                list_punish:function(){
                    this.req_data.classid_list = this.get_class_ids(this.req_data.classid)
                    ajax_post(api_punish_list, this.req_data.$model, this);
                },
                //班级改变
                class_change: function () {
                    //切换成页面默认表格形式
                    this.html_display = 2;
                    this.list_detail = 1;
                    if (this.req_data.classid == 0) {
                        this.req_data.classid = '';
                    }
                    this.list_punish()
                },
                //学籍号改变
                num_search: function () {
                    //切换成页面默认表格形式
                    this.html_display = 2;
                    this.list_detail = 1;
                    this.list_punish()
                },
                //姓名改变
                name_search: function () {
                    //切换成页面默认表格形式
                    this.html_display = 2;
                    this.list_detail = 1;
                    this.list_punish()
                },
                //上传惩戒处罚
                html_turn: function () {
                    window.location = '#teacher_punishment';
                },
                //列表查看详情
                person_honor: function (el) {
                    // console.log(el);
                    //表格显示：列表-1，详情-2
                    this.list_detail = 2;

                    el.img_arr = [];
                    el.video_arr = [];
                    el.file_arr = [];
                    var token = sessionStorage.getItem("token");
                    var fjdz = JSON.parse(el.basis);
                    for (var j = 0; j < fjdz.length; j++) {
                        var file_name = '';
                        if (fjdz[j].hasOwnProperty('name')) {
                            file_name = fjdz[j].name;
                        } else {
                            file_name = fjdz[j].inner_name;
                        }
                        fjdz[j].down_href = api.api + 'file/download_file?img=' + fjdz[j].guid + "&token=" + token;
                        var suffix_index = file_name.lastIndexOf('.');
                        var suffix = file_name.substr(suffix_index + 1);
                        suffix = suffix.toLowerCase();
                        if (vm.suffix_video.indexOf(suffix) != -1) {//视频
                            el.video_arr.push(fjdz[j]);
                            continue;
                        }
                        if (vm.suffix_img.indexOf(suffix) != -1) {
                            el.img_arr.push(fjdz[j]);
                            continue;
                        }
                        el.file_arr.push(fjdz[j]);
                    }
                    //单个学生详情
                    this.person_detail = el;


                    //单个学生详情
                    this.person_detail = el;
                },
                //列表详情返回列表
                back: function () {
                    //表格显示：列表-1，详情-2
                    this.list_detail = 1;
                },
                init: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level = data.data.highest_level;
                        self.ident_type = highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        self.school_name = tUserData.school_name;
                        self.distrit_name = tUserData.district;
                        self.req_data.schoolid = tUserData.fk_school_id;
                        if (highest_level == '4') {//校
                            ajax_post(api_grade_class, {school_id: tUserData.fk_school_id}, self);
                        } else if (highest_level == '6') {//教师
                            var t_grade = tUserData.teach_class_list;
                            var l_grade = tUserData.lead_class_list;
                            self.grade_list = self.teacherCombinClass(l_grade, t_grade);
                            self.class_list = self.grade_list[0].class_list;
                            //    学年学期列表
                            ajax_post(api_sem_list, {status: 1}, self);
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
                base_filter: function (data, col_name, value) {
                    var ret = [];
                    for (var x = 0; x < data.length; x++) {
                        if (data[x][col_name] == value) {
                            ret.push(data[x]);
                        }
                    }
                    return ret;
                },
                //锚点动画
                my_turn: function () {
                    // console.log($(location.hash))
                    if (location.pathname.replace(/^\//, '')) {
                        var $target = $(location.hash);
                        $target = $target.length && $target || $('[name=' + this.hash.slice(1) + ']');
                        if ($target.length) {
                            var targetOffset = $target.offset().top - 80;
                            $('html,body').animate({
                                    scrollTop: targetOffset
                                },
                                1000);
                            return false;
                        }
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级班级集合
                            case api_grade_class:
                                this.complete_grade_class(data);
                                break;
                            //学年学期列表
                            case api_sem_list:
                                this.complete_sem_list(data);
                                break;
                            //    惩戒列表
                            case api_punish_list:
                                this.complete_punish_list(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                //年级班级集合
                complete_grade_class: function (data) {
                    this.grade_list = data.data;
                    //    学年学期列表
                    ajax_post(api_sem_list, {status: 1}, this);
                },
                complete_sem_list: function (data) {
                    this.semester_list = data.data;
                    var start = this.semester_list[0].start_date;
                    var end = this.semester_list[0].end_date;
                    this.req_data.xqkssj = this.timeChuo(start);
                    this.req_data.xqjssj = this.timeChuo(end);
                    this.list_punish()
                },
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                complete_punish_list: function (data) {
                    if (!data || !data.data || !data.data.list)
                        return;
                    var token = sessionStorage.getItem("token");
                    var list = data.data.list;
                    var list_length = list.length;
                    for (var i = 0; i < list_length; i++) {
                        if (!list[i].basis || list[i].basis == null)
                            continue;
                        var fjdz = JSON.parse(list[i].basis);
                        list[i].img_arr = [];
                        list[i].video_arr = [];
                        list[i].file_arr = [];
                        for (var j = 0; j < fjdz.length; j++) {
                            var file_name = '';
                            if (fjdz[j].hasOwnProperty('name')) {
                                file_name = fjdz[j].name;
                            } else {
                                file_name = fjdz[j].inner_name;
                            }
                            fjdz[j].down_href = api.api + 'file/download_file?img=' + fjdz[j].guid + "&token=" + token;
                            var suffix_index = file_name.lastIndexOf('.');
                            var suffix = file_name.substr(suffix_index + 1);
                            suffix = suffix.toLowerCase();
                            if (vm.suffix_video.indexOf(suffix) != -1) {//视频
                                list[i].video_arr.push(fjdz[j]);
                                continue;
                            }
                            if (vm.suffix_img.indexOf(suffix) != -1) {
                                list[i].img_arr.push(fjdz[j]);
                                continue;
                            }
                            list[i].file_arr.push(fjdz[j]);
                        }
                    }


                    ready_photo(list, "punished_person_id");

                    this.punish_list = list;

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
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });