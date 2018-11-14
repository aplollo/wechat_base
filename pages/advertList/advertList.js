const app = getApp()
const network = require('../../utils/network.js')
Page({
  data: {
    advertId: -1,
    page: 0,
    productList: [],
    productPrice: [],
    moreProduct: true,//是否更多商品阀值
    httpFlag: false,
    loadState: '正在加载',
    query: {
      siteId: '',
      pageNo: 0,
      advertId:'',
    },
    unit: ''
  },
  onLoad(options) {
    console.log(options)
    if (options.advertId) {
      this.data.query.advertId = options.advertId
    }
    let siteId = wx.getStorageSync('site').id
    let unit = wx.getStorageSync('site').cashUnit
    this.setData({
      unit
    })
    this.data.query.siteId = siteId
    console.log(this.data.query.advertId)
    console.log(this.data.query.siteId)
    this.initData()
  },
  initData() {
    console.log(this.data.query)
    network('/xxx', this.data.query, 'POST').then(res => {
      console.log(res)
      if (res.data.code == 200) {
        this.data.query.page++;
        if (this.data.query.page == 1) {
          this.data.productPrice = res.data.obj.page.rows;
        }
        let data = res.data.obj.page.rows;
        this.data.productList = data;
        this.getProductPrice(this.data.productList, () => {
          if (this.data.page == 1) {
            this.data.productPrice = []
          }
          this.httpFlag = true;
          if (!data.length || data.length < 10) {
            //如果返回的数据为空
            this.data.moreProduct = false; //禁止再次发送请求
            this.setData({
              loadState: "无更多数据"
            })
            return;
          }
        });
      }
    }).catch(err => {
      console.log(err, 1);
      this.data.moreProduct = true;
      this.data.httpFlag = true;
    });
  },
  toPage(e) {
    console.log(e.currentTarget.dataset.pid)
    if (e.currentTarget.dataset.pid) {
      wx.navigateTo({
        url: '../productDetail/productDetail?pid=' + e.currentTarget.dataset.pid,
      })
    }
  },
  getProductPrice(products, callBack) {
    let spIds = products.map(e => e.id).join(",")
    let token = wx.getStorageSync('token')
    let siteId = wx.getStorageSync('site').id
    let params = {
      token,
      siteId,
      spIds
    }
    network('/xxx', params, 'POST').then(res => {
      if (callBack) callBack()
      if (res.data.success && res.data.code == 200) {
        console.log(res.data.obj)
        this.setData({
          productPrice: this.data.productPrice.concat(res.data.obj.priceSiteProductList)
        })
      } else if (res.data.code == 204) {
        this.setData({
          productPrice: this.data.productPrice.concat(products)
        })
      }
      console.log(this.data.productPrice)
    })
  },
})