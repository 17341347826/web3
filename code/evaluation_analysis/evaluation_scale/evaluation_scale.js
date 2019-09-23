/**
 * Created by uptang on 2017/6/5.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("evaluation_analysis", "evaluation_scale/evaluation_scale", "css!"),
        C.Co("evaluation_analysis", "evaluation_scale/evaluation_scale", "html!"),
        C.CMF("data_center.js"),
        "layer",
        C.CM("three_menu_module"), "highcharts"],
    function ($, avalon, css, html, data_center, layer, three_menu_module, highcharts) {
        //等级列表
        var usagecount_findbyrankcount = api.growth + "usagecount_findbyrankcount";
        //市州获取区县
        var area_list = api.PCPlayer + "school/arealist.action";
        //学校列表
        var school_list = api.PCPlayer + "school/schoolList.action";
        //年级列表
        var grade_list = api.user + "grade/findGrades.action";
        //获取班级列表
        var class_list_api = api.api+"base/class/findClassSimple.action";
        //评价维度的
        var usagecount_findbyindexth = api.growth + "usagecount_findbyindexth";
        var usagecount_findbysemesterth = api.growth + "usagecount_findbysemesterth";
        var usagecount_findbyindextb = api.growth + "usagecount_findbyindextb";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "table",
                first_num: 0,
                //区县集合
                area_list: [],
                //学校集合
                school_list: [],
                //年级集合
                grade_list: [],
                //比例
                scale: [],
                // 用户角色
                highest_level: "",
                //年级领导
                grade_user: "",
                //请求参数
                data: {
                    province: "",
                    //区县
                    city: "",
                    //学校
                    schoolid: "",
                    //年级
                    gradeid: ""
                },
                other: {
                    city: "",
                    //区县
                    area_name: "",
                    district: "",
                    //学校
                    school: "",
                    //学校
                    school_name: "",
                    grade: "",
                    grade_name: "",
                    class_name:"",
                    semester: '',
                },
                //图表数据
                high_chart_series: [],
                //评价维度
                index_tab: [],
                semester_tab: [],
                index_count: [],
                //名称
                tit: "",
                semester_list: [],
                sel_semester: '',
                //班级列表
                class_list:[],
                fk_class_id:'',
                grade_class_list:[],
                class_from_grade:[],
                //初始化
                init: function () {
                    // 1：省级；2：市州级；3：区县级；4：校级；5：年级
                    var self = this;
                    data_center.uin(function (data) {
                        var highest = data.data.highest_level;
                        var userData = JSON.parse(data.data["user"]);
                        self.highest_level = Number(highest);
                        //省级
                        if (highest == "1")
                            return;
                        self.data.province = userData.province;
                        self.other.city = userData.city;
                        if (highest == "2") {//市级
                            self.tit = userData.city;
                            //请求区县
                            ajax_post(area_list, {
                                city: userData.city
                            }, self);
                            self.school_list = cloud.school_list();
                            if(self.school_list.length>0){
                                self.other.school = '';
                                // self.other.school = self.school_list[0].id+'|'+self.school_list[0].schoolname;
                                self.schoolChange();
                            }
                            //请求年级
                            ajax_post(grade_list, {status: 1}, self);
                            return;
                        }
                        //区县及以下
                        self.other.area_name = userData.district;
                        if (highest == "3") {//区县
                            //请求学校
                            // ajax_post(school_list, {district: userData.district, offset: 0, rows: 99999}, self);
                            self.school_list = cloud.school_list();
                            if(self.school_list.length>0){
                                self.other.school = self.school_list[0].id+'|'+self.school_list[0].schoolname;
                                self.schoolChange();
                            }
                            ajax_post(grade_list, {status: 1}, self);
                            return;
                        }
                        //学校及以下
                        self.other.school_name = userData.school_name;
                        self.data.schoolid = userData.fk_school_id;
                        //年级及以下
                        self.grade_class_list = cloud.auto_grade_list();
                        self.class_from_grade = self.grade_class_list[0].class_list;
                        self.data.gradeid = self.grade_class_list[0].grade_id;
                        self.other.grade_name = self.grade_class_list[0].grade_name;
                        self.other.grade = self.data.gradeid + "|" + self.other.grade_name;
                        self.data.city = cloud.user_depart_id();
                        if(self.class_from_grade.length>0){
                            self.fk_class_id = self.class_from_grade[0].class_id;
                        }
                        self.demand();
                    });

                },
                to_page:function (url) {
                    window.location.href = '#' + url;
                },
                //区县改变时，请求学校数据
                districtChange: function (num, el) {
                    var district = '';

                    this.school_list = [];
                    this.first_num = num;
                    if (el.hasOwnProperty('district')) {
                        this.other.district = el.district;
                        this.other.area_name = el.district;
                        district = el.district;
                    } else {
                        this.other.district = '';
                        this.other.area_name = '';
                    }
                    var user = cloud.user_user();
                    if(el.value==''&&el.district=='全市'){
                        district = user.city;
                        this.school_list = cloud.school_list();
                    }else{
                        this.school_list = cloud.school_list({district:district})
                    }


                    this.data.city = "";
                    this.data.schoolid = "";
                    this.other.school_name = "";
                    this.other.school = "";
                    this.data.city = cloud.user_depart_id();
                    if(el.value!=''){
                        this.data.city = el.id;
                    }

                    if(this.school_list.length>0){
                        this.other.school = this.school_list[0].id+'|'+this.school_list[0].schoolname;
                        this.other.school_name = this.school_list[0].schoolname;
                        this.data.schoolid = this.school_list[0].id;
                    }
                    // ajax_post(school_list, {
                    //     district: district,
                    //     offset: 0,
                    //     rows: 99999
                    // }, this);
                },
                schoolChange: function () {
                    this.other.school_name = "";
                    this.data.schoolid = "";
                    if (this.other.school != "") {
                        var school = this.other.school;
                        this.data.schoolid = Number(school.substring(0, school.indexOf("|")));
                        this.other.school_name = school.substring(school.indexOf("|") + 1, school.length);
                    } else {
                        this.other.school = "";
                    }
                },
                gradeChange: function () {
                    if(this.highest_level>3){
                        var grade_id = this.other.grade.split('|')[0];
                        for(var i=0;i<this.grade_class_list.length;i++){
                            if(grade_id==this.grade_class_list[i].grade_id) {
                                this.class_from_grade =  this.grade_class_list[i].class_list;
                                break;
                            }
                        }
                        this.other.grade_name = this.other.grade.split('|')[1];
                        if(this.class_from_grade.length>0){
                            this.fk_class_id = this.class_from_grade[0].class_id;
                        }
                        this.data.gradeid = grade_id;
                        this.demand();
                        return;
                    }
                    if (this.other.grade != "") {
                        var grade = this.other.grade;
                        this.data.gradeid = Number(grade.substring(0, grade.indexOf("|")));
                        this.other.grade_name = grade.substring(grade.indexOf("|") + 1, grade.length);
                        this.demand();
                    }
                },
                update_class_info:function () {
                    var sel_class = base_filter(this.class_from_grade, "class_id", this.fk_class_id);
                    if(sel_class.length != 0){
                        var cls_name = sel_class[0].class_name;
                        if(cls_name.indexOf("班")<0){
                            cls_name += "班"
                        }
                        this.other.class_name = cls_name;
                    }
                },
                sel_class:function (el,index) {
                    this.demand();
                },
                //获取等级人数
                rank_count: function () {
                    layer.load(1, {shade:[0.3,'#121212']});
                    var level = cloud.user_level();
                    if(level == 4){
                        ajax_post(usagecount_findbyrankcount, {
                            city: '',
                            gradeid: this.data.gradeid,
                            schoolid: this.data.schoolid,
                            fk_xq_id: this.other.semester,
                            classid:this.fk_class_id
                        }, this);
                    }else{
                        if(this.data.schoolid == ''){
                            ajax_post(usagecount_findbyrankcount, {
                                city: this.data.city,
                                gradeid: this.data.gradeid,
                                schoolid: '',
                                fk_xq_id: this.other.semester,
                                classid:this.fk_class_id
                            }, this);
                        }else{
                            ajax_post(usagecount_findbyrankcount, {
                                city: '',
                                gradeid: this.data.gradeid,
                                schoolid: this.data.schoolid,
                                fk_xq_id: this.other.semester,
                                classid:this.fk_class_id
                            }, this);
                        }
                    }

                },
                semester_change: function () {
                    if (this.sel_semester == '') {
                        this.other.semester = '';
                    }else {
                        this.other.semester = Number(this.sel_semester.split("|")[0]);
                    }
                    this.rank_count();
                },
                demand: function () {
                    this.update_class_info();
                    this.tit = this.other.city + "-" + this.other.area_name + "-" + "" + this.other.school_name + "-" + "" + this.other.grade_name + "" + this.other.class_name + "";
                    //（接口===city代表区县）
                    this.rank_count();
                },
                //等级相关
                scaleData: function (data) {
                    var arr = [];
                    for (var i = 0; i < data.length; i++) {
                        //计算比例
                        var scaleA = Math.round(data[i].A / data[i].count * 100000) / 1000;
                        var scaleB = Math.round(data[i].B / data[i].count * 100000) / 1000;
                        var scaleC = Math.round(data[i].C / data[i].count * 100000) / 1000;
                        var scaleD = Math.round(data[i].D / data[i].count * 100000) / 1000;
                        data[i]["scale_count"] = [];
                        data[i]["scale"] = [];
                        data[i]["scaleA"] = scaleA;
                        data[i]["scale"].push(Math.round(scaleA * 100) / 100);
                        data[i]["scale_count"].push(data[i].A);
                        data[i]["scaleB"] = scaleB;
                        data[i]["scale"].push((Math.round(scaleB * 100) / 100));
                        data[i]["scale_count"].push(data[i].B);
                        data[i]["scaleC"] = scaleC;
                        data[i]["scale"].push((Math.round(scaleC * 100) / 100));
                        data[i]["scale_count"].push(data[i].C);
                        data[i]["scaleD"] = scaleD;
                        data[i]["scale"].push((Math.round(scaleD * 100) / 100));
                        data[i]["scale_count"].push(data[i].D);
                        //比例
                        var column = {
                            name: data[i].semester,
                            type: 'column',
                            yAxis: 1,
                            data: data[i].scale,
                            tooltip: {
                                valueSuffix: ' %'
                            }
                        };
                        arr.push(column);
                        //人数
                        var spline = {
                            name: data[i].semester,
                            type: 'spline',
                            data: data[i].scale_count,
                            tooltip: {
                                valueSuffix: ' 人'
                            }
                        };
                        arr.push(spline);
                    }
                    sort_by(data,['+semester']);
                    this.scale = data;
                    sort_by(arr,['+name']);
                    this.high_chart_series = arr;
                    this.eHighcharts();
                },
                eHighcharts: function () {
                    var arr = JSON.parse(JSON.stringify(this.high_chart_series));
                    Highcharts.setOptions({
                        lang: {
                            printChart:"打印图表",
                            downloadJPEG: "下载JPEG 图片" ,
                            downloadPDF: "下载PDF文档"  ,
                            downloadPNG: "下载PNG 图片"  ,
                            downloadSVG: "下载SVG 矢量图" ,
                            exportButtonTitle: "导出图片"
                        }
                    });
                    var a = new Highcharts.Chart('container', {
                        chart: {
                            zoomType: 'xy'
                        },
                        title: {
                            text: ''
                        },
                        exporting:{
                            enabled:false //用来设置是否显示‘打印’,'导出'等
                        },
                        xAxis: [{
                            categories: ['A', 'B', 'C', 'D'],
                            crosshair: true
                        }],
                        yAxis: [{
                            gridLineWidth: 0,
                            title: {
                                text: '人数',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            labels: {
                                format: '{value} 人',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            }
                        }, {
                            labels: {
                                format: '{value} %',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            },
                            title: {
                                text: '比例',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            },
                            opposite: true
                        }],

                        legend: {
                            layout: 'vertical',
                            align: 'right',
                            x: -60,
                            verticalAlign: 'top',
                            y: 0,
                            floating: true,
                            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                        },
                        series: arr,
                        // exporting: {
                        //     enabled: false
                        // }
                    });
                },
                count:count,
                //评价维度相关
                is_visible: function (ind) {
                    if (ind == 0)
                        return true;
                    if (this.index_count[ind - 1].indexname != this.index_count[ind].indexname)
                        return true;
                    return false;
                },
                areaList: function (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].district == this.other.area_name) {
                            this.data.city = data[i].id;
                            //请求年级
                            ajax_post(grade_list, {status: 1}, this);
                            return;
                        }
                    }
                },
                get_class_list:function () {
                  ajax_post(class_list_api,{
                      fk_grade_id:this.data.schoolid,
                      fk_school_id:this.data.gradeid
                  },this)
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        if ($('.highcharts-credits')[0]) {
                            $('.highcharts-credits')[0].style.display = 'none';
                        }
                        switch (cmd) {
                            case school_list:
                                this.school_list = data.data.list;
                                if(this.school_list.length>0){
                                    this.other.school = this.school_list[0].id+'|'+this.school_list[0].schoolname;
                                    this.other.school_name = this.school_list[0].schoolname;
                                    this.data.schoolid = this.school_list[0].id;
                                }

                                break;
                            case grade_list:
                                this.grade_list = data.data;
                                if (data.data.length != 0) {
                                    this.data.gradeid = data.data[0].id;
                                    this.other.grade_name = data.data[0].grade_name;
                                    this.other.grade = data.data[0].id + "|" + data.data[0].grade_name;
                                    this.tit = this.other.city + "-" + this.other.area_name + "-" + "" + this.other.school_name + "-" + "" + this.other.grade_name + "";
                                    //（接口===city代表区县）
                                    if(this.highest_level>3){
                                        this.get_class_list();
                                    }
                                    if(this.highest_level==2 || this.highest_level==3){
                                        this.data.city = cloud.user_depart_id();
                                        this.demand();
                                    }

                                } else {
                                    toastr.error("无年级数据！")
                                }
                                break;
                            case class_list_api:
                                this.class_list = data.data;
                                break;
                            case area_list:
                                this.area_list = data.data.list;
                                //请求是的单位id
                                this.area_list.unshift({district: "全市", value: ''});
                                if (this.highest_level == 3) {
                                    this.areaList(data.data.list);
                                }
                                break;
                            case usagecount_findbyrankcount:
                                this.scaleData(data.data);
                                //请求评价维度
                                ajax_post(usagecount_findbyindexth, {
                                    //区县
                                    city: this.data.city,
                                    //学校
                                    schoolid: this.data.schoolid,
                                    //年级
                                    gradeid: this.data.gradeid,
                                    fk_xq_id: this.other.semester
                                }, this);
                                break;
                            case usagecount_findbyindexth:
                                this.index_tab = data.data;
                                //请求学年学期
                                ajax_post(usagecount_findbysemesterth, {
                                    //区县
                                    city: this.data.city,
                                    //学校
                                    schoolid: this.data.schoolid,
                                    //年级
                                    gradeid: this.data.gradeid,
                                    fk_xq_id: this.other.semester
                                }, this);
                                break;
                            case usagecount_findbysemesterth:
                                this.semester_tab = data.data;
                                //请求列表数据
                                ajax_post(usagecount_findbyindextb, {
                                    //区县
                                    city: this.data.city,
                                    //学校
                                    schoolid: this.data.schoolid,
                                    //年级
                                    gradeid: this.data.gradeid,

                                    fk_xq_id: this.other.semester,
                                    classid:this.fk_class_id
                                }, this);
                                break;
                            case usagecount_findbyindextb:
                                this.index_count = data.data;
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                    if(cmd==usagecount_findbyrankcount){
                        layer.closeAll();
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