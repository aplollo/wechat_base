const app = getApp()
const network = require('../../utils/network.js')
Page({
  data: {
    currentInput:'',
    siteId:'',
    unit:'',
    source:'',
    cateId:'',
    shop:[],
    product: [],
    loadText: '正在加载',
    page: 0,
    sendFlag: true,
    loadFlag: true,
    showToast:false,
  },
  onLoad() {
    this.data.siteId = wx.getStorageSync('site').id
    let unit = wx.getStorageSync('site').cashUnit
    this.setData({
      unit
    })
    // this.initCate()
    // this.getProduct()
  },
  currentInput(e) {
    this.setData({
      currentInput:e.detail.value
    })
    console.log(this.data.currentInput)
  },
  deleteInput() {
    this.setData({
      currentInput: ''
    })
  },
  toPage(e) {
    console.log(e.currentTarget.dataset.pid)
    if (e.currentTarget.dataset.pid) {
      wx.navigateTo({
        url: '../productDetail/productDetail?pid=' + e.currentTarget.dataset.pid,
      })
    }
  },
  toSearch() {
    console.log(this.data.currentInput)
    if (!this.data.sendFlag) return
    this.setData({
      product: [],
      loadText: '正在加载',
      page: 0,
      sendFlag: true,
      loadFlag: true,
      showToast: true,
    })
    this.getProduct()
  },
  getProduct() {
    console.log(this.data.sendFlag)
    this.setData({
      sendFlag: false
    })
    let source = this.source()
    console.log(source)
    let query = {
      siteId: this.data.siteId, //站点id，必填
      itemName: this.data.currentInput, //搜索关键字，必填
      catId: this.data.cateId, //分类id
      startPrice: '', //起始价格
      endPrice: '', //结束价格
      source: source, //商品渠道id（多选英文逗号分隔）
      brandName: '',
      px: '', //是否是排序查询
      pageNo: this.data.page, //页码
      desc: 'asc'
    };
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 60000
    })
    network('/xxx/advance', query, 'POST').then(res => {
      console.log(res)
      if (res.data.code == 200) {
        this.data.page += 1
        console.log(this.data.page)
        if (this.data.page == 1) {
          this.data.product = res.data.obj.page.rows.sort(this.compare('supplyPrice'))
        }
        let data = res.data.obj.page.rows
        this.getProductPrice(data, () => {
          if (this.data.page == 1) {
            this.setData({
              product: []
            })
          }
          if (!data.length || data.length < 10) {
            this.setData({
              loadText: '没有更多商品了',
              loadFlag: false
            })
          }
          this.setData({
            sendFlag: true
          })
          console.log(this.data.sendFlag)
        })
      } else {
        wx.hideToast()
        this.setData({
          sendFlag: true
        })
      }
    })
  },
  getProductPrice(products, callBack) {
    let spIds = products.map(e => e.id).join(",")
    let token = wx.getStorageSync('token')
    let siteId = wx.getStorageSync('site').id
    let params = {
      spIds,
      token,
      siteId
    }
    network('/xxx', params, 'POST').then(res => {
      if (callBack) callBack()
      if (res.data.success && res.data.code == 200) {
        console.log(res.data.obj)
        if (res.data.obj.priceSiteProductList) {
          this.setData({
            product: this.data.product.concat(res.data.obj.priceSiteProductList.sort(this.compare('supplyPrice')))
          })
        } else {
          this.setData({
            product: this.data.product
          })
        }
      } else if (res.data.code == 204) {
        this.setData({
          product: this.data.product.concat(products.sort(this.compare('supplyPrice')))
        })
      }
      wx.hideToast()
      console.log(this.data.product)
    })
  },
  compare(pro) {
    let that = this
    return function (obj1, obj2) {
      var val1 = obj1[pro];
      var val2 = obj2[pro];

      if (val1 < val2) { //正序
        return that.data.sort ? -1 : 1;
      } else if (val1 > val2) {
        return that.data.sort ? 1 : -1;
      } else {
        return 0;
      }
    }
  },
  source() {
    //商品渠道id（多选英文逗号分隔）
    console.log(this.data.shop)
    let shop = [];
    for (let i = 0; i < this.data.shop.length; i++) {
      shop.push(this.data.shop[i]);
      console.log(shop)
    }
    console.log(shop)
    if (!shop.length) {
      return "";
    }
    return shop.join(",");
  },
  onReachBottom() {
    if (!this.data.loadFlag) return
    this.getProduct()
  }
})