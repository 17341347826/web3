/**
 * Created by Administrator on 2018/1/25.
 */
define([
        C.CLF('avalon.js'),"jquery",
        C.Co("weixin_xy", "choose_sub/choose_sub", "css!"),
        C.Co("weixin_xy", "choose_sub/choose_sub", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "amazeui",
        "jquery_weui"
],
    function (avalon, $, css, html,x, data_center,amazeui,weui) {
        // 获取指定考试项目详情
        var api_get_subs = api.xy + "front/examProject_findExamSubject.action";
        var avalon_define = function (pmx) {
            var sub = avalon.define({
                $id: "choose_sub",
                data: "",
                //提示信息
                msg: "",
                //页面跳转
                sub_detail:function(id,name){
                    window.location='#wrong_set_all?sub_id='+id+'&sub_name='+name+'&exam_id='+pmx.exam_id+'&exam_name='+pmx.exam_name;
                },
                // 实例化
                init: function () {
                    // console.log(pmx);
                    ajaxPost(api_get_subs, {examProjectId:pmx.exam_id}, this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case  api_get_subs:
                                if (status == 200) {
                                    this.complete_get_subs(data);
                                }else{
                                    this.msg =msg;
                                }
                                break;
                        }
                    }
                },
                complete_get_subs:function(data){
                    var subs=data.data;
                    if(subs.length>0){
                        this.data=data.data;
                    }else{
                        this.msg ='科目暂未统计'
                    }
                }
            });
            sub.init();
            return sub;
        };
        return {
            view: html,
            define: avalon_define
        }
    });