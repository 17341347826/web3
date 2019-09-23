/**
 * Created by Administrator on 2018/8/23.
 */
define(["jquery",C.CLF('avalon.js'),'layer',"select2",
        C.Co("user","department_manage/department_manage","css!"),
        C.Co("user","department_manage/department_manage","html!"),
        C.CMF("router.js"),C.CMF("data_center.js"),C.CM('three_menu_module')
    ],
    function($,avalon,layer,select2,css, html, x, data_center,three_menu_module) {
        //获取单位部门
        var api_get_office = api.user + "office/get";
        //新增单位部门
        var api_save_office = api.user + 'office/save';
        //删除部门
        var api_del_office = api.user + 'office/del';
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "department_manage",
                //身份判断
                highest_level:"",
                //请求参数
                extend:{
                    name:'',
                    per:'',
                },
                //返回数据
                dataList:[],
                // 部门负责人
                charge_list:[
                    {name:'张三',guid:'123'},
                    {name:'李四',guid:'124'},
                    {name:'王五',guid:'125'},
                    {name:'赵六',guid:'126'},
                ],
                cb:function() {
                    var self = this;
                    data_center.uin(function(data) {
                        //user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        self.highest_level = data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        //获取单位部门	2：按市级。3：按区县。4：按学校
                        ajax_post(api_get_office,{},self);
                    });
                },
                //新增
                addInfo:function(){
                    window.location = '#department_add?type='+1;
                },
                //配置
                configure:function(){

                },
                //修改
                update:function(el){
                    var al = JSON.stringify(el);
                    window.location = '#department_add?type='+2+'&el='+al;
                },
                //删除
                delete:function(dep_id){
                    var self = this;
                    layer.confirm('确定要删除该条记录吗？', {
                        btn: ['确定','取消'] //按钮
                    }, function(){
                        ajax_post(api_del_office,{id:dep_id},self);
                        layer.closeAll();
                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            // 单位部门
                            case api_get_office:
                                this.complete_get_office(data);
                                break;
                        //        刪除
                            case api_del_office:
                                this.complete_del_office(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //獲取
                complete_get_office:function (data) {
                    this.dataList = data.data.list;
                },
            //    刪除
                complete_del_office:function(data){
                    toastr.success('删除成功！');
                    //获取单位部门	2：按市级。3：按区县。4：按学校
                    ajax_post(api_get_office,{},this);
                },
            });
            vm.$watch('onReady', function() {
                this.cb();
                //模糊查询
                // $(".js-example-basic-single").select2();
                // $("#charge-person").on("change", function (e) {
                //     var charge_info = $("#charge-person").val();
                //     vm.extend.student_guid = charge_info.split('|')[0];
                // });
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
