/**
 * Created by Administrator on 2018/9/12.
 */
define([
        'jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_pj", "school_login/school_review_progress/school_review_progress", "css!"),
        C.Co("weixin_pj", "school_login/school_review_progress/school_review_progress", "html!"),
        C.CMF("data_center.js"),'jquery-weui','swiper', C.CMF("formatUtil.js")
    ],
    function ($,avalon, css,html, data_center,weui,swiper,formatUtil) {

        var avalon_define = function () {
            var review_api = api.api + "GrowthRecordBag/audit_reconsider_progress_school";
            var vm = avalon.define({
                $id: "school_review_progress",
                //当前学期
                cur_semester: '',
                //当前学期id
                semester_id: '',
                //学期开始时间
                semester_start_date: '',
                //当前年级id
                cur_grade_id: '',
                //当前学校id
                school_id: '',
                //上传材料
                sccl_list: [],
                //各班级审核进度
                gbj_list: [],
                //申诉复议数据
                ssfy_list: [],
                //年级进度
                grade_eval:[],
                //班级进度
                class_eval:[],
                init: function () {
                    this.semester_list = cloud.semester_all_list();
                    this.cur_semester = this.semester_list[0].value;
                    this.get_semester();
                    var grade_list = cloud.auto_grade_list();
                    this.grade_list = any_2_select(grade_list, {name: "grade_name", value: ["grade_id"]});
                    this.cur_grade_id = this.grade_list[0].value;
                    this.school_id = cloud.user_school_id();
                    this.get_review();
                },
                get_semester: function () {
                    var semester_arr = this.cur_semester.split('|');
                    this.semester_id = semester_arr[0];
                    this.semester_start_date = time_2_str(semester_arr[1]);
                },
                get_review: function () {
                    ajax_post(review_api, {
                        fk_grade_id: this.cur_grade_id,
                        fk_school_id: this.school_id,
                        fk_semester_id: this.semester_id,
                        semester_start_date: this.semester_start_date
                    }, this)
                },
                //学期改变
                semester_change: function () {
                    this.get_semester();
                    this.get_review();
                },
                //年级改变
                grade_change: function () {
                    this.get_review();
                },
                review_data: function (data) {
                    if (!data.data)
                        return;
                    // this.sccl_list = data.data.sccl_list;
                    // this.ssfy_list = data.data.ssfy_list;
                    // sort_by(this.sccl_list, ["+njmc"]);
                    // sort_by(this.ssfy_list, ["+njmc"]);
                    // this.gbj_list = data.data.gbj_list;
                    // sort_by(this.gbj_list, ["+bjmc"]);
                //    年级进度
                   var sccl_list = data.data.sccl_list;
                   var ssfy_list = data.data.ssfy_list;
                   for(var i=0;i<sccl_list.length;i++){
                       var name = sccl_list[i].njmc;
                       for(var j=0;j<ssfy_list.length;j++){
                           if(name = ssfy_list[j].njmc){
                               sccl_list[i].fywcl = ssfy_list[j].wcl;
                               break;
                           }
                       }
                   }
                //   年纪进度
                    this.grade_eval = sccl_list;
                    sort_by(this.grade_eval, ["+njmc"]);
                    //班级进度
                    var gbj_list = data.data.gbj_list;
                    var list = [];
                    for(var i=0;i<gbj_list.length;i++){
                        var obj = {};
                        obj.bjmc = gbj_list[i].bjmc;
                        //审核完成率
                        var wcl_ary = [gbj_list[i].sc_rcbx_wcl,gbj_list[i].sc_zhsj_wcl,gbj_list[i].sc_cjjl_wcl];
                        obj.wcl = this.average_wcl(wcl_ary);
                        // 复议完成率
                        var fy_ary = [gbj_list[i].rcbx_wcl,gbj_list[i].zhsj_wcl,gbj_list[i].cjjl_wcl,
                                      gbj_list[i].xycj_wcl,gbj_list[i].tzjk_wcl,gbj_list[i].jlk_wcl,
                                      gbj_list[i].xqpj_wcl,gbj_list[i].bypj_wcl];
                        obj.fy_wcl = this.average_wcl(fy_ary);
                        list.push(obj);
                    }
                    this.class_eval = list;
                    sort_by(this.class_eval, ["+bjmc"]);
                },
                //判断平均完成率，等于0的不参与计算
                average_wcl:function(data){
                    var count = 0;
                    var sum = 0;
                    for(var i=0;i<data.length;i++){
                        if(data[i]>0){
                            count++;
                            sum = sum+data[i];
                        }
                    }
                    if(count == 0)
                        return 0;
                    return sum/count;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case review_api:
                                this.review_data(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                }
            });

            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
