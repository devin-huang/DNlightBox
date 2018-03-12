;(function($){

  var DNLightBox = function(setting){

    var self = this;
    this.obj = $('.js-lightBox') ;
    this.setting = setting;
    this.isIE6 = /MSIE 6.0/gi.test(window.navigator.userAgent);
    this.defaultSetting = {
      speed:'fast',
      scale: 0.8
    }
    $.extend(this.defaultSetting,this.getCustomSetting());
    this.groupArr = [];
    this.clear = false;
    this.groupName = null;
    this.bodyNode = $(document.body);
    this.popupMask = $("<div class='lightBox-popupMask'></div>");
    this.popup     = $("<div class='lightBox-popup'></div>");
    this.settingDefaultImg();

    //主要通过点击事件触发大部分效果
    this.obj.on('click',  function(event) {
      event.preventDefault();
      event.stopPropagation();
      var currentGroup = $(this).attr('data-group');
      if(currentGroup != self.groupName){
        self.groupName = currentGroup;
      }
      //设置默认每次点击插入遮罩层与图片层的DOM结构
      self.defaultDOM();

      //点击当前对象获取到所在的集合
      self.getImageGroup();

      //（点击、左右切换）设置弹出图层的效果及图片的转换
      self.initLightBox($(this));

    });
  };

  DNLightBox.prototype = {
    //是否带有自定义设置
    getCustomSetting : function(){
        var setting = this.setting ;
        if(setting && setting != ''){
            return setting;
        }else{
            return {};
        }
    },
    //设置需要使用该效果的图片添加唯一的ID值
    settingDefaultImg : function (){
      var obj = this.obj;
      obj.each(function(i){obj.eq(i).attr('data-id',i)});
    },
    //实现左右切换
    goto : function(dir){
      var len = this.groupArr.length;
      if(dir==='prev'){
        var picSrc = this.groupArr[--this.index].src;
        this.loadCompletePicShow(picSrc);            
      }else{
        var picSrc = this.groupArr[++this.index].src;
        this.loadCompletePicShow(picSrc);
      }
    },
    //过渡效果显示图片层的框
    showMaskAndPopu:function(src,id){
      var _this_ = this 
          _scale_ = 1 ;
      this.winWidth  = $(window).width();
      this.winHeight = $(window).height();
      this.lightBoxPic.hide();
      this.lightBoxDescription.hide();
      this.lightBoxPopupMask.fadeIn();
      this.lightPopup.fadeIn();

      this.lightPopup.css({
        "width"      : this.winWidth/2 ,
        "height"     : this.winHeight/2 ,
        "marginLeft" : -(this.winWidth/2) / 2 ,
        "marginTop"  : -this.lightPopup.height() - 8 
      }).animate({
        "marginTop"  : (this.winHeight-this.lightPopup.height() + 8)/2 
      },this.defaultSetting.speed,function(){
        _this_.loadCompletePicShow(_this_.src);
      });

    },
    settingParmt : function(thisObj){
      //设置每个图片显示的信息
      this.src   = thisObj.attr('src');
      this.title = thisObj.attr('data-title');
      this.lightBoxPic.attr('src',this.src);
    },
    //获取当前索引值 
    getCurrentIndex : function(thisObj){
      var thisID = thisObj.attr('data-id'),
          index = 0;
      jQuery.each(this.groupArr,function(i,e){
        if(thisID == e.id){
          index = i;
          return false;
        }
      });
      return index;
    },
    loadPicShow : function(thisSrc,callback){
      var image = new Image();
      if(!!window.ActiveXObject){
        //兼容IE
        image.onreadystatechange = function(){
          if(this.readyState == "complete"){
            callback();
          }
        };
      }else{
        image.onload = function(){
            callback();
        };
      }
      image.src = thisSrc;
    },
    //主要展示图片的函数
    loadCompletePicShow : function (src){
      var _this_ = this ;
      this.lightBoxPic.css({"width":"auto","height":"auto"}).hide();
      this.lightBoxDescription.hide();
      this.winWidth  = $(window).width();
      this.winHeight = $(window).height();
      this.clear = true;

      _this_.loadPicShow(src,function(){
        _this_.lightBoxPic.attr('src',src); 
        var picWidth  = _this_.lightBoxPic.width();
        var picHeight = _this_.lightBoxPic.height();

        //判断所点击的图片是否需要左右按钮
        var groupArrLength = _this_.groupArr.length;
        if( groupArrLength>1 ){
          if(_this_.index === 0){
            _this_.lightBoxPrevBtn.addClass('disable');
            _this_.lightBoxPrevBtn.removeClass('active');
            _this_.lightBoxNextBtn.removeClass('disable');
          }else if(_this_.index === groupArrLength-1){
            _this_.lightBoxNextBtn.addClass('disable');
            _this_.lightBoxNextBtn.removeClass('active');
            _this_.lightBoxPrevBtn.removeClass('disable');
          }else{
            _this_.lightBoxNextBtn.removeClass('disable');
            _this_.lightBoxPrevBtn.removeClass('disable');
          }
        }

        //当图片大于浏览器窗口时按等比例方式显示
        if(picWidth > _this_.winWidth || picHeight > _this_.winHeight){
          _scale_ = Math.min(_this_.winWidth/(picWidth+12) * _this_.defaultSetting.scale , _this_.winHeight/(picHeight+12)* _this_.defaultSetting.scale);
        }else{
          _scale_ =  _this_.defaultSetting.scale;   
        }
        
        picWidth = picWidth * _scale_;
        picHeight = picHeight * _scale_;  
        //加载完毕图片展示的动画效果
        _this_.lightPopup.animate({
          "width"      : picWidth  -12 ,
          "height"     : picHeight  -12 ,      
          "marginLeft" : -picWidth  / 2 ,
          "marginTop"  : (_this_.winHeight - picHeight ) /2 
        },function(){
          _this_.lightBoxPic.css({
            "width"      : picWidth  -12 ,
            "height"     : picHeight  -12           
          });

          _this_.lightBoxTitle.text(_this_.groupArr[_this_.index].title);
          _this_.lightBoxCurrentIndex.text( (_this_.index + 1 ) + ' of ' + _this_.groupArr.length );
          _this_.lightBoxPic.fadeIn();
          _this_.lightBoxDescription.fadeIn(); 

        });

      });
    },
    //点击后需要促发的弹出框效果(并设置宽高)
    initLightBox:function(thisObj){
      var _this_    = this ,
          sourceSrc = thisObj.attr('src'),
          currentID = thisObj.attr('data-id');

          this.settingParmt(thisObj);
          this.showMaskAndPopu(sourceSrc,currentID);   
          this.index = this.getCurrentIndex(thisObj); 
    },
    //默认的幻灯片弹出框设置
    defaultDOM : function(){
      var _this_ = this ;
      this.lightBoxView = '<div class="loading"></div>' +
                          '<div class="lightBox-view">' +
                            '<span class="lightBox-btn lightBox-prev-btn"></span>' +
                            '<div class="lightBox-pic">' +
                              '<img src="" >' +
                            '</div>' +
                            '<span class="lightBox-btn lightBox-next-btn"></span>' +
                            '<div class="lightBox-description">' +
                              '<span class="lightBox-close"></span>' +
                              '<b class="lightBox-title"></b>' +
                              '<small class="lightBox-current-index"></small>' +
                            '</div>' +
                          '</div>'; 
                          
      this.bodyNode.prepend(this.popupMask,this.popup);
      this.popup.html('').append(this.lightBoxView);

      this.lightBoxPopupMask = this.bodyNode.find('.lightBox-popupMask');
      this.lightPopup = this.bodyNode.find('.lightBox-popup');
      this.lightBoxPic = this.lightPopup.find('.lightBox-pic > img');
      this.lightBoxPrevBtn = this.lightPopup.find('.lightBox-prev-btn');
      this.lightBoxNextBtn = this.lightPopup.find('.lightBox-next-btn');
      this.lightBoxClose   = this.lightPopup.find('.lightBox-close');
      this.lightBoxTitle   = this.lightPopup.find('.lightBox-title');
      this.lightBoxCurrentIndex = this.lightPopup.find('.lightBox-current-index');
      this.lightBoxDescription = this.lightPopup.find('.lightBox-description');

      //关闭按钮事件
      this.lightBoxPopupMask.on('click',function(event){
        event.preventDefault();
        event.stopPropagation();
        $(this).fadeOut();
        _this_.lightPopup.fadeOut();
        _this_.clear = false;
      });

      this.lightBoxClose.on('click',function(event){
        event.preventDefault();
        event.stopPropagation();
        _this_.lightPopup.fadeOut();
        _this_.lightBoxPopupMask.fadeOut();
        _this_.clear = false;
      });

      //左右按钮Hover事件 与 点击事件
      this.lightBoxPrevBtn.hover(function(){
        if( !$(this).hasClass('disable') && _this_.groupArr.length > 1 ){
          $(this).addClass('active');
        }
      },function(){
          $(this).removeClass('active');
      }).on('click',function(event){
          if(!$(this).hasClass('disable')){ 
            event.preventDefault();
            event.stopPropagation();
            _this_.goto('prev') 
          }
      })

      //响应式设置
      var timer = null;
      $(window).resize(function(event) {
        /* Act on the event */
        if(_this_.clear){
          clearTimeout(timer);
          timer = setTimeout(function(){
            _this_.loadCompletePicShow(_this_.groupArr[_this_.index].src);  
          },500)          
        }

      });
      document.onkeyup = function(e) {
        e = (e) ? e : window.event;
        if(e.key === "ArrowLeft" || e.keyCode === 37 ){
          _this_.lightBoxPrevBtn.click();
        }else if(e.key === "ArrowRight" || e.keyCode === 39){
          _this_.lightBoxNextBtn.click();
        }
      };
      this.lightBoxNextBtn.hover(function(){
        if( !$(this).hasClass('disable') && _this_.groupArr.length > 1 ){
          $(this).addClass('active');
        }
      },function(){
          $(this).removeClass('active');
      }).on('click',function(event){
          if(!$(this).hasClass('disable')){ 
            event.preventDefault();
            event.stopPropagation();
            _this_.goto('next') 
          }
      })
     },
    //获取每个组别的所有对象
    getImageGroup : function(){
      var _this_ = this ;
          _this_.groupArr = [];
      this.bodyNode.find("[data-group='"+ this.groupName +"']").each(function(index, el) {

        _this_.groupArr.push({
          "src":$(el).attr('src'),
          "title":$(el).attr('data-title'),
          "id":$(el).attr('data-id'),
          "group":$(el).attr('data-group'),
          "src":$(el).attr('src')
        });

      })
    }    
  };
  $.extend({
    DNLightBox :function(object){
      new DNLightBox(object);    
    } 
  });
  
  window['DNLightBox'] = DNLightBox;

})(jQuery);
