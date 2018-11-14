const app = getApp()
const network = require('../../utils/network.js')
Page({
  data:{
    reason: '',
    confirmOrder: [],
    source:'',
    token:'',
    siteId:'',
    user:'',
    activeAddress: {},
    freight: 0, //运费
    totalNum:0,
    total:0,
    tol:0,
    submitFlag:true,
    payQuery:{},
    message:{},
  },
  onLoad(options) {
    let confirmOrder = wx.getStorageSync('product')
    console.log(confirmOrder)
    this.setData({
      confirmOrder,
      source:confirmOrder[0].source
    })
    let token = wx.getStorageSync('token')
    let siteId = wx.getStorageSync('site').id
    let user = wx.getStorageSync('user')
    this.setData({
      token,
      siteId,
      user
    })
    this.setData({
      totalNum: this.totalNum()
    })
    this.initData()
  },
  onShow() {
    console.log(123)
    console.log(JSON.stringify(this.data.message) == '{}')
    if (JSON.stringify(this.data.message) =='{}') return
    this.setData({
      activeAddress:this.data.message
    })
    // 运费查询
    let freightQuery = this.freightQuery()
    network('/api/getFreightFare', freightQuery, 'POST', { "Content-Type": "application/json" }).then(res => {
      console.log(res)
      if (res.data.code == 200) {
        this.setData({
          freight: res.data.obj.freight
        })
        this.setData({
          total: this.total()
        })
        this.setData({
          tol: this.tol()
        })
      }
    })
  },
  initData() {
    let addressParams = {
      token:this.data.token,
      siteId: this.data.siteId,
      source: this.data.source,
    }
    network('/api/getAddress', addressParams,'POST').then(({data}) => {
      if (!data.obj.entity) {
        return wx.showToast({
          title: '系统繁忙',
          icon:'none',
          duration:1500
        })
      }
      console.log(data.obj.entity)
      this.setData({
        activeAddress:data.obj.entity
      })
      // 运费查询
      let freightQuery = this.freightQuery()
      network('/api/getFreightFare', freightQuery, 'POST', { "Content-Type": "application/json" }).then(res => {
        console.log(res)
        if(res.data.code ==200) {
          this.setData({
            freight:res.data.obj.freight
          })
          this.setData({
            total: this.total()
          })
          this.setData({
            tol: this.tol()
          })
        }
      })
      // 初始化支付方式
    })
    
    // 初始化反馈原因
    // let distParam = {
    //   dict: "buy_reason",
    //   siteId: this.data.siteId
    // }
    // network('/api/dictByType', distParam, 'POST').then(({data}) => {})
  },
  freightQuery() {
    //运费查询参数
    let cartItemList = this.data.confirmOrder.map(e => {
      return {
        itemId: e.id,
        shopNum: e.num
      };
    });
    console.log(cartItemList)
    console.log(this.data.user.organizationId)
    console.log(this.data.user)
    let query = {
      cartItemList: cartItemList,
      orgId: this.data.user && Number(this.data.user.organizationId),
      payWay: this.data.actPayWay || "ye",
      paymentType: 1,
      remark: this.data.reason,
      siteId: this.data.siteId,
      source: this.data.confirmOrder[0].source,
      supplyId: this.data.confirmOrder[0].supplyId,
      token: this.data.token,
      userAddressId: this.data.activeAddress.id
    };
    return query;
  },
  total() {
    // 订单总价
    let tol = 0;
    this.data.confirmOrder.forEach(item => {
      tol += item.supplyPrice * item.num;
    });
    return tol.toFixed(2);
  },
  tol() {
    // 支付金额
    let tol = Number(this.data.total) + Number(this.data.freight);
    return tol.toFixed(2);
  },
  totalNum() {
    //计算订单总件数
    let tol = 0;
    this.data.confirmOrder.forEach(item => {
      tol += parseInt(item.num);
      console.log(item.num);
    });
    console.log(tol);
    return tol.toFixed(0);
  },
  changeAddress() {
    console.log(this.data.source)
    wx.navigateTo({
      url: '../confirmAddress/confirmAddress?source='+this.data.source,
    })
  },
  reasonInput(e) {
    this.data.reason = e.detail.value;
  },
  confirm() {
    console.log(this.data.reason)
    if(!this.data.reason) {
      return  wx.showToast({
        title: '请输入采购事由',
        icon: 'none',
        duration: 2000,
      })
    }
    if(!this.data.submitFlag) return
    this.data.submitFlag = false
    wx.showLoading({
      title: '支付中',
    })
    network('/api/submitOrder', this.freightQuery(), 'POST', { "Content-Type": "application/json" }).then(({data}) =>{
      if(data.success) {
        var token = 'payQuery.token'
        var orderNo = 'payQuery.orderNo'
        var payWay = 'payQuery.payWay'
        this.setData({
          [token]: data.obj.token,
          [orderNo]: data.obj.orderNo,
          [payWay]: data.obj.payWay,
        })
        console.log(this.data.payQuery)
        network('/api/payOrder', this.data.payQuery, 'POST', { "Content-Type": "application/json" }).then(({ data }) => {
          wx.hideLoading()
          if(data.success) {
            console.log(data)
            this.deleteShopCar();
            wx.removeStorageSync('product')
            wx.redirectTo({
              url: '../paySuccess/paySuccess',
            })
          }
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: data.msg,
          icon:'none',
          duration:1500
        })
        this.data.submitFlag = true
      }
    }).catch(() => {
      this.data.submitFlag = true;
    });
  },
  deleteShopCar() {
    let act = wx.getStorageSync('product')
    console.log(act)
    console.log(this.data.user.id)
    let shopCar = wx.getStorageSync("js-shopCarProduct-" + this.data.user.id)
    console.log(shopCar)
    if(!shopCar || !shopCar.length) return
    let arr = shopCar
    console.log(arr)
    for (let j = 0; j < act.length; j++) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == act[j].id) {
          console.log(act[j].id)
          arr.splice(i, 1);
          break;
        }
      }
    }
    console.log(arr)
    wx.setStorageSync("js-shopCarProduct-" + this.data.user.id, arr)
  }
})