/**
 * 统计
 */
define([
        C.CLF('avalon.js'),
        C.CM("myCount", "css!"),
        C.CM("cardCount", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function (avalon, css,html, x, data_center) {
        var pdetail = undefined;
// 标志性卡基本详细信息组件
        var myCount = avalon.component('ms-card-count', {
            template: html,
            defaults: {
                title: "",
                // 参数
                status: "",
                fk_class_id:'',
                fk_grade_id:'',

                // ach_state: "",
                // art_state: "",
                dataNum: [],
                span_show:true,
                url: "",
                src:"",
                it_ary:[],
                myCount: function () {//get详细
                    if(this.url=="" && this.status==""){
                        // console.info("show span")
                        this.span_show=false;
                    }else {

                        if( this.it_ary.indexOf(1)>=0 && this.it_ary.indexOf(2) >=0)
                        {
                            // console.info("class id:",this.fk_class_id)
                            ajax_post(this.url, {
                                status: this.status,
                                fk_class_id:this.fk_class_id,
                                fk_grade_id:this.fk_grade_id} , this);
                        }

                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    this.dataNum = data.data;
                },
                full_path:function (x) {
                    return C.CI(this.src);
                },
                onReady: function () {
                    var self = this;
                    data_center.link(self.$id, self);
                    if( this.fk_class_id == "" && this.fk_grade_id == "" && this.url != "")
                    {
                        self.$watch("fk_class_id",function(){
                            self.it_ary.push(1);
                            self.myCount();
                        });
                        self.$watch("fk_grade_id", function(){
                            self.it_ary.push(2);
                            self.myCount();
                        })
                    }
                    else
                    {
                        if( this.fk_grade_id == "" && this.fk_class_id != ""  ){
                            this.it_ary.push(1);
                            self.$watch("fk_grade_id", function(){
                                self.it_ary.push(2);
                                self.myCount();
                            })
                        }
                        else if( this.fk_grade_id != "" && this.fk_class_id == "" ){
                            this.it_ary.push(2);
                            self.$watch("fk_class_id", function(){
                                self.it_ary.push(1);
                                self.myCount();
                            })
                        }
                        else
                        {
                            self.it_ary.push(1);
                            self.it_ary.push(2);
                            self.myCount();
                        }
                    }


                }
            }
        });
    });
