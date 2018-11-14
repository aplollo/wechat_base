## 小程序学习日记

1. ### 新建小程序，手动/自动配置基础文件

   1. #### 全局配置：app.js/json/wxss

      1. ##### app.js中可使用globalData定义全局数据

      2. ##### onLaunch

         + this.Promise = this.getOpenIdCb()

      3. ##### 通过promise可以解决app.js中获取openid在index.js中的不同步的问题

      4. ##### 具体直接看代码app.js ——index.js

   2. ##### 目录：

      + Image(注意图片尽量压缩，小程序打包为1mb)
      + pages
      + utils
      + wxParse(富文本渲染,有坑)

   3. ##### pages：

      + wxml(html)
      + wxss(css)
      + js(js)
      + json(局部目录配置)
      + wxs(可选模板)

   4. ##### template

      + ##### 模板——主做渲染使用（无法使用小程序生命周期，变量需在引用的js中定义）

      + ##### 直接看代码 order.wxml ——template.wxml

   5. ##### wx.Parse

      1. ##### 使用：

         ```javascript
         xxx.js
         var WxParse = require('../../wxParse/wxParse.js');
         data中定义一个接收变量 article_content
         获取接口数据后：
         WxParse.wxParse('article_content', 'html', data.obj.entity.content, this, 0)
         
         xxx.wxss
         @import "/wxParse/wxParse.wxss";
         
         xxx.wxml
         <import src="../../wxParse/wxParse.wxml"/>
         
         <template is="wxParse" data="{{wxParseData:article_content.nodes}}"/>
         ```

      2. ##### 坑：html2json.js中去掉 console.dir(value); 否则在部分安卓机中渲染不出来

         ```
         其实wx.Parse有很多坑，渲染数据不多的话可以自己定义模板渲染。除非你司数据源于。。
         ```

2. ### JS

   1. ##### onLoad--初次进入该页面优先调用 不变的数据可以在此调用

   2. ##### onShow--每次页面显示都会调用 (需每次请求的数据在此调用)

   3. ##### onReachTop 抵达页面顶部 如果使用scroll-view则根据场景可能无效

   4. ##### onReachBottom 抵达页面底部 同上

3. ### 小程序的api获取

   1. ##### utils/utils.js

4. ### 插件使用（待学习ing）





## 声明：本项目只是给自己加深印象，许多地方只是截取。



