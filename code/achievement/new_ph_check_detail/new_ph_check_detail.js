define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("achievement", "new_ph_check_detail/new_ph_check_detail", "css!"),
        C.Co("achievement", "new_ph_check_detail/new_ph_check_detail", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM('page_title'),
        C.CM("table"),
        C.CMF("uploader/uploader.js"),
    ],
    function ($, avalon, layer, css,html, x, data_center, page_title, tab, uploader) {
        //获取体质测评成绩异议审核详情页面
        var health_detail_api = api.api + "score/new_health_dissent_detail";
        //文件上传
        var api_file_uploader = api.api + "file/uploader";
        //异议审核
        var dissent_check_api = api.api + "score/new_health_dissent_check";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "new_ph_check_detail",
                //体质测试详情列表
                health_test_detail: [],
                //提出异议人列表
                dissent: [],
                //获取的上传文件
                files: [],
                //请求文件接口
                uploader_url: api_file_uploader,
                //判断是否更正审核意见1，异议无效，2更正审核
                radio_check:1,
                //审核异议参数请求
                extend:{
                    //体制测评id
                    _id:pmx.id,
                    //审核说明	string
                    content:'',
                    //附件	string
                    img:'',
                    //	是否通过	object
                    is_pass:true,
                    //  标准分	string
                    criteria_score:'',
                    // 	附加分	string
                    extra_score:'',
                    //	身高	string
                    height:'',
                    // 立定跳远	string
                    ldty:'',
                    //立定跳远等级	string
                    ldty_lv:'',
                    //立定跳远评分	string
                    ldty_score:'',
                    // 1000米跑	string
                    run_1000:'',
                    //1000米跑(附加分)	string
                    run_1000_extra:'',
                    // 1000米跑等级	string
                    run_1000_lv:'',
                    // 1000米跑评分	string
                    run_1000_score:'',
                    //50米跑	string
                    run_50:'',
                    //50米跑等级	string
                    run_50_lv:'',
                    //50米跑评分	string
                    run_50_score:'',
                    //800米跑	string
                    run_800:'',
                    //800米跑附加分	string
                    run_800_extra:'',
                    // 800米跑等级	string
                    run_800_lv:'',
                    //   	800米跑评分	string
                    run_800_score:'',
                    // 总分	string
                    total_score	:'',
                    //总分等级	string
                    total_score_lv:'',
                    //肺活量	string
                    vital_capacity:'',
                    vital_capacity_lv:'',
                    vital_capacity_score:'',
                    //   体重	string
                    weight:'',
                    weight_lv:'',
                    weight_score:'',
                    // 引体向上	string
                    ytxs:'',
                    // 引体向上附加分	string
                    ytxs_extra:'',
                    ytxs_lv:'',
                    ytxs_score:'',
                    //仰卧起坐(一分钟)	string
                    ywqz:'',
                    //仰卧起坐(一分钟 附加分)	string
                    ywqz_extra:'',
                    ywqz_lv:'',
                    ywqz_scor:'',
                    //坐位体前屈	string
                    zqqq:'',
                    zqqq_lv:'',
                    zqqq_score:'',
                },
                init: function () {
                    this.get_health_detail()
                },
                //获取体质测评详情
                get_health_detail: function () {
                    ajax_post(health_detail_api, {
                        for_id: pmx.id
                    }, this);
                },
                //深拷贝
                deep_copy: function (obj) {
                    return JSON.parse(JSON.stringify(obj));
                },
                //提交审核
                submit_data: function () {
                    //判断审核意见
                    if (this.radio_check == 1) {
                        this.extend.is_pass = true;
                        if(this.extend.content==''){
                            toastr.warning('请说明核实结果');
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
                        this.extend.is_pass = false;
                        this.deal_submit();
                    }
                },
                deal_submit: function () {
                    var uploaderWorks = data_center.ctrl("card_uploader");
                    var is_complete = uploaderWorks.is_finished();
                    if (is_complete) {
                        var files = uploaderWorks.get_files();
                        if(files.length==0){
                            toastr.warning('请上传核查材料');
                            return
                        }
                        this.extend.img = JSON.stringify(files);
                    }
                    //提交审核
                    ajax_post(dissent_check_api,this.extend.$model, this)
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case health_detail_api:
                                this.complete_health_detail(data);
                                break;
                            case dissent_check_api:
                                window.location.href = '#new_upload_material';
                                break;
                            default:
                                break;

                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                //获取体质测评健康详情
                complete_health_detail: function (data) {
                    if (!data.data)
                        return;
                    this.health_test_detail = data.data.content;
                    this.dissent = data.data.dissent;
                    var info = data.data.content;
                    this.extend._id = info._id;
                    this.extend.height = info.height;
                    this.extend.weight = info.weight;
                    this.extend.weight_lv = info.weight_lv;
                    this.extend.weight_score = info.weight_score;
                    this.extend.total_score = info.total_score;
                    this.extend.total_score_lv = info.total_score_lv;
                    this.extend.criteria_score = info.criteria_score;
                    this.extend.extra_score = info.extra_score;
                    this.extend.ldty = info.ldty;
                    this.extend.ldty_lv = info.ldty_lv;
                    this.extend.ldty_score = info.ldty_score;
                    this.extend.run_50 = info.run_50;
                    this.extend.run_50_lv = info.run_50_lv;
                    this.extend.run_50_score = info.run_50_score;
                    if(info.sex == 1){//男
                        this.extend.run_1000 = info.run_1000;
                        this.extend.run_1000_lv = info.run_1000_lv;
                        this.extend.run_1000_score = info.run_1000_score;
                        this.extend.run_1000_extra = info.run_1000_extra;
                        this.extend.ytxs = info.ytxs;
                        this.extend.ytxs_lv = info.ytxs_lv;
                        this.extend.ytxs_score = info.ytxs_score;
                        this.extend.ytxs_extra = info.ytxs_extra;
                    }else if(info.sex == 2){//女
                        this.extend.run_800 = info.run_800;
                        this.extend.run_800_lv = info.run_800_lv;
                        this.extend.run_800_score = info.run_800_score;
                        this.extend.run_800_extra = info.run_800_extra;
                        this.extend.ywqz = info.ywqz;
                        this.extend.ywqz_lv = info.ywqz_lv;
                        this.extend.ywqz_extra = info.ywqz_extra;
                        this.extend.ywqz_scor = info.ywqz_scor;
                    }
                    this.extend.vital_capacity = info.vital_capacity;
                    this.extend.vital_capacity_lv = info.vital_capacity_lv;
                    this.extend.vital_capacity_score = info.vital_capacity_score;
                    this.extend.zqqq = info.zqqq;
                    this.extend.zqqq_lv = info.zqqq_lv;
                    this.extend.zqqq_score = info.zqqq_score;
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