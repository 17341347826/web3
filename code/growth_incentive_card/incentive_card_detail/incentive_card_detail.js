/**
 * Created by Administrator on 2018/6/18.
 */
define(['jquery',C.CLF('avalon.js'),
        C.Co("growth_incentive_card","incentive_card_detail/incentive_card_detail",'css!'),
        C.Co("growth_incentive_card","incentive_card_detail/incentive_card_detail",'html!'),
        C.CMF("router.js"),C.CMF("data_center.js")
    ],
    function($,avalon, css, html, x, data_center) {
        //发放的标志卡详情
        var api_gain_card=api.api+"everyday/get_gain_card";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "incentive_card_detail",
                url_file:api.api + "file/get",//获取文件,
                //学生头像
                user_photo: cloud.user_photo,
                url_img:url_img,
                //区县名称
                district_name:'',
                //数据
                data_list:{},
                //身份
                user_type:'',
                //数据类型转换
                data_change:function(a){
                    return JSON.parse(a);
                },
                url_for: function(id) {
                    // console.log( this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id)
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                init:function () {
                    this.cb();
                },
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        //0：管理员；1：教师；2：学生；3：家长
                        var userType = data.data.user_type;
                        self.user_type = userType;
                        // 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var highest_level=data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        self.district_name=tUserData.district;
                        ajax_post(api_gain_card,{id:Number(pmx.id)},self);
                    });
                },
                //取消
                back:function(){
                    window.location = '#stu_oneself_card';
                },
                //返回
                return_back:function(){
                    window.location = '#incentive_card_see_list';
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_gain_card:
                                this.complete_gain_card(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_gain_card:function(data) {
                    var ary=[];
                    ary.push(data.data);
                    ready_photo(ary, "student_guid");
                    this.data_list=data.data;
                },
            });
            vm.init();
            return vm;
        }

        return {
            view: html,
            define: avalon_define
        }
    })