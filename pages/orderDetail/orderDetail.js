const app = getApp()
const network = require('../../utils/network.js')
Page({
  data:{
    orderDetail:{},
    auditLoad:[],
    isCancel:'',
    token:'',
    unit:'',
    orderNo:'',
    orderDetailList:[],
    totalPrice:'',
    totalNum:0,
  },
  onLoad(options) {
    console.log(options);
    let orderNo = options.orderNo
    let token = wx.getStorageSync('token')
    let unit = wx.getStorageSync('site').cashUnit
    this.setData({
      token,
      orderNo,
      unit
    })
    let params = {
      token,
      orderNo
    }
    // 订单是否可以撤销
    network('/xxx', params,'POST').then(({data}) => {
      console.log(data)
      if(data.code == 200) {
        console.log(123)
        this.setData({
          isCancel: data.obj.isCancel
        })
      }
    })
    // 初始化订单
    network('/xxx',{orderNo},'POST').then(({data}) => {
      console.log(data)
      if(data.code ==200) {
        let orderDetailList = data.obj.entity.orderDetailList
        let price = 0
        let totalNum = 0;
        orderDetailList.forEach((v,i)=>{
          price += v.saleNum * v.supplyPrice
          totalNum += v.saleNum
        })
        console.log(price)
        this.setData({
          orderDetail:data.obj.entity,
          totalNum,
          orderDetailList,
          totalPrice:price.toFixed(1)
        })
        // 订单审核状态
        let statusParams = {
          processInstanceId: data.obj.entity.taskProcessId
        }
        network('/xxx/findHistoryActInstanceList', statusParams,'POST').then(res => {
          console.log(res.data)
          if(res.data.code == 200) {
            this.setData({
              auditLoad: res.data.obj.voList
            })
          }
        })
      } else {
        wx.showToast({
          title: data.msg,
          icon:'none',
          duration:1500
        })
      }
    })
  },
  cancelOrder() {
    // 撤销订单
    let that = this
    wx.showModal({
      content: '您确定要撤销改订单吗？',
      success(res) {
        if(res.confirm) {
          console.log('confirm')
          let params = {
            token:that.data.token,
            orderNo:that.data.orderNo,
            processInstanceId: that.data.orderDetail.taskProcessId
          }
          network('/xxx', params,'POST').then(({data}) => {
            console.log(res)
            if (data.success) {
              wx.navigateBack({
                delta: 1,
                success:function(e) {
                  var page = getCurrentPages().pop();
                  console.log(page)
                  if (page == undefined || page == null) return
                  page.setData({
                    orderList: []
                  })
                  page.onLoad()
                }
              })
              wx.showToast({
                title: "订单撤销成功",
                icon:'success',
                duration:3000
              })
            } else {
              if(data.msg) {
                wx.showToast({
                  title: data.msg,
                  icon:'none',
                  duration:1500
                })
              } else {
                wx.showToast({
                  title: '撤销订单失败',
                  icon:'none',
                  duration:1500
                })
              }
            }
          })
        } else {
          console.log('cancel')
        }
      }
    })
  },
  changeStatus() {
    this.setData({
      showFlag: !this.data.showFlag
    })
  }
})