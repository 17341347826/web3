/**
 * Created by Administrator on 2017/10/11.
 */
define(["jquery", C.CLF('avalon.js'), 'layer',
        C.Co("user", "teacher_autograph/teacher_autograph", "html!"),
        C.Co("user", "teacher_autograph/teacher_autograph", "css!"),
        C.CMF("router.js"), C.CMF("data_center.js"),C.CM('three_menu_module')
    ],
    function (jquery,avalon,layer,html,css,router,data_center,three_menu_module){
        var api_get_info = api.api+"GrowthRecordBag/query_sign_by";
        var url_api_file = api.api+"file/get";
        //审核签字
        var api_check_sign = api.api+"GrowthRecordBag/sign_audit";
        var avalon_define=function(){
            var vm=avalon.define({
                $id:"teacher_autograph",
                class_list:[],
                grade_list:[],
                list_info:[],
                data:{
                    grade_id:"",
                    class_id:""
                },
                post_data:{
                    class_id:'',
                    ofset:0,
                    rows:9999
                },
                //年级改变
                gradeChange:function(){
                    var gId = this.data.grade_id;
                    var grade = this.grade_list;
                    for(var i = 0;i < grade.length;i++){
                        var id = grade[i].grade_id;
                        if(id == gId){
                            this.class_list = grade[i].class_list;
                            this.data.class_id = grade[i].class_list[0].class_id;
                            this.post_data.class_id = this.data.class_id;
                           this.get_info();
                        }
                    }
                },
                classChange:function () {
                    ajax_post(api_get_info,{
                        class_id:this.data.class_id,
                        ofset:0,
                        rows:9999,
                    },this);
                },
                init:function(){
                    this.cds();
                },
                get_info:function(){
                    ajax_post(api_get_info,this.post_data.$model,this);
                },
                cds:function(){
                    var self=this;
                    data_center.uin(function(data){
                        var cArr = [];
                        var tUserData = JSON.parse(data.data["user"]);
                        cArr = tUserData.lead_class_list;
                        self.grade_list = cArr;
                        self.class_list = cArr[0].class_list;
                        self.data.grade_id = cArr[0].grade_id;
                        self.data.class_id = cArr[0].class_list[0].class_id;
                        self.post_data.class_id = self.data.class_id;
                        self.get_info();
                    })
                },
                on_request_complete:function(cmd,status,data,is_suc,msg){
                    if(is_suc){
                        switch (cmd) {
                            case api_get_info:
                                this.complete_api_get_info(data);
                                break;
                            case api_check_sign:
                                toastr.success('操作成功');
                                this.get_info();
                                break;
                        }
                    }else{
                        toastr.error(msg)
                    }

                },
                complete_api_get_info:function (data) {
                    if(!data || !data.data || !data.data.list) return
                    var dataList = data.data.list;
                    var dataLength = dataList.length;
                    for(var i = 0;i < dataLength; i++){
                        if(dataList[i].sign_code != ''){//设备签字
                            dataList[i]['src'] = dataList[i].sign_img;
                        }else{//上传的图片
                            dataList[i]['src'] = url_api_file + "?token=" + sessionStorage.getItem("token") + "&img=" + dataList[i].sign_img;
                        }
                    }
                    this.list_info = dataList;
                },
                click_btn:function (guid,num) {
                    if(num == 1){//通过
                        ajax_post(api_check_sign,{guid:guid,is_adopt_audit:1,reson:''},this);
                    }else{//不通过
                        layer.prompt(
                            {title: '请填写不通过原因',
                                formType: 2,
                                yes: function(index, layero){
                                    var val = layero.find(".layui-layer-input").val();
                                    if($.trim(val) == ''){
                                        toastr.warning('原因不能为空');
                                    }else{
                                        ajax_post(api_check_sign,
                                            {guid:guid,
                                                reson:val,
                                                is_adopt_audit:2},
                                            self);
                                        layer.closeAll()
                                    }
                                }
                            }
                        );
                    }
                }

            });
            vm.init();
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    })