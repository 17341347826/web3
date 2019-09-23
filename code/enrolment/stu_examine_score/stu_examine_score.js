/**
 * Created by Administrator on 2017/10/11.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("enrolment", "stu_examine_score/stu_examine_score", "css!"),
        C.Co("enrolment", "stu_examine_score/stu_examine_score", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM('three_menu_module'), C.CM("table")
    ],
    function (jquery,avalon,layer,css,html,router,data_center,three_menu_module,table){
        //查询成绩
        var api_check_score_info = api.api + "Indexmaintain/get_exam_score";
        //导入成绩
        var api_up_score = api.api + '/Indexmaintain/import_exam_score';
        //导入成绩进度
        var api_score_progress = api.api + "Indexmaintain/get_exam_import_progress";
        var avalon_define=function(){
            var vm=avalon.define({
                $id:"stu_examine_score",
                url:api_check_score_info,
                info_list:'',
                timer:"",
                false_data:[],
                progress_data:'0%',
                file_name:"",
                is_init:false,
                extend: {
                    city_name: '',
                    __hash__: ""
                },
                data: {
                    offset: 0,
                    rows: 15
                },
                cb: function () {
                    this.extend.city_name = cloud.user_city();
                    this.is_init = true;
                },
                // 表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "区县",
                        type: "text",
                        from: "district_name"
                    },
                    {
                        title: "毕业学校名称",
                        type: "text",
                        from: "school_name"
                    },
                    {
                        title: "考生",
                        type: "text",
                        from: "stu_name"
                    },
                    {
                        title: "学籍号",
                        type: "text",
                        from: "stu_num"
                    },
                    /**/
                    {
                        title: "年级",
                        type: "text",
                        from: "grade_name"
                    },
                    {
                        title: "班级",
                        type: "text",
                        from: "class_name"
                    },
                    {
                        title: "分数",
                        type: "text",
                        from: "score"
                    }
                ],
                click_btn:function (num) {
                    layer.confirm('重新导入会清除原数据,确定要重新导入吗？', {
                        btn: ['确定','取消'] //按钮
                    }, function(){
                        vm.up_type = num;
                        $("#file").val("");
                        vm.file_name = "";
                        vm.modal_msg = "";
                        $("#file-uploading").modal({
                            closeOnConfirm: false
                        });
                        layer.closeAll();
                    }, function(){
                        layer.closeAll();
                    });
                },
                /*上传*/
                uploading:function () {
                    this.progress_data = '0%';
                    this.false_data = [];
                    var files=this.file_name;
                    var subFile = files.substring(files.indexOf(".") + 1, files.length);
                    if (subFile == "xlsx" || subFile == "xls") {
                        fileUpload(api_up_score,this)
                    }else{
                        vm.modal_msg = '请上传excel文件'
                    }

                },
                /*成绩进度*/
                timer_score:function () {
                    ajax_post(api_score_progress,{},this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_up_score:
                                this.complete_up_success(data);
                                break;
                            case api_score_progress:
                                this.complete_score_progress(data);
                                break;

                        }
                    } else {
                        if(cmd == api_up_fsx || cmd == api_up_score ||cmd == api_up_zy){
                            this.false_data = data.data;
                        }else{
                            toastr.error(msg)
                        };
                        $("#file-uploading").modal({
                            closeOnConfirm: false
                        });
                        $("#progress-up").modal({
                            closeOnConfirm: false
                        });
                        clearInterval(this.timer);
                    }
                },
                complete_check_score_line:function (data) {
                    this.kz_line = data.data;
                },
                complete_up_success:function (data) {
                    $("#file-uploading").modal({
                        closeOnConfirm: true
                    });
                    $("#progress-up").modal({
                        closeOnConfirm: true
                    });
                    setTimeout(function () {
                        vm.timer_score();
                    },1000);
                },
                complete_score_progress:function (data) {
                    var value = data.data.progress;
                    this.progress_data = value+'%';
                    if(value != 100){
                        setTimeout(function () {
                            vm.timer_score();
                        },5000);
                    }else{
                        this.info_list = data.data.errorList;
                    }
                },
                sure:function () {
                    $("#progress-up").modal({
                        closeOnConfirm: false
                    });
                    this.extend.__hash__ = new Date();
                }
            });
            vm.$watch('onReady', function () {
                this.cb();
            });

            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    })