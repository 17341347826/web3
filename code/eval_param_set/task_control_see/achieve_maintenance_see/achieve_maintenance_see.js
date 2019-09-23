/**
 * Created by Administrator on 2018/6/21.
 */
define(["jquery",
        C.CLF('avalon.js'),
        C.Co("eval_param_set", "task_control_see/achieve_maintenance_see/achieve_maintenance_see", "css!"),
        C.Co("eval_param_set", "task_control_see/achieve_maintenance_see/achieve_maintenance_see", "html!"),
        C.CM("table"),
        C.CM('page_title'),
        "layer",
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function ($,avalon, css, html, tab,page_title, layer,router, data_center) {
        //查询成就奖励积分
        var list_achievement= api.growth + "list_achievement_manage";
        //修改类型分值
        var update_achievement= api.growth + "update_achievement_manage";
        var avalon_define = function(pmx) {
            var table = avalon.define({
                $id: "achieve_maintenance_see",
                //当前页面：类型设置-1，上传数量设置-2，积分规则设置-3，任务开放时间设置-4，个性特长-5
                sit_type:3,
                //按钮状态
                btn_type:false,
                //当前按钮序号
                num:-1,
                //列表参数
                data: [],
                //请求列表
                list_achieve:function(){
                    ajax_post(list_achievement,{},this);
                },
                cds: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userType = data.data.user_type;
                        var user_data = JSON.parse(data.data["user"]);
                        //请求列表
                        self.list_achieve();
                    });
                },
                //页面切换
                sit_change:function(num){
                    if(num == 1){
                        window.location='#real_a_type_set_see?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type+'&start_time='+pmx.start_time+'&end_time='+pmx.end_time;
                    }else if(num == 2){
                        window.location='#real_a_upload_num_set_see?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type+'&start_time='+pmx.start_time+'&end_time='+pmx.end_time;
                    }else if(num == 3){
                        window.location='#achieve_maintenance_see?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type+'&start_time='+pmx.start_time+'&end_time='+pmx.end_time;
                    }else if(num == 5){
                        window.location='#special_personality_see?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type+'&start_time='+pmx.start_time+'&end_time='+pmx.end_time;
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询成就奖励积分
                            case list_achievement:
                                this.data=data.data;
                                break;
                        }
                    } else {
                        toastr.error('操作失败');
                    }
                },
            });
            table.cds();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });