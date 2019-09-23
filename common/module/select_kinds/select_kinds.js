/**
 * Created by Administrator on 2018/7/18.
 */
/**
 * 多种筛选框样式
 */
define([
        C.CLF('avalon.js'),
        C.CM("select_kinds", "css!"),
        C.CM("select_kinds", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"],
    function (avalon, css, html, x, data_center, layer) {
        var pdetail = undefined;
        //过滤器--判断后台班级名称是否返回'班'
        avalon.filters.class_ban = function(name){
            if(name.indexOf("班") != -1)
                return name;
            else
                return name+'班'
        };
        // 作品基本详细信息组件
        var detail = avalon.component('ms-select-kinds', {
            template: html,
            defaults: {
                //筛选框类型:0-学年学期；1-区县；2-校；3-年级；4-班级 ；5-自主列表
                //41-教师以上身份班级
                s_kind:'',
                //下拉框显示隐藏：true-显示，false-隐藏
                is_show:false,
                //筛选框内容
                show_name:'',
                //筛选框数组
                data_arr:[],
                empty_allert:"",
                //双向绑定数据
                duplex_params:'',
                //显示框
                drop_show:function(){
                    if(this.empty_allert != "" && this.data_arr.length==0){
                        toastr.info(this.empty_allert);
                    }
                    this.is_show = true;
                    //使下拉框获取焦点事件
                    $('.s-hide').focus();
                },
                //下拉框失去焦点
                div_blur:function(){
                    this.is_show = false;
                },
                //选项改变
                s_change:function(){

                },
                //选项改变-改变呈现内容
                name_change:function(name){
                    this.show_name = name;
                    this.is_show = false;
                },
                onReady: function () {

                }
            }
        })

    });
