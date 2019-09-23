/**
 * Created by uptang on 2017/5/8.
 */
define([
        C.CLF('avalon.js'),
        C.Co("user", "role_privileges/role_privileges_setting/role_privileges_setting", "css!"),
        C.Co("user", "role_privileges/role_privileges_setting/role_privileges_setting", "html!"),
        C.CM("modal"),C.CM('three_menu_module'),
        C.CMF("data_center.js")],
    function (avalon, css, html, modal,three_menu_module,data_center) {
        // 所有功能列表
        var power_list = api.user + "power/list";
        // 已有功能列表
        var role_power = api.user + "role/role_power";
        // 保存
        var role_save = api.user + "role/save_role_power";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "role_privileges_setting",
                // 模态框
                modal: {
                    id: "",
                    title: "",
                    info: "",
                    url: "",
                    msg: ""
                },
                //数据组织后的多位数据，所有权限
                role_power:[],
                //已分配功能的id集合
                power:[],
                power:[],
                //传值---角色信息
                role_info:[],
                //所有功能列表
                power_list:{},
                all_checked: false,
                power_len:0,
                //所有功能的id集合
                all_power:[],
                compile: function () {
                    if (this.compileData.role_name != "") {
                        if (this.department_level == 4) {
                            if (this.compileData.role_level != "" &&
                                this.compileData.role_type != "") {
                                ajax_post(role_save, this.compileData.$model, this)
                            } else {
                                this.modal.msg = "所有选项必填或必选";
                            }
                        } else {
                            ajax_post(role_save, this.compileData.$model, this)
                        }
                    } else {
                        this.modal.msg = "所有选项必填或必选";
                    }
                },
                infoModal: function (status, msg) {
                    var info = $("#info-tips");
                    if (status == 200) {
                        this.extend.__hash__ = new Date();
                        info.modal('open');
                        setTimeout(function () {
                            info.modal('close');
                        }, 1000)
                    }
                    this.modal.msg = msg;
                },
                // 获取功能列表
                init: function () {
                    this.role_info=data_center.get_key("role_privileges_setting").data;
                    ajax_post(power_list,{
                        product_code:"xspj",
                        role_level:this.role_info.role_level,
                        role_type:this.role_info.role_type
                    },this);
                },
                // 组织数据多维结构
                rolePowerSetting:function (data) {
                    var role=this.role_power;
                    //所有功能列表
                    var powerList=this.power_list;
                    //组织已分配功能结合id列表
                    for(var j=0;j<data.length;j++){
                        var pId=data[j].id;
                        this.power.push(pId)
                    }
                    // 编辑所有功能集合，组织成多维数据格式
                    for(var i=0;i<powerList.length;i++){
                        var power = powerList[i];
                        var powerId=power.id;
                        // 一维
                        var firstPower=power.power_code.substr(4, 2) - 1;
                        //二维
                        var secondPower = power.power_code.substr(6, 2) - 1;
                        //三维
                        var thirdPower = power.power_code.substr(8, 2) - 1;
                        var firstPowerName = power.first_power.trim();
                        var secondPowerName = power.second_power.trim();
                        var thirdPowerName = power.power_name.trim();
                        var menu = {
                            id:powerId,
                            title: '',
                            type:0
                        };
                        if(secondPower>=0){
                            if(thirdPower>=0){
                                //三级菜单
                                menu.title = thirdPowerName;
                                menu.type = 3;
                            }else {
                                //二级菜单
                                menu.title = secondPowerName;
                                menu.type = 2;
                            }
                        }else {
                            //一级菜单
                            menu.title = firstPowerName;
                            menu.type = 1;
                        }
                        if (role[firstPower] === undefined) {
                            role[firstPower] = {
                                id:powerId,
                                title: firstPowerName,
                                type:1,
                                elements:[]
                            };
                        }
                        switch (menu.type){
                            case 1:
                                role[firstPower].id = menu.id;
                                break;
                            case 2:
                                // 判断二维菜单是否已存在
                                if(role[firstPower].elements[secondPower]===undefined){
                                    role[firstPower].elements[secondPower] = {
                                        "elements": [],
                                        "title":secondPowerName,
                                        "type":2
                                    }
                                }
                                role[firstPower].elements[secondPower].id = menu.id;
                                break;
                            case 3:
                                if(role[firstPower].elements[secondPower]===undefined){
                                    role[firstPower].elements[secondPower] = {
                                        "elements": [],
                                        "title":secondPowerName,
                                        "type":2
                                    }
                                }
                                role[firstPower].elements[secondPower].elements[thirdPower] = menu;
                                break;
                            default:
                                break;
                        }
                        this.all_power.push(menu.id);
                    }
                    if(this.power.length==this.all_power.length){
                        this.all_checked=true;
                    }else {
                        this.all_checked=false;
                    }
                    this.role_power=role.$model;
                    console.log(this.role_power)
                    console.log(this.role_power[2].elements[1])
                    console.log(this.role_power[2].elements.length)
                    for(var x = 0;x<this.role_power.length;x++){
                        if(this.role_power[x]===undefined){
                            this.role_power.removeAt(x);
                        }else {
                            for(var y = 0;y<this.role_power[x].elements.length;y++){
                                if(this.role_power[x].elements[y]===undefined){
                                    this.role_power[x].elements.removeAt(y);
                                }else {
                                    for (var z = 0;z<this.role_power[x].elements[y].elements.length;z++){
                                        if(this.role_power[x].elements[y].elements[z]===undefined){
                                            this.role_power[x].elements[y].elements.removeAt(z);
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                //提交保存
                confirm:function () {
                    if (!this.power.length) {
                        toastr.error('权限分配不能为全空');
                        return;
                    }
                    ajax_post(role_save,{
                        powers:this.power,
                        role_id:this.role_info.id
                    },this)

                },
                //勾选一级菜单
                selectOne:function (item,e) {
                    var checked = e.target.checked;
                    if(checked){
                        for(var i = 0;i<item.elements.length;i++){
                            for(var j = 0;j<item.elements[i].elements.length;j++){
                                this.power.ensure(item.elements[i].elements[j].id);
                            }
                            this.power.ensure(item.elements[i].id);
                        }
                        this.power.ensure(item.id);
                    }else {
                        for(var i = 0;i<item.elements.length;i++){
                            for(var j = 0;j<item.elements[i].elements.length;j++){
                                this.power.remove(item.elements[i].elements[j].id);
                            }
                            this.power.remove(item.elements[i].id);
                        }
                        this.power.remove(item.id);
                    }
                    if(this.power.length==this.power_list.length){
                        this.all_checked = true;
                    }else{
                        this.all_checked = false;
                    }
                },
                //勾选二级菜单
                selectSec:function (item,e) {
                    var checked = e.target.checked;
                    if(checked){
                        for(var i = 0;i<item.elements.length;i++){
                            this.power.ensure(item.elements[i].id);
                        }
                        this.power.ensure(item.id);
                    }else {
                        for(var i = 0;i<item.elements.length;i++){
                            this.power.remove(item.elements[i].id);
                        }
                        this.power.remove(item.id);
                    }
                    if(this.power.length==this.power_list.length){
                        this.all_checked = true;
                    }else{
                        this.all_checked = false;
                    }
                },
                isCheckedSec:function (item) {
                    if(item.elements.length>0){
                        for(var i = 0;i<item.elements.length;i++){
                            if (this.power.indexOf(item.elements[i].id)>=0){
                                this.power.ensure(item.id);
                                return true;
                            }
                        }
                        if(this.power.indexOf(item.id)>=0){
                            this.power.remove(item.id);
                        }
                        return false;
                    }else {
                        if(this.power.indexOf(item.id)>=0){
                            return true;
                        }
                        return false;
                    }
                },
                //全选
                allChange:function (e) {
                    var checked = e.target.checked;
                    var sub = this.all_power;
                    var subLength = sub.length;
                    var esub = this.power;
                    var esubLength = esub.length;
                    if (checked == false) {
                        this.power = [];
                    } else {
                        this.power=this.all_power;
                    }
                },
                //三级菜单勾选
                powerChange:function (secItem,e) {
                    //id,二级菜单id
                    var checked = e.target.checked;
                    var esub = this.power;
                    var esubLength = esub.length;
                    if (checked == false) {
                        this.all_checked = false;
                    }else {
                        if(esubLength== this.all_power.length) {
                            this.all_checked = true;
                        }
                    }
                },
                clickOneMenu:function (e) {

                },
                clickSecMenu:function (e) {

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    var compileData = $("#compileData");
                    var info = $("#info-tips");
                    switch (cmd) {
                        case  power_list:
                            if(status==200){
                                this.power_list=data.data;
                                ajax_post(role_power,{
                                    product_code:"xspj",
                                    role_id:this.role_info.id
                                },this);
                            }
                            break;
                        case  role_power:
                            if(status==200){
                                this.rolePowerSetting(data.data);
                            }
                            break;
                        case  role_save:
                            if (status == 200) {
                                info.modal('open');
                                setTimeout(function () {
                                    info.modal('close');
                                    window.location="#role_privileges_list"
                                }, 1000);
                                this.modal.msg = msg;
                            }
                            break;
                    }
                },
                cancel:function () {
                    window.history.back(-1);
                }
            });
            table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });