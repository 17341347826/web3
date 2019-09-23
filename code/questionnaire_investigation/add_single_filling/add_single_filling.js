define(["jquery",
        C.CLF('avalon.js'),
        "layer",
        C.Co("questionnaire_investigation","add_simple_question/add_simple_question","css!"),
        C.Co("questionnaire_investigation","add_single_filling/add_single_filling","css!"),
        C.Co("questionnaire_investigation","add_single_filling/add_single_filling","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.Co("notice", "create_notice/style", "css!"),
        C.CM("three_menu_module")

    ],
    function($,avalon,layer,css1,css2, html, x, data_center,css3,three_menu_module) {
        var avalon_define = function(par) {
            var vm = avalon.define({
                $id: "add_single_filling",
                //判断是编辑模式还是完成模式
                //每道题的标题名称
                simple_title:"请在此输入问题标题",
                //必答是否选中
                must_answer:true,
                //填写提示是否选中
                hinted:false,
                //填写提示信息
                prompt:"",
                post_data:{},
                q_index:'',
                //判断是否是编辑
                is_update:function () {
                    var session_question = data_center.get_key('question_obj')
                    if(session_question&&session_question!=''){
                        var question_msg_str = session_question;
                        var question_msg = JSON.parse(question_msg_str);
                        this.must_answer = question_msg.must;
                        this.prompt = question_msg.prompt;
                        this.question_type = question_msg.question_type;
                        this.simple_title = question_msg.title;
                        this.title_arr = question_msg.data;
                        this.hinted = question_msg.hinted;
                    }
                },
                //点击完成时
                complete_simple:function () {
                    if(this.hinted==false){
                        this.prompt="";
                    }
                    if(this.simple_title=='请在此输入问题标题' || $.trim(this.simple_title)==''){
                        toastr.warning('请完善题目');
                        return;
                    }
                    this.post_data = {
                        _id:'',
                        data:[{
                            answer:""
                        }],
                        must:this.must_answer,
                        prompt:this.prompt,
                        question_type:'单项填空题',
                        title:this.simple_title,
                        hinted:this.hinted,
                        q_index:this.q_index
                    };
                    this.save_question();
                },
                save_question:function () {
                    var post_data_str = JSON.stringify(this.post_data);
                    data_center.set_key('question_obj',post_data_str);
                    if(par.question_index){
                        window.location = "#add_topic?id="+par.paper_id+"&question_index="+par.question_index+"&scroll_height="+par.scroll_height;
                    }else {
                        window.location = "#add_topic?id="+par.paper_id;
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case save_question:

                                break;

                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                add_title:function () {
                    if(this.simple_title=='请在此输入问题标题'){
                        this.simple_title=' ';
                    }
                }
            });
            vm.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                this.is_update();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });