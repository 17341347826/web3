define(["jquery",
        C.CLF('avalon.js'),
        "layer",
        C.Co("questionnaire_investigation", "add_papers/add_papers", "css!"),
        C.Co("questionnaire_investigation", "add_papers/add_papers", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, css, html, x, data_cente,tmm) {
        //创建问卷
        var api_add_get_papers = api.api + "ques_naire/save_questionnaire";
        //获取年级
        var api_get_grade = api.api + "base/class/school_class.action";
        //获取卷子详情
        var get_questionnaire_api = api.api + "ques_naire/get_questionnaire";

        var avalon_define = function (par) {
            var vm = avalon.define({
                $id: "add_papers",
                grade_info: 0,
                grade_list: [],
                data: {
                    _id: "",
                    // questio_list: [],
                    //问卷名称
                    ques_name: "",
                    //创建人
                    founder: "",
                    //创建单位
                    company_name: "",
                    //创建人guis
                    founder_guid: "",
                    //创建单位id
                    company_id: "",
                    //适用年级
                    grade_name: "",
                    //适用年级id
                    grade_id: "",
                    //使用主体
                    type: 0
                },
                ques_name: "",
                cb: function () {
                    var user = cloud.user_user();
                    this.data.founder = user.name;
                    this.data.company_name = user.school_name;
                    this.data.founder_guid = user.guid;
                    this.data.company_id = user.fk_school_id;
                    ajax_post(api_get_grade, {school_id: this.data.company_id}, this);
                },
                //切换年级
                gradeChange: function () {
                    var get_grade = this.grade_info;
                    if (get_grade != 0) {
                        this.data.grade_name = get_grade.split("|")[0];
                        this.data.grade_id = Number(get_grade.split("|")[1]);
                    } else {
                        this.data.grade_name = '';
                        this.data.grade_id = '';
                    }
                },
                add_papers: function () {
                    if (this.data.ques_name == '') {
                        toastr.warning('请填写问卷名称');
                        return
                    }
                    ajax_post(api_add_get_papers, this.data, this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //查年级
                            case api_get_grade:
                                this.grade_list = data.data;
                                this.is_update();
                                break;
                            //保存
                            case api_add_get_papers:
                                this.complete_add_get_papers(data);
                                break;
                            case get_questionnaire_api:
                                // this.data.ques_name = data.data[0].ques_name;
                                // this.data.type = data.data[0].type;
                                this.data = data.data[0];
                                break


                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                is_update: function () {
                    if (par.id) {
                        ajax_post(get_questionnaire_api,{_id:par.id},this);
                    }
                },
                complete_add_get_papers: function (data) {
                    window.location = "#papers_list";
                }

            });
            vm.$watch("onReady", function () {
                $(".am-dimmer").css("display", "none");
                this.cb();

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });