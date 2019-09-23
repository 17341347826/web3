/**
 * Created by Administrator on 2017/10/11.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("enrolment", "stu_volunteering/stu_volunteering", "css!"),
        C.Co("enrolment", "stu_volunteering/stu_volunteering", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM('three_menu_module'),
        C.CM("table")
    ],
    function (jquery,avalon,layer,css,html,router,data_center,three_menu_module,table){
        //查询志愿信息
        var api_check_zy_info = api.api + "Indexmaintain/get_volunteer_infomation";
        //导入志愿
        var api_up_zy = api.api + 'Indexmaintain/import_volunteer_infomation';
        //导入志愿进度
        var api_zy_progress = api.api + "Indexmaintain/get_volunteer_import_progress";
        var avalon_define=function(){
            var vm=avalon.define({
                $id:"stu_volunteering",
                url:api_check_zy_info,
                is_init:false,
                extend: {
                    city_name: '',
                    __hash__: ""
                },
                data: {
                    offset: 0,
                    rows: 15
                },
                timer:"",
                dataInfo:[],
                false_data:[],
                info_list:[],
                file_name:"",
                progress_data:'0%',
                // 表头名称
                theadTh: [{
                    title: "序号",
                    type: "index",
                    from: "id"
                },
                    {
                        title: "报名号",
                        type: "min_text",
                        from: "plan_name",
                        min_width:"white-space"

                    },
                    {
                        title: "姓名",
                        type: "text",
                        from: "stu_name"
                    },
                    {
                        title: "毕业学校代码",
                        type: "text",
                        from: "plan_grade"
                    },
                    {
                        title: "毕业学校名称",
                        type: "text",
                        from: "school_name"
                    },
                    {
                        title: "班级",
                        type: "text",
                        from: "class_name"
                    },
                    {
                        title: "志愿区县名称",
                        type: "text",
                        from: "district_name"
                    },
                    /**/
                    {
                        title: "单报民办志愿学校代码",
                        type: "text",
                        from: "dbmbzy_school_code"
                    },
                    {
                        title: "单报民办志愿学校名称",
                        type: "text",
                        from: "dbmbzy_school_name"
                    },
                    {
                        title: "跨区县志愿学校代码",
                        type: "text",
                        from: "kqxzy_school_code"
                    },
                    {
                        title: "跨区县志愿学校名称",
                        type: "text",
                        from: "kqxzy_school_name"
                    },
                    {
                        title: "艺体志愿学校代码",
                        type: "text",
                        from: "ytzy_school_code"
                    },
                    {
                        title: "艺体志愿学校名称",
                        type: "text",
                        from: "ytzy_school_name"
                    },
                    {
                        title: "切块志愿学校代码",
                        type: "text",
                        from: "qkzy_school_code"
                    },
                    {
                        title: "切块志愿学校名称",
                        type: "text",
                        from: "qkzy_school_name"
                    },
                    {
                        title: "划线志愿学校代码",
                        type: "text",
                        from: "hxzy_school_code"
                    },
                    {
                        title: "划线志愿学校代码",
                        type: "text",
                        from: "hxzy_school_name"
                    },
                    {
                        title: "兼报志愿学校代码",
                        type: "text",
                        from: "jbzy_school_code"
                    },
                    {
                        title: "兼报志愿学校名称",
                        type: "text",
                        from: "jbzy_school_name"
                    },
                    {
                        title: "第一志愿学校代码",
                        type: "text",
                        from: "dyzy_school_code"
                    },
                    {
                        title: "第一志愿学校名称",
                        type: "text",
                        from: "dyzy_school_name"
                    },
                    {
                        title: "第二志愿学校代码",
                        type: "text",
                        from: "dezy_school_code"
                    },{
                        title: "第二志愿学校名称",
                        type: "text",
                        from: "dezy_school_name"
                    },
                    {
                        title: "第三志愿学校代码",
                        type: "text",
                        from: "dszy_school_code"
                    },{
                        title: "第三志愿学校名称",
                        type: "text",
                        from: "dszy_school_name"
                    },
                    {
                        title: "兼报民办志愿学校代码",
                        type: "text",
                        from: "jbmbzy_school_code"
                    },
                    {
                        title: "兼报民办志愿学校名称",
                        type: "text",
                        from: "jbmbzy_school_name"
                    },
                    {
                        title: "联系电话",
                        type: "text",
                        from: ""
                    }
                ],
                cb: function () {
                    this.extend.city_name = cloud.user_city();
                    this.is_init = true;
                },
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
                        fileUpload(api_up_zy,this)
                    }else{
                        vm.modal_msg = '请上传excel文件'
                    }

                },
                /*志愿进度*/
                timer_zy:function () {
                    ajax_post(api_zy_progress,{},this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_up_zy:
                                this.complete_up_success(data);
                                break;
                            case api_zy_progress:
                                this.complete_zy_progress(data);
                                break;

                        }
                    } else {
                        if(cmd == api_up_zy){
                            toastr.error(msg);
                            this.false_data = data.data;
                        }
                        // $("#file-uploading").modal({
                        //     closeOnConfirm: false
                        // });
                        // $("#progress-up").modal({
                        //     closeOnConfirm: false
                        // });
                        clearInterval(this.timer);
                    }
                },
                complete_up_success:function (data) {
                    $("#file-uploading").modal({
                        closeOnConfirm: true
                    });
                    $("#progress-up").modal({
                        closeOnConfirm: true
                    });
                    setTimeout(function () {
                        vm.timer_zy();
                    },1000);
                },
                complete_zy_progress:function (data) {
                    var value = data.data.progress;
                    this.progress_data = value+'%';
                    if(value != 100){
                        setTimeout(function () {
                            vm.timer_zy();
                        },5000);
                    }else{
                        var str = data.data.errorList;
                        var dataList = JSON.parse(str);
                        this.info_list = dataList;
                    }
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