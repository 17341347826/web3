/**
 * Created by Administrator on 2018/3/5.
 */
define(["jquery",C.CLF('avalon.js'),'layer',
        C.Co("user","district_club_number_list/district_club_number_list","css!"),
        C.Co("user","district_club_number_list/district_club_number_list","html!"),
        C.CMF("router.js"),C.CMF("data_center.js"),C.CM('three_menu_module'), 'jquery_print'
    ],
    function($,avalon,layer,css, html, x, data_center,three_menu_module,jquery_print) {
        //获取区县
        var api_get_area = api.user+"school/arealist.action";
        //社团统计
        var api_get_info = api.growth+"communityManagement_communityStatistics";
        //社团导出
        var api_club_export = api.api+'GrowthRecordBag/export_communitys_count';
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "district_club_number_list",
                current_semester:"",
                //身份
                highest_level:"",
                city:"",
                //区县集合
                areaList:[],
                areaInfo:"",
                //返回数据：两个装
                dataList:[],
                dataList_two:[],

                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var cArr = [];
                        var highest_level = data.data.highest_level;
                        self.highest_level = highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        var city=tUserData.city;
                        var district = tUserData.district;
                        if(highest_level == 2){//市级用户
                            ajax_post(api_get_area,{city:city},self);
                            // //获取社团个数string	2：按市级。3：按区县。4：按学校
                            // ajax_post(api_get_info,{departmentleveltype:'3'},self);
                        }else if(highest_level == 3){//区县级用户
                            //获取社团个数string	2：按市级。3：按区县。4：按学校
                            ajax_post(api_get_info,{departmentleveltype:'3'},self);
                        }
                    });
                },
                //导出
                club_export:function(){
                    var url = api_club_export + '?token=' + sessionStorage.getItem('token') + '&departmentleveltype=' + 3;
                    window.open(url);
                },
                //打印
                club_printing:function(){
                    // bdhtml=window.document.body.innerHTML;//获取当前页的html代码
                    // sprnstr="<!--startprint-->";//开始打印标识字符串有17个字符
                    // eprnstr="<!--endprint-->";//结束打印标识字符串
                    // prnhtml=bdhtml.substr(bdhtml.indexOf(sprnstr)+17);//从开始打印标识之后的内容
                    // prnhtml=prnhtml.substring(0,prnhtml.indexOf(eprnstr));//截取开始标识和结束标识之间的内容
                    // window.document.body.innerHTML=prnhtml;//把需要打印的指定内容赋给body.innerHTML
                    // window.print();//调用浏览器的打印功能打印指定区域
                    // window.document.body.innerHTML=bdhtml;//重新给页面内容赋值；
                    // window.location.reload();
                    $('#print_content').print({
                        globalStyles:true
                    });
                },
                detail:function(e){
                    window.location='#leader_club_detail?&id='+e + '&departmentleveltype = ' + 3;
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取区县
                            case api_get_area:
                                this.complete_get_area(data);
                                break;
                            //查询
                            case api_get_info:
                                this.dataList = data.data.list;
                                this.dataList_two=data.data.list;
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //选择区县
                areaChange:function () {
                    var self=this;
                    self.dataList=self.dataList_two;
                    if(self.areaInfo == ''){
                        self.dataList=self.dataList_two;
                    }else{
                        var get_areaInfo = self.areaInfo;
                        var choose_ary=[];
                        var com_ary=[];
                        choose_ary=self.dataList;
                        for(var i=0;i<choose_ary.length;i++){
                            if(get_areaInfo==choose_ary[i].district){
                                com_ary.push(choose_ary[i]);
                            }
                        }
                        // console.log(com_ary);
                        self.dataList=com_ary;
                        // console.log(self.dataList);
                    }
                },
                //获取区县
                complete_get_area:function (data) {
                    this.areaList = data.data.list;
                    //获取社团个数string	2：按市级。3：按区县。4：按学校
                    ajax_post(api_get_info,{departmentleveltype:'3'},this);
                },
                go_href:function (num) {
                    if(num == 1){
                        window.location = "#city_club_number_list";
                    }else if(num == 2){
                        window.location = "#district_club_number_list";
                    }else{
                        window.location = "#school_club_number_list";
                    }
                }
            });
            vm.$watch('onReady', function() {
                this.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
