/*
 * Created with Sublime Text 3.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * github: https://github.com/tianxiangbing/loading
 * User: 田想兵
 * Date: 2015-08-05
 * Time: 11:27:55
 * Contact: 55342775@qq.com
 * desc:请尽量使用github上的代码，会修复一些问题，关注https://github.com/tianxiangbing/loading
 */
;
(function (root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory($);
	} else {
		root.Loading = factory(window.Zepto || window.jQuery || $);
	}
})(window, function ($) {
	var Loading = function () { };
	Loading.prototype = {
		loadingTpl: '<div class="ui-loading"><div class="ui-loading-mask"></div><i></i></div>',
		stop: function () {
			if(this.loading){
                this.loading.remove();
                this.loading = null;
			}
		},
		start: function () {
			var _this = this;
			var loading = this.loading;
			if (!loading) {
				loading = $(_this.loadingTpl);
				$('body').append(loading);
			}
			this.loading = loading;
			//console.log(cw,ch)
			this.setPosition();
		},
		setPosition: function () {
			var _this = this;
			var loading = this.loading;
			var target = _this.target;
			var type = _this.type;
			var content = $(target);
			//阴影位置计算
			//计算元素的高度（包括padding，border和选择性的margin）
			var ch = $(content).outerHeight();
            //计算元素的宽度（包括padding，border和选择性的margin）
			var cw = $(content).outerWidth();
            var offset = $(content).offset();
			if ($(target)[0].tagName == "HTML") {
				ch = Math.max($(target).height(), $(window).height());
				cw = Math.max($(target).width(), $(window).width());
			}else{
				if(type != 0){
					var cur = $(window).height()-offset.top-20;
					if(cur>0){
						ch = cur;
					}else{
						/**
						 * $(content).offset().top:获取元素距离窗口上边距的距离
						 * */
                        ch = $(window).height();
                    }
				}
				console.log(cur+'_______________'+ch);
			}
			loading.height(ch).width(cw);
			loading.find('div').height(ch).width(cw);
			if (ch < 100) {
				loading.find('i').height(ch).width(ch);
			}
			if(type != 0){
				if(cur>0){
                    loading.css({
                        position:'fixed',
                        top: offset.top,
                        left: offset.left
                    });
				}else{
                    loading.css({
                        position:'fixed',
                        top: '66px',
                        left: offset.left,
                    });
				}
			}else{
                loading.css({
                    top: offset.top,
                    left: offset.left
                });
			}
			//转圈圈位置计算
			var icon = loading.find('i');
			var h = ch,
				w = cw,
				top = 0,
				left = 0;
			if ($(target)[0].tagName == "HTML") {
				h = $(window).height();
				w = $(window).width();
				top = (h - icon.height()) / 2 + $(window).scrollTop();
				left = (w - icon.width()) / 2 + $(window).scrollLeft();
			} else {
				top = (h - icon.height()) / 2;
				left = (w - icon.width()) / 2;
			}
			icon.css({
				top: top,
				left: left
			})
		},
		init: function (settings) {
			settings = settings || {};
			this.loadingTpl = settings.loadingTpl || this.loadingTpl;
			this.target = settings.target || 'html';
			//type:0-正常模式，就是取获得的内容高度加阴影转圈圈，非0-非正常模式，阴影区域为当前窗口可见区域
            this.type = settings.type || 0;
			this.bindEvent();
		},
		bindEvent: function () {
			var _this = this;
			$(this.target).on('stop', function () {
				_this.stop();
			});
			$(window).on('resize', function () {
				_this.loading && _this.setPosition();
			});
		}
	}
	return Loading;
});