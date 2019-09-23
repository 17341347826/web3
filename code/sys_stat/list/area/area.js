/**
 * Created by Administrator on 2018/1/29.
 */
define(["jquery", C.CLF('avalon.js'), 'layer',
        C.Co("sys_stat", "list/area/area", "html!"),
        C.CMF("router.js"), C.CMF("data_center.js"), C.CM('page_title'),C.CM("table"),
        C.CM("three_menu_module")
    ],
    function($, avalon, layer, html, x, data_center, page_title,table,three_menu_module) {
        //获取区县
        var api_get_area = api.api + "base/school/arealist.action";
        //获取区县下的所有年级
        var api_get_area_grade = api.api + "base/school/sub_school_grade_list";
        //查询
        var api_get_info = api.api + "base/user_stat/sys_used_cnt";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "sys_area",
                //身份
                highest_level: "",
                city: "",
                //区县集合
                areaList: [],
                areaInfo: "",
                //学校集合
                schoolList: [],
                fk_school_id: '',
                //年级集合
                gradeList: [],
                data: {
                    district: "",
                    grade_id: "",
                    level: 3, //2-市州；3-区县；4-校
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
                        var district = tUserData.district;
                        if (highest_level == 2) { //市级用户
                            self.city = tUserData.city;
                            ajax_post(api_get_area, { city: self.city }, self);
                        } else if (highest_level == 3) { //区县级用户
                            self.data.district = district;
                            ajax_post(api_get_area, { district: district }, self)
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
                                //获取区县下所有的年级
                            case api_get_area_grade:
                                this.complete_get_area_grade(data);
                                break;
                                //查询
                            case api_get_info:
                                this.dataList = data.data.list;
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //选择区县
                areaChange: function() {
                    if (this.areaInfo == '') {
                        this.data.grade_id = '';
                        this.gradeList = [];
                        ajax_post(api_get_info, this.data, this);
                    } else {
                        var get_areaInfo = this.areaInfo;
                        var district_id = Number(get_areaInfo.split('|')[1]);
                        this.data.district = get_areaInfo.split('|')[0];
                        ajax_post(api_get_area_grade, { department_id: district_id, grade_id: 0 }, this)
                    }
                },
                //选择年级
                gradeChange: function() {
                    ajax_post(api_get_info, this.data, this);
                },
                //获取区县
                complete_get_area: function(data) {
                    if (this.highest_level == 3) {
                        ajax_post(api_get_area_grade, { department_id: data.data.list[0].higher_id, grade_id: 0 }, this)

                    } else {
                        this.areaList = data.data.list;
                        ajax_post(api_get_info, this.data, this);
                    }
                },
                //获取区县下所有的年级
                complete_get_area_grade: function(data) {
                    this.gradeList = data.data.list;
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