// pages/phone/phone.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    callFlag:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(this.data.callFlag)
    this.data.callFlag = true
    this.setData({
      callFlag: true
    })
    console.log(this.data.callFlag)
  },
})