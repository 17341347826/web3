/**
 * Created by uptang on 2017/5/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        C.Co("weixin_xy", "point_score/point_score", "css!"),
        C.Co("weixin_xy", "point_score/point_score", "html!"),

    ],
    function ($, avalon, css, html) {
        avalon.filters.get_int = function (data) {
            data = parseInt(data);
            return data
        };

        var avalon_define = function (par) {
            //获取小题得分列表
            var get_point_list_api = api.xy + "front/scoreAnalysis_questionAnalysis";
            var vm = avalon.define({
                $id: "point",
                //小题得分列表
                point_scores: [],
                init: function () {
                    this.get_point_list();
                },
                //获取小题得分列表
                get_point_list: function () {
                    var exam_id = par.exam_id;
                    var subject_code = par.subject_code;
                    $.showLoading();
                    ajax_post(get_point_list_api, {
                        exam_id: exam_id,
                        subject_code: subject_code
                    }, this)
                },
                //处理小题得分列表数据
                deal_points: function (data) {
                    if (!data.data)
                        return;
                    var data_length = data.data.length;
                    for (var i = 0; i < data_length; i++) {
                        var star = data.data[i].star;
                        star = parseInt(star);
                        var empty_star = 5 - star;
                        data.data[i].star_arr = new Array(star);
                        data.data[i].empty_arr = new Array(empty_star);
                        var first_name = data.data[i].question_name.substr(0, 2);
                        if (first_name == 'kg') {
                            data.data[i].question_name = '客观题_' + data.data[i].title;
                        } else {
                            data.data[i].question_name = '主观题_' + data.data[i].title;
                        }
                    }
                    this.point_scores = data.data;
                },
                //跳转到题目详情页面
                go_detail:function (el) {
                    var obj = el;
                    obj.exam_id = par.exam_id;
                    obj.subject_code = par.subject_code;
                    window.location = "#subject_detail?obj="+JSON.stringify(el);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (status == 200) {
                        switch (cmd) {
                            case get_point_list_api:
                                this.deal_points(data);
                                break;

                            default:
                                break;

                        }
                    } else {
                        $.alert(msg);
                    }
                    if(cmd==get_point_list_api){
                        $.hideLoading();
                    }
                }
            });
            require(["jquery_weui"], function (j) {
                vm.init();
            });

            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });