define([C.CLF('avalon.js'),
        C.Co("user", "type_manage/input", "css!"),
        C.Co("user", "type_manage/input", "html!"),
        C.CMF("router.js"), C.CMF("data_center.js"),
    'layer',
    'jquery', C.CM('page_title')
],
    function (avalon, growthPublic, html, x, data_center, layer, $, page_title) {
        var api_get_detail = api.growth + "get_detail";
        var api_save_type = api.growth + "save_type";
        var index_linkage = api.api + "Indexmaintain/indexmaintain_findByIndexName";
        var avalon_define = function (pxm) {
            var vm = avalon.define({
                $id: "input_type",
                data: {
                    id: "",
                    type_name: "",
                    type_remark: "",
                    rule: "",
                    type: "1",
                    index_id:""
                },
                second_indexs: [],
                getdetail: function () {
                    this.data.id = pxm.type_id;
                    var self = this;
                    data_center.uin(function (data) {
                        var data = JSON.parse(data.data["user"]);
                        ajax_post_sync(index_linkage, { index_rank: 2}, self);
                        if (self.data.id) {
                            ajax_post(api_get_detail, self.data, self);
                        }
                    });
                },
                save_type: function (e) { /*提交*/
                    if ($.trim(this.data.type) == '') {
                        toastr.warning('业务类型不能为空');
                    } else if ($.trim(this.data.type_name) == '') {
                        toastr.warning('类型名称不能为空');
                    } else if ($.trim(this.data.type_remark) == '') {
                        toastr.warning('描述不能为空');
                    } else if ($.trim(this.data.rule) == '') {
                        toastr.warning('基本要求不能为空')
                    } else if ($.trim(this.data.index_id) == '') {
                        toastr.warning('指标不能为空')
                    } else {
                        var self = this;
                        layer.confirm('确认提交？', {
                            btn: ['确定', '取消'] //按钮
                        }, function () {
                            ajax_post(api_save_type, self.data, self);
                            layer.closeAll();
                        });

                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_detail:
                                this.complete_getdetail(data);
                                break;
                            case api_save_type:
                                this.complete_save_type(data);
                                break;
                            case index_linkage:
                                this.complete_index_linkage(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_getdetail: function (data) {
                    this.data = data.data;
                },
                complete_save_type: function (data) {
                    window.location = "#type_list";
                },
                complete_index_linkage: function (data) {
                    this.second_indexs = data.data;
                }
            });
            vm.$watch('onReady', function () {
                this.getdetail()
            })
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    })