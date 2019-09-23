/**
 * Created by Administrator on 2018/1/25.
 */
define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_xy", "topic_analysis/topic_analysis", "css!"),
        C.Co("weixin_xy", "topic_analysis/topic_analysis", "html!"),
        C.CMF("data_center.js")
    ],
    function ($, avalon, css, html, data_center) {

        var avalon_define = function (par) {
            //获取题目解析列表
            var get_question_list_api = api.xy + "front/scoreAnalysis_questionList";
            //获取试卷图片
            var api_get_img = api.wy + "svc_error/ori_pull";
            //加入错题集
            var add_into_error_api = api.wr + "question";
            //获取小题得分
            var get_score_api = api.xy + "front/scoreAnalysis_questionScore";
            //获取试卷
            var get_ori_list_api = api.wy + "svc_error/get_paper_list";
            var vm = avalon.define({
                $id: "topic_analysis",
                question_list: [],
                detail_obj: {},
                tag: '',
                init: function () {
                    var guid = sessionStorage.getItem('guid');
                    // var guid = data_center.get_key('guid');
                    this.get_ori_list(guid);
                },
                //获取试卷原题答案图片
                get_ori_list: function (guid) {

                    var exam_code = par.exam_id;
                    var zkzh = guid;
                    var subject_code = par.subject_code;

                    //-------需删除------
                    // exam_code = 4;
                    // subject_code = 1;
                    // zkzh = '51010101';
                    //--------------------

                    ajax_post(get_ori_list_api, {
                        exam_code: exam_code,
                        zkzh: zkzh,
                        subject_code: subject_code
                    }, this)
                },
                //获取小题得分
                get_question_score: function (num) {
                    ajax_post(get_score_api, {
                        exam_id: par.exam_id,
                        question_name: this.detail_obj.question_name,
                        question_type: num,
                        subject_code: par.subject_code
                    }, this)
                },
                //获取题目解析列表
                get_question_list: function () {
                    $.showLoading();
                    ajax_post(get_question_list_api, {
                        exam_id: par.exam_id,
                        subject_code: par.subject_code
                    }, this)
                },
                //处理题目解析列表
                deal_question_list: function (data) {
                    if (!data.data)
                        return;
                    var list = data.data;
                    var list_length = list.length;
                    var guid = sessionStorage.getItem('guid');
                    // var guid = data_center.get_key('guid');
                    // var zg_arr = [];
                    // var kg_arr = [];
                    // //调整题目顺序
                    // for(var i=0;i<list_length;i++){
                    //     for(var j=0;j<list_length;j++){
                    //         if(list[j].title==i){
                    //             var type = list[i].question_name.substr(0, 2);
                    //             if(type=='kg'){
                    //                 kg_arr.push(list[j]);
                    //                 break;
                    //             }else {
                    //                 zg_arr.push(list[j]);
                    //                 break;
                    //             }
                    //         }
                    //     }
                    // }


                    //处理图片数据
                    for (var i = 0; i < list_length; i++) {
                        //1,2,3代表图片三种类型 1，大题2，我的答案3，题目解析
                        var question_name = list[i].question_name;
                        var first_name = question_name.substr(0, 2);
                        var title = '';
                        if (first_name == 'kg') {
                            title = '1-' + list[i].title;
                            list[i].question_name = '客观题_' + list[i].title;
                        } else {
                            title = '2-' + list[i].title;
                            list[i].question_name = '主观题_' + list[i].title;
                        }
                        var img_url = api_get_img + '/' + par.exam_id + '/' + par.subject_code + '/' +
                            this.tag + '/' + title + '/' + 1;
                        list[i].img_url = img_url;
                    }
                    this.question_list = list
                },


                go_detail: function (el) {
                    var obj = el;
                    obj.exam_id = par.exam_id;
                    obj.subject_code = par.subject_code;
                    window.location = "#subject_detail?obj=" + JSON.stringify(el);
                },
                //加入错题集
                add_into_error: function (el) {
                    this.detail_obj = el;
                    this.get_question_score('1');
                },
                into_error: function () {
                    // var name = this.detail_obj.question_name.substr(0, 2);
                    var questionType = '';
                    // if (name == 'kg') {
                    //     questionType = '选择题';
                    // } else {
                    //     questionType = '填空题';
                    // }
                    // var guid = data_center.get_key('guid');
                    var guid = sessionStorage.getItem('guid');
                    ajax_post(add_into_error_api, {
                        examId: par.exam_id,
                        knowledgeId: '',
                        knowledgeName: this.detail_obj.question_knowledge_level_2,
                        questionFromName: '',
                        questionName: this.detail_obj.question_name,
                        questionNumber: this.detail_obj.title,
                        questionType: questionType,
                        reasonId: '',
                        scoreGet: this.detail_obj.my_score,
                        scoreStandard: this.detail_obj.question_score,
                        studentNumber: guid,
                        studyStatus: '',
                        subjectCode: par.subject_code
                    }, this)
                },
                deal_score: function (data) {
                    if (!data.data)
                        return;
                    if (data.data.question_type == 1) {
                        this.detail_obj.my_score = data.data.score;
                        this.get_question_score('2');
                    } else {
                        this.detail_obj.question_score = data.data.score;
                        this.into_error();
                    }

                },

                deal_paper_tag: function (data) {
                    if (!data.data || data.data.length == 0) {
                        $.alert('无试卷信息');
                        // return;
                    }
                    this.tag = data.data[0];
                    // this.tag = tag.toUpperCase();
                    this.get_question_list();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case get_question_list_api:
                                this.deal_question_list(data);
                                break;
                            case add_into_error_api:
                                $.alert('加入成功');
                                break;
                            case get_score_api:
                                this.deal_score(data);
                                break;
                            case get_ori_list_api:
                                this.deal_paper_tag(data);
                                break
                        }
                    } else {
                        $.alert(msg);
                    }
                    if (cmd == get_question_list_api) {
                        $.hideLoading();
                    }

                }

            });
            require(["jquery_weui"], function (j) {
                vm.init();
            });
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    });