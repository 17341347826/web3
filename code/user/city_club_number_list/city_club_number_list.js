/**
 * Created by Administrator on 2018/3/5.
 */
define(["jquery",C.CLF('avalon.js'),'layer',
        C.Co("user","city_club_number_list/city_club_number_list","css!"),
        C.Co("user","city_club_number_list/city_club_number_list","html!"),
        C.CMF("router.js"),C.CMF("data_center.js"),C.CM('three_menu_module'),'jquery_print'
    ],
    function($,avalon,layer,css, html, x, data_center,three_menu_module,jquery_print) {
        //社团统计
        var api_get_info = api.growth+"communityManagement_communityStatistics";
        //社团导出
        var api_club_export = api.api+'GrowthRecordBag/export_communitys_count';
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "city_club_number_list",
                //身份判断
                highest_level:"",
                dataList:[],
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var cArr = [];
                        self.highest_level = data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        //获取社团个数string	2：按市级。3：按区县。4：按学校
                        ajax_post(api_get_info,{departmentleveltype:'2'},self);
                    });
                },
                //导出
                club_export:function(){
                    var url = api_club_export + '?token=' + sessionStorage.getItem('token') + '&departmentleveltype=' + 2 ;
                    window.open(url);
                },
                //打印
                club_printing:function(){
                    $('#print_content').print({
                        globalStyles:true
                    });
                },
                detail:function(e){
                    window.location='#leader_club_detail?&id='+e + '&departmentleveltype=' + 2;
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            // 社团统计数量
                            case api_get_info:
                                this.complete_get_info(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_get_info:function (data) {
                    this.dataList = data.data.list;
                },
                //js把时间戳转为为普通日期格式
                timeChuo:function(h){
                    var timestamp3 = h/1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function(format) {
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
                    var getTimeIs=newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                },
                go_href:function (num) {
                    if(num == 1){
                        window.location = "#city_club_number_list";
                    }else if(num == 2){
                        window.location = "#district_club_number_list";
                    }else{
                        window.location = "#school_club_number_list";
                    }
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
