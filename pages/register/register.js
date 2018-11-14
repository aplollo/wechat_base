const app = getApp()
const network = require('../../utils/network.js')
Page({
  data:{
    obj:{
      organizationNames: '昆明预算单位1',
      username: 'cg42',
      certificationNumber: '31010619710303001X',
      bankManagerNo: '621700272023201925',
      mobile: '12312',
      wxOpenId:'',
    }
  },
  onLoad() {
    console.log(app)
  },
  organizationName(e) {
    this.data.obj.organizationNames = e.detail.value
    console.log(this.data.obj)
  },
  username(e) {
    this.data.obj.username = e.detail.value
    console.log(this.data.obj)
  },
  certificationNumber(e) {
    this.data.obj.certificationNumber = e.detail.value
    console.log(this.data.obj)
  },
  bankManagerNo(e) {
    this.data.obj.bankManagerNo = e.detail.value
    console.log(this.data.obj)
  },
  mobile(e) {
    this.data.obj.mobile = e.detail.value
    console.log(this.data.obj)
  },
  confirm() {
    this.data.obj.wxOpenId = app.globalData.openId
    var cardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    var mobileReg = /^((13|14|15|17|18)[0-9]{1}\d{8})$/;
    if (!this.data.obj.organizationNames) {
      return wx.showToast({
        title: '请输入企业全称',
        icon: 'none',
        duration:1000
      })
    }
    if (!this.data.obj.username) {
      return wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration:1000
      })
    }
    if (!this.data.obj.certificationNumber) {
      return wx.showToast({
        title: '请输入身份证号',
        icon: 'none',
        duration:1000
      })
    }
    // if (!cardReg.test(this.data.obj.certificationNumber)) {
    //   return wx.showToast({
    //     title: '请输入正确的身份证号',
    //     icon: 'none',
    //     duration: 1000
    //   })
    // }
    if (!this.data.obj.bankManagerNo) {
      return wx.showToast({
        title: '请输入银行卡号',
        icon: 'none',
        duration:1000
      })
    }
    if (!this.data.obj.mobile) {
      return wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration:1000
      })
    }
    // if (!mobileReg.test(this.data.obj.mobile)) {
    //   return wx.showToast({
    //     title: '请输入正确的手机号',
    //     icon:'none',
    //     duration:1000
    //   })
    // }
    console.log(app)
    let that = this
    return network('/xxx/verifyUserInfo', this.data.obj, 'POST', {"Content-Type":"application/json"})
    .then(res => {
      console.log(res)
      if (res.data.code == 200) {
        var token = res.data.obj.token;
        var user = res.data.obj.user;
        var site = res.data.obj.page.rows[0]
        var veryobj = {
          username: that.data.obj.username,
          mobile: that.data.obj.mobile,
          bankManagerNo: that.data.obj.bankManagerNo,
          certificationNumber: that.data.obj.certificationNumber
        }
        console.log(veryobj);
        wx.setStorageSync('veryobj', veryobj)
        wx.setStorageSync('token', token)
        wx.setStorageSync('user', user)
        wx.setStorageSync('site', site)
        var shopcarPro = wx.getStorageSync('js-shopCarProduct-' + user.id)
        if (!shopcarPro) {
          wx.setStorageSync('js-shopCarProduct-' + user.id, [])
        }
        wx.navigateTo({
          url: '../message/message',
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 700
        })
      }
    })
  }
})