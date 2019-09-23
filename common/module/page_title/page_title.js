/**
 * 页面命名
 */
define([
        C.CLF('avalon.js'),
        C.CM("page_title", "css!"),
        C.CM("page_title", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js")
    ],
    function (avalon, css,html, x, data_center) {
        var pdetail = undefined;
        var vm = avalon.component('page_title_div', {
            template: html,
            defaults: {
                base_path:"",
                //页面名
                title: "",
                //返回按钮的有否 0：没有；1：有
                reBack:'',
                onReady:function(pmx){
                    if(this.title){
                        if(this.title=='帮助'){
                            this.base_path=this.title;
                            return;
                        }else{
                            this.title='>'+this.title;
                        }
                    }else{
                        this.title='';
                    }
                    var page_title={}
                    if(data_center.get_key('page_title')){
                        page_title = data_center.get_key('page_title')
                    }else{
                        var menu = data_center.get_key('menu')
                        for(var i = 0 ; i < menu.length ; i++){
                                var k = menu[i].url
                                var v = menu[i].first_power+'>'+menu[i].second_power+'>'+menu[i].power_name
                                page_title[k]=v
                        }
                        data_center.set_key("page_title",page_title)
                    }
                    var hash = window.location.hash.replace("/","")
                    if(hash.indexOf("?")>0){
                        hash = hash.substring(0,hash.indexOf("?"))
                    }
                    if(page_title[hash]){
                        title = page_title[hash].split(">")
                        var obj = {
                            first_level_menu:title[0],
                            two_level_menu:title[1],
                            three_level_menu :title[2]
                        }
                        data_center.set_key('menu_level',obj);
                    }
                    var get_menu=data_center.get_key('menu_level');
                    var path = page_title[hash] || (get_menu.first_level_menu+'>'+get_menu.two_level_menu+'>'+get_menu.three_level_menu)
                    this.base_path=path+this.title;
                    
                }
            }


        });
        return vm;
    });
