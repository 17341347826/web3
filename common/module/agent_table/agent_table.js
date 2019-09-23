/**
 * Created by uptang on 2017/4/28.
 */
define([
        C.CLF('avalon.js'),
        C.CLF('base64.js'),
        C.CM("agent_table", "css!"),
        C.CM("agent_table", "html!"),
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
        //table_agent_render_html
        var url_render_table = api.api +"render/table_agent_render_html";
        var detail = avalon.component('ms-ele-agent-table', {
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
                //
                pipe:[],
                //表头
                header: [],
                pageNo:1,
                no_bind:false,
                currentPage:0,
                remember: false,
                only_hash: false,
                table_html: "",
                offset: 0,
                exclude_rem: ["student_performance_score"],
                msg: "",
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

                refresh: function () {
                    this.currentPageDate(this.currentPage);
                },
                // 取数据
                currentPageDate: function (ind) { //0,1,2

                    this.currentPage = ind;
                    if (this.remember) {
                        var qbs = parseQuery(location.hash);
                        qbs.query["p"] = ind;
                        var jrt = JSON.stringify(this.extend.$model);
                        jrt = bs64.encoder(jrt);
                        qbs.query["pms"] = jrt;
                        var pms = consistQuery(qbs.query);

                        qbs.path = qbs.path.replace("#", "");

                        var nhash = qbs.path + "?" + pms;
                        var key = "table_params";
                        if (this.exclude_rem.indexOf(qbs.path) >= 0) {
                            key = "hi:" + qbs.path;
                        }
                        sessionStorage.setItem(key, nhash);

                    }


                    var form ={
                        pms_pool:{},
                        header:this.header.$model,
                        pipe:this.pipe.$model
                    }

                    var self = this;
                    form.pms_pool = $.extend(form.pms_pool, self.extend);
                    form.pms_pool.current_page = this.currentPage;
                    form.pms_pool.offset = this.data.rows * this.currentPage;
                    form.pms_pool.rows = this.data.rows;
                    form.header = this.header.$model;

                    $.ajax({
                        method: "POST",
                        url: url_render_table,
                        contentType: "application/json",
                        data: JSON.stringify(form),
                        beforeSend: function (xhr) {
                            var token = window.sessionStorage.getItem("token");
                            if (token != undefined && token != "")
                                xhr.setRequestHeader('Token', token);
                        }, //这里设置header
                        success: function (repsData, statusCode, xhr) {
                            // if(self.no_bind)
                            //     $("#ht").html(repsData);
                            // else
                            //    self.table_html = repsData;
                            self.table_html = repsData;
                        },
                        error: function (repsData, status, xhr) {
                            x = 1;
                            x = 2;
                        }
                    })


                    this.pageNoMsg = ""
                },

                pageNOSure: function (num) {
                    var v = $(".divide-page span:nth-child(3)").text();
                    var total_page = Number(v.substr(1, v.length-2));
                    var reg = /^[1-9]*[1-9][0-9]*$/;
                    var ind = Number($.trim(num));
                    var numReg = reg.test(ind);
                    if (numReg) {
                        if (ind > 0) {
                            if (ind <= total_page) {
                                this.currentPageDate(ind - 1);
                            } else {
                                this.pageNoMsg = "请输入小于总页数" + total_page + "的正整数";
                                toastr.warning("请输入小于总页数" + total_page + "的正整数");
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
                  //  params.data = this.tbodyTd[params.current];
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