/**
 * 标志性卡详情组件
 */
define([
        C.CLF('avalon.js'),
        C.CM("worksDetail","css!"),
        C.CM("signCard_publicityDatail","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"],
    function(avalon, css, html, x, data_center,layer) {
        // 查询学生标志卡详情
        var detail = avalon.component('ms-base-signCard-detail', {
            template: html,
            defaults: {
                url_file:"",//获取图片文件
                url:"",//查询学生标志卡详情
                has_video:false,
                has_excel:false,
                video_info:[],
                excel_info:[],
                p_id:'',
                //学生学籍号
                code:'',
                rotation_str: function(x) {
                    var deg = 'rotate(' + x + 'deg)'
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
                data:[],
                productGetDetalisById: function() { //get详细
                    ajax_post(this.url, {id:this.p_id}, this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case this.url:
                                this.complete_find_study_curriculum(data);
                                break;
                        }
                    } else {
                        layer.msg(msg)
                    }
                },
                //???
                complete_find_study_curriculum:function(data) {
                    var dataList=data.data;
                    // var data_attachment=JSON.parse(dataList.attachment);
                    var data_attachment=dataList.attachment;
                   if(data_attachment){
                       for(var i=0;i<data_attachment.length;i++){
                           var get_name="";
                           if(data_attachment[i].hasOwnProperty('name')){
                               get_name=data_attachment[i].name;

                           }else{
                               get_name=data_attachment[i].inner_name;
                           }
                           var index1=get_name.lastIndexOf(".");
                           var index2=get_name.length;
                           var get_type=get_name.substring(index1,index2);//后缀名
                           if(get_type=='.mp4' || get_type=='.wmv' || get_type=='.avi' || get_type=='rmvb'){//视频
                               this.has_video=true;
                               this.video_info.push(data_attachment[i]);
                           }
                           // 非视频
                           if( get_type==".pdf" ||
                               get_type==".xls" ||
                               get_type==".txt" ||
                               get_type==".docx"
                           ){
                               this.has_excel=true;
                               this.excel_info.push(data_attachment[i]);
                           }

                       }
                   }

                    this.data = data.data;
                    // if(this.data!=null){
                    //     this.code= data.data.code;
                    //     this.data.attachment=JSON.parse(data.data.attachment);
                    // }
                    //传递学生guid
                    // data_center.set_key("studentNum",this.code);
                    $('.am-slider').flexslider();//amaze ui js轮播插件
                },
                onReady: function() {
                    $('.am-gallery').pureview();//web组件
                    this.productGetDetalisById();
                },
                //视频
                video_click:function () {
                    var str='';
                    for(var i=0;i<this.video_info.length;i++){
                        var url ='#video_file?guid='+this.video_info[i].guid;
                        var down_video='pj.xtyun.net/api/file/download_file?img='+ this.video_info[i].guid+"&token="+sessionStorage.getItem("token");
                        str +='<div class="am-padding-left-lg am-margin-top-ms">' +
                            "<a id='up_down_a' title="+this.video_info[i].name+">"+(i+1)+"、"+this.video_info[i].name+"</a>"+
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
                    var self=this;
                    var str='';
                    for(var i=0;i<this.excel_info.length;i++){
                        var url ='pj.xtyun.net/api/file/download_file?img='+this.excel_info[i].guid+'&token='+sessionStorage.getItem("token");
                        str +='<div class="am-padding-left-lg am-margin-top-ms">' +
                            "<a id='up_down_a' title="+this.excel_info[i].name+">"+(i+1)+"、"+this.excel_info[i].name+"</a>"+
                            "<a href='"+url+"'  class='float-right am-margin-right-lg'>"+
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

                }

            }
        })

    });