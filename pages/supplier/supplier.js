const app = getApp()
const network = require('../../utils/network.js')
Page({
  data: {
    cateId:'',
    cateList:[],
    showFlag: false,
    shop: [], //选中商城
    shops: [
      //全部商城列表
      {
        name: "京东商城",
        source: 1,
        color:false,
      },
      {
        name: "线下供应商",
        source: 2,
        color: false,
      },
      {
        name: "苏宁易购",
        source: 3,
        color: false,
      },
      {
        name: "网易严选",
        source: 4,
        color: false,
      }
    ],
    source:'',
    product: [],
    page:0,
    tbodyHeight:0,
    siteId:'',
    sort:false,//降序flag
    sendFlag:true,
    loadText:'正在加载',
    loadFlag:true,
    loading:false,
    unit:''
  },
  onLoad: function (options) {
    this.data.siteId = wx.getStorageSync('site').id
    let unit = wx.getStorageSync('site').cashUnit
    this.setData({
      unit
    })
    this.initCate()
    this.getProduct()
  },
  onReachBottom: function () {
    console.log(123)
    if(!this.data.loadFlag) return
    this.getProduct()
  },
  initCate() {
    // 初始化分类列表
    let params = {siteId: this.data.siteId}
    network('/xxx',params,'POST').then(res => {
      console.log(res)
      if(res.data.code == 200) {
        this.setData({
          cateList: res.data.obj.page.rows
        })
      }
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
  // 选择分类
  chooseCli(e) {
    let cateId = e.currentTarget.dataset.cateid
    let flag = e.currentTarget.dataset.flag
    
    if(this.data.cateId == cateId) {
      this.setData({
        cateId:''
      })
      console.log(this.data.cateId);
    } else {
      this.setData({
        cateId: e.currentTarget.dataset.cateid
      })
      console.log('商品类id')
      console.log(this.data.cateId);
    }
    if (flag) {
      this.chooseSly(e)
      this.setData({
        product: [],
        loadText: '正在加载',
        page: 0,
        sendFlag: true,
      })
      this.getProduct()
    }
  },
  // 选择供应商
  chooseSly(e) {
    let shop = e.currentTarget.dataset.source
    if(shop == -1) {
      this.data.shops.forEach((v,i) => {
        v.color = false
      })
      this.setData({
        shop: [],
        shops:this.data.shops
      })
      console.info(this.data.shop, this.data.shops)
      return
    }
    let index = this.data.shop.indexOf(shop);
    if (index != -1) {
      //是否已选中 如果已选中 取消相互
      this.data.shops.forEach((v, i) => {
        if (v.source == shop) {
          return v.color = false
        }
      })
      console.log(index)
      this.data.shop.splice(index, 1)
      console.log(this.data.shop)
      this.setData({
        shop: this.data.shop,
        shops: this.data.shops
      })
    } else {
      //如果未选中 则选中
      this.data.shops.forEach((v,i) => {
        if(v.source == shop) {
          return v.color = true
        }
      })
      console.log(this.data.shops)
      console.log(this.data.shop);
      this.data.shop.push(shop)
      this.setData({
        shop: this.data.shop,
        shops:this.data.shops
      })
      console.log(this.data.shop);
    }
    console.log('渠道arr')
    console.log(this.data.shop);
  },
  showSupply() {
    if(this.data.showFlag) {
      this.setData({
        product:[],
        loadText:'正在加载',
        page:0,
        sendFlag:true,
        loadFlag:true,
      })
      this.getProduct()
    }
    this.setData({
      showFlag: !this.data.showFlag
    })
  },
  getProduct() {
    console.log(this.data.sendFlag)
    if (!this.data.sendFlag) return
    this.setData({
      sendFlag : false
    })
    let source = this.source()
    console.log(source)
    let query = {
      siteId: this.data.siteId, //站点id，必填
      itemName: '', //搜索关键字，必填
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
      icon:'loading',
      duration:60000
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
        this.getProductPrice(data,() => {
          if(this.data.page == 1) {
            this.setData({
              product: []
            })
          }
          if(!data.length || data.length<10) {
            this.setData({
              loadText:'没有更多商品了',
              loadFlag:false
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
  upper: function (e) {
    console.log('滚动到顶部')
  },
  lower: function (e) {
    console.log('滚动到底部')
  },
  scroll: function (e) {
    console.log(e)
  },
  preventTouchMove() {

  }
})