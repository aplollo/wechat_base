const app = getApp()
const network = require('../../utils/network.js')
Page({
  data: {
    availablePoints:'',
    unit:'',
    user:'',
  },
  onLoad() {
    this.init()
  },
  init() {
    let user = wx.getStorageSync('user')
    this.setData({
      user
    })
    // let siteId = wx.getStorageSync('site').id
    // let token = wx.getStorageSync('token')
    // let unit = wx.getStorageSync('site').cashUnit
    // let params = {
    //   siteId,
    //   token
    // }
    // network('/xxx',params,'POST').then(res => {
    //   console.log(res)
    //   if(res.data.code == 200) {
    //     this.setData({
    //       availablePoints: res.data.obj.availablePoints,
    //       unit
    //     })
    //     wx.setStorageSync('availablePoints', res.data.obj.availablePoints)
    //   }
    // })
  },
  toPage() {
    wx.navigateTo({
      url: '../approve/approve',
    })
  }
})
