/**
 * Created by uptang on 2017/6/5.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("evaluation_analysis", "comparative_analysis/comparative_analysis", "css!"),
        C.Co("evaluation_analysis", "comparative_analysis/comparative_analysis", "html!"),
        C.CMF("data_center.js"),
        "layer",
        C.CM("three_menu_module"),
        C.CM("comparative_analysis_area"),
        C.CM("comparative_analysis_school"),
        C.CM("comparative_analysis_class")
    ],
    function ($, avalon, css, html, data_center,
              layer, three_menu_module,comparative_analysis_area,
              comparative_analysis_school,
              comparative_analysis_class
    ) {
        var avalon_define = function () {
            var table = avalon.define({
                $id: "comparative_analysis",
                highest_level:"",
                to_page:function (url) {
                    location.href = url;
                },
                cds: function () {
                    // 1：省级；2：市州级；3：区县级；4：校级；5：年级
                    var self = this;
                    data_center.uin(function (data) {
                        self.highest_level = data.data.highest_level;
                    });
                }
            });
            table.cds();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });