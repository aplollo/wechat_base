const app = getApp()
const network = require('../../utils/network.js')
Page({
  data:{
    typeList:[
      {
        status: '',
        name: '全部'
      },
      {
        status: 1,
        name: '待审批'
      },
      {
        status: 21,
        name: '未通过'
      },
      {
        status: 22,
        name: '待收货'
      },
      {
        status: 23,
        name: '已完成'
      },
    ],
    orderList:[],
    token:'',
    siteId:'',
    status:'',
    sendHttpFlag:true,
    loadText:true,
    page:0,
    unit:''
  },
  onLoad() {
    let token = wx.getStorageSync('token')
    let siteId = wx.getStorageSync('site').id
    this.setData({
      token,
      siteId,
      page:0,
    })
    let unit = wx.getStorageSync('site').cashUnit
    this.setData({
      unit
    })
    this.initData()
  },
  onReachBottom() {
    console.log('bottom')
    if (!this.data.sendHttpFlag) return;
    this.data.sendHttpFlag = false
    this.initData()
  },
  initData() {
    this.data.sendHttpFlag = false
    let params = {
      token: this.data.token,
      status: this.data.status,
      pageNo: this.data.page,
      siteId: this.data.siteId
    }
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 60000
    })
    network('/api/myOrderList',params,'POST').then(res => {
      wx.hideToast()
      if(res.data.code ==200) {
        let data = res.data.obj.page.rows
        console.log(data)
        if(this.data.page>0) {
          this.setData({
            orderList:this.data.orderList.concat(data)
          })
          console.log(this.data.orderList)
        } else {
          this.setData({
            orderList: data
          })
        }
        if(!data.length || data.length<10) {
          return this.setData({
            loadText:false,
            sendHttpFlag:true
          })
        }
        this.data.page +=1
        console.log(this.data.page)
      } else {
        wx.showToast({
          title: res.data.msg,
          icon:'none',
          duration:1500
        })
      }
      this.data.sendHttpFlag = true
    }).catch(() => {
      this.data.sendHttpFlag = true
    })
  },
  chooseType(e) {
    console.log(e.currentTarget.dataset.status)
    console.log(this.data.sendHttpFlag)
    if (!this.data.sendHttpFlag) return
    if(this.data.status == e.currentTarget.dataset.status) return
    this.setData({
      status: e.currentTarget.dataset.status,
      page: 0,
      loadText:true,
      orderList:[],
    })
    this.initData()
  },
  toDetail(e) {
    console.log(e.currentTarget.dataset.orderno);
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderNo=' + e.currentTarget.dataset.orderno,
    })
  },
  toHome() {
    wx.switchTab({
      url: '../home/home',
    })
  }
})