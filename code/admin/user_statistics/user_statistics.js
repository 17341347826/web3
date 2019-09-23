/**
 * Created by uptang on 2017/6/5.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("user","user_public/css/user","css!"),
        C.Co("admin", "user_statistics/user_statistics", "css!"),
        C.Co("admin", "user_statistics/user_statistics", "html!"),
        C.CM("table"),
        C.CMF("data_center.js"), "PCAS",C.CM('page_title')],
    function ($,avalon, css1,css2, html, table, data_center, PCAS,page_title) {
        //获取年级
        var api_get_grade=api.api+"base/grade/findGrades.action";
        //查询统计
        var api_get_user_statistic=api.api+"base/baseUser/get_user_statistic";
        //获取学校
        var api_get_school=api.api+"base/school/schoolList.action";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "table",
                // 列表数据接口
                url:'',
                table_num:2,
                type:5,
                city_value:'',
                district_name:"",
                // 列表请求参数
                data: {
                    offset: 0,
                    rows: 15
                },
                is_init: false,
                // 列表表头名称
                theadTh: [],
                //按市州查看
                city_check_list: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "年级",
                    type: "text",
                    from: "grade_name"
                }, {
                    title: "市州",
                    type: "text",
                    from: "city"
                }, {
                    title: "区县个数",
                    type: "text",
                    from: "district_count"
                }, {
                    title: "学校个数",
                    type: "text",
                    from: "school_count"
                }, {
                    title: "在籍教师",
                    type: "text",
                    from: "teacher_all"
                }, {
                    title: "停用教师",
                    type: "text",
                    from: "teacher_stop"
                }, {
                    title: "启用教师",
                    type: "text",
                    from: "teacher_used"
                },{
                    title: "在籍学生",
                    type: "text",
                    from: "student_all"
                },{
                    title: "停用学生",
                    type: "text",
                    from: "student_stop"
                },{
                    title: "启用学生",
                    type: "text",
                    from: "student_used"
                }],
                //按区县查看
                district_check_list: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                }, {
                    title: "年级",
                    type: "text",
                    from: "grade_name"
                }, {
                    title: "市州",
                    type: "text",
                    from: "city"
                }, {
                    title: "区县",
                    type: "text",
                    from: "district"
                }, {
                    title: "学校个数",
                    type: "text",
                    from: "school_count"
                }, {
                    title: "在籍教师",
                    type: "text",
                    from: "teacher_all"
                }, {
                    title: "停用教师",
                    type: "text",
                    from: "teacher_stop"
                }, {
                    title: "启用教师",
                    type: "text",
                    from: "teacher_used"
                }, {
                    title: "在籍学生",
                    type: "text",
                    from: "student_all"
                },{
                    title: "停用学生",
                    type: "text",
                    from: "student_stop"
                },{
                    title: "启用学生",
                    type: "text",
                    from: "student_used"
                }],
                //按学校查看
                school_check_list: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },  {
                    title: "年级",
                    type: "text",
                    from: "grade_name"
                }, {
                    title: "市州",
                    type: "text",
                    from: "city"
                }, {
                    title: "区县",
                    type: "text",
                    from: "district"
                }, {
                    title: "学校",
                    type: "text",
                    from: "school"
                }, {
                    title: "在籍教师",
                    type: "text",
                    from: "teacher_all"
                }, {
                    title: "停用教师",
                    type: "text",
                    from: "teacher_stop"
                }, {
                    title: "启用教师",
                    type: "text",
                    from: "teacher_used"
                },{
                    title: "在籍学生",
                    type: "text",
                    from: "student_all"
                },{
                    title: "停用学生",
                    type: "text",
                    from: "student_stop"
                },{
                    title: "启用学生",
                    type: "text",
                    from: "student_used"
                }],
                // 附加参数
                extend: {
                    //等级
                    level:"",
                    city:"",
                    //区县
                    district: "",
                    //学校
                    school: "",
                    //年级
                    grade_id: "",
                    __hash__: ""
                },
                only_hash:false,
                //学校集合
                school_list: [],
                //年级集合
                grade_list: [],
                //选择查看方式
                typeChange:function () {
                  var get_level=this.extend.level;
                  if(get_level!=0){
                      if(get_level==2){//按市
                          this.type=6;
                      }else if(get_level==3){//区县
                          this.type=3;
                          $("#area_select").removeClass('am-hide');
                      }else {//按学校
                          this.type=4;
                          $("#area_select").removeClass('am-hide');
                      }
                      new PCAS("province","city","area","四川省","成都市","");
                      this.extend.city="成都市";
                      ajax_post(api_get_grade,{status:'1'},this);
                  }
                },
                //选择市
                cityChange:function () {
                    this.extend.city=this.city_value;
                },
                //区县选择
                districtChange: function () {
                    this.extend.district=this.district_name;
                    if(this.type==3){//区县选择
                        if(this.district_name==""){
                            this.table_num=2;
                        }else{
                            this.url=api_get_user_statistic;
                            this.theadTh=this.district_check_list;

                            this.extend.__hash__=new Date();
                            this.table_num=1;
                        }
                    }else if(this.type==4){//选择学校
                        ajax_post(api_get_school,{district:this.extend.district},this)
                    }

                },
                //学校选择
                schoolChange: function () {
                    if(this.extend.school!=0){
                        if(this.extend.grade_id=='' || this.extend.grade_id==0){
                            this.table_num=2;
                        }else{
                            this.url=api_get_user_statistic;
                            this.theadTh=this.school_check_list;
                            this.is_init=true;
                            this.extend.__hash__=new Date();
                            this.table_num=1;
                        }

                    }
                },
                //选择年级
                gradeChange: function () {
                    if(this.extend.grade_id=='0'){
                        this.table_num=2;
                    }else{
                        this.url=api_get_user_statistic;
                        this.theadTh=this.city_check_list;
                        this.is_init=true;
                        this.extend.__hash__=new Date();
                        this.table_num=1;
                    }
                },
                classChange:function () {
                    this.extend.ach_classid=this.other.ach_classid;
                    this.extend.__hash__=new Date();
                },
                gradeLeaders:function (data) {
                    if(this.highest_level!=5){
                        this.grade_list = data;
                    }else {
                        var arr=[];
                        var teachGrade=this.teach_grade;
                        for(var i=0;i<data.length;i++){
                            var id=data[i].grade_id;
                            for(var j=0;j<teachGrade.length;j++){
                                if(teachGrade[j]==id){
                                    arr.push(data[i]);
                                }
                            }
                        }
                        this.grade_list=arr;
                        this.class_list=arr[0].class_list;
                        this.only_hash=true;
                        this.theadTh = this.school_stu_list;
                        this.extend.province=this.grade_user.province;
                        this.extend.city=this.grade_user.city;
                        this.extend.district=this.grade_user.district;
                        this.extend.ach_schoolid=this.grade_user.fk_school_id;
                        this.extend.ach_gradeid=this.grade_list[0].grade_id;
                        this.only_hash=false;
                        this.is_init = true;
                        this.extend.__hash__=new Date();
                    }
                },
                getCompleteDate:function () {
                    var self=this;
                    var datepicker=$("#my-datepicker");
                    datepicker.on("change", function(event) {
                        self.other.start_time = event.delegateTarget.defaultValue;
                        self.extend.ach_start_dates=self.other.start_time;
                    });
                    datepicker.datepicker('open');
                },
                getCompleteDates:function () {
                    var self=this;
                    var datepicker=$("#my-datepickers");
                    datepicker.on("change", function(event) {
                        self.other.end_time = event.delegateTarget.defaultValue;
                        self.extend.ach_end_dates=self.other.end_time;
                    });
                    datepicker.datepicker('open');
                },
                init:function () {
                    this.cds();
                },
                userInfo:function (self) {
                    self.url=stu_list;
                    self.only_hash=false;
                    self.is_init = true;
                    self.extend.__hash__=new Date();
                },
                cds: function () {
                    // 1：省级；2：市州级；3：区县级；4：校级；5：年级
                    var self = this;
                    data_center.uin(function (data) {
                        self.only_hash=true;
                        var userType = data.data.user_type;
                        var highest = data.data.highest_level;
                        if (userType == "1") {
                            var userData = JSON.parse(data.data["user"]);
                            if (highest == "1") {//省级
                            } else if (highest == "2") {//市级
                                self.theadTh = self.city_stu_list;
                                self.extend.province=userData.province;
                                self.extend.city=userData.city;
                                self.userInfo(self);
                                self.highest_level = 2;
                                // new PCAS("province", "city", "area", "" + userData.province + "省", "" + userData.city + "");
                            } else if (highest == "3") {//区县
                                self.theadTh = self.district_stu_list;
                                self.extend.province=userData.province;
                                self.extend.city=userData.city;
                                self.extend.district=userData.district;
                                self.userInfo(self);
                                self.highest_level = 3;
                                ajax_post(school_list, {
                                    district: userData.district,
                                    offset: 0,
                                    rows: 99999
                                }, self);
                            }else if (highest == "4") {//校级
                                self.theadTh = self.school_stu_list;
                                self.extend.province=userData.province;
                                self.extend.city=userData.city;
                                self.extend.district=userData.district;
                                self.extend.ach_schoolid=userData.fk_school_id;
                                self.userInfo(self);
                                self.highest_level = 4;
                                ajax_post(grade_list, {
                                    school_id: userData.fk_school_id
                                }, self);
                            } else if (highest == "5") {//年级
                                self.highest_level = 5;
                                self.grade_user=userData;
                                self.teach_grade= userData.teach_grade.split(",");
                                ajax_post(grade_list, {
                                    school_id: userData.fk_school_id
                                }, self);
                            }
                        }
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case  api_get_grade:
                                this.grade_list = data.data;
                                break;
                            //获取学校
                            case  api_get_school:
                                this.school_list=data.data.list;
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });