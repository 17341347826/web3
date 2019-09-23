/**
 * Created by Administrator on 2018/6/21.
 */
define(["jquery",
        C.CLF('avalon.js'),
        C.Co("eval_param_set", "e_task_control/achieve_maintenance/achieve_maintenance", "css!"),
        C.Co("eval_param_set", "e_task_control/achieve_maintenance/achieve_maintenance", "html!"),
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
                $id: "achieve_maintenance",
                //当前页面：类型设置-1，上传数量设置-2，积分规则设置-3，任务开放时间设置-4，个性特长-5
                sit_type:3,
                //登陆者等级
                user_high:'',
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
                // //编辑
                // edit:function(id,el){
                //     this.num=id;
                //     this.btn_type=true;
                // },
                // //保存
                // save:function(id,el){
                //     this.num=-1;
                //     this.btn_type=false;
                //     //修改类型分值
                //     ajax_post(update_achievement,{id:id,score:el.score},this);
                // },
                //编辑
                edit:function(idx,el){
                    var self=this;
                    layer.prompt({title: '请输入新的积分', formType: 2}, function(text, index){
                        if(text > 0 && text<100){
                            layer.close(index);
                            el.score=Number(text);
                            //修改类型分值
                            ajax_post(update_achievement,{id:el.id,score:el.score},self);
                            toastr.success('修改积分成功!');
                        }else if(text>100){
                            toastr.warning('积分超出有效范围');
                        }else{
                            toastr.warning('请输入正确的积分');
                        }
                    });
                },
                cds: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userType = data.data.user_type;
                        var user_data = JSON.parse(data.data["user"]);
                        // user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                        self.user_high = data.data.highest_level;
                        //请求列表
                        self.list_achieve();
                    });
                },
                //页面切换
                sit_change:function(num){
                    if(num == 1){
                        window.location='#real_a_type_set?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type+'&start_time='+pmx.start_time+'&end_time='+pmx.end_time;
                    }else if(num == 2){
                        window.location='#real_a_upload_num_set?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type+'&start_time='+pmx.start_time+'&end_time='+pmx.end_time;
                    }else if(num == 3){
                        window.location='#achieve_maintenance?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type+'&start_time='+pmx.start_time+'&end_time='+pmx.end_time;
                    }else if(num == 4){
                        window.location='#real_a_t_t_set?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
                            '&module_type='+pmx.module_type+'&start_time='+pmx.start_time+'&end_time='+pmx.end_time;
                    }else if(num == 5){
                        window.location='#special_personality?grade_id='+pmx.grade_id+'&is_switch='+pmx.is_switch+
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
                            //修改类型分值
                            case update_achievement:
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