/**
 * Created by Administrator on 2018/1/25.
 */
define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_xy/wrong_topic_book", "error_detail/error_detail", "css!"),
        C.Co("weixin_xy/wrong_topic_book", "error_detail/error_detail", "html!"),
        C.CMF("data_center.js")
    ],
    function ($, avalon, css, html, data_center) {
        //查询我的答案图片
        var get_ans_img_api = api.wy + "svc_error/paper_pull";
        //查询主观题的AB
        var get_paper_list = api.wy + "svc_error/get_paper_list";
        var avalon_define = function (par) {
            var vm = avalon.define({
                $id: "error_detail",
                init: function () {
                    par = {
                        fkKsId:"4",
                        ctmc:"KGMARK9",
                        xjh:"700203018",
                        kcbh:"1",
                        cth:"9",
                        ctlx:"2"//客观1 主观:2  1就不需要学生答案
                    };
                    this.data.fkKsId = par.fkKsId;
                    this.data.ctmc = par.ctmc;
                    this.data.xjh = par.xjh;
                    this.data.kcbh = par.kcbh;
                    this.data.cth = par.cth;
                    this.data.ctlx = par.ctlx;
                    var item_num = par.ctlx + '-' + par.cth;
                    if(par.ctlx == 2){
                        //指定题号-获取学生试卷
                        this.my_answer = get_ans_img_api + '/' + par.fkKsId + '/' +
                            par.kcbh + '/' + par.xjh + '/' + item_num;
                    }
                    ajax_post(get_paper_list,{exam_code:Number(par.fkKsId),subject_code:Number(par.kcbh),zkzh:par.xjh},this);

                },
                my_answer:"",//学生答案
                original_problem:"",//原题
                correct_answer:"",//标准答案
                data:{
                    fkKsId:"",
                    ctmc:"",
                    xjh:"",
                    kcbh:"",
                    cth:"",
                    ctlx:""//客观1 主观:2  1就不需要学生答案
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case get_paper_list:
                                this.complete_paper_list(data);
                                break;
                        }
                    } else {
                        $.alert(msg);
                    }
                },
                complete_paper_list:function (data) {
                    var tag = data.data[0];
                    //item_type # 1：原题 2.答案 3:格式文件
                    //原题
                    this.original_problem = get_ans_img_api + '/' + this.data.fkKsId + '/' +
                        this.data.cth + '/' + 1 + '/' + this.data.kcbh + '/' + tag;
                    //标准答案
                    this.correct_answer = get_ans_img_api + '/' + this.data.fkKsId + '/' +
                        this.data.cth + '/' + 2 + '/' + this.data.kcbh + '/' + tag;
                }

            });
            require(["jquery_weui"], function (j) {
                vm.init();
            });
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    });