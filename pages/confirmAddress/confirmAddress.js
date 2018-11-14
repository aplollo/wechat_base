const app = getApp()
const network = require('../../utils/network.js')
Page({
  data:{
    token:'',
    siteId:'',
    source:0,
  },
  onLoad(options) {
    console.log(options.source)
    let token = wx.getStorageSync('token')
    let siteId = wx.getStorageSync('site').id
    this.setData({
      token,
      siteId,
      source:options.source,
      addressList:[]
    })
    this.initAddress(options.source)
  },
  onShow() {

  },
  initAddress(e) {
    let params = {
      token:this.data.token,
      source: this.data.source,
      siteId: this.data.siteId,
    }
    network('/xxx',params,'POST').then(({data}) => {
      if(data.success) {
        console.log(data.obj.addressList)
        this.setData({
          addressList: data.obj.addressList
        })
        console.log(this.data.addressList)
      }
    })
  },
  changeAddress(e) {
    console.log(e)
    let item = e.currentTarget.dataset.item
    console.log(item)
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.setData({
      message: e.currentTarget.dataset.item,
    })
    wx.navigateBack({
      delta: 1,
    })
  }
})