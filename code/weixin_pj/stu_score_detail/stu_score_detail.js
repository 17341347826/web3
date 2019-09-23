/**
 * Created by uptang on 2017/4/28.
 */

define(['jquery',
        C.CLF("avalon.js"),
        C.Co2("weixin_pj", "stu_score_detail", "css!"),
        C.Co2("weixin_pj", "stu_score_detail", "html!"),
        "select2",
        C.CMF("formatUtil.js"),
        "jquery-weui"
    ],
    function ($, avalon, css, html, select2,formatUtil,weui) {
        var everyday_api = api.api + "everyday/get_list_everyday";//获取日常表现
        var url_file = api.api + "file/get";
        var avalon_define = function (par) {
            var wx_daily_create = avalon.define({
                $id: "stu_score_detail",
                is_open: false,
                open_index: -1,
                check_list: [],
                //时候显示滚动加载
                is_show_loader_more: true,
                post_data: {},
                //前一次请求的滚动条高度
                old_scroll_top: '',
                everyday_list: [],
                init: function () {
                    this.init_post_data();
                    this.init_swipper();
                    this.listen_scroll();
                },
                uninit:function () {
                    $(window).unbind ('scroll');
                },
                listen_scroll: function () {
                    var self = this;
                    var range = 100;
                    $(window).scroll(function () {
                        var srollPos = $(window).scrollTop();    //滚动条距顶部距离(页面超出窗口的高度)
                        totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
                        if(($(document).height()-range) <= totalheight ) {
                            if (self.everyday_list.length < self.post_data.rows+self.post_data.offset)
                                return;
                            self.post_data.offset += 15;
                            self.old_scroll_top = $(document).height()-range;
                            self.get_check_list();
                        }
                    })
                },
                init_post_data: function () {
                    this.post_data = JSON.parse(par.detail_data);
                    this.get_check_list();
                },
                url_for: function (id) {
                    return url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                init_swipper: function () {
                    $(".swiper-container").swiper({
                        loop: true,
                        autoplay: 3000
                    });
                },
                //获取列表数据
                get_check_list: function () {
                    $.showLoading();
                    ajax_post(everyday_api, this.post_data.$model, this)
                },
                open_hide: function (index) {
                    this.open_index = index;
                },
                close_hide: function () {
                    this.open_index = -1;
                },

                deal_every_msg: function (data) {
                    this.is_show_loader_more = false;
                    if (data.data != null && data.data !== '' && data.data.list.length > 0) {
                        var list = data.data.list;
                        // console.dir(this.everyday_list);
                        for (var i = 0,len=list.length; i < len; i++) {
                            list[i].attachment = JSON.parse(list[i].attachment);
                        }
                        this.everyday_list = this.everyday_list.concat(list);
                        // if ( this.everyday_list.length == data.data.count) {
                        //     $(document.body).destroyInfinite();
                        //     this.is_show_loader_more = false;
                        // }
                        if (this.old_scroll_top > 0) {
                            $(window).scrollTop(this.old_scroll_top);
                        }
                    }

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    $.hideLoading();
                    if (is_suc) {
                        switch (cmd) {
                            case everyday_api:
                                this.deal_every_msg(data);
                                break;
                        }
                    } else {
                        this.is_show_loader_more = false;
                        $.hideLoading();
                        $.alert(msg)
                    }
                }

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