/**
 * Created by uptang on 2017/9/4.
 */

define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("online_service", "on_ser_user/on_ser_user", "css!"),
        C.Co("online_service", "on_ser_user/on_ser_user", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js"),
        C.CMF("router.js")
    ],
    function ($, avalon, css, html, layer, table, data_center, x) {
        var avalon_define = function (pxm) {
            //文件上传
            var api_file_uploader = api.api + "file/uploader";
            var session_url = api.sign + "/websocket/msg/register_session";
            var online_path = api.online_path;
            var vm = avalon.define({
                $id: "start",
                register_session_url: session_url,
                // path: "dev.xtyun.net/websocket",
                path:online_path,
                message: {
                    from: 0,
                    fromName: "测试用户",
                    to: 0,
                    text: "",
                    date: "",
                },
                user: {
                    id: this.from,
                    name: this.fromName,
                    num: ''
                },
                websocket: undefined,
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
                    });

                },
                msg_content: '',
                img_url: '',
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case this.register_session_url:
                                //建立链接
                                this.init()
                                break;
                            case api_file_uploader:
                                var v = '<img class="img-click"  src="http://pj.xtyun.net/api/file/get?token=' + this.current_token + '&img=' + data.data.guid + '" ' +
                                    'style="max-width: 300px;" />';
                                var new_data = {};
                                v = v.replace(/#@_@#/ig, '***');
                                v = v.replace(/@#_#@/ig, '***');
                                new_data["from"] = this.message.from;
                                new_data["fromName"] = this.message.fromName;
                                new_data["text"] = v;
                                websocket.send(JSON.stringify(new_data));
                                $("#chat-msg").append("<li class='send-msg'><span>" + new_data.fromName + "</span><p>" + new_data.text + "</p></li>");
                                var h = $('.online-main')[0].scrollHeight;
                                $('.online-main').scrollTop(h);

                                break;
                        }
                    } else {
                        layer.msg('操作失败');
                    }
                },
                show_fade: false,
                click_img: function () {
                    var self = this;
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
                heartbeat_timer_user: undefined,
                on_remove: function () {
                    clearInterval(this.heartbeat_timer_user)
                    websocket.close()
                },
                init: function () {
                    self = this;
                    this.getNowFormatDate();
                    if ('WebSocket' in window) {
                        websocket = new WebSocket("ws://" + this.path + "/myh?uid=" + this.message.from);
                    } else if ('MozWebSocket' in window) {
                        websocket = new MozWebSocket("ws://" + this.path + "/myh?uid=" + this.message.from);
                    } else {
                        websocket = new SockJS("http://" + this.path + "/myh?uid=" + this.message.from);
                    }

                    websocket.onopen = function (event) {
                        self.heartbeat_timer_user = setInterval(function () {
                            var data = {};
                            data["type"] = 1;
                            if (websocket.readyState == 1) {
                                websocket.send(JSON.stringify(data));
                                var time = new Date();
                            }
                        }, 3000);
                    },
                        websocket.onmessage = function () {
                            var data = JSON.parse(event.data);
                            if (data.from != -1) {
                                $("#chat-msg").append("<li class='receive-msg'><span>" + data.fromName + "</span><p>" + data.text + "</p></li>");
                            } else {
                                $("#chat-msg").append("<li class='receive-msg form_1'><span>" + data.fromName + "</span><p>" + data.text + "</p></li>");
                            }
                            // self.click_img_chat();
                            var h = $('.online-main')[0].scrollHeight;
                            $('.online-main').scrollTop(h);
                        },
                        websocket.onerror = function (event) {
                            console.log("WebSocket:发生错误 ");
                            console.log(event);
                        },
                        websocket.onclose = function (event) {
                            console.log("WebSocket:已关闭");
                            console.log(event);
                        }
                },

                sendMsg: function () {
                    var v = $("#msg").html();
                    var new_v = v.replace(/(^\s*)|(\s*$)/g, "");
                    if (new_v == "") {
                        return;
                    }
                    if (v == "") {
                        return;
                    } else {
                        var data = {};
                        v = v.replace(/#@_@#/ig, '***');
                        v = v.replace(/@#_#@/ig, '***');
                        data["from"] = this.message.from;
                        data["fromName"] = this.message.fromName;
                        data["text"] = v;
                        websocket.send(JSON.stringify(data));
                        $("#chat-msg").append("<li class='send-msg'><span>" + data.fromName + "</span><p>" + data.text + "</p></li>");
                        var h = $('.online-main')[0].scrollHeight;
                        $('.online-main').scrollTop(h);
                        $("#msg").empty();
                    }
                },

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
                            fm.append("note", "liao tian");
                            self.current_token = window.sessionStorage.getItem("token");
                            fm.append("token", self.current_token);
                            fileUpload(api_file_uploader, self, fm);
                            $("#uploaderInput").val('');
                        }
                        self.files = files;
                    });
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
                self_currentdate: '',
                getNowFormatDate: function () {
                    var date = new Date();
                    var seperator2 = ":";
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