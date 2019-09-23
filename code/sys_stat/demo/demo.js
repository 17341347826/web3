/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),
        C.Co("sys_stat", "demo/demo", "html!"),
        C.CMF("data_center.js"),
        'layer',
        C.CM("three_menu_module")
    ],
    function(avalon, html, data_center,layer,three_menu_module) {
        var avalon_define = function() {
            var table = avalon.define({
                $id: "demo",
                grade_list:[],
                get_grade_id:"",
                class_list:[],
                get_class_id:"",
                semester_list:[],
                semester_id:'',
                area_list:[],
                area_id:'',
                init:function () {
                    var self = this;
                    // cloud.city_sqfy_process({  }, function (data) {
                    //     var x = 0;
                    //     x = 1;
                    // });
                    //var user_type = cloud.user_type();
                    var area_list = cloud.area_list();
                    var area_list = cloud.area_list();
                    cloud.area_process_mb({}, {

                    });
                    // on_data_init(function (user) {
                    //     var user_type = user.user_type;
                    //     var tUserData = JSON.parse(user["user"]);
                    //     var highest_level = user.highest_level;
                    //     var city = tUserData.city;
                    //     User.get_below_info(highest_level, city);
                    //     self.area_list = User.area_list;
                    //     self.area_id = self.area_list[0].id;
                    // })
                    // this.gradeChange();
                },
                gradeChange:function () {
                    base_semester(this.get_grade_id);
                    this.semester_list = Base.map_data.semester_list;
                    this.semester_id = this.semester_list[0].id;
                }

            });
            table.$watch("onReady", function() {
                table.init();


            });

            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });