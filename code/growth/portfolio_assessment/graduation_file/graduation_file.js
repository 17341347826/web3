/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('growth', 'portfolio_assessment/graduation_file/graduation_file', 'html!'),
        C.Co('growth', 'portfolio_assessment/graduation_file/graduation_file', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        "jquery_print",C.CLF('base64.js'),
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, three_menu_module, jquery_print,bs64) {
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
        var suffix_video = ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'];
        var suffix_img = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
        var token = sessionStorage.getItem("token");
        var url_file = api.api + "file/get";
        var avalon_define = function (par) {
            var export_api = api.api + "Indexmaintain/export_graduation_pdfzip";
            var vm = avalon.define({
                $id: "graduation_file",
                url_file:api.api + "file/get",//获取文件,
                grade_list: [], //年级
                area_list: [],//区县
                current_tg: '#cover',
                winHeight: 0,
                stu: {},//学生个人信息
                photo_guid: '',//头像guid
                semester_list: [],//学年学期
                local_ary: [],
                thead: [],//表头数据
                graduation_score: [],//毕业综合素质评价
                special_list: [], //个性特长表现
                award_list: [],//获奖情况
                practical_list: [],//实践活动
                practical_detail: [],
                remark_list: [],//评语

                //判断当前登陆者能否获取承诺书处签名：最初--1，学生-1，评价小组-2，领导-3
                promise_sign:-1,
                //签名者身份判断
                sign_type:'',
                //查询签名数据--报告册接口
                query_sign_data:'',
                owner_sign: {
                    'img': '',//签名返回
                    'sign_code': '',//签名返回
                    'sign_year': '',//签名年
                    'sign_month': '',//签名月
                    'sign_day': '' //签名日
                },//签名返回
                group_sign: {
                    'img': '',//签名返回
                    'sign_code': '',//签名返回
                    'sign_year': '',//签名年
                    'sign_month': '',//签名月
                    'sign_day': '' //签名日
                },
                leader_sign: {
                    'img': '',//签名返回
                    'sign_code': '',//签名返回
                    'sign_year': '',//签名年
                    'sign_month': '',//签名月
                    'sign_day': '' //签名日
                },
                extend: {//综合素质评价请求参数
                    fk_grade_id: '',//年级id	number:类型为学期评价必填
                    // fk_semester_id:'',//学年学期id	number:不需要传(最对的）
                    workid: '',//单位id	number:类型为学期评价必填
                    guid: '',//被查询人guid必填)	number
                    // stu_num:'',
                    //模块类型(必填)	number:1:作品 2:品德 3:获奖情况 4:实践活动 5:艺术活动 6:研究型学习 7:身心健康 8:日常表现和特长表现 9:成长记录 10:学期评价
                    listType: 10,
                    offset: 0,
                    rows: 9999,
                },
                query_sign: {//查询签字请求参数
                    class_id: '',	//number
                    grade_id: '',	//年级id	number	必填
                    school_id: '',	//number
                    stu_id: '',	    //学生id	//number	必填
                    stu_name: '',	//string
                    stu_num: '',	    //学生学号	string	必填
                },
                //添加、修改签字
                add_sign:{
                    class_id:'',	        //班级id	number
                    class_sign_code:'',	    //班级签字code	string
                    class_sign_img:'',	    //班级签字img	string
                    class_sign_time:'',     //班级签字时间   date
                    grade_id:'',	        //年级id	number
                    school_id:'',	        //学校id	number
                    school_sign_code:'',	//学校签字code	string
                    school_sign_img:'',	    //学校签字img	string
                    school_sign_time:'',    //学校签字时间   date
                    stu_id:'',	            //学生id	number
                    stu_name:'',	        //学生姓名	string
                    stu_num:'',	            //学生学号	string
                    stu_sign_code:'',	    //学生签字code	string
                    stu_sign_img:'',	    //学生签字img	string
                    stu_sign_time:'',       //学生签字时间  date
                },
                //教师级别身份:1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                ident_high_level:'',
                //身份判断:0-管理员；1-教师；2-学生，3-家长
                ident_type:'',
                //登陆者基本信息
                ident_user:{},
                init: function () {
                    var page_style = window.localStorage.getItem('page_style_graduation');
                    page_style = JSON.parse(page_style);
                    var user = cloud.user_user();
                    this.ident_high_level = cloud.user_level();
                    this.ident_type = cloud.user_type();
                    this.ident_user = user;
                    if (page_style && (page_style.user == user.guid)) {
                        this.img_position = page_style.img_position;
                        this.show_img = page_style.show_img;
                    }

                    //解密传参
                    var portfolio_stu = par.portfolio_stu;
                    if(this.ident_type != 2 && this.ident_type != 3){//用户身份不是学生和家长
                        var stu_info = bs64.decoder(par.portfolio_stu);

                        var cp_pms = stu_info;
                        for (var i = stu_info.length - 1; i >= 0; i--) {
                            if (stu_info[i] == 0) {
                                cp_pms.splice(i, 1);
                            } else {
                                break;
                            }
                        }
                        stu_info = String.fromCharCode.apply(String, cp_pms);
                    }else{
                        stu_info = portfolio_stu;
                    }

                    if (!stu_info) {
                        guid = cloud.user_guid().toString();
                        if(cloud.user_type()==3){
                            guid = user.student.guid;
                        }
                    } else {
                        guid = stu_info.split("|")[0];

                    }
                    ready_photo([{"guid": guid}], "guid");
                    //获取学生基本信息
                    this.get_stu_info(guid);
                },
                cds: function () {
                    this.init_height();
                },
                //打印
                print: function () {
                    $("#print-container").print();
                },
                export: function () {
                    var export_data = sessionStorage.getItem('g_export_data');
                    export_data = JSON.parse(export_data);
                    var user_level = cloud.user_level();
                    if (user_level == 7) {
                        export_data = {};
                        var user = cloud.user_user();
                        export_data.school_id = user.fk_school_id;
                        export_data.grade_id = user.fk_grade_id;
                        export_data.class_id = user.fk_class_id;
                        export_data.district_id = '';
                        export_data.token = sessionStorage.getItem('token');
                        export_data.guid = user.guid;
                    }

                    //0为没有图片，1为图片在中间，2为图片在最后
                    if (this.show_img == false) {
                        export_data.position = 0;
                    } else if (this.show_img == true && this.img_position == 1) {
                        export_data.position = 1;
                    } else if (this.show_img == true && this.img_position == 2) {
                        export_data.position = 2;
                    }
                    var url = export_api + "?" + "school_id=" + export_data.school_id +
                        "&grade_id=" + export_data.grade_id +
                        "&class_id=" + export_data.class_id +
                        "&district_id=" +
                        "&token=" + export_data.token +
                        "&guid=" + export_data.guid +
                        '&position=' + export_data.position;
                    window.open(url);
                },
                user_photo: cloud.user_photo,//获取学生头像
                url_img: url_img,
                //页面中是否显示图片（layer中操作用）
                is_show_img: true,
                //页面是否显示图片(全局用)
                show_img: true,
                //图片显示位置(layer中操作用)
                //1代表显示在详情中，2代表图片显示在末尾
                img_position_index: 1,
                //图片位置（全局用）
                img_position: 1,
                //数据类型转换
                data_change:function(a){
                    return JSON.parse(a);
                },
                url_for: function(id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                //自定义设置
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
                            };
                            window.localStorage.setItem('page_style_graduation', JSON.stringify(page_style));
                            layer.closeAll();
                        }
                        , btn2: function (index, layero) {
                            vm.img_position_index = 1;
                            vm.is_show_img = false;
                        }
                    });
                },
                //获取成长记录列表(综合素质评价、获奖情况、综合实践活动)
                get_growth_all_list: function () {
                    var self = this;
                    this.semester_list = cloud.grade_semester_mapping_list({grade_id: this.extend.fk_grade_id});
                    //综合素质评价
                    this.extend.listType = 10;
                    cloud.get_growth_all_list(this.extend.$model, function (url, args, data) {
                        var semester = self.semester_list;
                        var term = data;
                        //表头
                        var thead = self.thead;
                        for (var i = 0; i < term.length; i++) {
                            var list = term[i].evaluate_grade_list;
                            let obj = {};
                            if (thead.length == 0) {//初次相遇
                                for (let j = 0; j < list.length; j++) {
                                    obj.name = list[j].signname1;
                                    thead.push(obj);
                                }
                            } else if (thead.length != 0) {//二次及以后相遇
                                for (let j = 0; j < list.length; j++) {
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
                        // console.log(this.thead);
                        //学年学期和分数组合
                        for (let i = 0; i < semester.length; i++) {
                            for (let j = 0; j < term.length; j++) {
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
                        // console.log(semester);
                        //最终数据柔和
                        for (let i = 0; i < semester.length; i++) {
                            var grade_list = semester[i].evaluate_grade_list;
                            for (let j = 0; j < thead.length; j++) {
                                var name = thead[j].name;
                                if (grade_list.length == 0) {
                                    let obj = {};
                                    obj.signname1 = thead[j].name;
                                    obj.score = '';
                                    obj.evaluate_score = '';
                                    grade_list.push(obj);
                                } else if (grade_list.length != 0) {
                                    var owner = false;
                                    for (let k = 0; k < grade_list.length; k++) {
                                        if (grade_list[k].signname1 == name) {
                                            owner = true;
                                            break;
                                        }
                                    }
                                    if (owner == false) {
                                        let obj = {};
                                        obj.signname1 = thead[j].name;
                                        obj.score = '';
                                        obj.evaluate_score = '';
                                        grade_list.push(obj);
                                    }
                                }
                            }
                        }
                        self.local_ary = semester;

                        var param = {
                            class_id: self.extend.fk_class_id,
                            grade_id: self.extend.fk_grade_id,
                            stu_num: self.query_sign.stu_num
                        };
                        // console.log(param)
                        cloud.get_bybg_count_result_list(param, function (url, args, data) {
                            // console.log(args)
                            if (!data || data == [] || data.list.length == 0) return;
                            var list = data.list[0];
                            var values = list.index_value.slice(0, -1) + ',' + list.score_plus + ',' + list.zf + ',' + list.rank;
                            self.graduation_score = values.split(',');
                            // console.log(";;;;;;;;;;;;;;;;;;----------------")
                            // console.log(data)
                            // console.log(self.graduation_score)
                        });

                    });

                    //获取综合实践活动
                    this.extend.listType = 4;
                    cloud.get_growth_all_list(this.extend.$model, function (url, args, data) {
                        self.practical_list = data.detail_list.list;

                        //附件处理
                        var dataList = data.detail_list.list;
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
                        self.practical_detail = dataList;
                        // $('.am-slider').flexslider();
                    });

                    //获奖情况
                    this.extend.listType = 3;
                    cloud.get_growth_all_list(this.extend.$model, function (url, args, data) {
                        var dataList = data.list;
                        var dataListLength = dataList.length;
                        for(var i=0;i<dataListLength;i++){
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


                        self.award_list = dataList;
                        // console.dir(self.award_list);
                    });
                },
                //个性特长
                get_gxtc_rec_list: function (stu_num) {
                    var self = this;
                    cloud.get_gxtc_rec_list({stu_num: stu_num}, function (url, args, data) {
                        if (!data || !data.list)
                            return;
                        var list = data.list;
                        var list_length = list.length;
                        for(var i=0;i<list_length;i++){
                            if (!list[i].attachment || list[i].attachment == null)
                                continue;
                            var fjdz = JSON.parse(list[i].attachment);
                            list[i].img_arr = [];
                            list[i].video_arr = [];
                            list[i].file_arr = [];
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
                                    list[i].video_arr.push(fjdz[j]);
                                    continue;
                                }
                                if (suffix_img.indexOf(suffix) != -1) {
                                    list[i].img_arr.push(fjdz[j]);
                                    continue;
                                }
                                list[i].file_arr.push(fjdz[j]);
                            }
                        }
                        self.special_list = list;
                    })
                },
                //获取学生个人信息
                get_stu_info: function (guid) {
                    this.photo_guid = guid.toString();
                    var self = this;
                    cloud.get_stu_info({guid: guid}, function (url, args, data) {
                        for (var key in data) {
                            if (data[key] == null) {
                                data[key] = '';
                            }
                        }
                        data.grade_name = '';
                        data.school_name = '';
                        self.stu = data;
                        //获取学生图片
                        cloud.get_stu_user_info({guid: guid}, function (url, args, data) {
                            self.stu.grade_name = data.grade_name;
                            self.stu.school_name = data.school_name;
                            // console.log(data)
                            var photo = data;
                            // console.log(photo)
                            self.photo_guid = photo.guid;
                            self.extend.guid = data.guid;
                            self.extend.workid = data.fk_school_id;
                            self.extend.fk_grade_id = data.fk_grade_id;
                            //添加、修改签字
                            self.add_sign.class_id    = data.fk_class_id;
                            self.add_sign.grade_id    = data.fk_grade_id;
                            self.add_sign.school_id   = data.fk_school_id;
                            self.add_sign.stu_id      = data.guid;
                            self.add_sign.stu_num     = data.code;
                            //查询签字
                            self.query_sign.class_id = data.fk_class_id;
                            self.query_sign.grade_id = data.fk_grade_id;
                            self.query_sign.school_id = data.fk_school_id;
                            self.query_sign.stu_id = data.guid;
                            self.query_sign.stu_num = data.code;
                            //处理签字判断当前登陆者能否进行签字开始
                            //获取登陆者guid
                            var guid = self.ident_user.guid;
                            if(guid == self.query_sign.stu_id){//学生本人登录，学生本人签名
                                self.promise_sign=1;
                            }else if(self.ident_high_level == 6 && self.ident_type == 1 && self.ident_user.lead_class_list.length>0){//班级评价小组签名（班主任）
                                var teach_class_id = self.ident_user.lead_class_list[0].class_list[0].class_id;
                                if(self.query_sign.class_id == teach_class_id){
                                    self.promise_sign=2;
                                }
                            }else if(self.ident_high_level == 4 && self.ident_type == 1){//学校评价工作领导小组签名（校领导）
                                if( self.query_sign.school_id == self.ident_user.fk_school_id){
                                    self.promise_sign=3;
                                }
                            }
                            //处理签字判断当前登陆者能否进行签字结束
                            self.get_gxtc_rec_list(data.code);
                            // self.get_growth_all_list();
                            self.get_remark_list();
                            //查询签字
                            self.get_sign_info();
                            //表头
                            cloud.get_bybg_eval_thead({grade_id: self.extend.fk_grade_id}, function (url, args, data) {
                                if (!data)
                                    return;
                                var th = data.zb_name.split(',');
                                var head = [];
                                for (var i = 0; i < th.length; i++) {
                                    var obj = {};
                                    obj.name = th[i];
                                    head.push(obj);
                                }
                                vm.thead = head;
                                //综合素质评价
                                vm.get_growth_all_list();
                            });
                        })
                    });
                },
                //学生评语
                get_remark_list: function () {
                    var self = this;
                    cloud.get_remark_list({
                        stu_id: Number(self.photo_guid),
                        stu_num: self.query_sign.stu_num
                    }, function (url, args, data) {
                        self.remark_list = data.list[0];
                    });
                },
                //查询签字--报告册
                get_sign_info: function () {
                    var self = this;
                    cloud.get_sign_info(this.query_sign.$model, function (url, args, data) {
                        if (!data) {
                            return;
                        }
                        self.query_sign_data=data;
                        //本人
                        var owner = self.owner_sign;
                        owner.sign_code = data.stu_sign_code;
                        if (owner.sign_code != '' || data.stu_sign_img != '') {
                            owner.img = data.stu_sign_img;
                        }
                        if (data.stu_sign_time != null) {
                            owner.sign_year = self.timestamp_conver(data.stu_sign_time).split('-')[0];
                            owner.sign_month = self.timestamp_conver(data.stu_sign_time).split('-')[1];
                            owner.sign_day = self.timestamp_conver(data.stu_sign_time).split('-')[2];
                        }

                        //班级评价小组
                        var group = self.group_sign;
                        group.sign_code = data.class_sign_code;
                        if (group.sign_code != '' || data.class_sign_img != '') {
                            group.img = data.class_sign_img;
                        }
                        if (data.class_sign_time != null) {
                            group.sign_year = self.timestamp_conver(data.class_sign_time).split('-')[0];
                            group.sign_month = self.timestamp_conver(data.class_sign_time).split('-')[1];
                            group.sign_day = self.timestamp_conver(data.class_sign_time).split('-')[2];
                        }

                        //领导
                        var leader = self.leader_sign;
                        leader.sign_code = data.school_sign_code;
                        if (leader.sign_code != '' || data.school_sign_img != '') {
                            leader.img = data.school_sign_img;
                        }
                        if (data.school_sign_time != null) {
                            leader.sign_year = self.timestamp_conver(data.school_sign_time).split('-')[0];
                            leader.sign_month = self.timestamp_conver(data.school_sign_time).split('-')[1];
                            leader.sign_day = self.timestamp_conver(data.school_sign_time).split('-')[2];
                        }

                        self.owner_sign = owner;
                        self.group_sign = group;
                        self.leader_sign = leader;
                    })
                },
                //学生签名
                user_sign:function(e){//1-本人；2-评价小组；3-领导小组
                    var self=this;
                    self.sign_type=e;
                    if(e!=1 && self.owner_sign.img==''){
                        layer.alert('请先学生本人签名后在来签名', {
                            title:'签名'
                            ,closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                        return;
                    }else if(e==3 && self.group_sign.img==''){
                        layer.alert('请先班级评价小组签名后在来签名', {
                            title:'签名'
                            ,closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                        return;
                    }
                    layer.confirm('是否开始签名？', {
                        title:'签名'
                        ,btn: ['确定','取消'] //按钮
                    }, function(){
                        // ajax_post(api_check_sign,{class_id:'',is_adopt_audit:'1'},self);
                        //获取签名图片（签名结果），来源于承诺书签字图片
                        cloud.get_sign_img_info({class_id:'',is_adopt_audit:'1'}, function (url, args, data) {
                            if(!data || data == {} || data == null)
                                return;
                            //学生签字
                            if(self.sign_type==1){
                                self.add_sign.stu_sign_img   = data.sign_img;
                                self.add_sign.stu_sign_code  = data.sign_code;
                            }
                            //班级评价小组签字
                            if(self.sign_type==2){
                                self.add_sign.class_sign_img   = data.sign_img;
                                self.add_sign.class_sign_code  = data.sign_code;
                            }
                            //学校领导签字
                            if(self.sign_type==3){
                                self.add_sign.school_sign_img   = data.sign_img;
                                self.add_sign.school_sign_code  = data.sign_code;
                            }
                            //获取当前时间
                            // ajax_post(api_current_time,{},this);
                            var current_time = cloud.get_current_time();
                            var cur_time=self.timestamp_conver(current_time.current_time);
                            if(self.sign_type==1){//本人
                                //转换成Date
                                // this.add_sign.stu_sign_time     = new Date(cur_time.replace(/-/,"/"));
                                self.add_sign.stu_sign_time     = cur_time;
                            }else if(self.sign_type==2){//班级评价小组
                                self.add_sign.class_sign_time	= cur_time;
                            }else if(self.sign_type==3){//学校领导
                                self.add_sign.school_sign_time	= cur_time;
                            }
                            //查询签名结果
                            var query_sign_date=self.query_sign_data;
                            if(query_sign_date == ''){
                                //毕业报告添加签字
                                cloud.bybg_add_sign(self.add_sign.$model, function (url, args, data) {
                                    //查询签字
                                    self.get_sign_info();
                                });
                            }else{
                                //毕业报告修改签字--只要签名里面有一个身份签了名，后面的人就调修改签字
                                cloud.bybg_update_sign(self.add_sign.$model, function (url, args, data) {
                                    //查询签字
                                    self.get_sign_info();
                                });
                            }
                        });
                        layer.closeAll();
                    }, function(){

                    });
                },
                //创建时间格式化显示
                crtTimeFtt: function (time) {
                    let date = new Date(time);
                    let year = date.getFullYear(),
                        month = date.getMonth() + 1,//月份是从0开始的
                        day = date.getDate();
                    let newTime = year + '-' +
                        month + '-' +
                        day;
                    return newTime;
                },
                //js把时间戳转为为普通日期格式
                timestamp_conver: function (h, type) {
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
                    let getTimeIs;
                    if (type = "date_and_time") {
                        getTimeIs = newDate.format('yyyy-MM-dd');
                    } else {
                        getTimeIs = newDate.format('yyyy-MM-dd');
                    }
                    return getTimeIs;
                },
                uninit: function () {
                    $(window).unbind('scroll');
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
                    $('#file-munu').height(winHeight);
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

                }

            });
            vm.$watch('onReady', function () {
                vm.cds();
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define,
            repaint:true,
        }
    });
