const app = getApp()
const network = require('../../utils/network.js')
Page({
  data: {
    searchInput:'',
    advertList:[],
    bannerList:[],
    recomList:[],
    supply:[
      {
        cateId:'1',
        cateName:'京东'
      },{
        cateId:'2',
        cateName:'供应商'
      },{
        cateId:'3',
        cateName:'苏宁'
      },{
        cateId:'4',
        cateName:'网易'
      },{
        cateId:'5',
        cateName:'齐心'
      },
    ],
    cateId: '',
    navTop: 0,
    fixFlag: false,
    advertId: '',
    page:0,
    productList:[],
    productPrice:[],
    moreProduct:true,// 是否加载更多商品阀值
    httpFlag:true,// 请求接口的阀值
    loadState:'正在加载',
    siteId:'',
    unit:'',
  },
  onLoad: function (options) {
    // if (!wx.getStorageSync('token')) return
    this.initData();
    let that = this;
    let query = wx.createSelectorQuery();
    // 精选div到top的高度
    query.select('.move').boundingClientRect().exec((rect) => {
      console.log(rect[0].top)
      this.data.topHeight = rect[0].top
      console.log(this.data.topHeight)
    })
    // app.Promise.then((res) => {
    //   console.log(res)
    //   // if(res.data.code != 200) return
    //   if(!wx.getStorageSync('token')) return
    //   let that = this;
    //   let query = wx.createSelectorQuery();
    //   this.initData();
    //   // 精选div到top的高度
    //   query.select('.move').boundingClientRect().exec((rect) => {
    //     console.log(rect[0].top)
    //     this.data.topHeight = rect[0].top
    //     console.log(this.data.topHeight)
    //   })
    // })
  },
  initData() {
    let that = this
    let siteId = wx.getStorageSync('site').id
    let unit = wx.getStorageSync('site').cashUnit
    this.setData({
      siteId,
      unit
    })
    console.log(siteId)
    let params = { siteId: siteId }
    return network('/xxx', params, 'POST').then(res => {
      console.log(res)
      let data = res.data.obj.page.rows;
      let bannerList = [];
      let recomList = [];
      let advertList = [];
      data.forEach(e => {
        //数据分类
        if (e.type == 1) {
          bannerList.push(e);
        } else if (e.type == 2 && e.showType != 2) {
          recomList.push(e);
        } else if (e.type == 3) {
          advertList.push(e);
        }
      });
      // 设置banner/recom/advert
      that.setData({
        bannerList,
        recomList,
        advertList
      })
      // 精选商品id
      let ids = data.filter(e => e.type == 2 && e.showType == 2);
      let advertId = ids.length ? ids[0].id : false;
      this.setData({
        advertId
      })
      console.log(this.data.advertId)
      if (!this.data.advertId) {
        return;
      }
      this.getAdvertList();
    })
  },
  getAdvertList(source = '') {
    // 接口数据是否返回
    if (!this.data.httpFlag) return
    //能否加载更多数据
    if (!this.data.moreProduct) return;
    this.setData({
      httpFlag: false
    })
    let params = {
      siteId: this.data.siteId,
      advertId: this.data.advertId,
      pageNo: this.data.page,
      source: source
    }
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 60000
    })
    network('/xxx', params, 'POST').then(res => {
      console.log(res)
      if (res.data.code == 200) {
        this.data.page++;
        let data = res.data.obj.page.rows;
        console.log(data)
        if (this.data.page == 1) {
          this.data.productPrice = data;
        }
        this.data.productList = data;
        this.getProductPrice(this.data.productList, () => {
          if (this.data.page == 1) {
            this.data.productPrice = []
          }
          if (!data.length || data.length < 10) {
            this.setData({
              loadState: "无更多数据",
              moreProduct: false //禁止再次发送请求
            })
          }
        });
      } else {
        this.setData({
          httpFlag: true,
          moreProduct: true
        })
      }
    }).catch(err => {
      console.log(err, 1);
      this.setData({
        httpFlag: true,
        moreProduct: true
      })
      wx.hideToast()
    });
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
        if (!res.data.obj.priceSiteProductList) {
          res.data.obj.priceSiteProductList = []
        }
        this.setData({
          productPrice: this.data.productPrice.concat(res.data.obj.priceSiteProductList)
        })
      } else if (res.data.code == 204) {
        this.setData({
          productPrice: this.data.productPrice.concat(products)
        })
      }
      this.setData({
        httpFlag: true
      })
      wx.hideToast()
      console.log(this.data.productPrice)
      console.log(this.data.httpFlag)
      console.log(this.data.moreProduct)
    })
  },
  toSearch() {
    wx.navigateTo({
      url: '../search/search',
    })
  },
  toSelect(e) {
    if(this.data.cateId == e.currentTarget.dataset.cateid) return
    console.log(e.currentTarget.dataset.cateid)
    // 重置数据/改变渠道商id
    this.setData({
      productPrice: [],
      loadState: "正在加载",
      moreProduct:true,
      httpFlag:true,
      page: 0,
      cateId: e.currentTarget.dataset.cateid
    })
    this.getAdvertList(this.data.cateId)
    console.log(this.data.cateId)

  },
  toPage(e) {
    console.log(e.currentTarget.dataset.pid)
    if(e.currentTarget.dataset.pid) {
      wx.navigateTo({
        url: '../productDetail/productDetail?pid='+e.currentTarget.dataset.pid,
      })
    }
  },
  toProductList(e) {
    console.log(e.currentTarget.dataset.showtype)
    wx.navigateTo({
      url: '../productList/productList?showtype='+e.currentTarget.dataset.showtype,
    })
  },
  toHref(e) {
    console.log(e.currentTarget.dataset.url)
    // window.location.href = e.currentTarget.dataset.url;
  },
  toSupply() {
    wx.navigateTo({
      url: '../supplier/supplier',
    })
  },
  scrollHandler(e) {
    // 精选top置顶
    if(e.detail.scrollTop >= this.data.topHeight) {
      // console.log('超出')
      this.setData({
        fixFlag: true
      })
    } else {
      // console.log('不足')
      this.setData({
        fixFlag: false
      })
    }
  },
  scrollToBottom(e) {
    console.log(e)
    this.getAdvertList(this.data.cateId)
  },
})