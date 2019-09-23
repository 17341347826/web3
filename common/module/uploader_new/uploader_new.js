/**
 * Created by maweifeng on 2017.04.27.
 */


define([
        C.CLF('avalon.js'),
        'jquery',
        C.CM("uploader_new", "css!"),
        C.CM("uploader_new", "html!"),
        "plupload",
        C.CMF("data_center.js"),
        'layer'
    ],
    function (avalon, $, css, html, plupload, data_center, layer) {
        var self = undefined;
        var uploader = undefined;
        var get_file = [];

        /**
         * 当队列中的某一个文件上传完成后触发监听函数参数：(uploader,file,responseObject)
         uploader为当前的plupload实例对象，
         file为触发此事件的文件对象，
         responseObject为服务器返回的信息对象，它有以下3个属性：
         response：服务器返回的文本
         responseHeaders：服务器返回的头信息
         status：服务器返回的http状态码，比如200
         * */
        function file_uploaded(uploader, file, responseObject) {
            var status = "success";
            var message = "";
            if (responseObject.status != 200) {
                status = "fail";
                message = "通信错误";
            }
            else {
                var vret = JSON.parse(responseObject.response);
                if (vret.status != 200) {
                    status = "fail";
                    message = vret.msg;
                }
                for (var x = 0; x < self.files.length; x++) {
                    if (self.files[x].id == file.id) {

                        self.files[x].status = status;
                        self.files[x].guid = vret.data.guid;
                        self.files[x].inner_name = vret.data.inner_name;
                        self.files[x].mini_type = vret.data.mini_type;
                        self.files[x].name = vret.data.name;
                    }
                }
                // console.log(self.files);
            }

            self.n++;
        }

        function file_progress(uploader, file) {
            self.process = uploader.total.percent;

        }

        function complete(uploader, files) {
            self.process = 0;
            if (self.cb != undefined)
                self.cb(uploader, self.files, 'success')
        }

        function on_error(uploader, err) {

            if (self.cb != undefined)
                self.cb(uploader, self.files, err)
        }

        function on_add(up, files) {
            //文件格式数组
            uploader.msg_format = [];
            //文件长宽比
            uploader.msg_size = [];
            if (uploader.files.length > 9) {
                for (var i = 0; i < files.length; i++) {
                    uploader.removeFile(files[i].id);
                }
                layer.alert("<label>抱歉:</label>\r\n" + "最多只能上传9个文件", {skin: 'layui-layer-lan', closeBtn: 0, anim: 4});
                return true;
            }
            // 本地图片预览
            self.count = uploader.files.length;
            var review_count = uploader.files.length - files.length;
            files.forEach(function (file) {
                var local_file = file;
                /**
                 * 处理文件：
                 * 1、文件是否符合格式
                 * 2、文件大小（小于100M）
                 * 3、图片文件压缩
                 * */
                previewDeal(file,function (imgsrc, is_succ, minitype){
                    if (is_succ) {
                        self.size += file.origSize;
                        review_count++;
                        self.files.push({
                            "src": imgsrc,
                            "guid": "",
                            "inner_name": "",
                            "mini_type": minitype,
                            "desc": "",
                            "status": "ready",
                            "rotation": 0,
                            "file_name": local_file.name,
                            "id": local_file.id,
                            'name': local_file.name
                        });


                    }

                    if (review_count >= uploader.files.length) {
                        var error_msg = "";

                        if (uploader.msg_format.length != 0) {
                            //抱歉,文件格式不支持!暂时只支持.png .jpg .jpeg .pdf .xls .txt .docx .mp4 .wmv .avi .rmvb格式的文件,并且视频大小不能大于100MB
                            var msg = "";
                            for (var i = 0; i < uploader.msg_format.length; ++i) {
                                if (msg != "")
                                    msg += ", ";
                                msg += "[" + uploader.msg_format[i] + "]";
                            }
                            error_msg = "<label>以下文件格式不支持:</label><br/>" + msg + ":<br/>";
                            error_msg += "<label style='color:red;'>暂时只支持.png .jpg .jpeg .并且视频大小不能大于100MB</label>"

                        }

                        if (uploader.msg_size.length != 0) {
                            //抱歉,文件格式不支持!暂时只支持.png .jpg .jpeg .pdf .xls .txt .docx .mp4 .wmv .avi .rmvb格式的文件,并且视频大小不能大于100MB
                            var msg = "";
                            for (var i = 0; i < uploader.msg_size.length; ++i) {
                                if (msg != "")
                                    msg += ",";
                                msg += "[" + uploader.msg_size[i] + "]";
                            }
                            error_msg += "<br/><label>以下文件长宽比不正确:</label><br/>" + msg + ":<br/>";

                            error_msg += "<label style='color:red'>图片要求:<br/>①长度大于等于300；<br/>②宽度大于等于300；<br/>③长宽比大于等于0.5小于等于1.0</label>"

                        }
                        if (error_msg != "") {
                            layer.alert("<label>抱歉:</label>\r\n" + error_msg, {
                                skin: 'layui-layer-lan',
                                closeBtn: 0,
                                anim: 4
                            });
                        }
                        //所有文件一起上传
                        // if (uploader.files.length != 0) {
                        //     self.start();
                        //     console.log(self.compress_ary);
                        // }
                    }
                    //当文件格式为图片时将之前所有文件一起上传拆成单个文件上传
                    if (file && minitype == 'image/jpeg') {
                        for(var i=0;i<self.compress_ary.length;i++){
                            if(self.compress_ary[i].id == local_file.id){
                                uploader.settings.resize.width = self.compress_ary[i].width;
                                uploader.settings.resize.height = self.compress_ary[i].height;
                                break;
                            }
                        }
                        self.start();
                    }
                });
                // downSizeImage(uploader,file, function (imgsrc, is_succ, minitype){
                //     if (is_succ) {
                //         self.size += file.origSize;
                //         review_count++;
                //         self.files.push({
                //             "src": imgsrc,
                //             "guid": "",
                //             "inner_name": "",
                //             "mini_type": minitype,
                //             "desc": "",
                //             "status": "ready",
                //             "rotation": 0,
                //             "file_name": local_file.name,
                //             "id": local_file.id,
                //             'name': local_file.name
                //         });
                //
                //
                //     }
                //
                //     if (review_count >= uploader.files.length) {
                //         var error_msg = "";
                //
                //         if (uploader.msg_format.length != 0) {
                //             //抱歉,文件格式不支持!暂时只支持.png .jpg .jpeg .pdf .xls .txt .docx .mp4 .wmv .avi .rmvb格式的文件,并且视频大小不能大于100MB
                //             var msg = "";
                //             for (var i = 0; i < uploader.msg_format.length; ++i) {
                //                 if (msg != "")
                //                     msg += ", ";
                //                 msg += "[" + uploader.msg_format[i] + "]";
                //             }
                //             error_msg = "<label>以下文件格式不支持:</label><br/>" + msg + ":<br/>";
                //             error_msg += "<label style='color:red;'>暂时只支持.png .jpg .jpeg .并且视频大小不能大于100MB</label>"
                //
                //         }
                //
                //         if (uploader.msg_size.length != 0) {
                //             //抱歉,文件格式不支持!暂时只支持.png .jpg .jpeg .pdf .xls .txt .docx .mp4 .wmv .avi .rmvb格式的文件,并且视频大小不能大于100MB
                //             var msg = "";
                //             for (var i = 0; i < uploader.msg_size.length; ++i) {
                //                 if (msg != "")
                //                     msg += ",";
                //                 msg += "[" + uploader.msg_size[i] + "]";
                //             }
                //             error_msg += "<br/><label>以下文件长宽比不正确:</label><br/>" + msg + ":<br/>";
                //
                //             error_msg += "<label style='color:red'>图片要求:<br/>①长度大于等于300；<br/>②宽度大于等于300；<br/>③长宽比大于等于0.5小于等于1.0</label>"
                //
                //         }
                //         if (error_msg != "") {
                //             layer.alert("<label>抱歉:</label>\r\n" + error_msg, {
                //                 skin: 'layui-layer-lan',
                //                 closeBtn: 0,
                //                 anim: 4
                //             });
                //         }
                //         if (uploader.files.length != 0) {
                //             self.start();
                //         }
                //
                //     }
                //
                // }).fail(option.failCb);
            })
        }
        //处理文件
        function previewDeal(file,callback){
            var get_name = file.name;
            var index1 = get_name.lastIndexOf(".");
            var index2 = get_name.length;
            var get_type = get_name.substring(index1, index2);//后缀名
            var s_get_type = get_type.toLowerCase();
            var is_v = true;
            var valid_fmt = ['.mp4', '.mov', '.avi', '.flv', '.swf', ".pdf", ".xls", ".xlsx", ".txt", ".docx", ".doc", ".jpg", ".jpeg", ".png", ".ppt", '.pptx'];

            // 判断文件格式
            if (valid_fmt.indexOf(s_get_type) < 0) {
                is_v = false;
                if (uploader.msg_format.indexOf(file.name) < 0)
                    uploader.msg_format.push(file.name);

            }
            // 判断文件大小
            if (file.size > 100 * 1024 * 1024) {
                is_v = false;
            }
            if (!is_v) {
                if (uploader.msg_format.indexOf(file.name) < 0)
                    uploader.msg_format.push(file.name);
                uploader.removeFile(file.id);
                callback && callback("", false, "");
                return;
            }
            //生成base64编码，用于预览
            if (s_get_type == ".jpg" ||
                s_get_type == ".jpeg" ||
                s_get_type == ".png" ||
                s_get_type == ".gif"
            ) {
                //获取图片宽高
                var fr = new mOxie.FileReader();
                var preloader = new mOxie.Image();
                preloader.onload = function(){
                    //获取图片实际宽高
                    var imgWidth = preloader.width;
                    var imgHeight = preloader.height;
                    if(imgWidth>self.max_compress_width){//大于最大宽度
                        self.compress_width = self.max_compress_width;
                        self.compress_height = Math.floor(self.max_compress_width*(imgHeight/imgWidth));
                    }else{//小于最大宽度
                        self.compress_width = imgWidth;
                        self.compress_height = imgHeight;
                    }
                    //设置图片压缩宽高
                    // uploader.settings.resize.width = self.compress_width;
                    // uploader.settings.resize.height = self.compress_height;
                    var obj = {id:'',width:'',height:''};
                    obj.id = file.id;
                    obj.width = self.compress_width;
                    obj.height = self.compress_height;
                    self.compress_ary.push(obj);
                    //gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
                    fr.onload = function () {
                        callback(fr.result, true, "image/jpeg");
                    }
                    //readAsDataURL 方法会读取指定的 Blob 或 File 对象。读取操作完成的时候，readyState 会变成已完成DONE，并触发 loadend 事件，同时 result 属性将包含一个data:URL格式的字符串（base64编码）以表示所读取文件的内容
                    fr.readAsDataURL(file.getSource());
                };
                preloader.load(file.getSource());
            } else {
                callback && callback(undefined, true, "");
            }
        }
        //图片压缩
        function downSizeImage(uploader,file,callback) {
            /**deferred对象是一个延迟对象，意思是函数延迟到某个点才开始执行，改变执行状态的方法有两个
           （成功：resolve和失败：reject），分别对应两种执行回调（成功回调函数：done和失败回调函数fail）*/
            var $def = $.Deferred();
            uploader.stop();
            var imageMaxSize  = option.maxFileSize * 1024;//不处理的图片大小阀值B
            var maxResizeTime  = 10;//最大压缩次数
            // var file = files[0];
            var fr = new mOxie.FileReader();
            var mOxieLoader = new mOxie.Image();
            if(!$.support.leadingWhitespace){//IE6-8的情况不压缩直接上传
                console.info("IE6-8的情况不压缩直接上传")
                // uploader.start()
                // //得到图片src,实质为一个base64编码的数据:getAsDataURL函数返回一个形如 data: 的 URL，这个URL包含了所涉及到的内容的编码形式。注意：这个方法已经废弃，你应该使用 FileReader 对象中的readAsDataURL() 方法作为替代。
                // var imgsrc = mOxieLoader.type == 'image/jpeg' ? mOxieLoader.getAsDataURL('image/jpeg', 80) : mOxieLoader.getAsDataURL();
                // callback && callback(imgsrc, true, "image/jpeg");
                fr.onload = function () {
                    callback(fr.result, true, "image/jpeg");
                };
                //readAsDataURL 方法会读取指定的 Blob 或 File 对象。读取操作完成的时候，readyState 会变成已完成DONE，并触发 loadend 事件，同时 result 属性将包含一个data:URL格式的字符串（base64编码）以表示所读取文件的内容
                fr.readAsDataURL(file.getSource());
                return $def.resolve({})
            }
            if(file.size <= imageMaxSize){//图片在限制之内则直接上传
                console.info("图片大小为："+file.size+"b，开始上传");
                // uploader.start();
                //得到图片src,实质为一个base64编码的数据:getAsDataURL函数返回一个形如 data: 的 URL，这个URL包含了所涉及到的内容的编码形式。注意：这个方法已经废弃，你应该使用 FileReader 对象中的readAsDataURL() 方法作为替代。
                // var imgsrc = mOxieLoader.type == 'image/jpeg' ? mOxieLoader.getAsDataURL('image/jpeg', 80) : mOxieLoader.getAsDataURL();
                // callback && callback(imgsrc, true, "image/jpeg");

                fr.onload = function () {
                    callback(fr.result, true, "image/jpeg");
                };
                //readAsDataURL 方法会读取指定的 Blob 或 File 对象。读取操作完成的时候，readyState 会变成已完成DONE，并触发 loadend 事件，同时 result 属性将包含一个data:URL格式的字符串（base64编码）以表示所读取文件的内容
                fr.readAsDataURL(file.getSource());
                return $def.resolve({})
            }
            if(file.resizeTime == undefined){//如果没有压缩过，则初始压缩次数为0
                file.resizeTime = 0
            }
            file.resizeTime ++ ;
            if(file.resizeTime >=  maxResizeTime){//如果超出压缩最大次数，那么直接提交，交给后台拦截，常见Png。如果一个图片一直压缩不了，那么不限制次数，浏览器会炸的
                console.info("压缩次数达到极限，不能再压缩了，直接上传");
                // uploader.start()
                //得到图片src,实质为一个base64编码的数据:getAsDataURL函数返回一个形如 data: 的 URL，这个URL包含了所涉及到的内容的编码形式。注意：这个方法已经废弃，你应该使用 FileReader 对象中的readAsDataURL() 方法作为替代。
                // var imgsrc = mOxieLoader.type == 'image/jpeg' ? mOxieLoader.getAsDataURL('image/jpeg', 80) : mOxieLoader.getAsDataURL();
                // callback && callback(imgsrc, true, "image/jpeg");
                fr.onload = function () {
                    callback(fr.result, true, "image/jpeg");
                };
                //readAsDataURL 方法会读取指定的 Blob 或 File 对象。读取操作完成的时候，readyState 会变成已完成DONE，并触发 loadend 事件，同时 result 属性将包含一个data:URL格式的字符串（base64编码）以表示所读取文件的内容
                fr.readAsDataURL(file.getSource());
                return $def.resolve({})
            }
            mOxieLoader.onload = function () {
                var scare = Math.sqrt(imageMaxSize /mOxieLoader.size);//压缩率
                var opts = {//其实只有width 和height有用
                    width : mOxieLoader.width * scare,
                    height : mOxieLoader.height * scare,
                    imageType:mOxieLoader.type,
                    size:mOxieLoader.size
                }
                console.log("开始压缩！当前图片大小为：",opts.size,"b");
                mOxieLoader.downsize(opts);
                var newFile = mOxieLoader.getAsBlob(opts.imageType);
                newFile.resizeTime = file.resizeTime;
                /**
                 * $.each()是对数组，json和dom结构等的遍历。
                 * $.each(arr1,function(i,val){ }//两个参数，第一个参数表示遍历的数组的下标，第二个参数表示下标对应的值
                 */
                $.each(uploader.files,function(i,v){//清除原先的上传队列
                    // uploader.removeFile(uploader.files[0].id);
                    uploader.removeFile(file.id);
                });
                //回炉重造:没有达到压缩标准的，将压缩的图片重新添加进去在进行压缩
                uploader.addFile(newFile);
            }
            mOxieLoader.onerror = function () {
                console.log(arguments);
                $def.reject({msg:"文件压缩出现错误，请上传小于1M的图片"})
            }
            mOxieLoader.load(file.getSource());
            return $def;
        };

        //删除文件
        var api_file_remove = api.api + "file/remove";
        var option = {};
        var detail = avalon.component('ms-ele-new-uploader', {
            template: html,
            defaults: {
                as_json: function (data) {
                    return JSON.stringify(data)
                },
                opt: [],
                files: [],
                url: "",
                size: 0,
                token: sessionStorage.getItem("token"),
                name: "ttt",
                back_tip: "",
                id_prefix: "",
                process: -0,
                already_size: 0,
                n: 0,
                count: 10,
                current_hover: -1,
                is_modify: false,
                show_opt: false,
                icon_success: C.CI("success.png"),
                //设置图片压缩宽度高度数组
                compress_ary:[],
                //设置图片压缩宽度
                compress_width:'',
                //设置图片压缩高度
                compress_height:'',
                //设置图片压缩最大宽度
                max_compress_width:750,
                on_mouse_enter: function (idx) {

                    this.current_hover = idx;
                },
                on_mouse_leave: function (idx) {

                    this.current_hover = -1;
                },

                rotation_str: function (idx) {
                    var deg = 'rotate(' + this.files[idx].rotation + 'deg)'
                    return {
                        'WebkitTransform': deg,
                        'MosTransform': deg,
                        'OTransform': deg,
                        'transform': deg
                    }
                },
                json: function (x) {
                    return JSON.stringify(x)
                },
                // image_info: {
                //     "guid": "",
                //     "inner_name": "",
                //     "mini_type": "",
                //     "desc": "",
                //     "status": "",
                //     "rotation": 0,
                //     "src": "",
                //     'name':""
                // },
                clear: function () {
                    this.files = [];
                    for (var i = 0; i < this.files.length; i++) {
                        uploader.removeFile(this.files[i].id);
                    }
                },
                get_file_info: function () {
                    // console.info("正在提取:image"+this.image_info.$id)
                    // return this.image_info.$model;
                    return {
                        "guid": this.files.guid,
                        "inner_name": this.files.inner_name,
                        "mini_type": this.files.mini_type,
                        "desc": this.files.desc,
                        "status": this.files.status,
                        "rotation": this.files.rotation,
                        "name": this.files.name
                    };
                },
                rotate: function (idx, x) {
                    this.files[idx].rotation += x;
                    // 同步图片方向
                    ajax_post(api.api + "file/set_file_info", {
                        file_id: this.files[idx].guid,
                        rotation: this.files[idx].rotation
                    }, this)
                },
                on_request_complete: function(cmd, status, data, is_suc, msg){
                    if(is_suc){
                        switch (cmd) {
                            //删除文件
                            case api_file_remove:
                                toastr.success('删除成功');
                                break;
                        }
                    }else{
                        toastr.error(msg);
                    }
                },
                url_image: function (src, guid) {
                    if (src != "" || src != undefined) {
                        return api.api + "file/get?img=" + guid + "&token=" + this.token;
                    }


                },
                is_sup_view: function (x) {
                    var ary = [];
                    ary.push('image/jpeg');
                    ary.push('image/png');
                    ary.push('image/jpeg');
                    if (ary.indexOf(x) >= 0)
                        return true;
                    return false;
                },
                //判断文件图片类型guid是否返回
                is_img_guid:function(x){
                    if(x.guid != '' && x.guid != null && x.guid != undefined){
                        return true;
                    }
                    return false;
                },
                cb: function () {

                },
                show_file_dia: function () {
                    $("#" + this.name).click();
                },
                //删除
                on_remove_file: function (idx) {
                    var guid = this.files[idx].guid;
                    if (this.files[idx].hasOwnProperty('id')) {
                        uploader.removeFile(this.files[idx].id);
                    }
                    this.files.removeAt(idx);
                    this.opt.removeAt(idx);
                    self.count = uploader.files.length;
                    //删除文件
                    // ajax_post(api_file_remove,{file_id:guid},this);
                },
                start: function (cb) {
                    this.cb = cb;
                    uploader.start();
                },

                is_finished: function (a) {
                    for (var i = 0; i < this.files.length; i++) {
                        if (this.files[i]["guid"] == "")
                            return false
                    }
                    return true;

                },
                get_files: function () {
                    for (var i = 0; i < this.files.length; i++) {
                        this.files[i].src = '';
                    }
                    return this.files;
                    // var lists = data_center.get_sub_link(this.$id);
                    // var vret = []
                    // for( var i = 0; i < lists.length; i++ ){
                    //     vret.push(lists[i].get_file_info())
                    // }
                    // return vret;
                },
                onDispose: function () {
                    data_center.remove_link(this.$id)
                },
                onReady: function () {

                    data_center.link(this.$id, this);
                    self = this;
                    /**
                     * 初始化方法，需要传入配置信息。！开头为必填
                     * @param option{
                     *      !up：dom节点ID或者dom节点，如upload-id 或者 document.getElementById("upload-id")或者 $("#upload-id")[0]
                     *      !successCb:成功的回调，接收一个服务器返回对象successCb(responseObj),如responseObj：{data:"20180227/3fc1d47f951d254ae8b8f9a8b8be1aee.jpg",msg:"上传成功",status:true}
                     *      failCb:失败的回调
                     *      !url:图片上传的路径
                     *      maxSelectIeSize:"10kb",//IE8及以下的能选中最大的图片
                     *      maxSelectSize:"8000kb",//其他浏览器能选中最大的图片
                     *      maxFileSize:200//单位kb,默认压缩到200k以下的再上传,可以修改这个上限
                     * }
                     * @returns {plupload.Uploader}
                     */
                    var defaultOption = {
                        url:self.url,
                        successCb:function (msg) {console.log(msg)},
                        failCb:function (msg) {console.log(msg)},
                        maxSelectIeSize:"1500kb",
                        maxSelectSize:"8000kb",
                        maxFileSize:150,//单位kb,默认压缩到200k以下的再上传,可以修改这个上限
                    }
                    option = $.extend({},self,defaultOption);
                    //实例化一个plupload上传对象
                    uploader = new plupload.Uploader({
                        runtimes: 'html5,flash,silverlight,html4',
                        // Maximum file size
                        //限制为2MB
                        // max_file_size: '100MB',
                        // chunk_size: '100MB',
                        //触发文件选择对话框的按钮，为那个元素id
                        browse_button: self.name,
                        //服务器端的上传页面地址
                        url: self.url,
                        //swf文件，当需要使用swf方式进行上传时需要配置该参数
                        flash_swf_url: '/js/lib/uploader/Moxie.swf',
                        //silverlight文件，当需要使用silverlight方式进行上传时需要配置该参数
                        silverlight_xap_url: '/js/lib/uploader/Moxie.xap,',
                        // 文件过虑,图片限制
                        // filters: [
                        //     {title: "Image files", extensions: "jpg,gif,png"},
                        //     {title: "Zip files", extensions: "zip,avi"}
                        // ],
                        // Enable ability to drag'n'drop files onto the widget (currently only HTML5 supports that)
                        dragdrop: true,
                        // fileNumLimit: '',//上传数量限制
                        // fileSizeLimit: 100*1024*1024,//限制上传所有文件大小
                        // fileSingleSizeLimit: 100*1024*1024,//限制上传单个文件大小100MB
                        //设置上传时的自定义头信息，以键/值对的形式传入，键代表头信息属性名，键代表属性值。html4上传方式不支持设置该属性。
                        headers: {
                            Token: self.token
                        },
                        resize: {
                            width: self.compress_width,// width：指定压缩后图片的宽度，如果没有设置该属性则默认为原始图片的宽度
                            height: self.compress_width,
                            crop: true,// crop：是否裁剪图片
                            // quality: 60,//quality：压缩后图片的质量，只对jpg格式的图片有效，默认为90。quality可以跟width和height一起使用，但也可以单独使用，单独使用时，压缩后图片的宽高不会变化，但由于质量降低了，所以体积也会变小
                            preserve_headers: false,// preserve_headers：压缩后是否保留图片的元数据，true为保留，false为不保留,默认为true。删除图片的元数据能使图片的体积减小一点点
                        }
                    });
                    //当队列中的某一个文件上传完成后触发监听函数参数
                    uploader.bind("FileUploaded", file_uploaded);
                    //会在文件上传过程中不断触发，可以用此事件来显示上传进度监听（比如说上传进度）
                    uploader.bind("UploadProgress", file_progress);
                    //当上传队列中所有文件都上传完成后触发监听函数参数：(uploader,files)
                    uploader.bind("UploadComplete", complete);
                    /**
                     * 当发生错误时触发监听函数参数：(uploader,errObject)
                     uploader为当前的plupload实例对象，errObject为错误对象，它至少包含以下3个属性(因为不同类型的错误，属性可能会不同)：
                     code：错误代码，具体请参考plupload上定义的表示错误代码的常量属性
                     file：与该错误相关的文件对象
                     message：错误信息
                     * */
                    uploader.bind("Error", on_error);
                    //图片选择完毕触发
                    uploader.bind("FilesAdded", on_add);
                    //当Plupload实例对象初始化完成后触发监听函数参数
                    uploader.init();
                    //this.uploader('notify', 'info', "This might be obvious, but you need to click 'Add Files' to add some files.");
                },
                quit: function () {
                },
                who: detail
            }
        })
        return {
            control: detail
        }
    })