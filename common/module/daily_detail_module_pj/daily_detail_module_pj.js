/**
 * 品德详情组件
 */
define([
        "jquery",
        "jquery-weui",
        'swiper',
        C.CLF('avalon.js'),
        C.CM("worksDetail", "css!"),
        C.CM("daily_detail_module_pj", "css!"),
        C.CM("daily_detail_module_pj", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function ($, weui, swiper, avalon, css1, css2, html, x, data_center) {
        var pdetail = undefined;
        // 作品基本详细信息组件
        var detail = avalon.component('ms-daily_module_pj', {
            template: html,
            defaults: {
                url_file: "",//获取文件
                url: "",//家长查询子女日常表现列表
                //隐藏内容的显示隐藏
                show: -1,
                //正在加载那部分的显示隐藏
                is_show:-1,
                url_for: function (id) {
                    return this.url_file + "?token=" + sessionStorage.getItem("token") + "&img=" + id;
                },
                //展开、收起
                btn_show:-1,

                data_list: [],
               data:{
                   //查询偏移量
                   offset: 0,
                   //查询数据量
                   rows: 15
               },
                //请求参数
                extend: {
                    // start_date: '',
                    //学生guid
                    guid: '',
                    //等分类型 1加分2减分 8全部
                    mark_type: '',
                    // end_date: '',
                    //8全部 4公示中 5已归档
                    status: '',
                },
                //获取当前时间----结束时间
                get_end_time: function () {
                    var mydate = new Date();
                    var str = "" + mydate.getFullYear() + "-";
                    str += (mydate.getMonth() + 1) + "-";
                    str += mydate.getDate();
                    console.log(str);
                    return str;
                },
                //展开
                open_btn: function (ind) {
                    this.show = ind;
                    // this.btn_show=0;
                    var mySwiper = new Swiper('.swiper-container', {
                        loop: true,
                        autoplay: 1000//可选选项，自动滑动
                    });
                },
                //收起
                close_btn: function (ind) {
                    // var self=this;
                    // self=data_list[ind];
                    this.show = -2;
                    // this.btn_show=-1;
                },
                //获取开始时间
                get_start_time: function () {
                    var mydate = new Date();
                    var str = "" + mydate.getFullYear() + "-";
                    str += (mydate.getMonth()) + "-";
                    str += mydate.getDate();
                    console.log(str);
                    return str;
                },
                loading:false,
                //滚动加载
                loading_list:function(){
                    var self=this;
                    console.log(self.data.offset);
                    $(document.body).infinite().on("infinite", function() {
                        if(self.loading) return;
                        self.loading = true;
                        setTimeout(function() {
                            self.data.offset=self.data.offset+15;
                            console.log(self.data.offset);
                            ajax_post(self.url, {
                                guid: self.extend.guid,
                                mark_type: 8, status: 8,
                                offset:self.data.offset, rows:self.data.rows
                            }, self);
                            self.loading = false;
                        }, 1500);   //模拟延迟
                    });
                },
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        self.user_type = Number(data.data.user_type);
                        self.extend.guid = JSON.parse(data.data.user).student.guid;
                        console.log(self.extend.guid);
                        // self.loading_list();
                        console.log(self.data.offset);
                    })
                },
                productGetDetalisById: function () { //get详细
                    //家长查询子女表现列表
                    ajax_post(this.url, {
                        guid: this.extend.guid,
                        mark_type: 8, status: 8,
                        offset:this.data.offset, rows:this.data.rows
                    }, this);
                },
                complete_daily: function (data) {
                    if(this.data_list.length==0){
                        this.data_list=data.data.list;
                    }else{
                        for(var i=0;i<data.data.list.length;i++){
                            this.data_list.push(data.data.list[i]) ;
                        }
                        //清除页面的正在加载那部分
                        if(this.data_list.length==data.data.count){
                            this.is_show=-2;
                        }
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //家长查询子女品德列表
                            case this.url:
                                this.complete_daily(data);
                                break;
                        }
                    } else {
                        layer.msg(msg)
                    }
                },
                onReady: function () {
                    // pdetail=this;
                    this.cb();
                    this.productGetDetalisById();
                    this.loading_list();
                }
            }
        })
    });