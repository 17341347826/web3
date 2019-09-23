/**
 * Created by uptang on 2017.04.28.
 */
/**
 * Created by ma weifeng on 2017.04.26.
 */
define(["lodash",
    C.CMF("request.js")
], function (_, request) {
    api_base = url_api_base + "base/";
    var api_send_token = api_base + "baseUser/sessionuser.action";
    var map = {
        bind: {},
        ulist: {}
    };

    function parseQuery(url) {
        var array = url.split("?"),
            query = {},
            path = array[0],
            querystring = array[1];
        if (querystring) {
            var seg = querystring.split("&"),
                len = seg.length,
                i = 0,
                s;
            for (; i < len; i++) {
                if (!seg[i]) {
                    continue;
                }
                s = seg[i].split("=");
                query[decodeURIComponent(s[0])] = decodeURIComponent(s[1]);
            }
        }
        return {
            path: path,
            query: query
        };
    };

    function consistQuery(args) {
        cnt = "";
        for (var i in args) {
            var sub = i + "=" + args[i].toString();
            if (cnt != "") {
                cnt += "&";
            }
            cnt += sub;
        }
        return cnt;
    }

    function set_key(key, value) {
        // var vtype = typeof(value);
        // var vary = ["number", "string", "boolean"];
        // if (vary.indexOf(vtype) >= 0) {
        //     var query = parseQuery(location.hash);
        //     query.query[key] = value;
        //     var pms = consistQuery(query.query);
        //     var new_hash = query.path + "?" + pms;
        //     location.hash = new_hash;
        // } else {
        window.sessionStorage.setItem(key, JSON.stringify(value));
        // }
    }

    function get_key(key) {
        var values = window.sessionStorage.getItem(key);
        // if (!values) {
        //     var query = parseQuery(location.hash);
        //     if (query.query.hasOwnProperty(key)) {
        //         return query.query[key];
        //     }
        // }
        return JSON.parse(values);
    }

    function remove_key(key) {
        window.sessionStorage.removeItem(key);
    }

    function ctrl(id) {
        return _.get(map.ulist, id);
    }

    var awoke_list = [];

    function wait_ready(id, cb) {
        var r = _.get(map.ulist, id);
        if(r != undefined)
            cb&&cb(r);
        else
            awoke_list.push({id: id, cb: cb});
    };

    function link_ctrl(id, who) {
        var ret = awoke_list.indexOf(id, function (data) {
            if (data.id == id)
                return true;
            return false;
        });
        if (ret != undefined) {
            setTimeout(ret, 0);
        }
        map.ulist[id] = who;
    }

    function remove_link(id) {
        delete map.ulist[id];
    }

    function get_sub_link(id) {
        var ret = [];
        _.forOwn(map.ulist, function (value, key) {
            if (_.startsWith(key, id) && key != id) {
                ret.push(value)
            }
        });
        return ret;
    }

    function get_user_info(cb) {
        if (map.hasOwnProperty("user_info")) {
            return cb(get_key("user_info"));
        }
        /**
         * 判断控制台中是否存在用户基本信息，没有就调用接口，有就直接用
         */
        var info = get_key('user_info');
        if(info){
            set_key("user_info",info);
            cb(info);
            return;
        }
        /**
         * 首次登陆，调用接口，存储数据到控制台
         * */
        var obj_ite = {
            on_request_complete: function (cmd, status, data, is_suc, msg) {
                if (is_suc) {
                    switch (cmd) {
                        case api_send_token:
                            this.complete_send_token(data);
                            break;
                    }
                } else {

                }
            },
            complete_send_token: function (data) {
                set_key("user_info", data);
                cb(data);
            }
        };
        ajax_post(api_send_token, {}, obj_ite);
    }

    return {
        set_key: set_key,
        get_key: get_key,
        remove_key: remove_key,
        link: link_ctrl,
        ctrl: ctrl,
        scope:wait_ready,
        remove_link: remove_link,
        get_sub_link: get_sub_link,
        uin: get_user_info,
        consistQuery: consistQuery,
        parseQuery: parseQuery
    };
});