/**
 * Created by Administrator on 2018/1/29.
 */
define(["jquery", C.CLF('avalon.js'), 'layer',
        C.Co("sys_stat", "list/school/school", "html!"),
        C.CMF("router.js"), C.CMF("data_center.js"), C.CM('page_title'),C.CM("table"),
        C.CM("three_menu_module")
    ],
    function($, avalon, layer,html, x, data_center, page_title,table,three_menu_module) {
        //获取区县
        var api_get_area = api.api + "base/school/arealist.action";
        //获取学校
        var api_get_school = api.api + "base/school/schoolList.action";
        //获取学校下对应的年级
        var api_get_school_grade = api.api + "base/class/school_class.action";
        //查询
        var api_get_info = api.api + "base/user_stat/sys_used_cnt"
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "sys_school",
                //身份
                highest_level: "",
                city: "",
                //区县集合
                areaList: [],
                areaInfo: "",
                //学校集合
                schoolList: [],
                schoolInfo: '',
                //年级集合
                gradeList: [],
                data: {
                    district: "",
                    grade_id: "",
                    level: 4, //2-市州；3-区县；4-校
                    school: ""
                },
                dataList: [],
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var cArr = [];
                        var highest_level = data.data.highest_level;
                        self.highest_level = highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        if (highest_level == 2) { //市级用户
                            self.city = tUserData.city;
                            ajax_post(api_get_area, { city: self.city }, self);
                        } else if (highest_level == 3) { //区县级用户
                            var district = tUserData.district;
                            self.data.district = district;
                            ajax_post(api_get_school, { district: district }, self)
                        } else if (highest_level == 4) { //校级用户
                            var district_x = tUserData.district;
                            var school = tUserData.school_name;
                            self.data.district = district_x;
                            self.data.school = school;
                            var school_id = tUserData.fk_school_id;
                            //请求年级
                            ajax_post(api_get_school_grade, { school_id: school_id }, self)
                        }
                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取区县
                            case api_get_area:
                                this.complete_get_area(data);
                                break;
                                //获取学校
                            case api_get_school:
                                this.complete_get_school(data);
                                break;
                                //获取学校下对应的年级
                            case api_get_school_grade:
                                this.complete_get_school_grade(data);
                                break;
                                //查询
                            case api_get_info:
                                this.dataList = data.data.list;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //选择区县
                areaChange: function() {
                    if (this.areaInfo == '') {
                        this.data.district = '';
                        this.data.grade_id = '';
                        this.data.school = '';
                        this.schoolList = [];
                        this.gradeList = [];
                        ajax_post(api_get_info, this.data, this);
                    } else {
                        var get_areaInfo = this.areaInfo;
                        var district = get_areaInfo.split('|')[0];
                        this.data.district = district;
                        ajax_post(api_get_school, { district: district }, this)
                    }
                },
                //选择学校
                schoolChange: function() {
                    if (this.schoolInfo == '') {
                        this.data.grade_id = '';
                        this.gradeList = [];
                        this.data.school = "";
                        ajax_post(api_get_info, this.data, this);
                    } else {
                        //请求年级
                        var schoolInfo = this.schoolInfo;
                        var school_id = schoolInfo.split("|")[1];
                        this.data.school = schoolInfo.split("|")[0];
                        ajax_post(api_get_school_grade, { school_id: school_id }, this)
                    }
                },
                //选择年级
                gradeChange: function() {
                    ajax_post(api_get_info, this.data, this);
                },
                //获取区县
                complete_get_area: function(data) {
                    this.areaList = data.data.list;
                    ajax_post(api_get_info, this.data, this);
                },
                //获取学校
                complete_get_school: function(data) {
                    this.schoolList = data.data.list;
                    ajax_post(api_get_info, this.data, this);
                },
                //获取年级
                complete_get_school_grade: function(data) {
                    this.gradeList = data.data;
                    ajax_post(api_get_info, this.data, this);
                }

            });
            vm.$watch('onReady', function() {
                this.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });