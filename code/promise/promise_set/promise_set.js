h2c = null;
vp = undefined;
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('promise', 'promise_set/promise_set', 'html!'),
        C.Co("notice", "create_notice/style", "css!"),
        C.Co('promise', 'promise_set/promise_set', 'css!'),
        C.Co('promise', 'promise_set/font-awesome.min', 'css!'),
        C.Co('promise', 'promise_set/wysiwyg-editor', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CMF("formatUtil.js"),
        C.CLF('html2canvas.js')
    ],
    function (avalon, layer, html, css1,css2, css3,css4,data_center,
              three_menu_module,formatUtil,html2canvas) {
        h2c = html2canvas;
        var avalon_define = function () {
            var HTTP_X = location.origin;
            var api_save = api.api + "GrowthRecordBag/goodFaithCommitment_save";
            var api_check = api.api + "GrowthRecordBag/goodFaithCommitment_query_by_level";
            var api_uploader_base64 = HTTP_X + "/api/file/uploader_base64";
            var instance = undefined;
            var vm = avalon.define({
                $id: "promise_set",
                is_yulan:true,
                yu_lan_img:"",
                instance:"",
                user_num:0,
                id:"",
                //highest_level 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师 7个体
                user_list:[
                    {name:"县(区)管理用户",highest_level:3,user_type:''},
                    {name:"学校管理用户",highest_level:4,user_type:''},
                    {name:"志愿招生",highest_level:41,user_type:'1'},
                    {name:"教师",highest_level:6,user_type:1},
                    {name:"学生",highest_level:7,user_type:2},
                    {name:"家长",highest_level:7,user_type:3}
                ],
                re_data:{
                    syr_dj:3,
                    syr_lx:"0"
                },
                data:{
                    id:"",
                    cxcn_nr:"",
                    syr_dj:3,
                    syr_lx:"0,1",
                    cxcnsj:""
                },
                user_change:function ($index,el) {
                    this.user_num = $index;
                    var highest_level = el.highest_level;
                    this.data.syr_dj = highest_level;
                    this.re_data.syr_dj = highest_level;
                    if(highest_level == 3 || highest_level == 4){
                        if(el.user_type == ''){
                            this.data.syr_lx = '0,1';
                            this.re_data.syr_lx = '0,1';
                        }else{
                            this.data.syr_lx = el.user_type;
                            this.re_data.syr_lx = el.user_type;
                        }
                    }else{
                        this.data.syr_lx = el.user_type;
                        this.re_data.syr_lx = el.user_type;
                    }
                    this.check();
                },
                init:function () {
                    // $('#editor1').froalaEditor({
                    //     dragInline: false,
                    //     toolbarButtons: ['bold', 'italic', 'underline', 'insertImage', 'insertLink', 'undo', 'redo'],
                    //     pluginsEnabled: ['image', 'link', 'draggable']
                    // })
                    WYSIWYG.init();
                    this.check();
                },
                check:function () {
                    ajax_post(api_check,this.re_data,this);
                },
                //提交
                submitBtn:function () {
                    var el = document.getElementsByClassName("wysiwyg-editor")[0];
                    var val = el.textContent;
                    if($.trim(val) == ''){
                        toastr.warning('诚信承诺内容为空');
                    }else{
                        this.data.cxcn_nr = el.innerHTML;
                        if(this.id){
                            this.data.id = Number(this.id);
                        }
                        var img_div = document.getElementById("img_div");
                        html2canvas(el).then(function(canvas) {
                            $("#img_div").empty();
                            img_div.appendChild(canvas);
                            var base_64 = $('canvas')[0].toDataURL();
                            ajax_post(api_uploader_base64,{file:base_64},vm);
                        });


                    }

                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case api_check:
                                this.complete_check(data);
                                break;
                            case api_uploader_base64:
                                this.complete_uploader_base64(data);
                                break;
                            case api_save:
                                this.complete_save(data);
                                break;
                        }
                    } else {
                        if(cmd != api_check){
                            toastr.warning(msg);
                        }else{
                            this.id = '';
                            this.data.id = '';
                            this.data.cxcn_nr = '';
                            $(".wysiwyg-editor").html('');
                            this.yu_lan();
                        }
                    }
                },
                cn_nr:"",
                //	创建人单位名称
                cn_dw:'',
                complete_check:function (data) {
                    var value = data.data[0].cxcn_nr;
                    this.data.cxcn_nr = value;
                    this.cn_dw = data.data[0].cjr_dw_mc;
                    $(".wysiwyg-editor").html(value);
                    this.id = data.data[0].id;
                    this.yu_lan();
                    this.is_show = true;
                },
                is_show:false,
                yu_lan:function () {
                    vm.yu_lan_img = '';
                    var base_64 = '';
                    var el = document.getElementsByClassName("wysiwyg-editor")[0];
                    var img_div = document.getElementById("img_div");
                    html2canvas(el).then(function(canvas) {
                        $("#img_div").empty();
                        img_div.appendChild(canvas);
                        base_64 = $('canvas')[0].toDataURL();
                        vm.yu_lan_img = base_64;
                        vm.is_show = true;
                    });

                },
                complete_uploader_base64:function (data) {
                    this.data.cxcnsj = data.data.inner_name;
                    ajax_post(api_save,this.data.$model,this);
                },
                complete_save:function (data) {
                    toastr.success("保存成功");
                    this.check();
                }
            });
            require(["wysiwyg"], function (j) {
                require(["wysiwyg-editor"], function (j) {
                    require(["/Growth/code/promise/promise_set/demo.js"], function (j) {
                        vm.init();
                    });
                });
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });