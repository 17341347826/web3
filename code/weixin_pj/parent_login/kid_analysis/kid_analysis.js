/**
 * Created by Administrator on 2018/9/7.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("weixin_pj/parent_login", "kid_analysis/kid_analysis", "css!"),
        C.Co("weixin_pj/parent_login", "kid_analysis/kid_analysis", "html!"),
        C.CMF("data_center.js"),
        "jquery-weui",C.CLF('base64.js')
    ],
    function ($, avalon,css, html, data_center,weui,bs64) {
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "kid_analysis",
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var dataList=JSON.parse(data.data['user']);
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType=data.data.user_type;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest=data.data.highest_level;
                        if(userType == 2){
                            self.ident_info = dataList;
                        }else if(userType == 3){
                            var stu = dataList.student;
                        }
                    });
                },
                //毕业档案
                graduate_archives:function(el){
                    var info = this.ident_info;
                    var portfolio_stu = info.guid + '|' + info.grade_name + '|' + info.fk_grade_id + '|' + info.fk_school_id + '|' +
                        info.sex + '|' + info.province + '|' + info.city + '|' + info.district + '|' + info.fk_class_id + '|' + info.code;
                    var param = {
                        class_id: info.fk_class_id,
                        grade_id: info.fk_grade_id,
                        stu_num: info.stu_num,
                        school_id:info.fk_school_id
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
                            window.console.info(url);
                            var dz = window.location.origin + '/api/GrowthRecordBag/wx_growth_file_get_img?token='+token+'&url='+url;
                            window.open(dz)
                        }
                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {

                        }
                    } else {
                        $.alert(msg);
                    }
                },
                init:function(){
                    this.cb();
                },

            });
            vm.$watch('onReady', function () {
                vm.init();

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });