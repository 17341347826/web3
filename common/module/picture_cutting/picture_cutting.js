/**
 * Created by uptang on 2017/5/4.
 *图片裁剪工具：1、用于签名，2、用于头像上传
 */
define([
        C.CLF('avalon.js'),
        C.CM("picture_cutting", "css!"),
        C.CM("picture_cutting", "html!"),
        "jquery"],
    function (avalon,css, html, $) {
        var cropbox = function(options, el){
            var el = el || $(options.imageBox),
                obj =
                    {
                        state : {},
                        ratio : 1,
                        options : options,
                        imageBox : el,
                        thumbBox : el.find(options.thumbBox),
                        spinner : el.find(options.spinner),
                        image : new Image(),
                        rotateDegrees:0,
                        getDataURL: function ()
                        {
                            var width = this.thumbBox.width(),
                                height = this.thumbBox.height(),
                                canvas = document.createElement("canvas"),
                                dim = el.css('background-position').split(' '),
                                size = el.css('background-size').split(' '),
                                //这个是算要裁剪的图片距离内边框的距离
                                dx = parseInt(dim[0]) - el.width()/2 + width/2,
                                dy = parseInt(dim[1]) - el.height()/2 + height/2,
                                dw = parseInt(size[0]),
                                dh = parseInt(size[1]),
                                sh = parseInt(this.image.height),
                                sw = parseInt(this.image.width);

                            canvas.width = width;
                            canvas.height = height;
                            var context = canvas.getContext("2d");
                            //使用canvas旋转校正
                            // context.rotate(obj.rotateDegrees * Math.PI / 180);
                            context.drawImage(this.image, 0, 0, sw, sh, dx, dy, dw, dh);
                            var imageData = canvas.toDataURL('image/png');
                            return imageData;
                        },
                        getBlob: function()
                        {
                            var imageData = this.getDataURL();
                            var b64 = imageData.replace('data:image/png;base64,','');
                            var binary = atob(b64);
                            var array = [];
                            for (var i = 0; i < binary.length; i++) {
                                array.push(binary.charCodeAt(i));
                            }
                            return  new Blob([new Uint8Array(array)], {type: 'image/png'});
                        },
                        zoomIn: function ()
                        {
                            obj.ratio*=1.1;
                            setBackground();
                        },
                        zoomOut: function ()
                        {
                            obj.ratio*=0.9;
                            setBackground();
                        },
                        rotateLeft:function(){
                            var d = obj.rotateDegrees%360-90;
                            obj.rotateDegrees = d;
                            el.css({
                                'transform': 'rotate('+d+'deg)',
                                '-ms-transform': 'rotate('+d+'deg)',
                                '-webkit-transform': 'rotate('+d+'deg)'});
                        },
                        rotateRight:function(){
                            var d = obj.rotateDegrees%360+90;
                            obj.rotateDegrees = d;
                            el.css({
                                'transform': 'rotate('+d+'deg)',
                                '-ms-transform': 'rotate('+d+'deg)',
                                '-webkit-transform': 'rotate('+d+'deg)'});
                        },
                    },
                setBackground = function()
                {
                    var w =  parseInt(obj.image.width)*obj.ratio;
                    var h =  parseInt(obj.image.height)*obj.ratio;

                    var pw = (el.width() - w) / 2;
                    var ph = (el.height() - h) / 2;

                    el.css({
                        'background-image': 'url(' + obj.image.src + ')',
                        'background-size': w +'px ' + h + 'px',
                        'background-position': pw + 'px ' + ph + 'px',
                        'background-repeat': 'no-repeat'});
                },
                /**
                 *语法：eventObject.stopImmediatePropagation( )
                 * 1、stopImmediatePropagation()函数用于阻止该元素剩余的其他事件处理函数的执行，并防止当前事件在DOM树上冒泡，
                 *    不会触发执行当前元素的任何祖辈元素的任何事件处理函数；
                 * 2、stopImmediatePropagation()函数无法阻止live事件和delegate事件的冒泡，因为这两个函数是‘委托事件函数’，
                 *    并不是将事件处理函数直接绑定到自己身上，而是"委托"绑定到祖辈元素上，由祖辈元素来触发执行。
                 * */
                imgMouseDown = function(e)
                {
                    e.stopImmediatePropagation();

                    obj.state.dragable = true;
                    //鼠标按下当前鼠标距离body的距离
                    obj.state.mouseX = e.clientX;
                    obj.state.mouseY = e.clientY;
                },
                imgMouseMove = function(e)
                {
                    e.stopImmediatePropagation();

                    if (obj.state.dragable)
                    {
                        //移动后的坐标减去之前鼠标按下的位置的坐标，计算出当前的背景图片位置
                        var x = e.clientX - obj.state.mouseX;
                        var y = e.clientY - obj.state.mouseY;

                        var bg = el.css('background-position').split(' ');

                        var bgX = x + parseInt(bg[0]);
                        var bgY = y + parseInt(bg[1]);

                        el.css('background-position', bgX +'px ' + bgY + 'px');

                        obj.state.mouseX = e.clientX;
                        obj.state.mouseY = e.clientY;
                    }
                },
                imgMouseUp = function(e)
                {
                    e.stopImmediatePropagation();
                    obj.state.dragable = false;
                },
                /**
                 * js滚轮事件：
                 * 1、兼容性：firefox-DOMMouseScroll,除firefox外-onmousewheel；
                 * 2、对于FireFox浏览器（Opera浏览器也有），判断鼠标滚动方向的属性为event.detail, 滚动值为3；
                 *    而对于其他浏览器是event.wheelDelta,滚动值是120；
                 * */
                //鼠标滚珠滚动进行放大缩小
                zoomImage = function(e)
                {
                    e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0 ? obj.ratio*=1.1 : obj.ratio*=0.9;
                    setBackground();
                }

            obj.spinner.show();
            obj.image.onload = function() {
                obj.spinner.hide();
                setBackground();

                el.bind('mousedown', imgMouseDown);
                el.bind('mousemove', imgMouseMove);
                $(window).bind('mouseup', imgMouseUp);
                el.bind('mousewheel DOMMouseScroll', zoomImage);
            };
            obj.image.src = options.imgSrc;
            el.on('remove', function(){$(window).unbind('mouseup', imgMouseUp)});

            return obj;
        };
        var detail = avalon.component('ms-ele-picture-cutting', {
            template: html,
            defaults: {
                //标题
                title:'',
                //1-上传签名，2-上传头像
                type:'',
                //组件点击确定后，页面的后续操作
                cuttingImg_late:'',
                //当前裁剪图片
                cur_file:[],
                //裁剪对象
                cropper:'',
                options:{
                    thumbBox: '.thumbBox',
                    spinner: '.spinner',
                    imgSrc: ''
                },
                //判断是非上传图片:true-上传，false-未上传
                is_up_img:false,
                //放大
                zoom_in:function(){
                    this.cropper.zoomIn();
                },
                //缩小
                zoom_out:function(){
                    this.cropper.zoomOut();
                },
                //左旋
                rotate_left:function(){
                    this.cropper.rotateLeft();
                },
                //右旋
                rotate_right:function(){
                    this.cropper.rotateRight();
                },
                cuttingImg_sure: function () {
                    if(!this.is_up_img){
                        toastr.info('请上传图片');
                        return;
                    }
                    //裁剪图片采用canvas画图
                    var img = this.cropper.getDataURL();
                    // var img = this.cropper.options.imgSrc;//这个是原图
                    // console.log(img);
                    //关闭弹框
                    $("#cuttingImg-modal").modal({
                        closeOnConfirm: true
                    });
                    //实际页面后续操作-业务处理
                    this.cuttingImg_late(img);
                    // $('.cutting-img-container').html('');
                    // $('.cutting-img-container').append('<img src="'+img+'" align="absmiddle" style="width:90px;margin-top:4px;border-radius:90px;box-shadow:0px 0px 12px #7E7E7E;" >');
                },
                onReady:function(){
                    var self = this;
                    // self.files = [];
                    $.fn.cropbox = function(options){
                        return new cropbox(options, this);
                    };
                    self.cropper = $('.cutting-area').cropbox(self.options);
                    $('#cuttingImg-file').on('change', function(){
                        var fileName = this.files[0].name;
                        var name=fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);
                        if(name=="jpg"||name=="JPG"||name=="png"||name=="PNG"||name=="jpeg"||name=="JPEG"||name=="bmp"||name=="BMP"){
                            self.is_up_img = true;
                            var reader = new FileReader();
                            reader.onload = function(e) {
                                self.options.imgSrc = e.target.result;
                                self.cropper = $('.cutting-area').cropbox(self.options);
                            };
                            self.cur_file.push(this.files[0]);
                            reader.readAsDataURL(this.files[0]);
                            // //图片转码
                            // blob_2_b64(imgFile,function(data){
                            //     image_buf = data;
                            // });
                            // files = [];
                        }else {
                            self.is_up_img = false;
                            toastr.info("图片格式错误");
                        }
                    })
                },
            }
        });
        return {
            pictureCut: detail,
        }
    });