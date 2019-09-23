/**
 * Created by uptang on 2017/6/5.
 */
define([
        C.CLF('avalon.js'),
        C.CM("parent_growth_nav","css!"),
        C.CM("parent_growth_nav","html!"),
        C.CMF("data_center.js")],
    function (avalon,css, html, data_center) {
        var detail = avalon.component('ms-parents-growth-nav', {
            template: html,
            defaults: {
                skipPage:function (id) {
                    data_center.set_key("parent_growth_nav",id);
                }
            }
        });
    });