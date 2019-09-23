/**
 * Created by Administrator on 2018/6/21.
 */
define([C.CLF('avalon.js'),
        C.Co("leaders_growth","school_punish_detail/school_punish_detail","css!"),
        C.CLF("carousel",'css!'),
        C.Co("leaders_growth","school_punish_detail/school_punish_detail",'html!'),
        C.CMF("router.js"), C.CM("punishDetail"),C.CMF("data_center.js"),
        C.CM('page_title')
    ],
    function (avalon, css1,css2, html, x,signCard_publicityDatail,data_center,page_title) {
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "detail",
                url_file:api.api+"file/get",//获取文件
                url:api.growth + "punish_findbyPunishID",//详情
                pmx:pmx,
                punish_id:pmx.punish_id
            });
            return vm;
        }

        return {
            view: html,
            define: avalon_define
        }
    })