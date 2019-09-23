define([
        "jquery",
        C.CLF('avalon.js'),"date_zh",
        C.Co("health", "health_project_check/detail/detail", "css!"),
        C.Co("health", "health_project_check/detail/detail", "html!"),
        C.CM('three_menu_module'),'layer'],
    function ($, avalon,date_zh,css, html,three_menu_module,layer) {
        // 查看详情
        var api_detail = api.api + "score/health_project_detail"

        var api_check = api.api + "score/health_project_check"
        //查看方案详情
        var api_get_health_solu = api.api + "score/get_health_solu";
        var avalon_define = function (pms) {
            var new_health_item = avalon.define({
                $id: "edit_health_project",
                data: {
                    _id:"",
                    //项目名
                    name:"",
                    // 开始时间
                    start:"",
                    // 结束时间
                    end:"",
                    // 适用年级
                    due_grade: "",
                    // 解决方案ID
                    solution:""
                }, 
                solu_data:{
                     _id:"",
                    solu_name:"",
                    due_grade:"7",
                    status:"0",
                    health_sole_item:[],
                },
                form_list: [],
                select_health:[],
                boy:0.0,
                girl:0.0,
                init:function(){
                    ajax_post(api_detail, pms, this)
                },
                get_detail_conplete:function(data){               
                    this.data=data.data
                    ajax_post(api_get_health_solu,{"_id":this.data.solution._id},this)
                },
                click:function () {
                    var self = this;
                    layer.confirm('确认审核？', {
                            btn: ['确认', '取消'] //按钮
                    }, function() {
                        ajax_post(api_check,self.data.$model, self);
                        layer.closeAll();
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case api_detail:
                                this.get_detail_conplete(data)
                            break;
                            case api_check:
                                 window.location = "#health_project_check";
                            break;
                            case api_get_health_solu:
                                for(i in data.data.form_list){
                                    if(!data.data.form_list[i].rate){
                                        data.data.form_list[i]["rate"]=0;
                                    }
                                }
                                this.form_list=data.data.form_list;
                                if(data.data.solu){
                                    this.solu_data=data.data.solu;
                                    for( i in this.solu_data.health_sole_item){
                                        this.select_health.push(this.solu_data.health_sole_item[i].health_item)
                                        for(j in this.form_list){
                                            if(this.form_list[j]._id==this.solu_data.health_sole_item[i].health_item){
                                                this.form_list[j].rate=this.solu_data.health_sole_item[i].rate
                                                break;
                                            }
                                        }
                                    }
                                    for( i in this.form_list){
                                        if(this.form_list[i].for_sex==1){
                                            this.boy+=parseFloat(this.form_list[i].rate)
                                        }else{
                                            this.girl+=parseFloat(this.form_list[i].rate)
                                        }
                                    }
                                }
                                break;
                            break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                back:function () {
                    window.location = "#health_project_check";
                }

            });
            new_health_item.init()
            return new_health_item;
        };
        return {
            view: html,
            define: avalon_define
        }
    });