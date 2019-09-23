/**
 * Created by uptang on 2017/6/5.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.CM("comparative_analysis_class", "css!"),
        C.CM("comparative_analysis_class", "html!"),
        C.CMF("data_center.js"),
        "layer",
        "highcharts","exporting","highcharts-zh_CN","highcharts_more"
    ],
    function ($, avalon, css, html, data_center, layer,highcharts,exporting,zh_CN,highcharts_more) {
        var vm = avalon.component('ms-comparative-analysis-class', {
            template: html,
            defaults: {
                //市州获取区县
                area_list_api: api.PCPlayer + "school/arealist.action",
                //年级列表
                grade_list_api: api.user + "grade/findGrades.action",
                //学校列表
                school_list_api: api.PCPlayer + "school/schoolList.action",
                //学年学期
                grade_opt_semester: api.user + "semester/grade_opt_semester",
                //对比列表
                contrast_abcd: api.growth + "contrast_abcd",
                //年级集合
                grade_list: [],
                //学年学期
                semester: [],
                //学校集合
                school_list: [],
                evaluation_contrast: [],
                area_list: [],
                //班级集合
                class_list:[],
                //等级百分比集合
                a_list:[],
                b_list:[],
                c_list:[],
                d_list:[],
                //图表height
                chart_height:'',
                // 用户角色等级
                highest_level: "",
                //请求参数
                data: {
                    city: "",
                    //区县
                    district: "",
                    //学校
                    school_id: "",
                    //年级
                    grade_id: "",
                    //班级
                    classId: "",
                    //学年学期
                    fk_xq_id:0,
                    //查看方式
                    hierarchy: ""
                },
                other: {
                    //市州
                    city: "",
                    school: "",
                    school_name: "",
                    //年级
                    grade: "",
                    grade_name: "",
                    //学年学期
                    semester: "",
                    semester_name: ""
                },
                //名称
                tit: "",
                //用户等级
                user_level: '',
                //初始化
                init: function () {
                    this.cds();
                },
                cds: function () {
                    // 1：省级；2：市州级；3：区县级；4：校级；5：年级
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        var highest = data.data.highest_level;
                        var userData = JSON.parse(data.data["user"]);
                        self.user_level = highest;
                        if (highest == "1") {//省级
                        } else if (highest == "2") {//市级
                            self.other.city = userData.city;
                            self.data.city = userData.city;
                            self.highest_level = 2;
                            //请求区县
                            ajax_post(self.area_list_api, {city: userData.city}, self);
                            //请求年级
                            ajax_post(self.grade_list_api, {status: 1}, self);
                        } else if (highest == "3") {//区县
                            self.other.city = userData.city;
                            self.data.city = userData.city;
                            self.data.district = userData.district;
                            self.highest_level = 3;
                            //请求年级
                            ajax_post(self.grade_list_api, {status: 1}, self);
                            ajax_post(self.area_list_api, {
                                district: userData.district,
                                offset: 0,
                                rows: 99999
                            }, self);
                        } else if (highest > "3") {//校级
                            self.other.city = userData.city;
                            self.data.city = userData.city;
                            self.data.district = userData.district;
                            self.other.school_name = userData.school_name;
                            self.data.school_id = userData.fk_school_id;
                            var grade = userData.fk_grade_id;
                            if(highest == 6 || highest == 4){//教师
                                self.highest_level = 6;
                                ajax_post(self.grade_list_api, {status: 1}, self);
                            }else if(highest == 7){
                                self.highest_level = 7;
                                ajax_post(self.grade_opt_semester, {grade_id: grade}, self);
                            }
                        }
                    });
                },
                //区县改变时，请求学校数据
                districtChange: function () {
                    // this.school_list = [];
                    this.data.school_id = "";
                    this.other.school_name = "";
                    this.other.school = "";
                    if (this.data.district != "") {
                        this.get_school_list();
                    } else {
                        this.data.district = "";
                    }
                },
                get_school_list: function () {
                    ajax_post(this.school_list_api, {
                        district: this.data.district,
                        offset: 0,
                        rows: 99999
                    }, this);
                },
                schoolChange: function () {
                    this.other.school_name = "";
                    this.data.school_id = "";
                    if (this.other.school != "") {
                        var school = this.other.school;
                        this.data.school_id = Number(school.substring(0, school.indexOf("|")));
                        this.other.school_name = school.substring(school.indexOf("|") + 1, school.length);
                    } else {
                        this.other.school = "";
                    }
                    this.gradeChange();
                },
                gradeChange: function () {
                    this.other.semester = "";
                    this.other.semester_name = "";

                    this.data.grade_id = "";
                    this.other.grade_name = "";
                    this.semester = [];
                    var grade = this.other.grade;
                    this.data.grade_id = Number(grade.substring(0, grade.indexOf("|")));
                    this.other.grade_name = grade.substring(grade.indexOf("|") + 1, grade.length);
                    //请求学年学期
                    ajax_post(this.grade_opt_semester, {grade_id: this.data.grade_id}, this);
                   //this.demand();
                },
                semesterChange: function () {
                    this.other.semester_name="";
                    if (this.other.semester != "") {
                        var ret = base_filter(this.semester, "id", this.other.semester);
                        if(ret.length>0){
                            this.other.semester_name = ret[0].semester_name;
                        }
                        this.data.fk_xq_id = this.other.semester;
                    }else {
                        this.other.semester == "";
                    }
                    this.get_abcd();
                },
                demand: function () {
                    // 请求对比数据
                    this.get_abcd();
                },
                get_abcd: function () {
                    this.tit = this.other.city + "-" + this.data.district + "-" + "" + this.other.school_name + "" + "-" + "" + this.other.grade_name + "" + "-" + "" + this.other.semester_name + "";
                    layer.load(1, {shade: false});
                    ajax_post(this.contrast_abcd, {
                        city: this.data.city,
                        //区县
                        district: this.data.district,
                        //学校
                        school_id: this.data.school_id,
                        //年级
                        grade_id: this.data.grade_id,
                        //班级
                        classId: this.data.classId,
                         //学年学期
                        fk_xq_id: Number(this.data.fk_xq_id),
                        //查看方式
                        hierarchy: 5
                    }, this);
                },
                //时间转换
                timestampToTime: function (timestamp) {
                    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
                    var Y = date.getFullYear() + '-';
                    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
                    var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '';
                    return Y + M + D;
                },
                //highcharts图
                charts:function(){
                    var chart = Highcharts.chart('container', {
                        chart: {
                            type: 'bar'
                        },
                        //去掉logo
                        credits: {
                            enabled: false
                        },
                        //去掉打印按钮
                        exporting: {
                            enabled: false
                        },
                        title: {
                            text: ''
                        },
                        xAxis: {
                            categories: this.class_list,
                            crosshair: true //配置跟随鼠标或鼠标滑过点时的十字准星线
                        },
                        yAxis: {
                            min: 0,
                            max: 100,
                            title: {
                                text: '人数比例',
                            }
                        },
                        legend: {
                            /* 图例显示顺序反转
                             * 这是因为堆叠的顺序默认是反转的，可以设置
                             * yAxis.reversedStacks = false 来达到类似的效果
                             */
                            align: "center", //程度标的目标地位
                            verticalAlign: "top", //垂直标的目标地位
                            x: 0, //间隔x轴的间隔
                            y: -5 ,//间隔Y轴的间隔
                            reversed: true
                        },
                        plotOptions: {
                            series: {
                                stacking: 'normal',
                            },
                        },
                        series: [{
                            name: 'D',
                            data: this.d_list
                        }, {
                            name: 'C',
                            data: this.c_list
                        }, {
                            name: 'B',
                            data: this.b_list
                        }, {
                            name: 'A',
                            data: this.a_list
                        }]
                    })
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case  this.school_list_api:
                                this.school_list = data.data.list;
                                this.get_abcd();
                                break;
                            case  this.grade_list_api:
                                this.grade_list = data.data;
                                if (data.data.length != 0) {
                                    this.data.grade_id = data.data[0].id;
                                    this.other.grade_name = data.data[0].grade_name;
                                    this.other.grade = data.data[0].id + "|" + data.data[0].grade_name;
                                    this.tit = this.other.city + "-" + this.data.district + "-" + "" + this.other.school_name + "" + "-" + "" + this.other.grade_name + "" + "-" + "" + this.other.semester_name + "";
                                    //请求学年学期
                                    ajax_post(this.grade_opt_semester, {grade_id: data.data[0].id}, this);
                                    // 请求对比数据
                                    // this.get_abcd();
                                } else {
                                    layer.msg("无年级数据！")
                                }
                                break;
                            case this.grade_opt_semester:
                                this.semester = data.data.list;
                                var self = this;
                                cloud.semester_current({}, function (url, ars, data) {
                                    self.other.semester = data.id;
                                    self.semesterChange();
                                });
                                // this.other.semester = cloud.semester_current().id;
                                // this.semesterChange();
                                break;
                            case this.area_list_api:
                                this.area_list = data.data.list;
                                if (this.user_level > 2) {
                                    this.data.district = data.data.list[0].district;
                                    this.get_school_list();
                                }
                                break;
                            case this.contrast_abcd:
                                this.complete_contrast_abcd(data);
                                break;
                        }
                    } else {
                        layer.msg(msg);
                    }
                    if (cmd == this.contrast_abcd) {
                        layer.closeAll();
                    }
                },
                complete_contrast_abcd:function(data){
                    this.class_list = [];
                    this.a_list = [];
                    this.b_list = [];
                    this.c_list = [];
                    this.d_list = [];
                    this.evaluation_contrast = data.data;
                    if(this.evaluation_contrast.length == 0)
                        return;
                    //获取班级、等级百分比集合
                    var list = data.data;
                    var class_list = [];
                    var a_list = [];
                    var b_list = [];
                    var c_list = [];
                    var d_list = [];
                    for(var i=0;i<list.length;i++){
                        var item = list[i].class_name;
                        class_list.push(item);
                        var a_item = list[i].A_1;
                        a_list.push(a_item);
                        var b_item = list[i].B_1;
                        b_list.push(b_item);
                        var c_item = list[i].C_1;
                        c_list.push(c_item);
                        var d_item = list[i].D_1;
                        d_list.push(d_item);
                    }
                    this.class_list = class_list;
                    //图表高度
                    var len = this.class_list.length;
                    if(len<10){
                        this.chart_height = 42*len+100
                    }else{
                        this.chart_height = 42*len;
                    }
                    this.a_list = a_list;
                    this.b_list = b_list;
                    this.c_list = c_list;
                    this.d_list = d_list;
                    //图表
                    this.charts();
                },
                onReady: function () {
                    this.init();
                }
            }
        });
    });