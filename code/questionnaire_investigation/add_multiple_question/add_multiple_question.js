define(["jquery",
        C.CLF('avalon.js'),
        "layer",
        C.Co("questionnaire_investigation", "add_simple_question/add_simple_question", "css!"),
        C.Co("questionnaire_investigation", "add_multiple_question/add_multiple_question", "css!"),
        C.Co("questionnaire_investigation", "add_multiple_question/add_multiple_question", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.Co("notice", "create_notice/style", "css!"),
        C.CM("three_menu_module")

    ],
    function ($, avalon, layer, css, css3, html, x, data_center, css2, three_menu_module) {
        var save_question = api.api + "ques_naire/save_question_bank";
        var avalon_define = function (par) {
            var vm = avalon.define({
                $id: "add_topic",
                //判断是编辑模式还是完成模式
                //每道题的标题名称
                simple_title: '请在此输入问题标题',
                //必答是否选中
                must_answer: true,
                //填写提示是否选中
                hinted: false,
                option: '选项',
                //选项序号
                option_index: 1,
                //每道题（数组里为对象，对象为每道题的选项）
                title_arr: [],
                is_show_model: false,
                //判断弹出层弹出的是哪个选项
                model_index: 0,
                //弹出层输入的描述
                model_desc: '',
                test_index: 0,
                prompt: '',
                post_data: {},
                question_type: '多选题',
                q_index: '',
                //点击完成时
                complete_simple: function () {
                    this.post_data = {
                        _id: '',
                        data: this.title_arr,
                        must: this.must_answer,
                        prompt: this.prompt,
                        question_type: this.question_type,
                        title: this.simple_title,
                        hinted: this.hinted,
                        q_index: this.q_index
                    }
                    this.save_question();
                },
                save_question: function () {
                    var post_data_str = JSON.stringify(this.post_data);
                    data_center.set_key('question_obj', post_data_str)
                    if (par.question_index) {
                        window.location = "#add_topic?id=" + par.paper_id + "&question_index=" + par.question_index + "&scroll_height=" + par.scroll_height;
                    } else {
                        window.location = "#add_topic?id=" + par.paper_id;
                    }
                },
                //选项输入框失去焦点的时候
                sure_option: function (option_index) {
                    if (this.title_arr[option_index].option_name == '') {
                        this.title_arr[option_index].option_name = '选项' + (option_index + 1);
                    }
                },
                //添加一个选项
                add_option: function () {
                    var option_obj = {
                        option_name: '',
                        image: '',
                        option_desc: '',
                        is_checked: false
                    }
                    option_obj.option_name = '选项' + this.option_index;
                    this.title_arr.push(option_obj);
                    this.option_index++;
                },
                //减少一个选项
                reduce_option: function (option_index) {
                    this.title_arr.splice(option_index, 1)
                },

                //弹出层
                show_model: function (option_index) {

                    this.model_index = option_index;
                    this.model_desc = this.title_arr[this.model_index].option_desc;
                    this.is_show_model = true;
                    //初始化富文本
                    this.init_textarea();
                },
                model_save: function () {
                    this.instance.post();
                    // var txtContent = document.getElementById("input").value;
                    this.title_arr[this.model_index].option_desc = this.model_desc;
                    this.close_model()
                },
                model_cancel: function () {
                    this.close_model();
                },
                //关闭弹出层
                close_model: function () {
                    this.is_show_model = false;
                },

                //初始化选项个数
                detal_title_arr: function () {
                    var title_arr_length = this.title_arr.length
                    if (title_arr_length == 0) {
                        var option_obj = {
                            option_name: '',
                            image: '',
                            option_desc: '',
                            is_checked: false
                        }
                        for (var i = 0; i < 2; i++) {
                            option_obj.option_name = '选项' + this.option_index;
                            this.title_arr.push(option_obj);
                            this.option_index++;
                        }
                    }
                },
                init: function () {
                    this.is_update();
                },
                //判断是否是编辑
                is_update: function () {
                    var session_question = data_center.get_key('question_obj');
                    if (session_question && session_question != '') {
                        var question_msg_str = session_question;
                        var question_msg = JSON.parse(question_msg_str);
                        this.must_answer = question_msg.must;
                        this.prompt = question_msg.prompt;
                        this.question_type = question_msg.question_type;
                        this.simple_title = question_msg.title;
                        this.title_arr = question_msg.data;
                        this.hinted = question_msg.hinted;
                        this.option_index = question_msg.data.length + 1;
                    } else {
                        this.detal_title_arr();
                    }

                },
                instance: '',
                init_textarea: function () {
                    var title_width = $(".textarea-container").width();
                    this.instance = new TINY.editor.edit('editor', {
                        id: 'input',
                        width: title_width,
                        height: 175,
                        cssclass: 'te',
                        controlclass: 'tecontrol',
                        rowclass: 'teheader',
                        dividerclass: 'tedivider',
                        controls: ['bold', 'italic', 'underline', 'strikethrough', '|', 'subscript', 'superscript', '|',
                            'orderedlist', 'unorderedlist', '|', 'outdent', 'indent', '|', 'leftalign',
                            'centeralign', 'rightalign', 'blockjustify', '|', 'unformat', '|', 'undo', 'redo', 'n',
                            'font', 'size', 'style', '|', 'image', 'hr', 'link', 'unlink', '|', 'cut', 'copy', 'paste', 'print'],
                        footer: true,
                        fonts: ['Verdana', 'Arial', 'Georgia', 'Trebuchet MS'],
                        xhtml: true,
                        cssfile: 'style.css',
                        bodyid: 'editor',
                        footerclass: 'tefooter',
                        toggle: {text: 'source', activetext: 'wysiwyg', cssclass: 'toggle'},
                        resize: {cssclass: 'resize'}
                    });

                }
            });

            require(["tinyeditor"], function (j) {
                vm.init();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });