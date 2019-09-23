/**
 * Created by uptang on 2017/5/4.
 */
define([
        C.CLF('avalon.js'),
        C.CM("modal", "css!"),
        C.CM("modal", "html!"),
        "jquery"],
    function (avalon,css, html, $) {
        var detail = avalon.component('ms-ele-modal', {
            template: html,
            defaults: {
                modal: {
                    id: "",
                    title: "",
                    con: "",
                    url: "",
                    msg: "",
                    //model类型：1-启用，2-停用，3-重置密码,4-删除
                    type:'',
                },
                sure: function () {

                },
            //    确认修改信息
                modal_insure_info:function(){

                },
            }
        });

    });