/**
 * 研究性学习
 */
define([
        C.CLF('avalon.js'),
        C.CM("worksDetail","css!"),
        C.CM("study","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"],
    function(avalon, css, html, x, data_center, layer) {
        var pdetail = undefined;
        var detail = avalon.component('ms-base-study-detail', {
            template: html,
            defaults: {
                url_file:"",
                url:"",
                teacher_check:'',
                has_video:false,
                has_excel:false,
                video_info:[],
                excel_info:[],
                user_type:"",
                rotation_str: function(x) {
                    var deg = 'rotate(' + x + 'deg)'
                    return {
                        'WebkitTransform': deg,
                        'MosTransform': deg,
                        'OTransform': deg,
                        'transform': deg
                    }
                },
                url_for: function(igid) {
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + igid;
                },
                data: {
                    id:"",
                    owner:"",
                    course_type:"",
                    course_name:"",
                    start_date:"",
                    end_date:"",
                    site:"",
                    tutor:"",
                    role:"",
                    member:"",
                    duty:"",
                    hour_consume:"",
                    theme:"",
                    process:"",
                    result:"",
                    feel:"",
                    attachment:[],
                    create_time:"",
                    modify_time:"",
                    status:"",
                    checker:"",
                    check_name:"",
                    check_time:"",
                    check_opinion:"",
                    student_name:"",
                    student_num:"",
                    fk_school_id:"",
                    fk_grade_id:"",
                    fk_class_id:"",
                    school_name:"",
                    grade_name:"",
                    class_name:"",
                    second_check_attachment:[],
                    frist_index:"",
                    second_index:"",
                },
                get_data: function() { //get详细
                    this.data.id = data_center.get_key("study_id");
                    ajax_post(this.url, { id: this.data.id }, this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case this.url:
                                complete_get_data(data);
                                break;
                        }
                    } else {
                        layer.msg(msg)
                    }
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        self.user_type = Number(data.data.user_type);
                    })
                },
                onReady: function() {
                    pdetail = this;
                    this.cb();
                    $('.am-gallery').pureview();
                    pdetail.data.id = sessionStorage.getItem("id")
                    this.get_data();
                },
                //视频
                video_click:function () {
                    var str='';
                    for(var i=0;i<pdetail.video_info.length;i++){
                        var url ='#video_file?guid='+pdetail.video_info[i].guid;
                        var down_video='pj.xtyun.net/api/file/download_file?img='+ pdetail.video_info[i].guid+"&token="+sessionStorage.getItem("token");
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
                        var url ='pj.xtyun.net/api/file/download_file?img='+pdetail.excel_info[i].guid+'&token='+sessionStorage.getItem("token");
                        str +='<div class="am-padding-left-lg am-margin-top-ms">' +
                            "<a id='up_down_a' title="+pdetail.excel_info[i].name+">"+(i+1)+"、"+pdetail.excel_info[i].name+"</a>"+
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

                },
                //修正照片
                update_img:function () {
                    sessionStorage.setItem("study_data_detail", JSON.stringify(this.data));
                    window.location="#study_update_img";
                }
            }
        })

        complete_get_data = function(data) {
            var dataList=data.data;
            var data_attachment=dataList.attachment;
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
            pdetail.data = data.data;
            if(pdetail.teacher_check==1 && data.data.attachment.length==0){
                layer.alert('该记录无证据，为了能顺利入选学生的成长记录袋，请让学生上传证据', {
                    skin: 'layui-layer-lan'
                    ,closeBtn: 0
                    ,anim: 4 //动画类型
                });
            }
            $('.am-slider').flexslider();
        };
    });