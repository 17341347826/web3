/**
 * Created by Administrator on 2018/3/28.
 */
define([
        C.CLF('avalon.js'),
        C.CM("all_growth_nav","css!"),
        C.CM("all_growth_nav","html!"),
        C.CMF("data_center.js")],
    function (avalon,css, html, data_center) {
        var detail = avalon.component('ms-all-growth-nav', {
            template: html,
            defaults: {
                skipPage:function (id) {
                    data_center.set_key("all_growth_nav",id);
                }
            }
        });
    });