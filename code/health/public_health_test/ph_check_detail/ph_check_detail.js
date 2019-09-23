define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("health", "public_health_test/ph_test_list/ph_test_list", "css!"),
        C.Co("health", "public_health_test/ph_check_detail/ph_check_detail", "css!"),
        C.Co("health", "public_health_test/ph_check_detail/ph_check_detail", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM('page_title'),
        C.CM("table"),
        C.CMF("uploader/uploader.js"),
    ],
    function ($, avalon, layer, css, css2, html, x, data_center, page_title, tab, uploader) {
        //获取表头
        var table_titles_api = api.api + "score/list_health_item_by_school";
        //获取列表详情
        var health_detail_api = api.api + "score/health_dissent_detail";
        //文件上传
        var api_file_uploader = api.api + "file/uploader";
        //异议审核
        var dissent_check_api = api.api + "score/health_dissent_check";
        //分数修改
        var score_change_api = api.api+"score/health_score_set";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "table",
                // 表头名称
                titles: [],
                //体质测试详情列表
                health_test_detail: [],
                //提出异议人列表
                dissent: [],
                //判断是否更正审核意见1，异议无效，2更正审核
                radio_check: 1,
                //获取的上传文件
                files: [],
                //请求文件接口
                uploader_url: api_file_uploader,
                //更正后的数据
                new_detail: [],
                //需要修改的项
                select_title: 0,
                //需要修改的值
                select_value: '',
                //审核结果说明
                content: '',
                dissent_check_data: {
                    _id: '',
                    content: '',
                    img: '',
                    is_pass: ''
                },
                //获取的学生分数列表
                score_content:[],
                //修改后的分数列表
                column_list: [],
                init: function () {
                    this.get_health_detail()
                },
                //获取标题
                get_table_titles: function () {
                    ajax_post(table_titles_api, {
                        fk_school_id: pmx.school_id
                    }, this)
                },
                //获取分数详情
                get_health_detail: function () {
                    ajax_post(health_detail_api, {
                        for_id: pmx.id
                    }, this);
                },
                //点击保存时
                change_value: function () {
                    var index = this.select_title;
                    this.new_detail[index].value = this.select_value;
                    this.select_value = '';
                },
                //再次选择异议无效
                select_invalid: function () {
                    this.new_detail = this.deep_copy(this.health_test_detail);
                },
                //提交审核
                dissent_check: function (request_data) {
                    ajax_post(dissent_check_api, request_data.$model, this)
                },
                score_submit:function () {
                  ajax_post(score_change_api,this.score_content.$model,this);
                },
                //提交审核
                submit_data: function () {
                    //判断审核意见
                    if (this.radio_check == 1) {
                        this.dissent_check_data.is_pass = true;
                        if(this.content==''){
                            toastr.warning('请说明核实结果')
                            return
                        }
                        var self = this;
                        layer.confirm('确定异议无效吗？？', {
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            layer.closeAll();
                            self.deal_submit();
                        }, function () {

                        });
                    } else {
                        this.dissent_check_data.is_pass = false;
                        this.deal_submit();
                    }
                },
                deal_submit: function () {
                    this.dissent_check_data.content = this.content;
                    var uploaderWorks = data_center.ctrl("card_uploader");
                    var is_complete = uploaderWorks.is_finished();
                    if (is_complete) {
                        var files = uploaderWorks.get_files();
                        if(files.length==0){
                            toastr.warning('请上传核查材料');
                            return
                        }
                        this.dissent_check_data.img = JSON.stringify(files);
                    }
                    this.dissent_check_data._id = this.new_detail[0].id;
                    // console.dir(this.new_detail)
                    var new_detail_length = this.new_detail.length;
                    for(var i=0;i<new_detail_length;i++){
                        var key = this.new_detail[i].key;
                        if(this.score_content[key]){
                            this.score_content[key].addition = this.new_detail[i].addition;
                            this.score_content[key].lev = this.new_detail[i].lev;
                            this.score_content[key].rate = this.new_detail[i].rate;
                            this.score_content[key].score = this.new_detail[i].score;
                            this.score_content[key].value = this.new_detail[i].value;
                        }
                    }
                    this.score_submit();
                },

                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case table_titles_api:
                                this.detal_titles(data);
                                break;
                            case health_detail_api:
                                this.deal_score(data);
                                break;
                            case dissent_check_api:
                                //window.location = "#ph_check_list"
                                history.go(-1);
                                break;
                            case score_change_api:
                                this.dissent_check(this.dissent_check_data);
                                break;
                            default:
                                break;

                        }
                    } else {
                        toastr.error(msg)
                    }
                },

                deep_copy: function (obj) {
                    return JSON.parse(JSON.stringify(obj));
                },
                deal_score: function (data) {
                    if (!data.data)
                        return;
                    var titles = data.data.columns;
                    var titles_length = titles.length;
                    this.health_test_detail = [];
                    this.dissent = data.data.dissent;

                    var content = data.data.content;
                    var project_id = content.project;
                    this.score_content = content;
                    var _id = content._id;
                    var guid = content.guid;
                    for (var i = 0; i < titles_length; i++) {
                        var name = titles[i].name;
                        var key = titles[i].alias;
                        if (content[key]) {
                            var obj = {};
                            obj.name = name;
                            obj.score = content[key].score;
                            obj.addition = content[key].addition;
                            obj.lev = content[key].lev;
                            obj.value = content[key].value;
                            obj.rate = content[key].rate;
                            obj.id= _id;
                            obj.guid = guid;
                            obj.key = key;
                            this.health_test_detail.push(obj);
                        }
                    }
                    this.new_detail = this.deep_copy(this.health_test_detail);
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