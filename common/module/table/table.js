/**
 * Created by uptang on 2017/4/28.
 */
define([
        C.CLF('avalon.js'),
        C.CLF('base64.js'),
        C.CM("table", "css!"),
        C.CM("table", "html!"),
        "jquery"
    ],
    function (avalon, bs64, css, html, $) {

        function parseQuery(url) {
            if (url == null) {
                return {
                    path: "",
                    query: ""
                }
            }
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
            path = path.replace("#", "");
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

        var detail = avalon.component('ms-ele-table', {
            template: html,
            defaults: {
                // 数据接口
                url: "",
                is_init: true,
                //传值
                data: {
                    offset: "",
                    rows: ""
                },
                params: {},
                //附加参数
                extend: {},
                //表头
                theadTh: [],
                //表内容
                tbodyTd: [],
                // 数据总数
                count: "",
                /*总页数*/
                totalPage: "",
                // 计算分页
                totalPageArr: [],
                /*当前是第几页*/
                currentPage: 0,
                //第几页时错误的提示语
                pageNoMsg: "",
                pageNo: "",
                remember: true,
                only_hash: false,
                //
                offset: 0,
                exclude_rem: ["student_performance_score"],
                msg: "",
                is_init: false,
                table_list: [],
                onInit: function (e) {

                },
                onReady: function () {


                    var who = this;
                    var hash_key = sessionStorage.getItem("table_params");
                    var qbs = parseQuery(location.hash);
                    if (this.exclude_rem.indexOf(qbs.path) >= 0) {
                        hash_key = sessionStorage.getItem("hi:" + qbs.path);
                    }

                    var table_hash = parseQuery(hash_key);
                    if (table_hash.query.hasOwnProperty("p") && this.remember && table_hash.path == qbs.path) {
                        this.is_init = true;
                        if (table_hash.query.hasOwnProperty("pms")) {
                            var pms = table_hash.query.pms;
                            var dpms = bs64.decoder(pms);
                            if (pms.length > 0) {

                                var cp_pms = dpms;
                                for (var i = dpms.length - 1; i >= 0; i--) {
                                    if (dpms[i] == 0) {
                                        cp_pms.splice(i, 1);
                                    } else {
                                        break;
                                    }
                                }

                                pms = String.fromCharCode.apply(String, cp_pms);
                                dpms = JSON.parse(pms);
                                for (var it in dpms) {
                                    this.extend[it] = dpms[it];
                                }
                            }
                        }
                        this.currentPage = Number(table_hash.query["p"]);
                    }

                    if (table_hash.path != qbs.path) {
                        sessionStorage.setItem("table_params", "");
                    }

                    for (var x in this.extend.$model) {
                        if (x != "__hash__") {
                            this.$watch("extend." + x, function () {
                                if (!this.only_hash)
                                    who.currentPageDate(0);
                            });
                        }
                    }
                    if (this.extend.hasOwnProperty("__hash__")) {
                        this.$watch("extend.__hash__", function () {
                            who.currentPageDate(0);
                        });
                    }

                    if (this.is_init) {
                        this.currentPageDate(this.currentPage);
                    }
                },
                onDispose: function () {
                    //console.info("remove_dom_tree");

                },
                setIndex: function (index, currentPage) {
                    index = index + currentPage * this.data.rows;
                    return index;
                },
                //显示整个数据
                showDate: function (col_confi, row_data) {
                    if (col_confi.type == "html") {
                        return col_confi.from;
                    }
                    if (col_confi.type == "list") {
                        var new_arr = [];
                        var name = col_confi.use_name;
                        var data = row_data[col_confi.from];
                        var length = data.length;
                        if (length == 0) {
                            return new_arr;
                        } else {
                            for (var i = 0; i < length; i++) {
                                new_arr.push(data[i][name])
                            }
                            new_arr = new_arr.join(",");
                            return new_arr
                        }


                    }
                    if (col_confi.type == "cover_text") {
                        return col_confi.dict[row_data[col_confi.from]];
                    }
                    return row_data[col_confi.from]
                },
                on_request_complete: function (cmd, status, resp, is_suc, msg) {
                    this.is_init = true;
                    //console.info("table data recv");
                    if (!is_suc) {
                        this.msg = msg;
                        return;
                    } else {
                        if (!resp.data) {
                            resp.data = {};
                            resp.data['list'] = [];
                        }
                        var self = this;
                        this.tbodyTd = resp.data.list;
                        // 数据总数
                        this.count = resp.data.count;
                        if (this.count == 0) {
                            this.msg = "暂时没有数据";
                        }
                        this.setTotalPage();
                    }
                },

                /*设置总页数*/
                setTotalPage: function () {
                    if (this.count == 0) {
                        this.totalPage = 1;
                        this.totalPageArr = new Array(this.totalPage);
                    } else {
                        if (this.count % this.data.rows == 0) {
                            this.totalPage = Math.floor(this.count / this.data.rows);
                        } else {
                            this.totalPage = (Math.floor(this.count / this.data.rows)) + 1;
                        }
                        if (this.totalPage >= 5) {
                            this.totalPageArr = this.page_data(this.currentPage, 5);
                        } else {
                            this.totalPageArr = this.page_data(this.currentPage, this.totalPage);
                        }
                    }
                },
                page_data: function (current_index, element_count) {
                    var x = 0,
                        y = current_index,
                        z = 0;
                    var x_len = 0,
                        y_len = 0;
                    if (element_count % 2 == 0) {
                        x_len = element_count / 2;
                        y_len = element_count / 2 - 1
                    } else {
                        x_len = (element_count - 1) / 2;
                        y_len = x_len
                    }
                    x = y - x_len;
                    z = y + y_len;
                    if (x < 0 && z >= this.totalPage)
                        return new Array(this.totalPage);
                    var over_x = 0 - x > 0 ? 0 - x : 0;
                    z += over_x;
                    if (z >= this.totalPage) {
                        var over_y = z - this.totalPage + 1;
                        z = this.totalPage;
                        x -= over_y;
                    }
                    x = x > 0 ? x : 0;
                    this.offset = x;
                    return new Array(element_count)
                },
                refresh: function () {
                    this.currentPageDate(this.currentPage);
                },
                // 取数据
                currentPageDate: function (ind) { //0,1,2
                    this.is_init = false;
                    this.currentPage = ind;
                    if (this.remember) {
                        var qbs = parseQuery(location.hash);
                        qbs.query["p"] = ind;
                        var jrt = JSON.stringify(this.extend.$model);
                        jrt = bs64.encoder(jrt);
                        qbs.query["pms"] = jrt;
                        var pms = consistQuery(qbs.query);
                        //location.hash = qbs.path + "?" + pms;
                        qbs.path = qbs.path.replace("#", "");
                        //avalon.history.pause();
                        //avalon.history.setHash(qbs.path + "?" + pms, false);
                        var nhash = qbs.path + "?" + pms;
                        var key = "table_params";
                        if (this.exclude_rem.indexOf(qbs.path) >= 0) {
                            key = "hi:" + qbs.path;
                        }
                        sessionStorage.setItem(key, nhash);
                        // console.info("hash:", nhash);
                        // location.hash = nhash;
                        // avalon.history.continue();
                    }
                    //console.info(location.hash);
                    this.data.offset = ind * this.data.rows; //开始记录数
                    var form = {};
                    form.offset = this.data.offset;
                    form.rows = this.data.rows;
                    form = $.extend(form, this.extend);
                    if (form.hasOwnProperty("__hash__")) {
                        delete form.__hash__;
                    }
                    this.msg = "数据正在加载中...";
                    ajax_post(this.url, form, this);
                    // //替换url
                    // var par ={}
                    // for(var k in form){
                    //     par[k]=form[k]
                    // }
                    // par = JSON.stringify(par);
                    // _url =  window.location.hash
                    // index  = _url.indexOf("?")
                    // window.location.hash=window.location.hash.substring(0,index< 0 ? _url.length : index)+"?tab="+par
                    this.pageNoMsg = ""
                },
                getUrlParam: function (name) {
                    var str = location.href; //取得整个地址栏
                    var num = str.indexOf("?")
                    if (num > 0) {
                        str = str.substr(num + 1); //取得所有参数   stringvar.substr(start [, length ]
                        //构造一个含有目标参数的正则表达式对象
                        var reg = new RegExp("(^|&)" + name + "=([^&]*)(|&$)");
                        var r = str.match(reg);
                        if (r != null) return unescape(r[2]);
                        return null;
                    }
                    return null
                },
                pageNOSure: function (num) {
                    var reg = /^[1-9]*[1-9][0-9]*$/;
                    var ind = Number($.trim(num));
                    var numReg = reg.test(ind);
                    if (numReg) {
                        if (ind > 0) {
                            if (ind <= this.totalPage) {
                                this.currentPageDate(ind - 1);
                            } else {
                                this.pageNoMsg = "请输入小于总页数" + this.totalPage + "的正整数";
                                toastr.warning("请输入小于总页数" + this.totalPage + "的正整数");
                            }
                        } else {
                            this.pageNoMsg = "请输入大于1的正整数";
                            toastr.warning("请输入大于1的正整数");
                        }
                    } else {
                        this.pageNoMsg = "请输入正整数";
                        toastr.warning("请输入正整数");
                    }
                },
                msgNull: function () {
                    this.pageNoMsg = "";
                },
                cbopt: function (params) {
                },
                oncbopt: function (params) {
                    params.data = this.tbodyTd[params.current];
                    this.cbopt(params)
                },
            }
        });


        var make_custom_column = function (ary) {
            var max_column_count = 0;
            for (var i = 0; i < ary.length; i++) {
                if (max_column_count < ary[i].length) max_column_count = ary[i].length;
            }

            var table_html = "<table class='am-table'><thead>";
            for (var i = 0; i < ary.length; i++) {
                var col_span = max_column_count - ary[i].length + 1;
                table_html += "<tr>";
                for (var x = 0; x < ary[i].length; x++) {
                    table_html += "<td" + " colspan='" + col_span + "'>";
                    table_html += ary[i][x];
                    table_html += "</td>";
                }
                table_html += "</tr>";
            }
            table_html += "</thead></table>";

            return table_html;
        };
        var make_body_column = function (ary) {
            var max_column_count = 0;
            for (var i = 0; i < ary.length; i++) {
                if (max_column_count < ary[i].length) max_column_count = ary[i].length;
            }

            var table_html = "<table><tbody>";
            for (var i = 0; i < ary.length; i++) {
                var col_span = max_column_count - ary[i].length + 1;
                table_html += "<tr>";
                for (var x = 0; x < ary[i].length; x++) {
                    table_html += "<td" + " colspan='" + col_span + "'>";
                    table_html += ary[i][x];
                    table_html += "</td>";
                }
                table_html += "</tr>";
            }
            table_html += "</tbody></table>";
            // console.info(table_html);
            return table_html;
        };

        return {
            make_custom_column: make_custom_column,
            make_body_column: make_body_column
        }
    });