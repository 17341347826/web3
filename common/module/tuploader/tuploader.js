/**
 * Created by maweifeng on 2017.04.27.
 */

define(['jquery',
        "plupload",
        "layer",
        C.CMF("data_center.js")],
    function ($, plupload, layer,data_center) {
        var self = this;
        cb = undefined;
        files = [];

        function previewImage(file, callback) {
            //file为plupload事件监听函数参数中的file对象,callback为预览图片准备完成的回调函数
            if (!file || !/image\//.test(file.type))
                return; //确保文件是图片
            if (file.type == 'image/gif') {
                //gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
                var fr = new mOxie.FileReader();
                fr.onload = function () {
                    callback(fr.result);
                };
                fr.readAsDataURL(file.getSource());
            } else {
                var preloader = new mOxie.Image();
                preloader.onload = function () {
                    preloader.downsize(550, 400);//先压缩一下要预览的图片,宽300，高300
                    //得到图片src,实质为一个base64编码的数据
                    var imgsrc = preloader.type == 'image/jpeg' ? preloader.getAsDataURL('image/jpeg', 80) : preloader.getAsDataURL();
                    //callback传入的参数为预览图片的url
                    callback && callback(imgsrc);
                    //preloader.destroy();
                    // preloader = null;
                };
                preloader.load(file.getSource());
            }
        }

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
                for (var x = 0; x < files.length; x++) {
                    if (files[x].id == file.id) {
                        files[x].status = status;
                        files[x].guid = vret.data.guid;
                        files[x].inner_name = vret.data.inner_name;
                        files[x].mini_type = vret.data.mini_type;
                    }
                }
            }

            self.n++;
        }

        function file_progress(uploader, file) {
            self.process = uploader.total.percent;
        }

        function complete(uploader, file) {
            self.process = 0;
            this.cb && this.cb(uploader, files, 'success');
        }

        function on_error(uploader, err) {
            this.cb && this.cb(uploader, files, err)
        }

        function on_add(up, f) {
            files = [];
            // 本地图片预览
            files.push({
                "guid": "",
                "inner_name": "",
                "mini_type": "",
                "desc": "",
                "status": "ready",
                "rotation": 0,
                "file_name": f[0].name,
                "id": f[0].id
            });
            var fileName=files[0].file_name;
            var name=fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);
            if(name=="jpg"||name=="JPG"||name=="png"||name=="PNG"||name=="jpeg"||name=="JPEG"||name=="bmp"||name=="BMP"){
                if(this.is_auto!=false)
                    this.start();
            }else {
                layer.msg("图片格式错误")
            }
        }

        function init(cname, token, c, is_auto_upload) {

            self = this;
            uploader = new plupload.Uploader({
                runtimes: 'html5,html4',
                // Maximum file size
                max_file_size: '20mb',
                chunk_size: '20mb',
                //触发文件选择对话框的按钮，为那个元素id
                browse_button: cname,
                //服务器端的上传页面地址
                url: api.api + "file/uploader",
                //swf文件，当需要使用swf方式进行上传时需要配置该参数
                flash_swf_url: '/js/lib/uploader/Moxie.swf',
                //silverlight文件，当需要使用silverlight方式进行上传时需要配置该参数
                silverlight_xap_url: '/js/lib/uploader/Moxie.xap,',
                // // 文件过虑
                // filters: [
                //     {title: "Image", extensions: "jpg,gif,png"}
                // ],
                // Enable ability to drag'n'drop files onto the widget (currently only HTML5 supports that)
                // dragdrop: true,
                headers: {
                    Token: token
                }
            });
            uploader.is_auto = is_auto_upload;
            uploader.cb = c;
            uploader.bind("FileUploaded", file_uploaded);
            uploader.bind("UploadProgress", file_progress);
            uploader.bind("UploadComplete", complete);
            uploader.bind("Error", on_error);
            uploader.bind("FilesAdded", on_add);
            // uploader.bind("PostInit", function (up) {
            //     // $("input[type='file']").attr("accept", "image/*")
            // });
            uploader.init();
            return uploader;
        }

        function result() {
            return files;
        }
        function clear(up) {
            files = []
            for(var i = 0; i < up.files.length; i++ ){
                up.removeFile(up.files[i].id);
            }
            var s=  0;
            s = 1;
        }

        return {
            init: init,
            result: result,
            clear:clear,
        }
    });