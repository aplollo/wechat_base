const network = require('../../utils/network.js')
Page({
  data:{
    veriCode:'',
    msgFlag:true,
    num:60,
  },
  getVeriCode(e) {
    this.data.veriCode = e.detail.value
    console.log(this.data.veriCode)
  },
  reduceNum() {
    let that = this
    if(!this.data.msgFlag) return
    var timer = setInterval(() => {
      getMessage();
      console.log(this.data.num);
    },1000)
    function getMessage() {
      that.setData({
        msgFlag: false
      })
      if (that.data.num == 0) {
        clearInterval(timer)
        return that.setData({
          msgFlag: true,
          num: 60
        })
      } else {
        let reduce = that.data.num - 1
        return that.setData({
          num: reduce
        })
      }
    }
    let params = wx.getStorageSync('veryobj')
    console.log(params)
    return network('/api/wx/sendVeriCode', params, 'POST', {"Content-Type": "application/json"}).then(res => {
      console.log(res)
      if(res.data.code == 200) {
        wx.showToast({
          title: '验证码发送成功',
          icon: 'success',
          duration: 1500
        })
        console.log('send success')
      } else {
        wx.showToast({
          title: res.data.msg,
          icon:'none',
          duration:1000
        })
      }
    })
  },
  confirm() {
    if(this.data.veriCode == '') {
      return wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        duration:1000
      })
    }
    let mobile = wx.getStorageSync('veryobj').mobile
    let user = wx.getStorageSync('user')
    let userId = wx.getStorageSync('user').id
    let orgId = wx.getStorageSync('user').organizationId
    let openId = wx.getStorageSync('openId')
    let params = { veriCode: this.data.veriCode, mobile, userId, orgId, openId}

    return network('/api/wx/checkVeriCode', params, 'POST', { "Content-Type": "application/x-www-form-urlencoded" }).then(res => {
      console.log(res);
      if (res.data.success == true) {
        console.log(res)
        if (user.roleId == 30) {
          wx.switchTab({
            url: '../home/home'
          })
        } else {
          wx.redirectTo({
            url: '../approveIndex/approveIndex',
          })
        }
        // wx.switchTab({
        //   url: '../home/home',
        //   success: function (e) {
        //     var page = getCurrentPages().pop();
        //     console.log(page)
        //     if(page == undefined || page == null) return
        //     page.onLoad()
        //   }
        // })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon:'none',
          duration:1500
        })
      }
    })
  }
})