/**
 * Created by Administrator on 2018/1/29.
 */
define(["jquery", C.CLF('avalon.js'), 'layer',
        C.Co("sys_stat", "list/class/class", "html!"),
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
        var api_get_info = api.api + "base/user_stat/sys_used_cnt";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "sys_class",
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
                fk_grade_id: "",
                data: {
                    district: "",
                    grade_id: "",
                    level: 5, //2-市州；3-区县；4-校
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
                        self.city = tUserData.city;
                        self.data.district = tUserData.district;
                        self.data.school = tUserData.school_name;
                        var school_id = tUserData.fk_school_id;
                        //请求年级
                        ajax_post(api_get_school_grade, { school_id: school_id }, self)
                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
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
                //获取年级
                complete_get_school_grade: function(data) {
                    this.gradeList = data.data;
                    ajax_post(api_get_info, this.data, this);
                },
                gradeChange: function() {
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