/**
 * Created by Administrator on 2018/5/24.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('data_security', 'automatic_backup/automatic_backup', 'html!'),
        C.Co('data_security', 'automatic_backup/automatic_backup', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, three_menu_module) {
        var url = api.api + "base/backup_set/save";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "automatic_backup",
                chose_hour:"00",
                chose_min:"00",
                duplex:"00",
                data:{
                    bk_cycle:"",//备份周期 string 1-每天；2-每周；3-每月
                    bk_date:"",//备份日期 number 1：每月1日；2：每月2日
                    bk_time:"",//备份时间 string 11:12:13
                    bk_type:"",//备份类型 string 【必填】0-完全备份；1-增量备份
                    bk_week:"",//备份星期 number 1-周日；2-周一；...；7-周六
                    persist_day:""//备份文件保留时长(天) number
                },
                ajax_add:function () {
                    if(this.data.bk_type == ''){
                        toastr.warning('请选择备份方式');
                        return;
                    }else if(this.data.bk_cycle == ''){
                        toastr.warning('请选择周期');
                        return;
                    }
                    if(this.data.bk_cycle == 2){
                        if(this.data.bk_week == ''){
                            toastr.warning('请选择星期');
                            return;
                        }
                    }
                    if(this.data.bk_cycle == 3){
                        if(this.data.bk_date == ''){
                            toastr.warning('请选择备份日期');
                            return;
                        }
                    }
                    if(this.data.persist_day == ''){
                        toastr.warning('请选择保留时常');
                        return;
                    }
                    var str = this.chose_hour + ':' + this.chose_min + ":" +this.duplex;
                    this.data.bk_time = str;
                    console.log(this.data.$model);
                    ajax_post(url,this.data.$model,this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case url:
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
