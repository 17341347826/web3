/**
 * Created by Administrator on 2018/3/9.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_material/stu_evaluation', 'teacher_index_count/teacher_index_count', 'html!'),
        C.Co('evaluation_material/stu_evaluation', 'teacher_index_count/teacher_index_count', 'css!'),
        C.CMF("router.js"),
        C.CMF("data_center.js")
    ],
    function ($, avalon, layer, html, css, x, data_center) {
        //查询教师参考接口
        var api_index_count = api.api + "Indexmaintain/indexmaintain_reference";
        //获取指定日期段所属学年学期
        var api_date_part = api.user + 'semester/appoint_date_part';
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: 'teacher_index_count',
                //指标统计数量
                index_data: [],
                //请求参数
                req: {
                    //班级id	number	当guid为空时必传
                    class_id: Number(pmx.class_id),
                    //	学籍号	string	当guid不为空时（必传）
                    code: pmx.code,
                    //	学期结束时间	string	yyyy-MM-dd（必传）
                    end_date: '',
                    //学生guid	number	当对单个学生评价时必传（对多学生评价可不用传）
                    guid: Number(pmx.guid),
                    //考查项id	number	当guid为空时（必传）
                    item_id: '',
                    //学生姓名	string	当guid不为空时（必传）
                    name: pmx.name,
                    //评价项目id	number	（必传）
                    fk_plan_id: Number(pmx.project_id),
                    //学期开始时间	string	yyyy-MM-dd（必传）
                    start_date: '',
                    //学生性别	number	当guid不为空时（必传）
                    sex: Number(pmx.sex),
                    plan_level:Number(pmx.plan_level)
                },
                cd: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var cArr = [];
                        var tUserData = JSON.parse(data.data["user"]);
                        var start = pmx.pro_start_time.substr(0, 10);
                        var end = pmx.pro_end_time.substr(0, 10);
                        ajax_post(api_date_part, {end_date: end, start_date: start}, self);
                    })
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //指定日期段所属学年学期
                            case api_date_part:
                                this.complete_date_part(data);
                                break;
                            //    进度
                            case api_index_count:
                                this.complete_index_count(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_date_part: function (data) {
                    this.req.end_date = this.timeChuo(data.data.end_date);
                    this.req.start_date = this.timeChuo(data.data.start_date);
                    ajax_post(api_index_count, this.req.$model, this);
                },
                complete_index_count: function (data) {
                    this.index_data = data.data;
                },
                //js把时间戳转为为普通日期格式
                timeChuo: function (h) {
                    var timestamp3 = h / 1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function (format) {
                        var date = {
                            "M+": this.getMonth() + 1,
                            "d+": this.getDate(),
                            "h+": this.getHours(),
                            "m+": this.getMinutes(),
                            "s+": this.getSeconds(),
                            "q+": Math.floor((this.getMonth() + 3) / 3),
                            "S+": this.getMilliseconds()
                        };
                        if (/(y+)/i.test(format)) {
                            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
                        }
                        for (var k in date) {
                            if (new RegExp("(" + k + ")").test(format)) {
                                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                                    ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                            }
                        }
                        return format;
                    };
                    var getTimeIs = newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                }
            });
            vm.$watch('onReady', function () {
                this.cd();
            });
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    }
)