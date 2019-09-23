/**
 * 图片查看组件
 * Created by uptang on 2017.04.28.
 */
define([
    C.CLF('avalon.js'),
    C.CM("viewer","css!"),
    C.CM("viewer","html!"),
    C.CMF("data_center.js"),
    C.CMF("formatUtil.js")],
    function(avalon, css, html, data_center, formatUtil) {
    var detail = avalon.component('ms-ele-view', {
        template: html,
        defaults: {
            src: "",
            video_src:"",
            show_opt: false,
            token: "",
            image_info: {
                "guid": "",
                "inner_name": "",
                "mini_type": "",
                "desc": "",
                "status": "",
                "rotation": 0,
                "src": "",
                'name':""
            },
            json:function (x) {
              return JSON.stringify(x)
            },
            modify: true,
            icon_success: C.CI("success.png"),
            params: {},
            get_file_info: function() {
                // console.info("正在提取:image"+this.image_info.$id)
                // return this.image_info.$model;
                return {
                    "guid": this.image_info.guid,
                    "inner_name": this.image_info.inner_name,
                    "mini_type": this.image_info.mini_type,
                    "desc": this.image_info.desc,
                    "status": this.image_info.status,
                    "rotation": this.image_info.rotation,
                    "name":this.image_info.name
                };
            },
            on_mouse_enter: function() {
                this.show_opt = true;
            },
            on_mouse_leave: function() {
                this.show_opt = false;
            },
            on_delete: function() {

            },
            rotation_str: function() {
                var deg = 'rotate(' + this.image_info.rotation + 'deg)'
                return {
                    'WebkitTransform': deg,
                    'MosTransform': deg,
                    'OTransform': deg,
                    'transform': deg
                }
            },
            rotate: function(x) {
                this.image_info.rotation += x;
            },
            onDispose: function() {
                data_center.remove_link(this.$id)
            },
            onReady: function() {
                data_center.link(this.$id, this);
                if (this.image_info.guid != '' && this.image_info.guid != undefined) {
                    this.src = api.api+"file/get?img=" + this.image_info.guid + "&token=" + this.token;
                }
                    // else if(){
                //     this.video_src=api.api+"file/get?token=" + this.image_info.guid + "&img=" + this.token;
                //     this.video_tag=true;
                // }
                else {
                    this.src = this.image_info.src;
                    this.video_src=this.image_info.src;
                }

            },
            quit: function() {}
        }
    })
});