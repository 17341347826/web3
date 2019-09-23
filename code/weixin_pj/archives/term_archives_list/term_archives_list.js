/**
 * Created by Administrator on 2018/9/11.
 */
define(['jquery',
        C.CLF('avalon.js'),
        C.Co('weixin_pj', 'archives/term_archives_list/term_archives_list', 'html!'),
        C.Co('weixin_pj', 'archives/term_archives_list/term_archives_list', 'css!'),
        C.CMF("data_center.js"),
        "echarts",
        "PCAS",'jquery-weui','swiper',C.CLF('base64.js')
    ],
    function ($, avalon, html, css, data_center, echarts, PCAS,weui,swiper,bs64) {
        //获取学年学期
        var api_get_semester = api.api + "base/semester/grade_semester_mapping";
        //获取市下区县
        var api_city_disc = api.user + 'school/arealist.action';
        //获取区县下全部学校年级集合-区县
        var api_disc_school = api.user + 'school/sub_school_grade_list';
        //获取指定学校的年级班级集合——校、区县
        var api_school_class = api.api + 'base/class/school_class.action';
        // 获取指定年级的班级集合
        // var api_grade_class = api.user + 'class/findClassSimple.action';
        //获取初2016年级是几年级
        var grade_class_api = api.api + "base/grade/findGrades.action";
        //学生列表
        var api_stu_list = api.PCPlayer + "baseUser/studentlist.action";

        //导出接口
        var export_api = api.api + "Indexmaintain/export_semester_pdfzip";

        //查询项目
        var project_list_api = api.api + "Indexmaintain/find_project_by_state";

        var avalon_define = function () {
            var vm = avalon.define({
                $id: "term_archives_list",
                //学年学期列表
                semester_list: [],
                sem_info: '',
                url: api_stu_list,
                //用户类型	string	0：管理员；1：教师；2：学生；3：家长
                user_type: '',
                //最高等级	string	user_type='1' 时才有值。
                // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师;11:年级+教师
                highest_level: '',
                //年级
                grade_list: [],
                grade_info: '',
                //区县
                area_list: [],
                area_info: '',
                //学校
                school_list: [],
                school_name: '',
                school_info:'',
                //学校下拉是否显示
                is_show_school: false,
                //学校模糊查询
                nameFlag: false,
                //班级
                class_list: [],
                class_info: '',
                //评价项目
                pj_project_list: [],
                // 学生列表请求参数
                extend: {
                    semester: "",
                    start_date: "",
                    end_date: "",
                    //市
                    city: '',
                    //区县
                    district: '',
                    //学校id number
                    fk_school_id: "",
                    //年级id number
                    fk_grade_id: "",
                    // 班级id
                    fk_class_id: "",
                    //   pro_id: "",
                    code: "",
                    name: "",
                    offset: 0,
                    rows: 15,
                },
                project_list: [],
                //列表数据
                stu_data:[],
                //总的返回列表数
                all_count:'',
                export_extend: {
                    class_id: '',
                    district_id: '',
                    due_grade: '',
                    end_time: '',
                    grade_id: '',
                    phase: '',
                    project_id: '',
                    school_id: '',
                    semester_id: '',
                    start_time: '',
                    year: '',
                    token: '',
                    guid: ''
                },
                //根据年级切换，判断学年学期返回中是否调用身份（学年学期初次调用）：
                grade_tem:true,
                init: function () {
                    vm.grade_list = cloud.auto_grade_list();
                    vm.grade_info = vm.grade_list[0].id;
                    vm.extend.fk_grade_id = vm.grade_info;
                    //学年学期
                    ajax_post(api_get_semester, {grade_id:vm.extend.fk_grade_id}, this);
                },
                //学生列表请求
                stu_list_req:function(){
                    $.showLoading();
                    ajax_post(api_stu_list,this.extend.$model,this);
                },
                //学年学期改变
                semesterChange: function () {
                    var info = this.sem_info.split('|');
                    this.extend.end_date = this.timeChuo(info[2]);
                    this.extend.semester = Number(info[0]);
                    this.extend.start_date = this.timeChuo(info[1]);
                    this.stu_list_req();
                },
                //区县改变
                areaChange: function () {
                    this.school_list = [];
                    this.school_name = '';
                    this.extend.fk_school_id = '';
                    this.class_info = '';
                    this.extend.fk_class_id = '';
                    this.extend.code = '';
                    this.extend.name = '';
                    this.class_list = [];
                    this.project_list = [];
                    this.extend.pro_id = '';
                    var name = this.area_info;
                    this.extend.district = this.area_info;
                    if (name != '') {
                        this.school_list = cloud.school_list({"district": name});
                    }
                    this.stu_list_req();
                },
                //学校筛选
                schoolChange: function () {
                    this.class_info = '';
                    this.class_list = cloud.class_list({fk_school_id: this.school_info, fk_grade_id: this.grade_info});
                    this.project_list = [];
                    this.extend.pro_id = '';
                    this.extend.code = '';
                    this.extend.name = '';
                    this.extend.fk_class_id = "";
                    this.extend.fk_school_id = this.school_info;
                    this.stu_list_req();
                },
                //年级改变
                gradeChange: function () {
                    this.grade_tem = false;
                    this.class_info = '';
                    this.extend.fk_class_id = '';
                    this.project_list = [];
                    this.extend.pro_id = '';
                    this.extend.code = '';
                    this.extend.name = '';
                    this.extend.fk_grade_id = this.grade_info;
                    var gId = this.grade_info;
                    if(this.highest_level > 3){//校及以下身份
                        for(var i = 0;i<this.grade_list.length;i++){
                            if(gId == this.grade_list[i].id){
                                this.class_list = this.grade_list[i].class_list;
                            }
                        }
                        this.class_info = this.class_list[0].class_id;
                        this.extend.fk_class_id = this.class_list[0].class_id;
                    }else{//除教师身份外
                        if(this.school_info != ''){//如果学校存在
                            this.class_list = cloud.class_list({fk_school_id: this.school_info, fk_grade_id: gId});
                        }
                    }
                    if (this.extend.fk_school_id != "" && this.grade_info != '' && this.highest_level != 11) {
                        //项目
                        this.get_project_list()
                    }
                    //学年学期
                    ajax_post(api_get_semester, {grade_id:gId}, this);

                    this.stu_list_req();
                },
                //班级改变
                classChange: function () {
                    this.project_list = [];
                    this.extend.pro_id = '';
                    this.extend.code = '';
                    this.extend.name = '';
                    this.extend.fk_class_id = this.class_info;
                    this.stu_list_req();
                },
                //学籍号查询
                code_search:function(){
                    this.stu_list_req();
                },
                //姓名查询
                name_search:function(){
                    this.stu_list_req();
                },
                get_project_list: function () {
                    if (this.extend.fk_school_id == '' || this.extend.gradeid == '') {
                        toastr.warning('请选择学校和年级！');
                        return;
                    }
                    ajax_post(project_list_api, {
                        ca_gradeid: this.extend.fk_grade_id,
                        state: 5,
                        ca_workid: this.extend.fk_school_id
                    }, this);
                },
                get_remark: function (data) {
                    if (!data.data)
                        return;
                    var remark = data.data[0].remark;
                    var num_obj = {
                        '一年级': 1,
                        '二年级': 2,
                        '三年级': 3,
                        '四年级': 4,
                        '五年级': 5,
                        '六年级': 6,
                        '七年级': 7,
                        '八年级': 8,
                        '九年级': 9
                    }
                    this.export_extend.due_grade = num_obj[remark];
                    var url = export_api + '?' +
                        'class_id=' + this.export_extend.class_id +
                        '&district_id=' + this.export_extend.district_id +
                        '&due_grade=' + this.export_extend.due_grade +
                        '&end_time=' + this.export_extend.end_time +
                        '&grade_id=' + this.export_extend.grade_id +
                        '&phase=' + this.export_extend.phase +
                        '&project_id=' + this.export_extend.project_id +
                        '&school_id=' + this.export_extend.school_id +
                        '&semester_id=' + this.export_extend.semester_id +
                        '&start_time=' + this.export_extend.start_time +
                        '&year=' + this.export_extend.year +
                        '&token=' + this.export_extend.token+'&position=1';
                    if (this.export_extend.guid) {
                        url += '&guid=' + this.export_extend.guid;
                    }
                    window.open(url);

                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level = data.data.highest_level;
                        self.highest_level = highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        self.export_extend.phase = self.semester_list[0].semester_index;
                        self.extend.city = tUserData.city;
                        if (highest_level == 4) {//校
                            self.highest_level = 4;
                            self.area_info = tUserData.district;
                            self.extend.district = tUserData.district;
                            self.extend.fk_school_id = tUserData.fk_school_id;
                            self.school_info = self.extend.fk_school_id;
                            // vm.class_list = vm.grade_list[0].class_list;
                            // vm.class_info =  vm.class_list[0].class_id;
                            // vm.extend.fk_class_id = vm.class_info;
                            self.class_list = cloud.class_list({fk_school_id: self.extend.fk_school_id, fk_grade_id:  vm.grade_info});
                            self.stu_list_req();
                        } else if (highest_level == '2') {//市级
                            self.highest_level = 2;
                            self.ca_workid = D("user.user.fk_school_id");
                            ajax_post(api_city_disc, {city: self.extend.city}, self);
                            self.stu_list_req();
                        } else if (highest_level == '3') {//区县
                            // self.only_hash = true;
                            self.highest_level = 3;
                            self.ca_workid = D("user.user.fk_school_id");
                            var name = tUserData.district;
                            self.extend.district = tUserData.district;
                            //学校列表
                            self.school_list = cloud.school_list({"district": name});
                            self.stu_list_req();
                        } else if (userType == '1' && (highest_level == '5' || highest_level == '6')) {//年级+教师
                            self.highest_level = 11;
                            //年级综合
                            var t_grade = tUserData.teach_class_list;
                            var l_grade = tUserData.lead_class_list;
                            for (var i = 0; i < l_grade.length; i++) {
                                var has = false;
                                var id = l_grade[i].grade_id;
                                for (var j = 0; j < t_grade.length; j++) {
                                    if (t_grade[j].grade_id == id) {
                                        has = true;
                                        break;
                                    }
                                }
                                if (has == false) {
                                    t_grade.push(l_grade[i]);
                                }
                            }
                            self.grade_list = t_grade;
                            //班级综合
                            //教
                            var t_class = tUserData.teach_class_list[0].class_list;
                            //班主任
                            var l_class = tUserData.lead_class_list[0].class_list;
                            for (var i = 0; i < l_class.length; i++) {
                                var has = false;
                                var id = l_class[i].class_id;
                                for (var j = 0; j < t_class.length; j++) {
                                    if (t_class[j].class_id == id) {
                                        has = true;
                                        break;
                                    }
                                }
                                if (has == false) {
                                    t_class.push(l_class[i]);
                                }
                            }
                            self.class_list = t_class;
                            self.area_info = tUserData.district;
                            self.extend.district = tUserData.district;
                            self.extend.fk_school_id = tUserData.fk_school_id;
                            self.school_info = self.extend.fk_school_id;
                            self.grade_info = self.grade_list[0].grade_id;
                            self.extend.fk_grade_id = self.grade_list[0].grade_id;
                            // self.class_info = self.class_list[0].class_id;
                            // self.extend.fk_class_id = self.class_list[0].class_id;

                            self.extend.semester = self.semester_list[0].id;
                            self.stu_list_req();
                        }
                    });
                },
                //详情查看
                term_detail:function(el){
                    cloud.has_pjda({ fk_nj_id: vm.extend.fk_grade_id, fk_xq_id: vm.extend.semester,
                        guid: el.guid, status: 5
                    }, function (url, args, data) {
                        if (data.length == 0) {
                            // winRef.close();
                            $.alert("该学生还未生成学期评价数据");
                            return;
                        }
                        var sid = data[0].fk_pjtjxm_id;
                        vm.export_extend.project_id = sid;
                        var end_date = '';
                        var start_date = '';
                        for (var i = 0; i < vm.semester_list.length; i++) {
                            if (vm.extend.semester == vm.semester_list[i].id) {
                                end_date = vm.semester_list[i].end_date;
                                start_date = vm.semester_list[i].start_date;
                            }
                        }
                        end_date = vm.timeChuo(end_date);
                        start_date = vm.timeChuo(start_date);

                        var href = "guid=" + el.guid + "&s=" + start_date + "&e=" + end_date +
                            "&sid=" + sid + "&smsid=" + vm.extend.semester;
                        data_center.set_key('export_data', JSON.stringify(vm.export_extend))
                        var token = sessionStorage.getItem('token');
                        var f_url = '/Growth/index.html#evaluation_detail?guid=' +el.guid+ "&s=" + start_date + "&e=" + end_date +
                            "&sid=" + sid + "&smsid=" + vm.extend.semester;
                        var url =  bs64.encoder(f_url);
                        var dz = window.location.origin + '/api/GrowthRecordBag/wx_growth_file_get_img?token='+token+'&url='+url;
                        // window.open(dz)
                        // winRef.location = dz;
                        // function loc(){
                        //     winRef.location = dz;
                        // }
                        // setTimeout(loc(),800);//这个等待很重要，如果不等待的话将无法实现
                        var ary = {};
                        ary.jk = window.location.origin + '/api/GrowthRecordBag/wx_growth_file_get_img';
                        ary.token = token;
                        ary.url = url;
                        sessionStorage.setItem('src',JSON.stringify(ary));
                        // alert('3')
                        // window.location.href = '#page_term_archives?tmp='+Number(new Date());
                        window.location.href = '#page_term_archives';

                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    $.hideLoading();
                    if (is_suc) {
                        switch (cmd) {
                            //获取学年学期
                            case api_get_semester:
                                this.complete_get_semester(data);
                                break;
                            //   获取市下区县
                            case api_city_disc:
                                this.complete_city_disc(data);
                                break;
                            //获取区县下学校
                            case api_disc_school:
                                this.complete_disc_school(data);
                                break;
                            //获取指定学校的班级集合
                            case api_school_class:
                                this.complete_school_class(data);
                                break;
                            case project_list_api:
                                this.project_list = data.data;
                                break;
                            case grade_class_api:
                                this.get_remark(data);
                                break;
                            case export_api:

                                break;
                        //        学生列表
                            case api_stu_list:
                                this.complete_stu_list(data);
                                break;
                        }
                    } else {
                        $.alert(msg);
                    }
                },
                //学年学期
                complete_get_semester: function (data) {
                    this.only_hash = true;
                    this.semester_list = data.data.list;
                    this.sem_info = this.semester_list[0].id + '|' + this.semester_list[0].start_date + '|' + this.semester_list[0].end_date;
                    // this.semesterChange();
                    var info = this.sem_info.split('|');
                    this.extend.end_date = this.timeChuo(info[2]);
                    this.extend.semester = Number(info[0]);
                    this.extend.start_date = this.timeChuo(info[1]);
                    if(this.grade_tem){
                        //身份认证
                        this.cds();
                    }
                },
                //区县
                complete_city_disc: function (data) {
                    this.area_list = data.data.list;
                },
                //学校
                complete_disc_school: function (data) {
                    var list = data.data.list;
                    var schoolId = [];
                    var schoolName = [];
                    var sub = {};
                    for (var i = 0; i < list.length; i++) {
                        schoolId[i] = list[i].school_id;
                        schoolName[i] = list[i].schoolname;
                    }
                    var school_id = $.unique(schoolId);
                    var school_name = $.unique(schoolName);
                    for (var i = 0; i < school_id.length; i++) {
                        sub.school_id = school_id[i];
                        sub.schoolname = school_name[i];
                        this.school_list.push(sub);
                    }
                },
                //    年级、班级集合
                complete_school_class: function (data) {
                    this.grade_list = data.data;
                },
                //学生列表
                complete_stu_list:function(data){
                    this.stu_data = data.data.list;
                    this.all_count = data.data.count;
                },
                uninit:function(){
                    window.onscroll = undefined
                },
                //时间戳
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
                                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                                    date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                            }
                        }
                        return format;
                    }
                    var getTimeIs = newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                }

            });
            // require(["jquery-weui"], function (j) {
            //     require(['swiper', 'city_picker'], function (a, b) {
            //         vm.cb();
            //     })
            // });
            vm.$watch('onReady', function () {
                vm.init();
                //滚动条监控时间
                window.onscroll = function(){
                    //$(window).height()--窗口高度；$(window).scrollTop()--滚动体距离顶部的高度
                    var total_height = parseFloat($(window).height()) + parseFloat($(window).scrollTop());
                    //内容高度
                    var doc_height = parseFloat($(document).height());
                    var rows = vm.extend.rows;
                    if(doc_height-total_height <= 50 && rows<vm.all_count){
                        vm.first_scoll = doc_height;
                        console.log(vm.first_scoll);
                        vm.extend.rows = rows + 15;
                        vm.stu_list_req();
                    }
                };
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define,
            repaint:true,
        }
    });