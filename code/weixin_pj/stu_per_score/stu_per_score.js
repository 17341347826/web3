/**
 * Created by uptang on 2017/4/28.
 */

define(['jquery',
        C.CLF("avalon.js"),
        C.Co2("weixin_pj", "stu_per_score", "css!"),
        C.Co2("weixin_pj", "stu_per_score", "html!"),
        C.CMF("data_center.js"),
        C.CMF("viewer/viewer.js"),
        C.CMF("uploader/uploader.js"),
        "select2",
        C.CMF("formatUtil.js"),
    ],
    function ($, avalon, css, html, data_center, viewer, uploader, select2,formatUtil) {
        avalon.filters.code_format = function (str) {
            return '...'+str.substring(11);
        }
        var api_get_score=api.api+"everyday/statistics_score";
        var avalon_define = function () {
            var wx_daily_create = avalon.define({
                $id: "stu_per_score",
                data:{
                    offset: 0,
                    rows: 15,
                    fk_grade_id: "",
                    fk_class_id: "",
                    start_date:"",
                    end_date:""
                },
                grade_list:[],
                class_list:[],
                score_list:[],
                //时候显示滚动加载
                is_show_loader_more: true,
                //前一次请求的滚动条高度
                old_scroll_top: '',
                init: function () {
                    //获取用户信息
                    this.getUserMessage();
                    //滚动
                    this.init_date();
                    // this.init_load_more();
                    this.listen_scroll();
                },
                listen_scroll: function () {
                    var self = this;
                    var range = 100;
                    $(window).scroll(function () {
                        var srollPos = $(window).scrollTop();    //滚动条距顶部距离(页面超出窗口的高度)
                        totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
                        if(($(document).height()-range) <= totalheight ) {
                            if (self.score_list.length < self.data.rows+self.data.offset)
                                return;
                            self.data.offset += 15;
                            self.old_scroll_top = $(document).height()-range;
                            self.get_score_msg();
                        }
                    })
                },
                gradeChange:function () {
                    var gId=this.data.fk_grade_id;
                    var grade=this.grade_list;
                    for(var i=0;i<grade.length;i++){
                        var id=grade[i].grade_id;
                        if(id==gId){
                            this.class_list=grade[i].class_list;
                            this.data.fk_class_id=this.class_list[0].class_id;
                        }
                    }
                },
                init_date:function () {
                    var self = this;
                    $("#start_date").calendar({
                        onChange: function (p, values, displayValues) {
                            self.data.start_date = values[0];
                            self.get_score_msg();
                        }
                    });
                    $("#end_date").calendar({
                        onChange: function (p, values, displayValues) {
                            self.data.end_date = values[0];
                            self.get_score_msg();
                        }
                    });
                },
                classChange:function () {
                    this.get_score_msg();
                },
                getUserMessage:function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        var cArr = [];
                        if (userType == "1") {
                            var tUserData = JSON.parse(data.data["user"]);
                            if(tUserData.lead_class_list.length!=0){
                                cArr = tUserData.lead_class_list;
                            }else {
                                cArr = tUserData.teach_class_list;
                            }
                            self.grade_list = cArr;
                            self.class_list=cArr[0].class_list;
                            self.data.fk_grade_id=cArr[0].grade_id;
                            self.data.fk_class_id=cArr[0].class_list[0].class_id;
                            //获取卡片信息
                            self.get_score_msg();
                        }
                    });
                },
                get_detail:function (code) {
                    var detail_data = {
                        code:code,
                        end_date:this.data.end_date,
                        offset:this.data.offset,
                        rows:this.data.rows,
                        start_date:this.data.start_date,
                        status:5
                    }
                    window.location = "#stu_score_detail?detail_data=" +JSON.stringify(detail_data);
                },

                get_score_msg:function () {
                    $.showLoading();
                    ajax_post(api_get_score,this.data.$model,this);
                },
                init_load_more:function () {
                    var loading = false;  //状态标记
                    var self = this;
                    $(document.body).infinite().on("infinite", function() {
                        if(loading) return;
                        loading = true;
                        setTimeout(function() {
                            self.data.rows+=15;
                            self.get_score_msg();
                            loading = false;
                        }, 100);
                    });
                },
                uninit:function () {
                    $(window).unbind ('scroll');
                },
                jump_page:function (url) {
                    window.location.href = '#'+url;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_score:
                                this.complete_get_score(data);
                                break;
                            default:
                                break;
                        }
                    } else {
                        $.hideLoading();
                        $.alert(msg)
                    }
                },
                complete_get_score:function(data){
                    $.hideLoading();
                    this.score_list = this.score_list.concat(data.data.list);
                    this.is_show_loader_more = false;
                    if (this.old_scroll_top > 0) {
                        $(window).scrollTop(this.old_scroll_top);
                    }
                },
            });

            require(["jquery-weui"], function (j) {
                require(['swiper', 'city_picker'], function (a, b) {
                    wx_daily_create.init();
                })
            });
            return wx_daily_create;
        }


        return {
            view: html,
            define: avalon_define
        }
    });