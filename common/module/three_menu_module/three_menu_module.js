/**
 * 三级菜单
 */
define(['jquery',
        C.CLF('avalon.js'),'layer',
        C.CM("three_menu_module", "html!"),
        C.CM("three_menu_module", "css!"),
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function ($,avalon,layer,html,css,x, data_center) {
        var pdetail = undefined;
        var vm = avalon.component('ms-three-menu-module', {
            template: html,
            defaults: {
                // arr:[
                //     {id:1,power_name:'日常表现',url:'#self_scheme'},
                //     {id:2,power_name:'民主评价',url:'#a-k-perform'},
                //     {id:3,power_name:'目标计划',url:'#a_a_element'}
                // ],
                three_list:[],
                //三级菜单选中
                is_menu_show:0,
                get_info:function () {
                    // var two=data_center.get_key('three_info');
                    // if(two !=null){
                    //     this.three_list =two.elements;
                    // }

                    /*获取当前网址:
                    index.html:'';
                     index.html#evaluation_scheme:'#evaluation_scheme';
                     index.html#evaluation_scheme?mod=1:'#evaluation_scheme?mod=1'
                     */
                    //判断当前网址是否在已录入的菜单列表中
                    var is_exist = false;
                    //为了区分出指标评价方案
                    if(window.location.hash != '#evaluation_scheme?mod=2' && window.location.hash != '#evaluation_scheme?mod=1' && window.location.hash != '#evaluation_scheme?mod=3'){
                        var url_current = window.location.hash.split('?')[0];
                    }else{
                        var url_current = window.location.hash;
                    }
                    //消息页面
                    if(url_current == '#message_center'){
                        this.three_list =[];
                        return;
                    }
                    //处理后的菜单
                    var menu = JSON.parse(sessionStorage.getItem('handle_menu'));
                    for(var i=0;i<menu.length;i++){
                        //获取当前是直接跳转还是打开子菜单
                        var type = menu[i].content.type[0];
                        if(window.location.hash == '#evaluation_scheme?mod=2' || window.location.hash == '#evaluation_scheme?mod=1' || window.location.hash == '#evaluation_scheme?mod=3'){
                            var first_url = menu[i].url;
                        }else{
                            var first_url = menu[i].url.split('?')[0].replace(/[\r\n]/g,"");
                        }
                        if(url_current == first_url && type == 'skip') {//一级菜单，不存在二级
                            this.three_list = [];
                            this.is_exist = true;
                            return;
                        }
                        var second_menu = menu[i].elements;
                        for(var j=0;j<second_menu.length;j++){
                            var second_type = second_menu[j].content.type[0];
                            if(window.location.hash == '#evaluation_scheme?mod=2' || window.location.hash == '#evaluation_scheme?mod=1' || window.location.hash == '#evaluation_scheme?mod=3'){
                                var second_url = second_menu[j].url;
                            }else{
                                var second_url = second_menu[j].url.split('?')[0].replace(/[\r\n]/g,"");
                            }
                            if(url_current == second_url  && second_type == 'skip'){//二级菜单，不存在三级菜单
                                this.three_list = [];
                                this.is_exist = true;
                                return;
                            }
                            if(url_current == second_url  && second_type == 'expend'){//二级菜单存在三级菜单
                                this.three_list = second_menu[j].elements;
                                this.is_exist = true;
                                // this.is_menu_show = j;
                                // data_center.set_key('is_menu_show',this.is_menu_show);
                                return;
                            }
                            var third_menu = second_menu[j].elements;
                            for(var m=0;m<third_menu.length;m++){
                                if(window.location.hash == '#evaluation_scheme?mod=2' || window.location.hash == '#evaluation_scheme?mod=1' || window.location.hash == '#evaluation_scheme?mod=3'){
                                    var third_url = third_menu[m].url;
                                }else{
                                    var third_url = third_menu[m].url.split('?')[0].replace(/[\r\n]/g,"").trim();
                                }
                                if(url_current == third_url){//自身是三级菜单
                                    this.three_list = third_menu;
                                    this.is_exist = true;
                                    this.is_menu_show = m;
                                    data_center.set_key('is_menu_show',this.is_menu_show);
                                    return;
                                }
                            }
                        }
                    }
                    // console.log(this.three_list);
                    if(is_exist == false){
                        var two=data_center.get_key('three_info');
                        if(two !=null){
                            this.three_list =two.elements;
                        }
                    }
                },
                menu_click:function(idx){
                    this.is_menu_show=idx;
                    data_center.set_key('is_menu_show',this.is_menu_show);
                    // //回到顶部
                    // $('html,body').animate({scrollTop:0},0);
                    //清除滚动监测
                    $(window).off("scroll");
                    //清除加载提示
                    var loads = $('.ui-loading');
                    if(loads.length>0){
                        $('.ui-loading').remove();
                    }
                },
                onReady: function () {
                    this.get_info();
                    //is_menu_show-代表三级是否选中
                    var a=data_center.get_key('is_menu_show');
                    // console.log(this.is_menu_show);
                    if(a!=undefined && a!=null){
                        this.is_menu_show=data_center.get_key('is_menu_show');
                    }
                    // //回到顶部
                    // $('html,body').animate({scrollTop:0},0);
                }
            }
        });
    });
