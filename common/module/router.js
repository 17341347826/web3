/**
 * Created by uptang on 2017.04.27.
 */

define([C.CLF('avalon.js'), "lodash"], function(avalon, _) {
    var partens = []
    var history = []
    var status = {
        status_continue: 1,
        status_break: 2,
    }

    function start(current) {
        require([C.CLF("mmRouter.js")], function(mmRouter) {
            avalon.history.start({
                root: current, //根路径
                html5: false, //是否使用HTML5 history
                hashPrefix: "", //
                autoScroll: false, //滚动
                fireAnchor: false
            })
        })

    }

    // 添加一个绝对匹配
    function add(url, func) {
        require([C.CLF("mmRouter.js")], function(mmRouter) {
            avalon.router.add(url, func)
        })
    }

    // 添加一个绝对匹配 - 也可以添加一个
    function add_depend(url, depend, func) {
        require([C.CLF("mmRouter.js")], function(mmRouter) {
            var vdp = depend;
            var vfun = func;
            avalon.router.add(url, function(a) {
                require(vdp, vfun);
            });
        })
        require([C.CLF("mmRouter.js")].concat((depend)), function(mmRouter) {})
    }

    // 轮训试监听
    function check_listen(path, query) {
        if (path[path.length - 1] == "/" || path[path.length - 1] == "\\")
            path = path.substr(0, path.length - 1)
        var rst = status.status_break;
        for (var x = 0; x < partens.length; x++) {
            var is_start_with = _.startsWith(path, partens[x].url)
                // var is_start_with = path.startsWith(partens[x].url);
            var is_equire = (path == partens[x].url);
            if ((path == "/" && partens[x].url == "/") || path == "" || _.startsWith(path, "/http:")) {
                rst = status.status_continue;
                path = "/";
                var subp = path.replace(partens[x].url, "");
                rst = partens[x].cb(subp, query);
                return status.status_break;
            } else if (partens[x].url == path && partens[x].url != "/") {
                rst = status.status_continue;
                //var subp = path.replace(partens[x].url, "");
                var subp = path;
                rst = partens[x].cb(subp, query);
                if (is_equire) {
                    return status.status_break;
                }
            }
        };
        return status.status_continue;
    }

    function check_history() {
        if (history.length != 0) {
            for (var x = 0; x < history.length; x++) {
                var ir = check_listen(history[x].path, history[x].query);
                if (ir == status.status_break) {
                    history.splice(x, 1);
                }
            }
        }
    }

    function listen_url(url, cb, who) {
        partens.push({
            url: url,
            cb: cb,
            who: who
        })
        check_history();
    }


    require([C.CLF("mmRouter.js")], function() {
        avalon.router.error(function(path, query) {
            var ret = check_listen(path, query);
            if (ret == status.status_continue) {
                history.push({ path: path, query: query })
            }
        });
    });


    function url_load(depend, cb) {
        return function(url, query) {
            var dp = depend;
            require(depend, function(page) {
                cb(url, query, page);
            });
        };
    }


    var last_histroy = ["", "", "", "", ""];
    var history_length = last_histroy.length;
    var old_url = "",
        new_url = "";
    window.addEventListener('hashchange', function(ev) {
        new_url = ev.newURL;
        new_url = new_url.substr(new_url.indexOf("#"), new_url.length);
        old_url = ev.oldURL;
        old_url = old_url.substr(old_url.indexOf("#"), old_url.length);
    });


    function on(url, pagejs, who) {
        listen_url(url, url_load([pagejs], function(url, query, page) {
            if (api.hasOwnProperty("router")) {

                var ori_url = location.hash;
                var current_history = window.history.length;
                api.current_url = location.hash;
                if (page.hasOwnProperty("define")) {
                    if (who.data.hasOwnProperty("ctrl")) {
                        if (who.data.ctrl != undefined)
                            if (who.data.ctrl.hasOwnProperty("on_remove")) {
                                who.data.ctrl.on_remove();
                            }
                    }

                    var current_index = who.data.page_index;
                    // -1 表示用户没有点前进或者后退
                    var offset_index = 0;
                    if (old_url == last_histroy[(current_index) % history_length] && old_url != "" && new_url == last_histroy[(current_index - 1) % history_length] && new_url != "") {
                        offset_index = -1;
                    } else if (old_url == last_histroy[(current_index) % history_length] && old_url != "" && new_url == last_histroy[(current_index + 1) % history_length] && new_url != "") {
                        offset_index = 1;
                    }

                    var dest_index = (current_index + offset_index);
                    if (offset_index == 0)
                        dest_index += 1;
                    dest_index %= history_length;
                    var dst_url = last_histroy[dest_index];
                    //console.info("操作码:", offset_index);
                    //if (offset_index == 0 || offset_index == -1 || dst_url == "") {
                    if (true) {
                        // 用户刷新了或者用户转转过来的
                        // 暂时无法关闭前进刷新问题
                        var control = page.define(query);
                        who.data.bodys[dest_index].view = "";
                        who.data.bodys[dest_index].view = page.view;
                        who.data.bodys[dest_index].ctrl = page.control;
                        who.data.bodys[dest_index].url = ori_url;
                        last_histroy[dest_index] = ori_url;
                    } else {
                        // 更新当前页面数据
                        if (api.com_set.hasOwnProperty(api.current_url)) {
                            for (var i in api.com_set[api.current_url]) {
                                api.com_set[api.current_url][i].refresh();
                            }
                        }
                    }
                    who.data.page_index = dest_index;
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                    new_url = "";
                    old_url = "";
                }
                changeData(page.date_input);
            } else {
                if (page.hasOwnProperty("define"))
                {
                    try{
                        if(who.ctrl!=null&&who.ctrl!=undefined&&who.ctrl.hasOwnProperty("uninit"))
                        who.ctrl.uninit();
                    }catch (exp){console.trace()};
                    who.ctrl=page.define(query);
                }


               // who.data.body = "";
                if(!jQuery.isEmptyObject(page)&&page!=""&&page!=undefined){
                    if(page.hasOwnProperty("repaint")&&page.repaint == true){
                        who.data.body.view = "";
                        //who.data.body.view += "<div></div>";
                    }
                    who.data.body = page;
                }

                changeData(page.date_input);
            }

        }));
    }

    function changeData(date_input) {
        if (date_input) {
            var $startDate = $("#" + date_input.startDate);
            var $endDate = $("#" + date_input.endDate);
            switch (date_input.type) {
                case 1:
                    //限制开始日期和结束日期的大小关系
                    date_custom_1($startDate, $endDate);
                    break;
                case 2:
                    //限制开始日期和结束日期的大小关系 && 限制未来日期的选择
                    date_custom_2($startDate, $endDate);
                    break;
                case 3:
                    date_custom_3($startDate);
            }
        }

    }
    //sessionStorage.getItem = function(kname) {};
    //sessionStorage.setItem = function(kname, kvalue) {};

    function date_custom_1($startDate, $endDate) {
        var nowTemp = new Date();
        var nowDay = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0).valueOf();
        var nowMoth = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), 1, 0, 0, 0, 0).valueOf();
        var nowYear = new Date(nowTemp.getFullYear(), 0, 1, 0, 0, 0, 0).valueOf();
        //开始时间
        $startDate.datepicker().on("changeDate.datepicker.amui", function(event) {
            var endDate = new Date($endDate.val().replace("-", "/"));
            var eventData = new Date(event.date);
            if (endDate) {
                if (event.date.valueOf() > endDate.valueOf()) {
                    layer.msg('开始日期应小于结束日期！');
                    $startDate.val("");
                } else {
                    $startDate.val(eventData.getFullYear() + "-" + (eventData.getMonth() + 1) + "-" + eventData.getDate());
                }
                $(this).datepicker('close');
            } else {
                $startDate.val(eventData.getFullYear() + "-" + (eventData.getMonth() + 1) + "-" + eventData.getDate());
            }
        });

        //结束时间
        $endDate.datepicker().on('changeDate.datepicker.amui', function(event) {
            var startDate = new Date($startDate.val().replace("-", "/"));
            var eventData = new Date(event.date);
            if (startDate) {
                if (event.date.valueOf() < startDate.valueOf()) {
                    layer.msg('结束日期应大于开始日期！');
                    $endDate.val("");
                } else {
                    $endDate.val(eventData.getFullYear() + "-" + (eventData.getMonth() + 1) + "-" + eventData.getDate());
                }
                $(this).datepicker('close');
            } else {
                $endDate.val(eventData.getFullYear() + "-" + (eventData.getMonth() + 1) + "-" + eventData.getDate());
            }
        });
    }

    function date_custom_2($startDate, $endDate) {
        var nowTemp = new Date();
        var nowDay = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0).valueOf();
        var nowMoth = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), 1, 0, 0, 0, 0).valueOf();
        var nowYear = new Date(nowTemp.getFullYear(), 0, 1, 0, 0, 0, 0).valueOf();
        //开始时间
        $startDate.datepicker(
            //禁用当前时间之后的时间
            {
                onRender: function(date, viewMode) {
                    // 默认 days 视图，与当前日期比较
                    var viewDate = nowDay;
                    switch (viewMode) {
                        // moths 视图，与当前月份比较
                        case 1:
                            viewDate = nowMoth;
                            break;
                            // years 视图，与当前年份比较
                        case 2:
                            viewDate = nowYear;
                            break;
                    }
                    return date.valueOf() > viewDate ? 'am-disabled' : '';
                }
            }
        ).on("changeDate.datepicker.amui", function(event) {
            var endDate = new Date($endDate.val().replace("-", "/"));
            var eventData = new Date(event.date);
            if (endDate) {
                if (event.date.valueOf() > endDate.valueOf()) {
                    layer.msg('开始日期应小于结束日期！');
                    $startDate.val("");
                } else {
                    $startDate.val(eventData.getFullYear() + "-" + (eventData.getMonth() + 1) + "-" + eventData.getDate());
                }
                $(this).datepicker('close');
            } else {
                $startDate.val(eventData.getFullYear() + "-" + (eventData.getMonth() + 1) + "-" + eventData.getDate());
            }
        });

        //结束时间
        $endDate.datepicker(
            //禁用当前时间之后的时间
            {
                onRender: function(date, viewMode) {
                    // 默认 days 视图，与当前日期比较
                    var viewDate = nowDay;
                    switch (viewMode) {
                        // moths 视图，与当前月份比较
                        case 1:
                            viewDate = nowMoth;
                            break;
                            // years 视图，与当前年份比较
                        case 2:
                            viewDate = nowYear;
                            break;
                    }
                    return date.valueOf() > viewDate ? 'am-disabled' : '';
                }
            }
        ).on('changeDate.datepicker.amui', function(event) {
            var startDate = new Date($startDate.val().replace("-", "/"));
            var eventData = new Date(event.date);
            if (startDate) {
                if (event.date.valueOf() < startDate.valueOf()) {
                    layer.msg('结束日期应大于开始日期！');
                    $endDate.val("");
                } else {
                    $endDate.val(eventData.getFullYear() + "-" + (eventData.getMonth() + 1) + "-" + eventData.getDate());
                }
                $(this).datepicker('close');
            } else {
                $endDate.val(eventData.getFullYear() + "-" + (eventData.getMonth() + 1) + "-" + eventData.getDate());
            }
        });
    }

    function date_custom_3($Date) {
        var nowTemp = new Date();
        var nowDay = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0).valueOf();
        var nowMoth = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), 1, 0, 0, 0, 0).valueOf();
        var nowYear = new Date(nowTemp.getFullYear(), 0, 1, 0, 0, 0, 0).valueOf();
        $Date.datepicker(
            //禁用当前时间之后的时间
            {
                onRender: function(date, viewMode) {
                    // 默认 days 视图，与当前日期比较
                    var viewDate = nowDay;
                    switch (viewMode) {
                        // moths 视图，与当前月份比较
                        case 1:
                            viewDate = nowMoth;
                            break;
                            // years 视图，与当前年份比较
                        case 2:
                            viewDate = nowYear;
                            break;
                    }
                    return date.valueOf() > viewDate ? 'am-disabled' : '';
                }
            }
        ).on('changeDate.datepicker.amui', function(event) {
            var eventData = new Date(event.date);
            $Date.val(eventData.getFullYear() + "-" + (eventData.getMonth() + 1) + "-" + eventData.getDate());

        });
    }

    function on_by_config(config, main, mod) {
        for (i in config) {
            var url = config[i];
            on(i, C.Co(mod, url), main);
        }
    }
    return {
        add: add,
        add_depend: add_depend,
        start: start,
        listen_url: listen_url,
        status: status,
        url_load: url_load,
        on: on,
        on_by_config: on_by_config
    }
})