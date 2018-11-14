const app = getApp()
const network = require('../../utils/network.js')
Page({
  data:{

  },
  onLoad() {
    setTimeout(()=>{
      app.Promise.then((res) => {
        console.log(res)
        if(res.data.code == 200) {
          if (res.data.obj.user.roleId == 30) {
            wx.switchTab({
              url: '../home/home',
            })
          } else {
            wx.redirectTo({
              url: '../approveIndex/approveIndex',
            })
          }
        }
      })
    },1000)
  },
  toPage() {
    wx.switchTab({
      url: '../home/home',
    })
  }

})