define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("achievement", "free_test_audit_detail/free_test_audit_detail", "css!"),
        C.Co("achievement", "free_test_audit_detail/free_test_audit_detail", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM('three_menu_module'),
        C.CMF("formatUtil.js")
    ],
    function ($, avalon, layer, css, html, x, data_center, three_menu_module, formatUtil) {
        var pdetail = undefined;
        //审核免考数据
        var api_check_exempt = api.api + "score/checke_exempt_new_health";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "free_test_audit_detail",
                //用户类型
                user_type:'',
                //最高等级
                highest_level:'',
                //审核免考数据
                check_data:{
                    //体制测评id
                    _id:'',
                    //免考标记	number	1免考（审核通过）3审核不通过（回到正常学生状态）
                    flag_exempt:'',
                    //不通过意见	string
                    not_pass:'',
                },
                url_file:api.api+"file/get",//获取文件
                teacher_check:"",
                has_video:false,
                has_excel:false,
                video_info:[],
                excel_info:[],
                //依据数组
                ach_enclosures:[],
                dataMsg: {},
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        self.user_type= data.data.user_type;
                        self.highest_level=data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        //获取学生基本免测信息
                        var free_info = JSON.parse(sessionStorage.getItem('stu_free_info'));
                        self.check_data._id = free_info._id;
                        self.get_health_detail(free_info);
                    });
                },
                rotation_str: function(x) {
                    var deg = 'rotate(' + x + 'deg)';
                    return {
                        'WebkitTransform': deg,
                        'MosTransform': deg,
                        'OTransform': deg,
                        'transform': deg
                    }
                },
                url_for: function(id) {
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                //视频
                video_click:function () {
                    var str='';
                    for(var i=0;i<pdetail.video_info.length;i++){
                        var url ='#video_file?guid='+pdetail.video_info[i].guid;
                        var down_video='http://pj.xtyun.net/api/file/download_file?img='+ pdetail.video_info[i].guid+"&token="+sessionStorage.getItem("token");
                        str +='<div class="am-padding-left-lg am-margin-top-ms">' +
                            "<a id='up_down_a' title="+pdetail.video_info[i].name+">"+(i+1)+"、"+pdetail.video_info[i].name+"</a>"+
                            "<a href='"+url+"'  class='float-right am-margin-right-sm'>"+
                            "播放"+
                            "</a>"+
                            "<a href='"+down_video+"'  class='float-right am-margin-right-sm'>"+
                            "下载"+
                            "</a>"+
                            "</div>";
                    }
                    layer.open({
                        type: 1,
                        skin: 'layui-layer-rim', //加上边框
                        area: ['500px', '240px'], //宽高
                        content: str
                    });
                },
                //excel
                excel_click:function () {
                    //
                    var self=pdetail;
                    var str='';
                    for(var i=0;i<pdetail.excel_info.length;i++){
                        var url ='http://pj.xtyun.net/api/file/download_file?img='+pdetail.excel_info[i].guid+'&token='+sessionStorage.getItem("token");
                        str +='<div class="am-padding-left-lg am-margin-top-ms">' +
                            "<a id='up_down_a' title="+pdetail.excel_info[i].file_name+">"+(i+1)+"、"+pdetail.excel_info[i].file_name+"</a>"+
                            "<a href='"+url+"'  class='float-right am-margin-right-lg'>"+
                            "下载"+
                            "</a>"+
                            "</div>";
                    }
                    layer.open({
                        type: 1,
                        skin: 'layui-layer-rim', //加上边框
                        area: ['500px', '240px'], //宽高
                        content: str,
                        closeBtn:1, //显示关闭按钮
                    });

                },
                // //修正照片
                // update_img:function () {
                //     sessionStorage.setItem("achev_data_detail", JSON.stringify(this.data));
                //     window.location="#achev_update_img";
                // },
                get_health_detail:function(data) {
                    this.dataMsg=data;
                    var dataList=data;
                    // console.log(dataList);
                    // console.log(JSON.parse(dataList.attachment));
                    this.ach_enclosures=JSON.parse(dataList.img);
                    var data_attachment=this.ach_enclosures;
                    for(var i=0;i<data_attachment.length;i++){
                        var get_name="";
                        if(data_attachment[i].hasOwnProperty('name')){
                            get_name=data_attachment[i].name;

                        }else{
                            get_name=data_attachment[i].inner_name;
                        }
                        var index1=get_name.lastIndexOf(".");
                        var index2=get_name.length;
                        var get_type_name=get_name.substring(index1,index2);//后缀名
                        var get_type=get_type_name.toLowerCase();
                        if(get_type=='.mp4' || get_type=='.wmv' || get_type=='.avi' || get_type=='rmvb'){//视频
                            pdetail.has_video=true;
                            pdetail.video_info.push(data_attachment[i]);
                        }
                        // 非视频
                        if( get_type==".pdf" ||
                            get_type==".xls" ||
                            get_type==".txt" ||
                            get_type==".docx"
                        ){
                            pdetail.has_excel=true;
                            pdetail.excel_info.push(data_attachment[i]);
                        }

                    }

                    pdetail.data = data;
                    // if(pdetail.teacher_check==1 && data.data.ach_enclosures.length==0){
                    //     layer.alert('该记录无证据，为了能顺利申请免测，请上传证据', {
                    //         skin: 'layui-layer-lan'
                    //         ,closeBtn: 0
                    //         ,anim: 4 //动画类型
                    //     });
                    // }
                    $('.am-slider').flexslider();
                },
                //通过
                btn_sure:function(){
                    this.check_data.flag_exempt=1;
                    ajax_post(api_check_exempt,this.check_data.$model,this);
                },
                //不通过
                btn_no:function(){
                    this.check_data.flag_exempt=3;
                    var self=this;
                    layer.prompt({title: '请说明不通过理由', formType: 2}, function(text, index){
                        layer.close(index);
                        self.check_data.not_pass=text;
                        ajax_post(api_check_exempt,self.check_data.$model,self);
                    });
                },
                //教师查看审核不通过内容返回列表
                return_last:function(){
                    window.location.href = '#new_free_test_exemption';
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //审核免考数据
                            case api_check_exempt:
                                this.complete_check_exempt(data);
                                break;
                        }
                    } else {
                        layer.msg(msg)
                    }
                },
                complete_check_exempt: function (data) {
                    //列表
                    window.location='#test_free_audit';
                    sessionStorage.removeItem('stu_free_info');
                },
            });
            vm.$watch('onReady', function () {
                pdetail = vm;
                // $('.am-gallery').pureview();
                vm.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });