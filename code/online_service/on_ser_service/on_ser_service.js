/**
 * Created by uptang on 2017/9/4.
 */

define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("online_service", "on_ser_service/on_ser_service", "css!"),
        C.Co("online_service", "on_ser_service/on_ser_service", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js")
    ],
    function ($, avalon, css, html, layer, table, data_center) {

        var avalon_define = function (pxm) {
            //文件上传
            var api_file_uploader = api.api + "file/uploader";
            var session_url = api.sign + "/websocket/msg/register_session";
            var user_queue_url = api.sign + '/websocket/msg/get_user_queue';
            var list_queue_url = api.sign + '/websocket/msg/list_queue';
            var online_path = api.online_path;
            var vm = avalon.define({
                $id: "start",
                register_session_url: session_url,
                get_user_queue_url: user_queue_url,
                list_queue_url: list_queue_url,
                // path: "dev.xtyun.net/websocket",
                path:online_path,
                message: {
                    from: 0,
                    fromName: "测试客服",
                    to: 0,
                    text: "",
                },
                //用于等级用户session
                user: {
                    id: 0,
                    name: "测试客服",
                    num: ''
                },
                queue_number: 0,
                list_queue: [],
                self_currentdate: '',
                line_arr: [],
                user_map_arr: [],
                cb: function () {
                    this.file_uploader();
                    var self = this;
                    this.click_img();
                    data_center.uin(function (data) {
                        var get_user = JSON.parse(data.data.user);
                        self.message.from = get_user.guid;
                        self.message.fromName = get_user.name;
                        self.user.id = get_user.guid;
                        self.user.name = get_user.name;
                        self.user.num = get_user.account;
                        ajax_post(self.register_session_url, self.user.$model, self);
                        // ajax_post(self.person_list_api, {}, self);
                    });

                },
                //下一位
                next_user: function () {
                    //选择用户进行服务
                    ajax_post(this.get_user_queue_url, {
                        from: this.message.from,
                        fromName: this.message.fromName,
                    }, this);
                },
                list_arr: [],
                list_html: '',
                deal_list: function () {
                    var line = this.queue_number.line;
                    var user_map = this.queue_number.user_map;
                    this.list_arr = [];
                    var line_length = line.length;
                    // $('#person_list li').remove();
                    this.list_html = '';

                    for (var i = 0; i < line_length; i++) {
                        var key = line[i];
                        var num_show = false;
                        this.list_arr.push(user_map[key]);
                        this.list_html += '<li><a href="javascript:;"' +
                            ' ms-click="@choose_person(' + user_map[key].id + ')">' +
                            '<span class="rg-title">角色:</span>' + user_map[key].name + '<span' +
                            ' class="rg-title">账号：</span>' + user_map[key].num + '</a><span class="msg-num" ms-if="@user_map[key].msg_num!=0">' + user_map[key].msg_num + '</span></li>';
                    }
                },
                choose_person: function (id) {
                    ajax_post(this.get_user_queue_url, {
                        from: this.message.from,
                        fromName: this.message.fromName,
                        to: id
                    }, this);
                },
                msg_content: '',
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case this.list_queue_url:
                                this.queue_number = data.data;
                                this.deal_list();

                                break;
                            case this.register_session_url:
                                this.init()
                                break;
                            case this.get_user_queue_url:
                                // $("#chat-msg").find("li").remove();
                                if (data.data) {
                                    this.deal_offline(data);
                                } else {
                                    layer.msg("没有找到下一位")
                                }
                                break;
                            case api_file_uploader:

                                var v = '<img class="img-click" src="http://pj.xtyun.net/api/file/get?token=' + this.current_token + '&img=' + data.data.guid + '" ' +
                                    'style="max-width: 300px;" />';

                                v = v.replace(/#@_@#/ig, '***');
                                v = v.replace(/@#_#@/ig, '***');
                                var new_data = {};
                                new_data["from"] = this.message.from;
                                new_data["fromName"] = this.message.fromName;
                                new_data["to"] = this.message.to;
                                new_data["text"] = v;
                                if (this.message.to) {
                                    websocket.send(JSON.stringify(new_data));
                                    $("#chat-msg").append("<li class='send-msg'><span>" + new_data.fromName + "</span><p>" + new_data.text + "</p></li>");
                                    var h = $('.online-main .main-left')[0].scrollHeight;
                                    $('.online-main .main-left').scrollTop(h);

                                } else {
                                    layer.msg("没有服务对象")
                                }


                                break;
                        }
                    } else {
                        layer.msg('操作失败');
                    }
                },
                img_url: '',
                show_fade: false,
                click_img: function () {
                    var self = this;
                    // $(".img-click").dblclick(function (e) {
                    //     self.show_fade = true;
                    //     self.img_url = e.target.src;
                    // })
                    $("#msg").delegate("img", "dblclick", function (e) {
                        self.show_fade = true;
                        self.img_url = e.target.src;
                    });
                    $("#chat-msg").delegate("img", "dblclick", function (e) {
                        self.show_fade = true;
                        self.img_url = e.target.src;
                    });
                },
                close_fade: function () {
                    this.show_fade = !this.show_fade;
                },
                fade_img_click: function (event) {
                    event.stopPropagation();
                },
                websocket: undefined,
                heartbeat_timer: undefined,
                heartbeat_timer_1: undefined,
                deal_offline: function (data) {
                    this.message.to = data.data.to;
                    var offline_list = data.data.OffLine;
                    for (var i = 0; i < offline_list.length; i++) {
                        $("#chat-msg").append("<li class='receive-msg'><span>" + offline_list[i].fromName + "</span><p>" + offline_list[i].text + "</p></li>");
                    }
                    var h = $('.online-main .main-left')[0].scrollHeight;
                    $('.online-main .main-left').scrollTop(h);
                },
                on_remove: function () {
                    clearInterval(this.heartbeat_timer)
                    clearInterval(this.heartbeat_timer_1)
                    websocket.close()
                },
                init: function () {
                    var self = this;
                    this.getNowFormatDate();
                    if ('WebSocket' in window) {
                        websocket = new WebSocket("ws://" + this.path + "/csh?uid=" + this.message.from);
                    } else if ('MozWebSocket' in window) {
                        websocket = new MozWebSocket("ws://" + this.path + "/csh?uid=" + this.message.from);
                    } else {
                        websocket = new SockJS("http://" + this.path + "/csh?uid=" + this.message.from);
                    }
                    websocket.onopen = function (event) {
                        self.heartbeat_timer = setInterval(function () {
                            var data = {};
                            data["type"] = 1;
                            if (websocket.readyState == 1) {
                                websocket.send(JSON.stringify(data));
                                var time = new Date();
                            }
                        }, 3000);
                        self.heartbeat_timer_1 = setInterval(function () {
                            ajax_post(self.list_queue_url, {}, self);
                        }, 4000);
                    },
                        websocket.onmessage = function (event) {
                            var data = JSON.parse(event.data);
                            if (data.from != -1) {
                                $("#chat-msg").append("<li class='receive-msg'><span>" + data.fromName + "</span><p>" + data.text + "</p></li>");
                            } else {
                                $("#chat-msg").append("<li class='receive-msg form_1'><span>" + data.fromName + "</span><p>" + data.text + "</p></li>");
                            }
                            // self.click_img_chat();
                            var h = $('.online-main .main-left')[0].scrollHeight;
                            $('.online-main .main-left').scrollTop(h);

                        }
                    websocket.onerror = function (event) {
                        console.log("WebSocket:发生错误 ");
                        console.log(event);
                    }
                    websocket.onclose = function (event) {
                        console.log("WebSocket:已关闭");
                        console.log(event);
                    }
                },
                // click_img_chat:function () {
                //     var self = this;
                //     $("#chat-msg .img-click").dblclick(function (e) {
                //         self.show_fade = true;
                //         self.img_url = e.target.src;
                //     })
                // },
                files: [],
                current_token: '',
                file_uploader: function () {
                    var self = this;
                    var $uploaderInput = $("#uploaderInput");
                    $uploaderInput.on("change", function (e) {
                        var src, url = window.URL || window.webkitURL || window.mozURL, files = e.target.files;
                        for (var i = 0, len = files.length; i < len; ++i) {
                            var file = files[i];
                            if (url) {
                                src = url.createObjectURL(file);
                            } else {
                                src = e.target.result;
                            }
                            var fm = new FormData();
                            fm.append("file", file, file.name);
                            fm.append("note", "liaotian");
                            self.current_token = window.sessionStorage.getItem("token");
                            fm.append("token", self.current_token);
                            fileUpload(api_file_uploader, self, fm);
                            $("#uploaderInput").val('');

                        }
                        self.files = files;
                    });
                },
                sendMsg: function () {
                    var v = $("#msg").html();
                    //---------------
                    // $("#msg").append('<img src="http://pj.xtyun.net/api/file/get?token=56415340588d43a4b2bac4c6d4eed909&img=5a0d48a21992f7000fe6666b" ' +
                    //     'style="width: 100px;"/>')
                    //------------
                    var new_v = v.replace(/(^\s*)|(\s*$)/g, "");
                    if (!this.message.to) {
                        return;
                    }
                    if (new_v == "") {
                        return;
                    }
                    if (v == "") {
                        return;
                    } else {
                        v = v.replace(/#@_@#/ig, '***');
                        v = v.replace(/@#_#@/ig, '***');
                        var data = {};
                        data["from"] = this.message.from;
                        data["fromName"] = this.message.fromName;
                        data["to"] = this.message.to;
                        data["text"] = v;
                        if (this.message.to) {
                            websocket.send(JSON.stringify(data));
                            $("#chat-msg").append("<li class='send-msg'><span>" + data.fromName + "</span><p>" + data.text + "</p></li>");
                            var h = $('.online-main .main-left')[0].scrollHeight;
                            $('.online-main .main-left').scrollTop(h);
                            // $(".online-main").append("<div class='tmsg'><label class='name'>我&nbsp;"+this.getNowFormatDate()+"</label><div class='tmsg_text'>"+data.text+"</div></div>");
                            $("#msg").empty();
                        } else {
                            layer.msg("没有服务对象")
                        }
                    }
                },

                send: function (event) {
                    event = event || window.event;
                    if (event.keyCode == 13) {
                        event.preventDefault();
                        this.sendMsg();
                    }
                },
                clearAll: function () {
                    $("#content").empty();
                },
                getNowFormatDate: function () {
                    var date = new Date();
                    var seperator1 = "-";
                    var seperator2 = ":";
                    var month = date.getMonth() + 1;
                    var strDate = date.getDate();
                    if (month >= 1 && month <= 9) {
                        month = "0" + month;
                    }
                    if (strDate >= 0 && strDate <= 9) {
                        strDate = "0" + strDate;
                    }
                    this.self_currentdate = date.getHours() + seperator2 + date.getMinutes()
                }

            });
            vm.$watch('onReady', function () {
                vm.cb()
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define,
        }

    });