const app = getApp()
const network = require('../../utils/network.js')
Page({
  data:{
    orderDetail: {},
    auditLoad:[],
    saleNum: 0,
    totalPrice: 0,
    unit:'',
    showFlag:false,
  },
  onLoad(options) {
    console.log(options.orderNo)
    let unit = wx.getStorageSync('site').cashUnit
    this.setData({
      unit
    })
    this.init(options.orderNo)
  },
  init(orderNo) {
    network('/api/myOrderDetail', {orderNo}, 'POST').then(res => {
      console.log(res)
      if( res.data.code == 200 ) {
        let orderDetail = res.data.obj.entity
        let orderDetailList = res.data.obj.entity.orderDetailList
        orderDetailList.forEach((v,i) => {
          this.data.totalPrice += v.supplyPrice * v.saleNum
          this.data.saleNum += v.saleNum
        })
        this.data.totalPrice = this.data.totalPrice + orderDetail.freight
        this.setData({
          orderDetail: orderDetail,
          orderDetailList: orderDetailList,
          totalPrice: this.data.totalPrice,
          saleNum: this.data.saleNum
        })
        network('/api/act/findHistoryActInstanceList', { processInstanceId: res.data.obj.entity.taskProcessId},'POST').then(res => {
          this.setData({
            auditLoad: res.data.obj.voList
          })
        })
      }
    })
  },
  changeStatus() {
    this.setData({
      showFlag: !this.data.showFlag
    })
  }
})