/**
 * Created by uptang on 2017/9/4.
 */

define([ "jquery",
        C.CLF('avalon.js'),
        "layer",
        C.Co("notice", "create_notice/style", "css!"),
        C.Co("notice", "add_version_update/add_version_update", "css!"),
        C.Co("notice", "add_version_update/add_version_update", "html!"),
        C.CMF("formatUtil.js"),
        C.CMF("data_center.js"),
        C.CM('page_title')
    ],
    function ($,avalon,layer, css1,css2,html,formatUtil, data_center,page_title) {
        //添加通知
        var api_add = api.api + "Indexmaintain/indexmaintain_addversionnotify";
        //查询版本更新通知
        var get_version=api.api+"Indexmaintain/indexmaintain_findversionnotify";
        //修改通知
        var api_update=api.api+"Indexmaintain/indexmaintain_updateversionnotify";
        //公示结束
        var api_end = api.api+"score/score_pub_end";
        var avalon_define = function (par) {
            var table = avalon.define({
                $id: "add_version_update",
                init: function () {
                    //查询通知
                    ajax_post(get_version,{},this);
                },
                instance:"",
                init_textarea:function () {
                    var title_width = $("#text_div").width()/2;
                    this.instance = new TINY.editor.edit('editor',{
                        id:'input',
                        width:title_width,
                        height:175,
                        cssclass:'te',
                        controlclass:'tecontrol',
                        rowclass:'teheader',
                        dividerclass:'tedivider',
                        controls:['bold','italic','underline','strikethrough','|','subscript','superscript','|',
                            'orderedlist','unorderedlist','|','outdent','indent','|','leftalign',
                            'centeralign','rightalign','blockjustify','|','unformat','|','undo','redo','n',
                            'font','size','style','|','image','hr','link','unlink','|','cut','copy','paste','print'],
                        footer:true,
                        fonts:['Verdana','Arial','Georgia','Trebuchet MS'],
                        xhtml:true,
                        cssfile:'style.css',
                        bodyid:'editor',
                        footerclass:'tefooter',
                        toggle:{text:'source',activetext:'wysiwyg',cssclass:'toggle'},
                        resize:{cssclass:'resize'}
                    });

                },
                content: "",
                submitBtn: function () {
                    this.instance.post();
                    var self = this;
                    layer.confirm('确认提交？', {
                        btn: ['确认', '取消'] //按钮
                    }, function () {
                        if (self.id) {
                            var update_message = {
                                content:self.content,
                                id:self.id
                            };
                            ajax_post(api_update,update_message, self)
                        } else {
                            ajax_post(api_add, {content:self.content}, self)
                        }

                        layer.closeAll();
                    });

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //查询通知
                            case get_version:
                                if(data.data.length!=0){
                                    this.content = data.data[0].content;
                                    this.id=data.data[0].id;
                                }
                                //初始化富文本
                                this.init_textarea();
                                break;
                            case api_add:
                                toastr.success('发布成功');
                                break;
                            case api_update:
                                toastr.success('发布成功');
                                break;
                            case api_end:
                                toastr.success('启动成功');
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                end:function () {
                    ajax_post(api_end,{},this);
                }
            });

            require(["tinyeditor"], function (j) {
                table.init();
            });
            // table.init();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });