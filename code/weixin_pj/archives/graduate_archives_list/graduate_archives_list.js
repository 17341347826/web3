/**
 * Created by Administrator on 2018/9/11.
 */
define(['jquery',
        C.CLF('avalon.js'),
        C.Co('weixin_pj', 'archives/graduate_archives_list/graduate_archives_list', 'html!'),
        C.Co('weixin_pj', 'archives/graduate_archives_list/graduate_archives_list', 'css!'),
        C.CMF("data_center.js"),
        "echarts",
        "PCAS",'jquery-weui','swiper',C.CLF('base64.js'),
    ],
    function ($, avalon, html, css, data_center, echarts, PCAS,weui,swiper, bs64) {
        //获取市下区县
        var api_city_disc = api.user + 'school/arealist.action';
        //获取区县下全部学校年级集合-区县
        var api_disc_school = api.user + 'school/sub_school_grade_list';
        //获取指定学校的年级班级集合——校、区县
        var api_school_class = api.user + 'class/school_class.action';
        // 获取指定年级的班级集合
        var api_grade_class=api.user+'class/findClassSimple.action';
        //学生列表
        var api_stu_list = api.PCPlayer + "baseUser/studentlist.action";


        var export_api = api.api+"Indexmaintain/export_graduation_pdfzip";

        var avalon_define = function () {
            var vm = avalon.define({
                $id: "graduate_archives_list",
                //用户类型	string	0：管理员；1：教师；2：学生；3：家长
                user_type: '',
                //最高等级	string	user_type='1' 时才有值。
                // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师;11:年级+教师
                highest_level: '',
                //年级
                grade_list: [],
                grade_info:'',
                grade_name:'',
                //区县
                area_list: [],
                area_info:'',
                //学校
                school_list: [],
                school_name: '',
                school_info:'',
                //班级
                class_list: [],
                class_info:'',
                class_name:'',
                // 学生列表请求参数
                extend: {
                    code:"",
                    name:"",
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
                    offset: 0,
                    rows: 15,
                },
                //列表数据
                stu_data:[],
                //数据列表返回总数据
                all_count:'',
                init: function () {
                    this.cds();
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level = data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        if (highest_level == '2') {//市级
                            self.highest_level = 2;
                            self.extend.city = tUserData.city;
                            self.area_list = cloud.area_list();
                            self.stu_list_req();
                        } else if(highest_level=='3'){//区县
                            self.highest_level=3;
                            self.extend.city=tUserData.city;
                            self.extend.district = tUserData.district;
                            var name = tUserData.district;
                            self.school_list = cloud.school_list({"district":name});
                        }else if(highest_level=='4'){//校
                            self.highest_level=4;
                            self.extend.city=tUserData.city;
                            self.extend.district=tUserData.district;
                            self.extend.fk_school_id=tUserData.fk_school_id;
                            //年级
                            vm.grade_list = cloud.grade_list();
                        }
                        else if(userType=='1' && (highest_level=='5' || highest_level=='6')){//年级+教师
                            self.highest_level=11;
                            //年级综合
                            var t_grade=tUserData.teach_class_list;
                            var l_grade=tUserData.lead_class_list;
                            for(var i=0;i<l_grade.length;i++){
                                var has=false;
                                var id=l_grade[i].grade_id;
                                for(var j=0;j<t_grade.length;j++){
                                    if(t_grade[j].grade_id==id){
                                        has=true;
                                        break;
                                    }
                                }
                                if(has==false){
                                    t_grade.push(l_grade[i]);
                                }
                            }
                            self.grade_list=t_grade;
                            //班级综合
                            //教
                            var t_class=tUserData.teach_class_list[0].class_list;
                            //班主任
                            var l_class=tUserData.lead_class_list[0].class_list;
                            for(var i=0;i<l_class.length;i++){
                                var has=false;
                                var id=l_class[i].class_id;
                                for(var j=0;j<t_class.length;j++){
                                    if(t_class[j].class_id==id){
                                        has=true;
                                        break;
                                    }
                                }
                                if(has==false){
                                    t_class.push(l_class[i]);
                                }
                            }
                            self.class_list=t_class;
                            self.extend.city=tUserData.city;
                            self.extend.district=tUserData.district;
                            self.extend.fk_school_id=tUserData.fk_school_id;
                            self.grade_name = self.grade_list[0].grade_name;
                            self.extend.fk_grade_id = self.grade_list[0].grade_id;
                            self.class_name = self.class_list[0].class_name;
                            self.extend.fk_class_id = self.class_list[0].class_id;
                            self.stu_list_req();
                        }
                    });
                },
                //学生列表请求
                stu_list_req:function(){
                    ajax_post(api_stu_list,this.extend.$model,this);
                },
                //区县改变
                areaChange: function () {
                    this.school_list = [];
                    this.school_name = '';
                    this.school_info = '';
                    this.extend.fk_school_id = '';
                    this.grade_list=[];
                    this.grade_info = '';
                    this.extend.fk_grade_id = "";
                    this.class_info = '';
                    this.extend.fk_class_id = '';
                    this.class_list = [];
                    this.extend.name = '';
                    this.extend.code = '';
                    var data = this.area_list;
                    var name = this.extend.district;
                    for (var i = 0; i < data.length; i++) {
                        if (name == data[i].district) {
                            var id = data[i].id;
                        }
                    }
                    if(name != ''){
                        this.school_list = cloud.school_list({"district":name});
                    }
                   this.stu_list_req();
                },
                //学校筛选
                schoolChange:function(){
                    this.grade_info = '';
                    this.extend.fk_grade_id = "";
                    this.class_info = '';
                    this.extend.fk_class_id = "";
                    this.class_info = '';
                    this.grade_list = [];
                    this.class_list=[];
                    this.extend.name = '';
                    this.extend.code = '';
                    if(this.extend.fk_school_id != ''){
                        //请求年级
                        this.grade_list = cloud.grade_list({"school_id":Number(this.extend.fk_school_id)});
                    }
                    this.stu_list_req();
                },
                //年级改变
                gradeChange: function () {
                    this.class_list = [];
                    this.class_info = '';
                    this.extend.fk_class_id = '';
                    this.extend.name = '';
                    this.extend.code = '';
                    var gId = this.extend.fk_grade_id;
                    var grade = this.grade_list;
                    if (gId != "" && this.highest_level != 11){
                        this.class_list = cloud.class_all_list({fk_school_id:this.extend.fk_school_id,fk_grade_id: gId});
                    }
                    this.stu_list_req();
                },
                //班级改变
                classChange:function(){
                    this.extend.name = '';
                    this.extend.code = '';
                    this.stu_list_req();
                },
                //学籍号请求
                code_search:function(){
                    this.stu_list_req();
                },
                //姓名改变
                name_search:function(){
                    this.stu_list_req();
                },
                //详情
                graduate_detail:function(el){
                    var portfolio_stu = el.guid + '|' + el.grade_name + '|' + el.fk_grade_id + '|' + el.fk_school_id + '|' +
                        el.sex + '|' + el.province + '|' + el.city + '|' + el.district + '|' + el.fk_class_id + '|' + el.code;
                    var param = {
                        class_id: el.fk_class_id,
                        grade_id: el.fk_grade_id,
                        stu_num: el.account,
                        school_id:el.fk_school_id
                    };
                    cloud.get_bybg_count_result_list(param, function (url, args, data) {
                        if (data == null || data.list.length == 0) {
                            $.alert("该学生还未生成毕业评价数据!");
                        } else {
                            sessionStorage.setItem('portfolio_stu', portfolio_stu);
                            sessionStorage.setItem('g_export_data',JSON.stringify(self.export_extend));
                            var token = sessionStorage.getItem('token');
                            var bs_info = bs64.encoder(portfolio_stu);
                            var f_url = '/Growth/index.html#graduation_file?portfolio_stu='+bs_info;
                            var url = bs64.encoder(f_url);
                            var dz = window.location.origin + '/api/GrowthRecordBag/wx_growth_file_get_img?token='+token+'&url='+url;
                            // window.open(dz)
                            var ary = {};
                            ary.jk = window.location.origin + '/api/GrowthRecordBag/wx_growth_file_get_img';
                            ary.token = token;
                            ary.url = url;
                            sessionStorage.setItem('src',JSON.stringify(ary));
                            window.location = '#graduate_archives';
                        }
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
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
                        //        学生列表
                            case api_stu_list:
                                this.complete_stu_list(data);
                                break;
                        }
                    } else {
                        $.alert(msg);
                    }
                },
                //区县
                complete_city_disc: function (data) {
                    this.area_list = data.data.list;
                    // console.log(this.area_list)
                },
                //学校
                complete_disc_school: function (data) {
                    console.log(data)
                    this.grade_list = [];
                    var list = data.data.list;
                    var schoolId = [];
                    var schoolName = [];
                    var sub = {};
                    var temp_grade_list =[];
                    for (var i = 0; i < list.length; i++) {
                        schoolId[i] = list[i].school_id;
                        schoolName[i] = list[i].schoolname;
                        var obj = {
                            name : list[i].grade_name,
                            value : list[i].grade_id
                        }
                        temp_grade_list.push(obj)
                    }
                    this.grade_list = temp_grade_list;
                    // this.grade_info = this.grade_list [0].value;
                    this.extend.fk_grade_id = this.grade_list [0].value;
                    var school_id = $.unique(schoolId);
                    var school_name = $.unique(schoolName);
                    for (var i = 0; i < school_id.length; i++) {
                        sub.school_id = school_id[i];
                        sub.schoolname = school_name[i];
                        this.school_list.push(sub);
                    }
                    this.school_grade_list = data.data.list;
                    ajax_post(api_school_class, {school_id: id}, this)
                },
                //    年级、班级集合
                complete_school_class: function (data) {
                    this.grade_list = data.data;
                },
                uninit:function(){
                    window.onscroll = undefined
                },
                //    学生列表
                complete_stu_list:function(data){
                    this.stu_data = data.data.list;
                    this.all_count = data.data.count;
                },

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
                        vm.extend.rows = rows+15;
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