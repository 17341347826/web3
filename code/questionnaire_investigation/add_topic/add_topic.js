define(["jquery", C.CLF('avalon.js'), "layer",
        C.Co("questionnaire_investigation", "add_topic/add_topic", "css!"),
        C.Co("questionnaire_investigation", "add_topic/add_topic", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")

    ],
    function ($, avalon, layer, css, html, x, data_center,three_menu_module) {
        //获取卷子详情
        var get_questionnaire_api = api.api + "ques_naire/get_questionnaire";
        //往卷子中插入题，保存卷子
        var api_add_get_papers = api.api + "ques_naire/save_questionnaire";
        var avalon_define = function (par) {
            var vm = avalon.define({
                $id: "add_topic",
                simple_html: '',
                question_data: {},
                finish_edit:false,
                init: function () {
                    this.get_questionnaire();
                },
                get_questionnaire: function () {
                    if (par.id) {
                        ajax_post(get_questionnaire_api, {_id: par.id}, this);
                    }
                },
                //创建题目
                add_title: function (num) {
                    switch (num) {
                        case 2:
                            //添加单选题
                            this.add_simple_ques();
                            break;
                        case 3:
                            //添加多选题
                            this.add_multiple_ques();
                            break;
                        case 4:
                            //添加单项填空题
                            this.add_completion_ques();
                            break;
                        case 5:
                            //添加多项填空题
                            this.add_multiple_filling();
                            break;
                        case 6:
                            this.finish_editor();
                            break;
                    }
                },
                //添加单选题
                add_simple_ques: function () {
                    window.location = "#add_simple_question?paper_id=" + par.id;
                },
                //添加多选题
                add_multiple_ques: function () {
                    window.location = "#add_multiple_question?paper_id=" + par.id;
                },
                //添加单项填空题
                add_completion_ques: function () {
                    window.location = "#add_single_filling?paper_id=" + par.id;
                },
                //添加多项填空题
                add_multiple_filling: function () {
                    window.location = "#add_multiple_filling?paper_id=" + par.id;
                },
                //完成编辑
                finish_editor: function () {
                    var len = this.question_data.questio_list.length;
                    for(var i=0;i<len;i++){
                        this.question_data.questio_list[i].q_index = i+1;
                    }
                    this.finish_edit = true;
                    this.save_paper_fun();

                },
                //修改单选题
                update_simple_ques: function (question_index, type) {
                    var scroll_height = window.pageYOffset; //滚动条距顶端的距离
                    var question = this.question_data.questio_list[question_index];
                    var question_str = JSON.stringify(question);
                    var to_page = '';
                    switch (type) {
                        case '单选题':
                            to_page = "add_simple_question";
                            break;
                        case '多选题':
                            to_page = "add_multiple_question";
                            break;
                        case '单项填空题':
                            to_page = "add_single_filling";
                            break;
                        case '多项填空题':
                            to_page = "add_multiple_filling";
                            break;
                        default:
                            break;
                    }
                    data_center.set_key('question_obj', question_str);
                    window.location = "#" + to_page + "?paper_id=" + par.id + "&question_index=" + question_index + "&scroll_height=" + scroll_height;
                },

                copy_simple_que: function (index) {
                    var obj = this.question_data.questio_list[index];
                    this.question_data.questio_list.splice(index, 0, obj);
                    this.save_paper_fun();
                },

                del_simple_que: function (index) {
                    if (this.question_data.questio_list.length == 1) {
                        this.question_data.questio_list = [];
                        var obj = {
                            name: '---'
                        }
                        this.question_data.questio_list.push(obj);
                        this.save_paper_fun();
                        return
                    }
                    this.question_data.questio_list.removeAt(index);
                    this.save_paper_fun();

                },

                //将添加的题目放到试卷中
                add_qes_to_paper: function () {
                    var question_obj_session = data_center.get_key('question_obj')
                    if (question_obj_session && question_obj_session != '') {
                        var question_obj_str = question_obj_session;
                        var question_obj = JSON.parse(question_obj_str);
                        if (!this.question_data.questio_list) {
                            this.question_data.questio_list = [];
                        }
                        if (this.question_data.questio_list.length > 0) {
                            question_obj.q_index = this.question_data.questio_list.length;
                        } else {
                            question_obj.q_index = 0;
                        }

                        if (par.question_index) {
                            $("html,body").animate({scrollTop: par.scroll_height}, 10);
                            this.question_data.questio_list.set(parseInt(par.question_index), question_obj);
                        } else {
                            if (this.question_data.questio_list.length == 1 && this.question_data.questio_list[0].name == '---') {
                                this.question_data.questio_list.push(question_obj);
                                this.question_data.questio_list.removeAt(0);
                            } else {
                                this.question_data.questio_list.push(question_obj);
                            }
                            $("html,body").scrollTop($(".con").height());
                        }
                        this.save_paper_fun();
                        data_center.remove_key('question_obj')
                    }
                },
                save_paper_fun: function () {
                    ajax_post(api_add_get_papers, this.question_data, this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case get_questionnaire_api:
                                this.question_data = data.data[0];

                                if (!this.question_data.questio_list) {
                                    this.question_data.questio_list = [];
                                }
                                this.add_qes_to_paper();
                                break;
                            case api_add_get_papers:
                                if(this.finish_edit){
                                    window.location.href = "#papers_list"
                                }
                                break;
                            default:
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