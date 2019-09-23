/**
 * Created by Administrator on 2017/10/11.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("enrolment", "control_line/control_line", "css!"),
        C.Co("enrolment", "control_line/control_line", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM('three_menu_module')
    ],
    function (jquery,avalon,layer,css,html,router,data_center,three_menu_module){
        //查询控制分数线
        var api_check_score_line = api.api + "Indexmaintain/get_control_score_line";
        //导入控制分数线
        var api_up_fsx = api.api + 'Indexmaintain/import_control_score_line';
        var avalon_define=function(){
            var vm=avalon.define({
                $id:"control_line",
                kz_line:[],
                false_data:[],
                file_name:"",
                progress_data:'',
                cb: function () {
                    var city_name = cloud.user_city();
                    ajax_post(api_check_score_line,{city_name:city_name},this);

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
                    this.false_data = [];
                    var files=this.file_name;
                    var subFile = files.substring(files.indexOf(".") + 1, files.length);
                    if (subFile == "xlsx" || subFile == "xls") {
                        fileUpload(api_up_fsx,this)
                    }else{
                        vm.modal_msg = '请上传excel文件'
                    }

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_check_score_line:
                                this.complete_check_score_line(data);
                                break;
                            case api_up_fsx:
                                this.complete_up_success(data);
                                break;

                        }
                    } else {
                        if(cmd == api_up_fsx){
                            this.false_data = data.data;
                        }else{
                            toastr.error(msg)
                        };
                        $("#file-uploading").modal({
                            closeOnConfirm: false
                        });
                    }
                },
                complete_check_score_line:function (data) {
                    this.kz_line = data.data;
                },
                complete_up_success:function (data) {
                    var dataList = data.data;
                    var dataLength = dataList.length;
                    if(dataLength == 0){
                        toastr.success('导入成功');
                        $("#file-uploading").modal({
                            closeOnConfirm: true
                        });
                    }else{
                        this.false_data = dataList;
                        console.log(this.false_data)
                    }
                },
                cancel:function () {
                    this.cb();
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