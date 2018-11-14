Page({
  toOrder() {
    wx.redirectTo({
      url: '../order/order',
    })
  },
  toShopcar() {
    wx.switchTab({
      url: '../shopcar/shopcar',
    })
  },
  toHome() {
    wx.switchTab({
      url: '../home/home',
    })
  },
})