const app = getApp()
const network = require('../../utils/network.js')
Page({
  data: {
    status: 1,
    httpFalg: false,
    page: 0,
    loadStatus:true,
    loadText:"正在加载",
    orderList:[],
    orderObj:{},
    token:'',
    passFlag:true
  },
  onLoad() {
    let token = wx.getStorageSync('token')
    let unit = wx.getStorageSync('site').cashUnit
    this.setData({
      token,
      unit
    })
    this.reset()
    this.init()
  },
  reset() {
    this.setData({
      orderList: [],
      page: 0,
      httpFalg:true,
      loadStatus: true,
      loadText: '正在加载',
      orderObj:{}
    })
  },
  init(){
    if(!this.data.httpFalg) return
    this.data.httpFalg = false
    let params = {
      token:this.data.token,
      auditStatus:this.data.status,
      pageNo:this.data.page
    }
    wx.showLoading({
      title: '加载中',
    })
    network('/xxx/findHistoryTaskList',params,'POST').then(res => {
      wx.hideLoading()
      console.log(res)
      if(res.data.code == 200) {
        let oldOrder = this.data.orderList
        let data = res.data.obj.page.rows
        console.log(oldOrder.concat(data))
        this.setData({
          orderList: oldOrder.concat(data)
        })
        this.data.page += 1
        if(!data.length || data.length <10) {
          this.setData({
            loadStatus: false,
            loadText: '已无更多数据',
          })
        }
        console.log(this.data.orderList)
      } else {
        wx.showToast({
          title: res.data.msg,
          icon:'none',
          duration:1500
        })
      }
      this.setData({
        httpFalg:true
      })
    }).catch((res) => {
      this.setData({
        httpFalg: true
      })
    })
  },
  changeStatus(e) {
    let status = e.currentTarget.dataset.status
    if(status == this.data.status) return
    if(!this.data.httpFalg) return
    console.log(status)
    this.setData({
      status
    })
    this.reset()
    this.init()
  },
  onReachBottom() {
    if (!this.data.loadStatus) return
    this.init()
  },
  toDetail(e) {
    let orderNo = e.currentTarget.dataset.item
    console.log(orderNo)
    wx.navigateTo({
      url: '../approveDetail/approveDetail?orderNo='+orderNo,
    })
  },
  select(e) {
    console.log(e.currentTarget.dataset.item)
    let orderItem = e.currentTarget.dataset.item
    let orderObj = {
      id: orderItem.auditId.toString(),
      taskProcessId: orderItem.taskProcessId
    }
    this.data.orderList.forEach((v,i) => {
      if (v.auditId == orderItem.auditId) {
        console.log(v)
        v.selectStatus = true
        console.log(v)
      } else {
        v.selectStatus = false
      }
    })
    this.setData({
      orderObj,
      orderList: this.data.orderList
    })
    console.log(this.data.orderObj)
  },
  pass() {
    if (!this.data.passFlag) return
    if(!this.data.orderObj.id) return wx.showToast({
      title: '请选择订单',
      icon:'none',
      duration:1500
    })
    let that = this
    wx.showModal({
      content: '确认通过该订单？',
      success(res) {
        if(res.confirm) {
          that.data.passFlag = false;
          let params = {
            token: that.data.token,
            auditId: that.data.orderObj.id,
          }
          wx.showLoading({
            title: '审批中',
          })
          network('/xxx', params, 'POST').then(res => {
            wx.hideLoading()
            if (res.data.code == 200) {
              that.data.passFlag = true
              wx.hideLoading()
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 1500
              })
              that.reset()
              that.init()
            } else {
              that.data.passFlag = true
              wx.showToast({
                title: '支付失败',
                icon: 'none',
                duration: 1500
              })
            }
          }).catch((res) => {
            that.data.passFlag = true
            wx.hideLoading()
            wx.showToast({
              title: '支付失败',
              icon: 'none',
              duration: 1500
            })
          })
        } else {
          that.data.passFlag = true
          wx.showToast({
            title: '支付失败',
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },
  refuse() {
    let that = this
    if (!that.data.passFlag) return
    if (!that.data.orderObj.id) return wx.showToast({
      title: '请选择订单',
      icon: 'none',
      duration: 1500
    })
    wx.showModal({
      content: '确认拒绝此订单？',
      success(res) {
        if (res.confirm) {
          that.data.passFlag = false;
          let arr = [];
          arr.push(that.data.orderObj);
          let params = {
            token: that.data.token,
            auditList: JSON.stringify(arr)
          }
          wx.showLoading({
            title: '审批中',
          })
          network('/xxx',params,'POST').then(res => {
            wx.hideLoading()
            that.data.passFlag = true;
            if(res.data.code == 200) {
              wx.showToast({
                title: res.data.msg,
                icon:'success',
                duration:1500
              })
              that.reset()
              that.init()
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 1500
              })
            }
          }).catch(() => {
            wx.hideLoading()
            that.data.passFlag = true;
          })
        } else {
          console.log('refuse cancel')
        }
      }
    })
  }
})