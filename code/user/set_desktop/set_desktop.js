/**
 * Created by Administrator on 2018/3/7.
 */
define([C.CLF('avalon.js'), "jquery",
        C.Co("user", "set_desktop/set_desktop", 'css!'),
        C.Co("user", "set_desktop/set_desktop", 'html!'),
        C.CMF("data_center.js"),
        C.CMF("router.js"), C.CM('three_menu_module'),
        "layer"
    ],
    function (avalon, $, css, html, data_center, x, three_menu_module, layer) {
        //查询所有菜单
        // var api_get_all_product = api.user + "power/list";
        //查询已保存菜单
        var api_get_saved_menu = api.api + "GrowthRecordBag/query_custom_menu";
        //修改或者保存
        var api_save_menu = api.api + "GrowthRecordBag/save_or_update_custom_menu";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "set_desktop",
                //获取到的数据
                all_product: [],
                saved_list: [],
                //页面渲染的数据
                all_product_show: [],
                saved_list_show: [],
                data: {
                    product_code: "xspj",
                    role_level: '',
                    role_type: ''
                },
                //用户类型
                yhlx: "",
                //菜单
                menu: [],
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        //highest_level 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        var dataUser = JSON.parse(data.data['user']);
                        var highest_level = Number(data.data.highest_level);
                        var user_type = Number(data.data.user_type);
                        var yhlx = 0;
                        //role_level 1：省级；2：市州级；3：区县级；4：校级；5：年级
                        switch (highest_level) {
                            case 1:
                                self.data.role_level = '省级';
                                break;
                            case 2:
                                if (user_type == 1) {
                                    self.yhlx = 7;
                                } else if (user_type == 0) {
                                    self.yhlx = 8;
                                }
                                self.data.role_level = '市州级';
                                break;
                            case 3:
                                if (user_type == 1) {
                                    self.yhlx = 5;
                                } else if (user_type == 0) {
                                    self.yhlx = 6;
                                }
                                self.data.role_level = '区县级';
                                break;
                            case 4:
                                if (user_type == 1) {
                                    self.yhlx = 3;
                                } else if (user_type == 0) {
                                    self.yhlx = 4;
                                }
                                self.data.role_level = '校级';
                                break;
                            case 5:
                                self.data.role_level = '年级';
                                break;
                            case 6:
                                if (dataUser.lead_class_list.length > 0) {
                                    self.yhlx = 1;
                                }
                                self.data.role_level = '班主任或普通任课教师';
                                break;
                            case 7://个体
                                self.yhlx = 2;
                                break;
                        }
                        ;
                        switch (user_type) {
                            case 1:
                                self.data.role_type = '教师';
                                break;
                            case 2:
                                self.data.role_type = '学生';
                                break;
                            case 3:
                                self.data.role_type = '家长';
                                break;
                        }
                        ;
                        var handle_menu = sessionStorage.getItem('handle_menu');
                        self.menu = JSON.parse(handle_menu);
                        self.complete_get_all_product();
                    });


                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //查询已保存菜单
                            case api_get_saved_menu:
                                this.complete_get_saved_menu(data);
                                break;
                            //保存或修改
                            case api_save_menu:
                                this.complete_save_menu(data);
                                break;

                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                ary_product: [],

                complete_get_all_product: function () {

                    var list = this.menu;
                    this.all_product = list;
                    var dataLength = list.length;
                    var ary_list = [];
                    for (var i = 0; i < dataLength; i++) {
                        var obj = {};
                        if (list[i].elements.length == 0) {
                            obj.second_power = list[i].second_power;
                            obj.power_name = list[i].power_name;
                            obj.url = list[i].url;
                            ary_list.push(JSON.parse(JSON.stringify(obj)));
                            continue;
                        }
                        var elements =list[i].elements;
                        var elements_length = elements.length;
                        for (var j = 0; j < elements_length; j++) {
                            if(elements[j].elements.length==0){
                                obj.second_power = elements[j].second_power;
                                obj.power_name = elements[j].power_name;
                                obj.url = elements[j].url;
                                ary_list.push(JSON.parse(JSON.stringify(obj)));
                                continue;
                            }
                            var sec_elements = elements[j].elements;
                            obj.second_power = sec_elements[0].second_power;
                            obj.power_name = sec_elements[0].power_name;
                            obj.url = sec_elements[0].url;
                            ary_list.push(JSON.parse(JSON.stringify(obj)));
                        }
                    }
                    abstract_obj(ary_list,['second_power','power_name','url'])
                    ary_list = this.remove_empty(ary_list);
                    this.ary_product = ary_list;
                    ajax_post(api_get_saved_menu, {yhlx: this.yhlx}, this);
                },
                remove_empty:function (data) {
                    for(var i=0;i<data.length;i++){
                        if(data[i].second_power==''&&data[i].power_name==''){
                            data.splice(i,1);
                            return this.remove_empty(data);
                        }
                    }
                    return data;
                },
                complete_get_saved_menu: function (data) {

                    if (!data.data || !data.data.custom_menu || data.data.custom_menu.length == 0) {
                        this.all_product_show = this.ary_product;
                        return;
                    }
                    var dataList_x = JSON.parse(data.data.custom_menu);
                    this.all_product_show = arry_differ_part(this.ary_product,dataList_x,['second_power','power_name','url']);
                    this.saved_list_show = dataList_x;

                },
                //添加
                add_click: function (value) {
                    var second_power = value.second_power;
                    var power_name = value.power_name;
                    var url = value.url;
                    var obj = {second_power: second_power, power_name: power_name, url: url};
                    if (this.saved_list_show.length == 10) {
                        toastr.info('最多只能添加10个模块')
                        return;
                    }


                    this.saved_list_show.push(obj);
                    var all_product_show = this.all_product_show.$model;
                    var all_length = all_product_show.length;
                    for (var i = 0; i < all_length; i++) {
                        if (all_product_show[i].second_power == second_power &&
                            all_product_show[i].power_name == power_name&&
                                all_product_show[i].url == url
                        ) {
                            all_product_show.splice(i, 1);
                            this.all_product_show = all_product_show;

                            return;
                        }
                    }
                },
                //删除
                del_click: function (value) {
                    var second_power = value.second_power;
                    var power_name = value.power_name;
                    var url = value.url;
                    var obj = {second_power: second_power, power_name: power_name, url: url};
                    this.all_product_show.push(obj);
                    var saved_list_show = this.saved_list_show.$model;
                    var saved_list_length = saved_list_show.length;
                    for (var i = 0; i < saved_list_length; i++) {
                        if (saved_list_show[i].second_power == second_power &&
                            saved_list_show[i].power_name == power_name&&
                                saved_list_show[i].url ==url
                        ) {
                            saved_list_show.splice(i, 1);
                            this.saved_list_show = saved_list_show;
                            return;
                        }
                    }
                },
                //保存
                save_click: function () {
                    var dataList = this.saved_list_show;
                    if (dataList.length > 10) {
                        toastr.warning('最多只能选10个模块哦')
                    } else {
                        ajax_post(api_save_menu, {custom_menu: JSON.stringify(dataList)}, this);
                    }
                },
                complete_save_menu: function (data) {
                    this.saved_list_show = [];
                    this.all_product_show = [];
                    this.all_product = [];
                    this.saved_list = [];
                    this.ary_product = [];
                    var HTTP_X = location.origin;
                    window.location = HTTP_X + '/Growth/index.html';
                }
            });
            vm.$watch('onReady', function () {
                this.cb();
            })
        };
        return {
            view: html,
            define: avalon_define
        }
    });