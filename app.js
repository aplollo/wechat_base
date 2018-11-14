//app.js
const login = require('./utils/login.js')
App({
  config:{
    loadTime:1000,
    apiBase:'http://192.168.50.20:9999',
  },
  onLaunch: function () {
    this.Promise = this.getOpenIdCb()
  },
  Promise: null,
  getOpenIdCb:function() {
    var promise = new Promise((resolve,reject) => {
      let _this = this
      var openId = wx.getStorageSync('openId')
      if (!openId) {
        function getOpenId() {
          var basepath = _this.config.apiBase + '/xxx/getopenid'
          var log = login.getOpenId(basepath)
          console.log(log)
          if (log) {
            console.log(log)
            console.log('openid保存成功')
            _this.globalData.openId = wx.getStorageSync('openId')
            let basepath = _this.config.apiBase + '/xxx/verifyUserBind'
            wx.request({
              url: basepath,
              data: {
                openid: log.openId   //微信用户openid
              },
              success: res => {
                console.log(res)
                if (res.data.code == 200) {
                  console.log('用户已绑定')
                  var token = res.data.obj.token;
                  var user = res.data.obj.user;
                  var site = res.data.obj.page.rows[0]
                  wx.setStorageSync('token', token)
                  wx.setStorageSync('user', user)
                  wx.setStorageSync('site', site)
                  var shopcarPro = wx.getStorageSync('js-shopCarProduct-' + user.id)
                  if (!shopcarPro) {
                    wx.setStorageSync('js-shopCarProduct-' + user.id, [])
                  }
                  console.log(user.roleId)
                  if (user.roleId ==30) {
                    wx.switchTab({
                      url: '../home/home',
                    })
                  } else {
                    wx.redirectTo({
                      url: '../approveIndex/approveIndex',
                    })
                  }
                } else if (res.data.code == 204) {
                  wx.reLaunch({
                    url: '../register/register',
                  })
                }
                return resolve(res)
              }
            })
          } else {
            setTimeout(() => {
              getOpenId()
            }, 3000)
          }
        }
        getOpenId()
      } else {
        _this.globalData.openId = openId
        let basepath = _this.config.apiBase + '/xxx/verifyUserBind'
        wx.request({
          url: basepath,
          data: {
            openid: openId   //微信用户openid
          },
          success: res => {
            console.log(res)
            if (res.data.code == 200) {
              console.log('用户已绑定')
              var token = res.data.obj.token;
              var user = res.data.obj.user;
              var site = res.data.obj.page.rows[0]
              wx.setStorageSync('token', token)
              wx.setStorageSync('user', user)
              wx.setStorageSync('site', site)
              var shopcarPro = wx.getStorageSync('js-shopCarProduct-' + user.id)
              console.log(!shopcarPro)
              if (!shopcarPro) {
                wx.setStorageSync('js-shopCarProduct-' + user.id, [])
              }
              console.log(user.roleId)
              // if (user.roleId == 30) {
              //   wx.switchTab({
              //     url: '../home/home',
              //   })
              // } else {
              //   wx.redirectTo({
              //     url: '../approveIndex/approveIndex',
              //   })
              // }
            } else if (res.data.code == 204) {
              wx.reLaunch({
                url: '../register/register',
              })
            }
            return resolve(res)
          }
        })
      }
    })
    return promise
  },
  globalData: {
    userInfo: null,
    editAddress:null,
    openId:null,
    product:null,
  }
})