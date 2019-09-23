/**
 * Created by Administrator on 2018/5/24.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('data_security', 'manual_backup/manual_backup', 'html!'),
        C.Co('data_security', 'manual_backup/manual_backup', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, three_menu_module) {
        var avalon_define = function () {
            var url = api.api + "base/backup/hand";
            var vm = avalon.define({
                $id: "manual_backup",
                data:{
                    bk_desc:"",//备份描述
                    bk_type:""//备份类型（方式） 0-完全备份；1-增量备份
                },
                ajax_add:function () {
                    if($.trim(this.data.bk_desc) == ''){
                        toastr.warning('请输入备份描述');
                        return;
                    }
                    else if(this.data.bk_type == ''){
                        toastr.warning('请选择备份方式');
                        return;
                    }else{
                        ajax_post(url,this.data.$model,this);
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case url:
                                toastr.success('保存成功');
                                window.location = '#backup_recovery';
                                break;

                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                cancel_click:function () {
                    window.location = '#backup_recovery';
                }
            });
            vm.$watch('onReady', function () {
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
