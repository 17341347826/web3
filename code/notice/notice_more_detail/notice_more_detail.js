/**
 * Created by Administrator on 2018/8/31.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("notice", "notice_more_detail/notice_more_detail", "css!"),
        C.Co("notice", "notice_more_detail/notice_more_detail", "html!"),
        "layer",
        C.CMF("data_center.js"),
        C.CMF("formatUtil.js")],
    function ($, avalon, css, html, layer, data_center, formatUtil) {
        //列表详情
        // var api_notice_detail = api.api + 'Indexmaintain/indexmaintain_selByIdNewNoticeInfo';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "notice_more_detail",
                url_file:api.api+"file/get",//获取文件
                has_video:false,
                has_excel:false,
                //图片数组
                img_info:[],
                video_info:[],
                excel_info:[],
                //公告列表
                notice_detail:{},
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                cd:function(){
                    var self = this;
                    data_center.uin(function(data){
                        //用户类型--0：管理员；1：教师；2：学生；3：家长
                        var user_type = data.data.user_type;
                        var detail = sessionStorage.getItem('notice_detail');
                        var el = JSON.parse(detail);
                        // self.notice_detail = JSON.parse(detail);
                        el.img_arr = [];
                        el.video_arr = [];
                        el.file_arr = [];
                        var token = sessionStorage.getItem("token");
                        var fjdz = JSON.parse(el.attachment_html);
                        for (var j = 0; j < fjdz.length; j++) {
                            var file_name = '';
                            if (fjdz[j].hasOwnProperty('name')) {
                                file_name = fjdz[j].name;
                            }
                            else {
                                file_name = fjdz[j].inner_name;
                            }
                            fjdz[j].down_href = api.api+'file/download_file?img=' + fjdz[j].guid + "&token="+ token;
                            var suffix_index = file_name.lastIndexOf('.');
                            var suffix = file_name.substr(suffix_index + 1);
                            suffix = suffix.toLowerCase();
                            if (vm.suffix_video.indexOf(suffix) != -1) {//视频
                                el.video_arr.push(fjdz[j]);
                                continue;
                            }
                            if (vm.suffix_img.indexOf(suffix) != -1) {
                                el.img_arr.push(fjdz[j]);
                                continue;
                            }
                            el.file_arr.push(fjdz[j]);
                        }
                        vm.notice_detail = el;
                        // console.log(JSON.parse(self.notice_detail.attachment_html));
                        // $('#list-person').append(self.notice_detail.content);
                        //附件
                        // var data_attachment=JSON.parse(self.notice_detail.attachment_html);
                        // for(var i=0;i<data_attachment.length;i++){
                        //     var get_name="";
                        //     if(data_attachment[i].hasOwnProperty('name')){
                        //         get_name=data_attachment[i].name;
                        //
                        //     }else{
                        //         get_name=data_attachment[i].inner_name;
                        //     }
                        //     var index1=get_name.lastIndexOf(".");
                        //     var index2=get_name.length;
                        //     var get_type_name=get_name.substring(index1,index2);//后缀名
                        //     var get_type=get_type_name.toLowerCase();
                        //     if(get_type=='.mp4' || get_type=='.wmv' || get_type=='.avi' || get_type=='rmvb'){//视频
                        //         this.has_video=true;
                        //         this.video_info.push(data_attachment[i]);
                        //     }
                        //     // 非视频
                        //     if( get_type==".pdf" ||
                        //         get_type==".xls" ||
                        //         get_type==".txt" ||
                        //         get_type==".docx"
                        //     ){
                        //         self.has_excel=true;
                        //         self.excel_info.push(data_attachment[i]);
                        //     }
                        //     //判断是图片 var strFilter=".jpeg|.gif|.jpg|.png|.bmp|.pic|"
                        //    if(get_type==".jpeg" || get_type==".gif" || get_type==".jpg" ||
                        //        get_type==".png" || get_type==".bmp" || get_type==".pic"){
                        //        self.img_info.push(data_attachment[i]);
                        //    }
                        //
                        // }
                    });
                },
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
                //视频
                video_click:function () {
                    var str='';
                    for(var i=0;i<this.video_info.length;i++){
                        var url ='#video_file?guid='+this.video_info[i].guid;
                        var down_video='http://pj.xtyun.net/api/file/download_file?img='+ this.video_info[i].guid+"&token="+sessionStorage.getItem("token");
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
                    var str='';
                    for(var i=0;i<this.excel_info.length;i++){
                        var url =api.api + '/file/download_file?img='+this.excel_info[i].guid+'&token='+sessionStorage.getItem("token");
                        str +='<div class="am-padding-left-lg am-margin-top-ms">' +
                            "<a id='up_down_a' title="+this.excel_info[i].file_name+">"+(i+1)+"、"+this.excel_info[i].file_name+"</a>"+
                            "<a href='"+url+"'  class='float-right am-margin-right-lg'>"+
                            "下载"+
                            "</a>"+
                            "</div>";
                    }
                    layer.open({
                        type: 1,
                        skin: 'layui-layer-rim', //加上边框
                        closeBtn: 1, //不显示关闭按钮
                        shadeClose: true, //开启遮罩关闭
                        area: ['500px', '240px'], //宽高
                        content: str,
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                }
            });
            vm.cd();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }

    });