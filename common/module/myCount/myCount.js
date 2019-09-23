/**
 * 统计
 */
define([
        C.CLF('avalon.js'),
        C.CM("myCount", "css!"),
        C.CM("myCount", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function (avalon, css,html, x, data_center) {
        var pdetail = undefined;
// 作品基本详细信息组件
        var myCount = avalon.component('ms-my-count', {
            template: html,
            defaults: {
                title: "",
                status: "",
                ach_state: "",
                art_state: "",
                dataNum: [],
                span_show:true,
                url: "",
                src:"",
                myCount: function () {//get详细
                    if(this.url=="" && this.status==""){
                        this.span_show=false;
                    }else {
                        ajax_post(this.url, {status: this.status} , this);
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    this.dataNum = data.data;
                },
                full_path:function (x) {
                    return C.CI(this.src);
                },
                onReady: function () {

                    data_center.link(this.$id, this);
                    this.myCount();
                }
            }
        });
    });
