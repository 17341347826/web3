/**
 * Created by Administrator on 2018/1/25.
 */
define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_xy", "subject_detail/subject_detail", "css!"),
        C.Co("weixin_xy", "subject_detail/subject_detail", "html!"),
        C.CMF("data_center.js")
    ],
    function ($, avalon, css, html, data_center) {
        var avalon_define = function (par) {
            //获取试卷图片
            var api_get_img = api.wy + "svc_error/ori_pull";
            //获取我的答案图片
            var get_ans_img_api = api.wy+"svc_error/paper_pull";
            //获取客观题答案
            var get_ans_api = api.xy + "front/scoreAnalysis_objPersonalAnswer";
            //加入错题集
            var add_into_error_api = api.wr + "question";
            //获取小题知识点
            var get_knowledge_api = api.xy + "front/scoreAnalysis_questionKnowledge";
            //获取小题得分
            var get_score_api = api.xy +"front/scoreAnalysis_questionScore";
            //获取试卷
            var get_ori_list_api = api.wy + "svc_error/get_paper_list";
            var vm = avalon.define({
                $id: "subject_detail",
                //大题图片
                subject_img: '',
                //答案图片
                ans_img: '',
                //解析图片
                analysis_img: '',
                //详情数据对象
                detail_obj: {},
                //题目类型 1，客观题 2主观题
                title_type: 1,
                //答案
                kg_value: '',
                //图片浏览器
                photos_b: '',
                ans_obj: {},
                guid:'',
                init: function () {
                    var obj = JSON.parse(par.obj);
                    this.guid = sessionStorage.getItem('guid');
                    // this.guid = data_center.get_key('guid');
                    this.get_ori_list(obj);
                    if (!obj.question_knowledge_level_2)
                        obj.question_knowledge_level_2 = '';
                    if (!obj.question_score)
                        obj.question_score = '';
                    if (!obj.my_score)
                        obj.my_score = '';

                    this.detail_obj = obj;
                    var name = this.detail_obj.question_name.substr(0, 2);
                    if (name == 'kg' ||name=='客观') {
                        this.get_ans(get_ans_api);
                    } else {
                        this.title_type = 2;
                    }

                    if (this.detail_obj.question_knowledge_level_2 == '') {
                        this.get_knowledge();
                    }
                    if(this.detail_obj.my_score==''){
                        this.get_question_score('1');
                    }
                    if(this.detail_obj.question_score==''){
                        this.get_question_score('2');
                    }

                },
                //获取试卷原题答案图片
                get_ori_list: function (obj) {

                    var exam_code = obj.exam_id;
                    var zkzh = this.guid;
                    var subject_code = obj.subject_code;

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
                get_question_score:function (num) {
                    var q_name = this.get_q_name();
                    ajax_post(get_score_api,{
                        exam_id:this.detail_obj.exam_id,
                        question_name:q_name,
                        question_type:num,
                        subject_code:this.detail_obj.subject_code
                    },this)
                },
                get_q_name:function () {
                    var name = this.detail_obj.question_name.substr(0,3);
                    var no = this.detail_obj.question_name.substr(3);
                    var q_name = ''
                    if(name=='kg'||name=='客观'){
                        q_name = 'kg'+no;
                    }else {
                        q_name = 'zg'+no
                    }
                    return q_name;
                },
                //获取知识点
                get_knowledge: function () {
                    var q_name = this.get_q_name();
                    ajax_post(get_knowledge_api, {
                        exam_id: this.detail_obj.exam_id,
                        question_name:q_name ,
                        subject_code: this.detail_obj.subject_code
                    }, this)
                },
                //获取客观题答案
                get_ans: function (url) {
                    var q_name = this.get_q_name();
                    ajax_post(url, {
                        exam_id: this.detail_obj.exam_id,
                        question_name: q_name,
                        subject_code: this.detail_obj.subject_code
                    }, this)
                },
                get_img: function (guid) {
                    //1,2,3代表图片三种类型 1，大题2，我的答案3，题目解析
                    var question_name = this.detail_obj.question_name;
                    var first_name = question_name.substr(0, 2);
                    var title = '';
                    if (first_name == 'kg' || first_name=='客观') {
                        title = '1-' + this.detail_obj.title;
                    } else {
                        title = '2-' + this.detail_obj.title;
                    }
                    this.subject_img = api_get_img + '/' + this.detail_obj.exam_id + '/' +
                        this.detail_obj.subject_code + '/' + this.tag + '/' + title + '/' + 1;

                    //-------需删除------
                    // guid = '51010101';
                    //--------------------
                    this.ans_img = get_ans_img_api + '/' + this.detail_obj.exam_id + '/' +
                        this.detail_obj.subject_code + '/' + guid + '/' + title;

                    this.analysis_img = api_get_img + '/' + this.detail_obj.exam_id + '/' +
                        this.detail_obj.subject_code + '/' + this.tag + '/' + title + '/' + 2;

                    if (!this.detail_obj.title) {
                        this.subject_img = 'common/images/xy/test.png';
                        this.ans_img = 'common/images/xy/test.png';
                        this.analysis_img = 'common/images/xy/test.png';
                    }
                    var img_arr = [];
                    img_arr.push(this.subject_img);
                    img_arr.push(this.ans_img);
                    img_arr.push(this.analysis_img);
                    this.photo_browser(img_arr);
                },
                //初始化图片浏览器
                photo_browser: function (img_arr) {
                    this.photos_b = $.photoBrowser({
                        items: img_arr
                    });
                },
                check_img: function (img_index) {
                    this.photos_b.open(img_index);
                },
                //处理个人答案答案
                deal_ans: function (data) {
                    if (!data.data)
                        return;
                    var arr = this.detail_obj.question_name.split('-');
                    if(arr.length<2){
                        arr = this.detail_obj.question_name.split('_');
                    }
                    var key = 'kg_value_' + arr[1];
                    this.kg_value = data.data[key];
                },

                //加入错题集
                add_into_error: function () {
                    var questionType = '';
                    var guid = sessionStorage.getItem('guid');
                    var q_name = this.get_q_name();
                    ajax_post(add_into_error_api, {
                        examId: this.detail_obj.exam_id,
                        knowledgeId: '',
                        knowledgeName: this.detail_obj.question_knowledge_level_2,
                        questionFromName: '',
                        questionName: q_name,
                        questionNumber: this.detail_obj.title,
                        questionType: questionType,
                        reasonId: '',
                        scoreGet: this.detail_obj.my_score,
                        scoreStandard: this.detail_obj.question_score,
                        studentNumber: guid,
                        studyStatus: '',
                        subjectCode: this.detail_obj.subject_code
                    }, this)
                },
                //获取知识点数据
                deal_knowledge: function (data) {
                    if (!data.data)
                        return;
                    this.detail_obj.question_knowledge_level_2 = data.data.question_knowledge_level_2;
                },
                //处理小题得分数据
                deal_score:function (data) {
                    if(!data.data)
                        return;
                    if(data.data.question_type==1){
                        this.detail_obj.my_score = data.data.score;
                    }else {
                        this.detail_obj.question_score = data.data.score;
                    }
                },
                deal_paper_tag: function (data) {
                    if (!data.data || data.data.length == 0) {
                        $.alert('无试卷信息');
                    }
                    this.tag = data.data[0];
                    this.get_img(this.guid);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case get_ans_api:
                                this.deal_ans(data);
                                break;
                            case add_into_error_api:
                                $.alert('加入成功');
                                break;
                            case get_knowledge_api:
                                this.deal_knowledge(data);
                                break;
                            case get_score_api:
                                this.deal_score(data);
                                break;
                            case get_ori_list_api:
                                this.deal_paper_tag(data);
                                break;
                        }
                    } else {
                        $.alert(msg);
                    }

                }

            });
            require(["jquery_weui"], function () {
                require(["swiper"], function () {
                    vm.init();
                });

            });
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    });