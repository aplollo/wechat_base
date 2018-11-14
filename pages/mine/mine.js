const app = getApp()
const network = require('../../utils/network.js')
Page({
  data: {
    account:'',

  },
  onLoad: function (options) {
    let token = wx.getStorageSync('token')
    let unit = wx.getStorageSync('site').cashUnit
    // network('/xxx', {token},'POST').then(res => {
    //   console.log(res)  
    // })
  },
  toOrder() {
    wx.navigateTo({
      url: '../order/order',
    })
  },
  toAddress() {
    wx.navigateTo({
      url: '../address/address',
    })
  },
  toPhone() {
    wx.navigateTo({
      url: '../phone/phone',
    })
  },
  toPassword() {
    wx.navigateTo({
      url: '../changepass/changepass',
    })
  },
  toQuit() {

  }
})