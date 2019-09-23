/**
 * 品德详情组件
 */
define([
        C.CLF('avalon.js'),
        C.CM("choice_question","css!"),
        C.CM("choice_question","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"],
    function(avalon, css, html, x, data_center,layer) {
        // 作品基本详细信息组件
        var detail = avalon.component('ms-simple-question', {
            template: html,
            defaults: {
                //判断是编辑模式还是完成模式
                start_edit:true,
                //每道题的标题名称
                simple_title:'请在此输入问题标题',
                //必答是否选中
                must_answer:true,
                //填写提示是否选中
                hinted:false,
                option:'选项',
                //选项序号
                option_index:1,
                //每道题（数组里为对象，对象为每道题的选项）
                title_arr:[],
                is_show_model:false,

                //点击完成时
                complete:function () {
                    this.start_edit = false;
                },
                //选项输入框失去焦点的时候
                sure_option:function (option_index) {
                    if(this.title_arr[option_index].option_name==''){
                        this.title_arr[option_index].option_name = '选项'+(option_index+1);
                    }
                },
                //添加一个选项
                add_option:function () {
                    var option_obj = {
                        option_name:'',
                        image:'',
                        option_desc:''
                    }
                    option_obj.option_name = '选项'+this.option_index;
                    this.title_arr.push(option_obj);
                    this.option_index++;
                },
                //减少一个选项
                reduce_option:function (option_index) {
                    this.title_arr.splice(option_index,1)
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            default:
                                break;
                        }
                    } else {
                        layer.msg(msg)
                    }
                },
                //弹出层
                show_model:function (option_index) {
                    this.is_show_model = true;
                },

                //关闭弹出层
                close_model:function () {
                    this.is_show_model = false;
                },

                //初始化选项个数
                detal_title_arr:function () {
                    var title_arr_length = this.title_arr.length
                    if(title_arr_length==0){
                        var option_obj = {
                            option_name:'',
                            image:'',
                            option_desc:''
                        }
                        for(var i=0;i<2;i++){
                            option_obj.option_name = '选项'+this.option_index;
                            this.title_arr.push(option_obj);
                            this.option_index++;
                        }
                    }
                    // for(var i)
                },
                //页面初始化
                onReady: function() {
                    this.detal_title_arr();
                }
            }
        })
    });