/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('growth', 'portfolio_assessment/file_details/file_details', 'html!'),
        C.Co('growth', 'portfolio_assessment/file_details/file_details', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        "jquery_print"
    ],
    function ($, avalon, layer, html, css, data_center, three_menu_module, jquery_print) {
        avalon.filters.filter_sex = function (sex) {
            sex = Number(sex);
            switch (sex) {
                case 1:
                    sex = '男';
                    break;
                case 2:
                    sex = '女';
                    break;
            }
            return sex;
        };
        avalon.filters.trim_null = function (value) {
            if (value == null)
                value = '';
            return value;
        };
        var export_api = api.api + "Indexmaintain/export_growthArchives_pdfzip";
        var suffix_video = ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'];
        var suffix_img = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
        var token = sessionStorage.getItem("token");
        var url_file = api.api + "file/get";
        var avalon_define = function (par) {
            ready_photo({guid: par.guid}, "guid");
            var vm = avalon.define({
                $id: "file_details",
                //年级
                grade_list: [],
                //区县
                area_list: [],
                current_tg: '#cover',
                //浏览器高度
                winHeight: 0,
                //学生个人信息
                stu: {},
                //头像guid
                photo_guid: par.guid,
                //个性名片
                person_card: [],
                //学年学期列表
                semester_list: [],
                //目标与发展数据
                target_data: [],
                //日常表现数据
                daily_data: [],
                //实践活动
                practice_data: [],
                //实践活动详情
                practice_detail_data: [],
                extend: {
                    tar_year: '',
                    tar_ownerid: '',
                    gradeID: ''
                },
                fk_school_id: '',
                //获奖情况
                award_data: [],
                //学业成绩信息
                score_data: [],
                // 对齐数组
                score_align_left: [],
                score_align_right: [],
                //体质健康测试
                single_index: [],
                bonus_index: [],
                grade_score: [],
                grade_level: [],
                grade_addition:[],
                art_extend: {
                    code: '',//学籍号	string
                    subject_id: "10000",//科目id
                    due_in: {},
                    current_process:'已归档',
                },
                art_quality_data: [],

                growth_data: [],
                //学期评价
                term_evaluation: [],
                thead: [],
                //毕业评价
                gradation_extend: {
                    class_id: '',
                    grade_id: '',
                    rank: '',
                    stu_num: '',
                    is_file: '',
                    is_publish: ''
                },
                course_list: [],
                //毕业设计综合素质评价
                tbodyThead: [],
                gradation_value: [],
                //---------------
                //页面中是否显示图片（layer中操作用）
                is_show_img: true,
                //页面是否显示图片(全局用)
                show_img: true,
                //图片显示位置(layer中操作用)
                //1代表显示在详情中，2代表图片显示在末尾
                img_position_index: 1,
                //图片位置（全局用）
                img_position: 1,
                init: function () {
                    var page_style = window.localStorage.getItem('page_style');
                    page_style = JSON.parse(page_style);
                    var user = cloud.user_user();
                    if (page_style && (page_style.user == user.guid)) {
                        this.img_position = page_style.img_position;
                        this.show_img = page_style.show_img;
                    }

                    this.init_height();
                    //如果登录的用户是市领导，获取上一个列表页面传过来的guid
                    var guid = par.guid;
                    this.photo_guid = guid;
                    //如果登录的用户为学生,获取学生guid
                    this.user_type = cloud.user_type();
                    if (this.user_type == 2) {
                        guid = cloud.user_guid();
                    }
                    if (this.user_type == 3) {
                        guid = user.student.guid;
                    }
                    //------------------------------------
                    this.get_stu_info(guid);
                    this.get_per_card_list(guid);
                },
                uninit: function () {
                    $(window).unbind('scroll');
                },
                is_empty: $.isEmptyObject,
                user_photo: cloud.user_photo,
                url_img: url_img,
                get_per_card_list: function (guid) {
                    var self = this;
                    cloud.get_per_card_list({guid: guid}, function (url, args, data) {
                        self.person_card = data;
                    })
                },
                setting: function () {
                    this.img_position_index = this.img_position;
                    this.is_show_img = this.show_img;
                    layer.open({
                        type: 1,
                        content: $('#set')
                        , btn: ['确定', '取消']
                        , shadeClose: true
                        , resize: false
                        , yes: function (index, layero) {
                            vm.img_position = vm.img_position_index;
                            vm.show_img = vm.is_show_img;
                            var user = cloud.user_user();
                            var page_style = {
                                'user': user.guid,
                                'img_position': vm.img_position,
                                'show_img': vm.show_img
                            }
                            window.localStorage.setItem('page_style', JSON.stringify(page_style))
                            layer.closeAll();
                        }
                        , btn2: function (index, layero) {
                            vm.img_position_index = 1;
                            vm.is_show_img = false;
                        }
                    });
                },

                get_target: function (grade_id) {
                    var self = this;
                    this.semester_list = cloud.grade_semester_mapping_list({grade_id: grade_id});
                    cloud.get_target_plan_list(this.extend.$model, function (url, args, data) {
                        var list = data;
                        var semester = JSON.parse(JSON.stringify(self.semester_list));
                        for (var i = 0; i < semester.length; i++) {
                            for (var j = 1; j < list.length; j++) {
                                if (semester[i].id == list[j].semester_id) {
                                    var obj = {};
                                    obj.tar_targetplan = list[j].tar_targetplan;
                                    obj.tar_situation = list[j].tar_situation;
                                    obj.score = list[j].score;
                                    //合并对象
                                    semester[i] = Object.assign(semester[i], obj);
                                }
                            }
                        }
                        self.target_data = semester;
                    })
                },
                url_for: function (id) {
                    return url_file + "?token=" + token + "&img=" + id;
                },
                growth_obj: {},
                get_daily: function () {
                    var obj = {};
                    obj.fk_grade_id = this.extend.gradeID;
                    obj.fk_semester_id = '';
                    obj.guid = this.extend.tar_ownerid;
                    obj.listType = 8;
                    obj.workid = cloud.user_depart_id();
                    var self = this;
                    // //获取日常表现-老
                    // cloud.get_growth_all_list(obj, function (url, args, data) {
                    //     var semester = JSON.parse(JSON.stringify(self.semester_list));
                    //     var list = data;
                    //     for (var i = 0; i < semester.length; i++) {
                    //         for (var j = 0; j < list.length; j++) {
                    //             if (semester[i].id == list[j].fk_semester_id) {
                    //                 semester[i].sum_score = list[j].sum_score;
                    //                 semester[i].personality_score = list[j].personality_score;
                    //                 semester[i].everyday_score = list[j].everyday_score;
                    //             }
                    //         }
                    //         if (semester[i].hasOwnProperty('sum_score') == false) {
                    //             semester[i].sum_score = '';
                    //             semester[i].personality_score = '';
                    //             semester[i].everyday_score = '';
                    //         }
                    //     }
                    //     self.daily_data = semester;
                    // });

                    //获取用户基本信息和当前学年学期
                    // var user_data = JSON.parse(sessionStorage.getItem('user_info')).data;
                    // var current_sem = JSON.parse(user_data.semester);
                    // var user_info = JSON.parse(user_data.user);
                    //获取日常表现接口数据
                    var rcbx_data = [];
                    //获取日常表现-新
                    cloud.get_myCount_analysis({
                        semesterId:'',
                        studentId:Number(this.extend.tar_ownerid),
                    }, function (url, args, data) {
                            var semester = JSON.parse(JSON.stringify(self.semester_list));
                            var list = data;
                            rcbx_data = list;
                            for (var i = 0; i < semester.length; i++) {
                                for (var j = 0; j < list.length; j++) {
                                    if (semester[i].id == list[j].semesterId) {
                                        semester[i].sum_score = list[j].mbjh_value;
                                        semester[i].personality_score = list[j].gxtc_value;
                                        semester[i].everyday_score = list[j].rcbx_value;
                                    }
                                }
                                if (semester[i].hasOwnProperty('sum_score') == false) {
                                    semester[i].sum_score = '';
                                    semester[i].personality_score = '';
                                    semester[i].everyday_score = '';
                                }
                            }
                            self.daily_data = semester;
                    });
                    //获取综合实践活动
                    obj.listType = 4;
                    cloud.get_growth_all_list(obj, function (url, args, data) {
                        var semester = JSON.parse(JSON.stringify(self.semester_list));
                        var data_list = data;
                        var total_list = data_list.total_list;
                        for (var i = 0; i < semester.length; i++) {
                            //综合实践接口
                            for (var j = 0; j < total_list.length; j++) {
                                if (semester[i].id == total_list[j].fk_semester_id) {
                                    //合并对象
                                    semester[i] = Object.assign(semester[i], total_list[j]);
                                    delete semester[i].avg_score;
                                }
                            }
                            //日常表现和个性特长接口中去取得分
                            for (var k = 0; k < rcbx_data.length; k++) {
                                if (semester[i].id == rcbx_data[k].semesterId) {
                                    semester[i].avg_score = rcbx_data[k].xshd_value;
                                }
                            }

                            if (semester[i].hasOwnProperty('count_num') == false) {
                                var obj = {};
                                obj.count_num = '';
                                obj.sum_hour_consume = '';
                                if(semester[i].hasOwnProperty('avg_score') == false){
                                    obj.avg_score = '';
                                }
                                //合并对象
                                semester[i] = Object.assign(semester[i], obj);
                            }
                        }
                        self.practice_data = semester;
                        var dataList = data_list.detail_list.list;
                        var dataListLength = dataList.length;
                        for(var i=0;i<dataListLength;i++){
                            if (!dataList[i].attachment || dataList[i].attachment == null)
                                continue;
                            var fjdz = JSON.parse(dataList[i].attachment);
                            dataList[i].img_arr = [];
                            dataList[i].video_arr = [];
                            dataList[i].file_arr = [];
                            for (var j = 0; j < fjdz.length; j++) {
                                var file_name = '';
                                if (fjdz[j].hasOwnProperty('name')) {
                                    file_name = fjdz[j].name;
                                }
                                else {
                                    file_name = fjdz[j].inner_name;
                                }
                                fjdz[j].down_href = api.api+'file/download_file?img=' + fjdz[j].guid + "&token="+ token;
                                var suffix_index = file_name.lastIndexOf('.');
                                var suffix = file_name.substr(suffix_index + 1);
                                suffix = suffix.toLowerCase();
                                if (suffix_video.indexOf(suffix) != -1) {//视频
                                    dataList[i].video_arr.push(fjdz[j]);
                                    continue;
                                }
                                if (suffix_img.indexOf(suffix) != -1) {
                                    dataList[i].img_arr.push(fjdz[j]);
                                    continue;
                                }
                                dataList[i].file_arr.push(fjdz[j]);
                            }
                        }

                        self.practice_detail_data = dataList;
                    });
                    obj.listType = 3;
                    //获奖情况
                    cloud.get_growth_all_list(obj, function (url, args, data) {
                        var dataList = data.list;

                        for (var i = 0; i < dataList.length; i++) {
                            if (!dataList[i].ach_enclosure || dataList[i].ach_enclosure == null)
                                continue;
                            var fjdz = JSON.parse(dataList[i].ach_enclosure);
                            dataList[i].img_arr = [];
                            dataList[i].video_arr = [];
                            dataList[i].file_arr = [];
                            for (var j = 0; j < fjdz.length; j++) {
                                var file_name = '';
                                if (fjdz[j].hasOwnProperty('name')) {
                                    file_name = fjdz[j].name;
                                }
                                else {
                                    file_name = fjdz[j].inner_name;
                                }
                                fjdz[j].down_href = api.api+'file/download_file?img=' + fjdz[j].guid + "&token="+ token;
                                var suffix_index = file_name.lastIndexOf('.');
                                var suffix = file_name.substr(suffix_index + 1);
                                suffix = suffix.toLowerCase();
                                if (suffix_video.indexOf(suffix) != -1) {//视频
                                    dataList[i].video_arr.push(fjdz[j]);
                                    continue;
                                }
                                if (suffix_img.indexOf(suffix) != -1) {
                                    dataList[i].img_arr.push(fjdz[j]);
                                    continue;
                                }
                                dataList[i].file_arr.push(fjdz[j]);
                            }
                        }

                        self.award_data = dataList;
                    });
                    //成长记录
                    obj.listType = 9;

                    cloud.get_growth_all_list(obj, function (url, args, data) {
                        var gd = data;
                        var growth_data_length = gd.length;
                        var semester_length = self.semester_list.length;
                        var obj = {};

                        var semester_obj = {};
                        for (var i = 0; i < semester_length; i++) {
                            var key = self.semester_list[i].id;
                            if (!obj.hasOwnProperty(key)) {
                                obj[key] = {};
                            }
                            obj[key].remark = self.semester_list[i].remark;
                        }

                        for (var i = 0; i < growth_data_length; i++) {
                            var key = gd[i].fk_semester_id;
                            obj[key]['content_guardian'] = gd[i].content_guardian;
                            obj[key]['remark_mutual_list'] = gd[i].remark_mutual_list;
                            obj[key]['content_my'] = gd[i].content_my;
                            obj[key]['content_teacher'] = gd[i].content_teacher;
                        }
                        vm.growth_obj = obj;
                        console.log(vm.growth_obj)

                    });
                    //学期评价
                    obj.listType = 10;

                    cloud.get_growth_all_list(obj, function (url, args, data) {
                        //学年学期
                        var semester = JSON.parse(JSON.stringify(self.semester_list));
                        var term = data;
                        var thead = self.thead;
                        for (var i = 0; i < term.length; i++) {
                            var list = term[i].evaluate_grade_list;
                            var obj = {};
                            if (thead.length == 0) {//初次相遇
                                for (var j = 0; j < list.length; j++) {
                                    obj.name = list[j].signname1;
                                    thead.push(obj);
                                }
                            } else if (thead.length != 0) {//二次及以后相遇
                                for (var j = 0; j < list.length; j++) {
                                    var key = list[j].signname1;
                                    //判断表头里面是否有
                                    var own = false;
                                    for (var k = 0; k < thead.length; k++) {
                                        if (thead[k].name == key) {
                                            own = true;
                                            break;
                                        }
                                    }
                                    if (own == false) {
                                        obj.name = list[j].signname1;
                                        thead.push(obj);
                                    }
                                }
                            }
                        }
                        self.thead = thead;
                        for (var i = 0; i < semester.length; i++) {
                            for (var j = 0; j < term.length; j++) {
                                if (semester[i].id == term[j].semester_id) {
                                    //合并两对象
                                    semester[i] = Object.assign(semester[i], term[j]);
                                }
                            }
                            if (semester[i].hasOwnProperty('daily_evaluation_score') == false) {
                                var obj = {};
                                obj.daily_evaluation_score = '';
                                obj.sum_score = '';
                                obj.grade_name = '';
                                obj.evaluate_grade_list = [];
                                //合并对象
                                semester[i] = Object.assign(semester[i], obj);
                            }
                        }
                        for (var i = 0; i < semester.length; i++) {
                            var grade_list = semester[i].evaluate_grade_list;
                            for (var j = 0; j < thead.length; j++) {
                                var name = thead[j].name;
                                if (grade_list.length == 0) {
                                    var obj = {};
                                    obj.signname1 = thead[j].name;
                                    obj.score = '';
                                    obj.evaluate_score = '';
                                    grade_list.push(obj);
                                } else if (grade_list.length != 0) {
                                    var owner = false;
                                    for (var k = 0; k < grade_list.length; k++) {
                                        if (grade_list[k].signname1 == name) {
                                            owner = true;
                                            break;
                                        }
                                    }
                                    if (owner == false) {
                                        var obj = {};
                                        obj.signname1 = thead[j].name;
                                        obj.score = '';
                                        obj.evaluate_score = '';
                                        grade_list.push(obj);
                                    }
                                }
                            }
                        }
                        self.term_evaluation = semester;

                    });
                },
                //打印
                print: function () {
                    $("#print-container").print();
                },
                export: function () {
                    var export_data = data_center.get_key('grow_export_data');
                    export_data = JSON.parse(export_data);
                    var user_level = cloud.user_level();
                    var user = cloud.user_user();
                    if (user_level == 7) {
                        export_data = {};
                        export_data.class_id = user.fk_class_id;
                        export_data.grade_id = user.fk_grade_id;
                        export_data.school_id = user.fk_school_id;
                        export_data.guid = user.guid;
                        export_data.tar_year = Number(user.grade_name.substr(1, 4));
                        export_data.token = sessionStorage.getItem('token');
                    }
                    if (!this.show_img) {
                        export_data.position = 0;
                    }
                    if (this.show_img && this.img_position == 1) {
                        export_data.position = 1;
                    }
                    if (this.show_img && this.img_position == 2) {
                        export_data.position = 2;
                    }
                    // export_data.position =
                    var url = export_api + '?';
                    for (var key in export_data) {
                        url += key + '=' + export_data[key] + "&";
                    }
                    if (url.charAt(url.length - 1) == '&') {
                        url = url.substr(0, url.length - 1);
                    }

                    window.open(url);
                },
                //学业成绩，体质健康
                score_show: function (score_item, el) {
                    try {
                        if (!score_item.data.hasOwnProperty("score"))
                            return "";
                        if (!score_item.data.score || !score_item.data.score.hasOwnProperty(el.alias) || score_item.data.score[el.alias] == undefined)
                            return ""
                        if (score_item.data.score[el.alias].score != undefined)
                            return score_item.data.score[el.alias].value_percent;
                        if (score_item.data.score[el.alias].level != undefined)
                            return score_item.data.score[el.alias].level;
                        return "";
                    }
                    catch (exp) {
                        console.trace(exp);
                        return "";
                    }
                },
                get_study_health: function () {
                    var self = this;
                    // //学业成绩-老
                    // cloud.get_studies_score_list_v2({
                    //     fk_school_id: self.fk_school_id,
                    //     guid: this.extend.tar_ownerid,
                    // }, function (url, args, data) {
                    //     // 计算开始偏移
                    //     vm.course_list = data.course_list;
                    //     var score_data = data.score_list;
                    //
                    //     // 学期成绩对比，且计算下标
                    //     var mapping = merge_table(vm.semester_list.$model, ["id"], data.score_list, ["semester_id"], "score");
                    //     mapping.forEach(function (data) {
                    //         if (data.score.hasOwnProperty("grade_no") && data.score.grade_no != undefined)
                    //             data.index = data.score.grade_no * 10 + Number(data.score.phase);
                    //         else
                    //             data.index = remart_2_no(data.remark) * 10 + Number(data.semester_index) - 1;
                    //     })
                    //
                    //     var score_list = [{index: 70}, {index: 71}, {index: 80}, {index: 81}, {index: 90}, {index: 91}]
                    //     score_list = merge_table(score_list, ["index"], mapping, ["index"], "data");
                    //     vm.score_data = score_list;
                    // });
                    //学业成绩-新
                    cloud.get_art_quality_list({
                        code:this.art_extend.code,
                        current_process: "已归档",
                        due_in: {},
                        subject_id: "1000",
                    }, function (url, args, data) {
                        // 计算开始偏移
                        // vm.course_list = data.columns;
                        // var score_data = data.list[1];

                        // // 学期成绩对比，且计算下标
                        // var mapping = merge_table(vm.semester_list.$model, ["id"], data.score_list, ["semester_id"], "score");
                        // mapping.forEach(function (data) {
                        //     if (data.score.hasOwnProperty("grade_no") && data.score.grade_no != undefined)
                        //         data.index = data.score.grade_no * 10 + Number(data.score.phase);
                        //     else
                        //         data.index = remart_2_no(data.remark) * 10 + Number(data.semester_index) - 1;
                        // })
                        //
                        // var score_list = [{index: 70}, {index: 71}, {index: 80}, {index: 81}, {index: 90}, {index: 91}]
                        // score_list = merge_table(score_list, ["index"], mapping, ["index"], "data");
                        // vm.score_data = score_list;


                        if (typeof (data) == "string") {
                            toastr.warning(data)
                        } else {
                            //科目分数
                            var columns = data.columns;
                            //成绩
                            var list = data.list;
                            //重组数据
                            for (var i = 0; i < columns.length; i++) {
                                var alias = columns[i].alias;
                                //score_type：nor-分数，ABCD-等级，pass-合格
                                var score_type = columns[i].score_type;
                                //年级集合
                                var grades = [];
                                for (var j = 0; j < 6; j++) {
                                    // var obj = {'level': '', 'score': '', 'grade_no': ''};
                                    // if (list[j].hasOwnProperty(alias) == true) {
                                    //     obj.level = list[j][alias].level;
                                    //     obj.score = list[j][alias].score;
                                    //     obj.grade_no = list[j].grade_no;
                                    // }
                                    var obj = {};
                                    if (list[j].hasOwnProperty(alias) == true) {
                                        obj = list[j][alias];
                                    }
                                    grades.push(obj);
                                }
                                //合并对象
                                var obj = {};
                                obj.grades = grades;
                                columns[i] = Object.assign(columns[i], obj);
                            }
                            self.course_list = columns;
                            console.log(self.course_list);
                        }
                    });
                   //体质健康测试新
                    cloud.get_new_health_score_list({
                        current_process:'已归档',
                        guid:this.extend.tar_ownerid,
                    },function(url,args,data){
                        /**
                         * 1、单项指标（没有附加分的评价项）：single_index
                         * 2、加分指标（有附加分的评价项）：bonus_index
                         * 3、附加分（总附加分）:grade_addition
                         * 4、学年得分（总分）:grade_score
                         * 5、学业等级评定（总分等级）:grade_level
                         * */
                        var single_index = [
                            {
                                name:'体重',
                                grades:[
                                    {grade_no:7,value:'',score:'',level:'',},
                                    {grade_no:8,value:'',score:'',level:'',},
                                    {grade_no:9,value:'',score:'',level:'',},
                                    ]
                            },
                            {
                                name:'肺活量',
                                grades:[
                                    {grade_no:7,value:'',score:'',level:'',},
                                    {grade_no:8,value:'',score:'',level:'',},
                                    {grade_no:9,value:'',score:'',level:'',},
                                ]
                            },
                            {
                                name:'50米跑',
                                grades:[
                                    {grade_no:7,value:'',score:'',level:'',},
                                    {grade_no:8,value:'',score:'',level:'',},
                                    {grade_no:9,value:'',score:'',level:'',},
                                ]},
                            {
                                name:'立定跳远',
                                grades:[
                                    {grade_no:7,value:'',score:'',level:'',},
                                    {grade_no:8,value:'',score:'',level:'',},
                                    {grade_no:9,value:'',score:'',level:'',},
                                ]},
                            {
                                name:'坐位体前屈',
                                grades:[
                                    {grade_no:7,value:'',score:'',level:'',},
                                    {grade_no:8,value:'',score:'',level:'',},
                                    {grade_no:9,value:'',score:'',level:'',},
                                ]
                            },
                        ];
                        var bonus_index = [
                            {
                                name:'800米跑',
                                grades:[
                                    {grade_no:7,value:'',score:'',addition:'',level:'',},
                                    {grade_no:8,value:'',score:'',addition:'',level:'',},
                                    {grade_no:9,value:'',score:'',addition:'',level:'',},
                                ]},
                            {
                                name:'1000米跑',
                                grades:[
                                    {grade_no:7,value:'',score:'',addition:'',level:'',},
                                    {grade_no:8,value:'',score:'',addition:'',level:'',},
                                    {grade_no:9,value:'',score:'',addition:'',level:'',},
                                ]},
                            {
                                name:'一分钟仰卧起坐',
                                grades:[
                                    {grade_no:7,value:'',score:'',addition:'',level:'',},
                                    {grade_no:8,value:'',score:'',addition:'',level:'',},
                                    {grade_no:9,value:'',score:'',addition:'',level:'',},
                                ]},
                            {
                                name:'引体向上',
                                grades:[
                                    {grade_no:7,value:'',score:'',addition:'',level:'',},
                                    {grade_no:8,value:'',score:'',addition:'',level:'',},
                                    {grade_no:9,value:'',score:'',addition:'',level:'',},
                                ]},
                        ];
                        var grade_addition = [
                            {grade_no:7,addition:'',},
                            {grade_no:8,addition:'',},
                            {grade_no:9,addition:'',},
                        ];
                        var grade_score = [
                            {grade_no:7,total:'',},
                            {grade_no:8,total:'',},
                            {grade_no:9,total:'',},
                        ];
                        var grade_level = [
                            {grade_no:7,level:'',},
                            {grade_no:8,level:'',},
                            {grade_no:9,level:'',},
                        ];
                        var list = data;
                        list = sort_by(list,['+grade_no']);
                        for(var i=0;i<list.length;i++){
                            var grade_no = list[i].grade_no;
                            var idx = -1;
                            if(grade_no == 7){
                                idx = 0;
                            }else if(grade_no == 8){
                                idx = 1;
                            }else if(grade_no == 9){
                                idx = 2;
                            }
                            //体重
                            single_index[0].grades[idx].value = list[i].weight;
                            single_index[0].grades[idx].score = list[i].weight_score;
                            single_index[0].grades[idx].level = list[i].weight_lv;
                            //肺活量
                            single_index[1].grades[idx].value = list[i].vital_capacity;
                            single_index[1].grades[idx].score = list[i].vital_capacity_score;
                            single_index[1].grades[idx].level = list[i].vital_capacity_lv;
                            //50米跑
                            single_index[2].grades[idx].value = list[i].run_50;
                            single_index[2].grades[idx].score = list[i].run_50_score;
                            single_index[2].grades[idx].level = list[i].run_50_lv;
                            //立定跳远
                            single_index[3].grades[idx].value = list[i].ldty;
                            single_index[3].grades[idx].score = list[i].ldty_score;
                            single_index[3].grades[idx].level = list[i].ldty_lv;
                            //坐位体前屈
                            single_index[4].grades[idx].value = list[i].zqqq;
                            single_index[4].grades[idx].score = list[i].zqqq_score;
                            single_index[4].grades[idx].level = list[i].zqqq_lv;
                            //800米跑
                            bonus_index[0].grades[idx].value = list[i].run_800;
                            bonus_index[0].grades[idx].score = list[i].run_800_score;
                            bonus_index[0].grades[idx].level = list[i].run_800_lv;
                            bonus_index[0].grades[idx].addition = list[i].run_800_extra;
                            //1000米跑
                            bonus_index[1].grades[idx].value = list[i].run_1000;
                            bonus_index[1].grades[idx].score = list[i].run_1000_score;
                            bonus_index[1].grades[idx].level = list[i].run_1000_lv;
                            bonus_index[1].grades[idx].addition = list[i].run_1000_extra;
                            //一分钟仰卧起坐
                            bonus_index[2].grades[idx].value = list[i].ywqz;
                            bonus_index[2].grades[idx].score = list[i].ywqz_scor;
                            bonus_index[2].grades[idx].level = list[i].ywqz_lv;
                            bonus_index[2].grades[idx].addition = list[i].ywqz_extra;
                            //引体向上
                            bonus_index[3].grades[idx].value = list[i].ytxs;
                            bonus_index[3].grades[idx].score = list[i].ytxs_score;
                            bonus_index[3].grades[idx].level = list[i].ytxs_lv;
                            bonus_index[3].grades[idx].addition = list[i].ytxs_extra;
                            //总附加分
                            grade_addition[idx].addition = list[i].extra_score;
                            //学年得分
                            grade_score[idx].total = list[i].total_score;
                            //学年等级评定
                            grade_level[idx].level = list[i].total_score_lv;
                        }
                        self.single_index = single_index;
                        self.bonus_index = bonus_index;
                        self.grade_addition = grade_addition;
                        self.grade_score = grade_score;
                        self.grade_level = grade_level;
                    });
                },
                //艺术素养测试
                get_art_quality: function () {
                    var self = this;
                    cloud.get_art_quality_list(this.art_extend.$model, function (url, args, data) {
                        if (typeof (data) == "string") {
                            toastr.warning(data)
                        } else {
                            //科目分数
                            var columns = data.columns;
                            //成绩
                            var list = data.list;
                            //重组数据
                            for (var i = 0; i < columns.length; i++) {
                                var alias = columns[i].alias;
                                //年级集合
                                var grades = [];
                                for (var j = 0; j < 6;) {
                                    var obj = {'level': '', 'score': '', 'grade_no': ''};
                                    var listOne = list[j];
                                    var listTwo = list[j+1];
                                    if(listTwo.hasOwnProperty(alias) == true){
                                        obj.level = listTwo[alias].level;
                                        obj.score = listTwo[alias].score;
                                        obj.grade_no = listTwo.grade_no;
                                    }else if (listOne.hasOwnProperty(alias) == true) {
                                        obj.level = listOne[alias].level;
                                        obj.score = listOne[alias].score;
                                        obj.grade_no = listOne.grade_no;
                                    }
                                    grades.push(obj);
                                    j = j + 2;
                                }
                                //合并对象
                                var obj = {};
                                obj.grades = grades;
                                columns[i] = Object.assign(columns[i], obj);
                            }
                            self.art_quality_data = columns;
                        }
                    })
                },
                //获取毕业评价
                get_gradation: function () {
                    var obj = {};
                    obj.grade_id = this.gradation_extend.grade_id;
                    obj.class_id = this.gradation_extend.class_id;
                    var self = this;
                    cloud.get_bybg_eval_thead(obj, function (url, args, data) {
                        if (!data)
                            return;
                        self.tbodyThead = data.zb_name.split(',');
                        cloud.get_bybg_eval_list(self.gradation_extend, function (url, args, data) {
                            if (!data)
                                return;
                            var list = data.list;
                            var list_length = list.length;
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
                                    if (list[i].index_value[list[i].index_value.length - 1] == ",")
                                        index_value.pop();
                                }
                                list[i].values = index_value;
                            }
                            self.gradation_value = list;
                        })
                    })

                },
                //获取学生个人图片名称
                stu_inner_name:'',
                //获取学生个人信息
                get_stu_info: function (guid) {
                    //guid通过上一个页面传过来
                    var self = this;
                    cloud.get_stu_info({guid: guid}, function (url, args, data) {
                        for (var key in data) {
                            if (data[key] == null) {
                                data[key] = '';
                            }
                        }
                        vm.sex = Number(data.sex);
                        data.grade_name = '';
                        data.school_name = '';
                        self.stu = data;
                        cloud.get_stu_user_info({guid: guid}, function (url, args, data) {
                            if(data.photo != "" && data.photo != null){
                                self.stu_inner_name = JSON.parse(data.photo).inner_name;
                            }
                            self.stu.grade_name = data.grade_name;
                            var photo = data;
                            self.photo_guid = photo.guid;
                            self.stu.school_name = data.school_name;
                            self.extend.tar_year = Number(data.grade_name.substr(1, 4));
                            self.extend.tar_ownerid = data.guid;
                            self.extend.gradeID = data.fk_grade_id;
                            self.fk_school_id = data.fk_school_id;
                            self.art_extend.code = data.code;
                            self.gradation_extend.class_id = data.fk_class_id;
                            self.gradation_extend.grade_id = data.fk_grade_id;
                            self.gradation_extend.stu_num = data.code;
                            self.get_target(data.fk_grade_id);
                            self.get_daily();
                            self.get_study_health();
                            self.get_art_quality();
                            self.get_gradation();
                        })
                    });
                },
                listen_scroll: function () {
                    var self = this;
                    $(window).scroll(function () {
                        var scoll_top = $(window).scrollTop();
                        var $a = $('.file-munu a');
                        $($a).each(function () {
                            var click_href = $(this).attr('name');
                            var top1 = $(click_href).position().top;
                            var top2 = $("#cover").position().top;
                            var top = top1 - top2;
                            if (scoll_top > top) {
                                self.current_tg = click_href;
                            }
                        });
                    })
                },
                //初始化页面高度
                init_height: function () {
                    var winHeight = 0;
                    if (window.innerHeight)
                        winHeight = window.innerHeight;
                    else if ((document.body) && (document.body.clientHeight))
                        winHeight = document.body.clientHeight;
                    if (document.documentElement && document.documentElement.clientHeight)
                        winHeight = document.documentElement.clientHeight;
                    this.winHeight = winHeight;
                    var self = this;
                    $('.file-munu a').click(function () {
                        $(window).off("scroll");
                        var click_href = $(this).attr('name');
                        var top1 = $(click_href).position().top;
                        var top2 = $("#cover").position().top;
                        var top = top1 - top2;
                        self.current_tg = click_href;
                        $('html,body').animate({
                            scrollTop: top + 'px'
                        }, 1000);
                        setTimeout(self.listen_scroll, 1500)
                    });
                    this.listen_scroll()

                },
                
            });
            vm.$watch('onReady', function () {
                vm.init();
                var height = $(window).height();
                $('.file-munu').height(height * 0.8);
                $(window).resize(function () {
                    var height = $(window).height();
                    $('.file-munu').height(height * 0.8);
                })
            });

            return vm;
        };
        return {
            view: html,
            define: avalon_define,
            repaint:true,
        }
    });
