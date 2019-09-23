/**
 * Created by uptang on 2017/6/1.
 */
define([
        C.CLF('avalon.js'),
        C.CM("review_detail","css!"),
        C.CM("review_detail","html!"),
        C.CMF("data_center.js"),
        "layer"],
    function (avalon,css, html,data_center, layer) {
        var detail = avalon.component('ms-ele-review-detail', {
            template: html,
            defaults: {
                //复查
                url_file:"",
                url:"",
                url_review:"",
                review_id:"",
                review:[],
                onReady:function () {
                    ajax_post(this.url_review,{id:this.review_id},this)
                },
                url_for: function(igid) {
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + igid;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd) {
                            case  this.url_review:
                                this.review=data.data.datalist;
                                 $('.am-slider').flexslider();
                                break;
                        }
                    }else{
                        layer.msg(msg);
                    }
                }
            }
        });

    });