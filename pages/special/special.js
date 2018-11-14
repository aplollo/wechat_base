const app = getApp()
const network = require('../../utils/network.js')
Page({
  data: {
    recomList:[],
  },
  onLoad: function (options) {
    let that = this
    let siteId = wx.getStorageSync('site').id
    let params = { siteId: siteId }
    network('/xxx',params,'POST').then(res => {
      console.log(res)
      if(res.data.code == 200) {
        this.setData({
          recomList:res.data.obj.page.rows
        })
        console.log(this.data.recomList)
      }
    })
  },
  toPage(e) {
    console.log(e.currentTarget.dataset)
    wx.navigateTo({
      url: '../advertList/advertList?advertId=' + e.currentTarget.dataset.advertid
    })
  },
})