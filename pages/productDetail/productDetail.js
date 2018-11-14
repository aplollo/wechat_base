const app = getApp()
const network = require('../../utils/network.js')
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    modelFlag:false,
    shopType:0,
    product:{},
    num:1,
    price:'',
    article_content:"",
    content:'',
    saleNum:'',
    token:'',
    siteId:'',
    user:'',
    address:'',
    stockNum:'',
    unit:''
  },
  onLoad: function (options) {
    console.log(options)
    let siteId = wx.getStorageSync('site').id
    let token = wx.getStorageSync('token')
    let user = wx.getStorageSync('user')
    let unit = wx.getStorageSync('site').cashUnit
    this.setData({
      unit
    })
    this.data.token = token
    this.data.siteId = siteId
    this.data.user = user
    network('/api/productDetail', {id:options.pid},'POST').then(({data}) => {
      console.log(data)
      if (data.code == 200) {
        // detail: data.obj.entity.content.replace(/\<img/g, '<img style="width:100%;height:auto;display:block" ')
        WxParse.wxParse('article_content', 'html', data.obj.entity.content, this, 0)
        this.setData({
          product: data.obj.entity,
        })
        console.log(typeof this.data.detail)
        let spIds = [data.obj.entity.id]
        let params = {
          siteId,
          token,
          spIds
        }
        network('/api/productPrice', params,'POST').then(res => {
          console.log(res)
          if(res.data.code == 200) {
            var xnum = 'product.supplyPrice'
            this.setData({
              price: res.data.obj.priceSiteProductList[0].supplyPrice,
              [xnum]: res.data.obj.priceSiteProductList[0].supplyPrice
            })
            console.log(this.data.price)
            console.log(this.data.product)
          } else {
            this.setData({
              price:this.data.product.supplyPrice
            })
            console.log(this.data.product)
          }
        })
      }
    })
    network('/api/productSaleNum',{id:options.pid},'POST').then(res => {
      if(res.data.code == 200) {
        this.setData({
          saleNum:res.data.obj.saleNum
        })
      }
    })
  },
  toShopcar() {
    wx.switchTab({
      url: '../shopcar/shopcar',
      success:function(e) {
        // var page = getCurrentPages().pop();
        // console.log(page)
        // if(page == undefined || page == null) return
        // page.onLoad()
      }
    })
  },
  addShopcar(e) {
    console.log(e.currentTarget.dataset.type)
    this.setData({
      modelFlag: true,
      shopType: e.currentTarget.dataset.type
    })
    let params = {
      token: this.data.token,
      source: this.data.product.source,
      siteId: this.data.siteId
    }
    network('/api/getAddress', params,'POST').then(({data}) => {
      console.log(data)
      if(!data.obj.entity)  {
        return this.setData({
          stockNum:'暂无信息'
        })
      }
      let address = data.obj.entity
      let actAddress = address.vo
      this.setData({
        address:actAddress
      })
      console.log(this.data.address)
      let params = {
        token:this.data.token,
        siteId: this.data.siteId,
        supplyId: this.data.product.supplyId,
        itemId: this.data.product.id,
        skuId: this.data.product.itemCode,
        num:1,
        source:this.data.product.source,
        provinceId: actAddress.province,
        cityId: actAddress.city,
        countyId: actAddress.county,
        townId: actAddress.town || 0
      }
      network('/api/productStock', params,'POST').then(({data}) => {
        console.log(data)
        if (data.obj[0].status == 1) {
          this.setData({
            stockNum: data.obj[0].stockNum || "有货"
          })
        } else {
          this.setData({
            stockNum: "库存不足"
          })
        }
        console.log(this.data.stockNum)
      })
    })
    console.log(this.data.shopType)
  },
  cancelModel() {
    this.setData({
      modelFlag:false,
    })
  },
  reduce() {
    let num = this.data.num - 1
    console.log(num)
    if(num < 1) {
      wx.showToast({
        title: '购买数量已达到最少！',
        icon:'none',
        duration:1500
      })
      this.setData({
        num:1
      })
      return
    } else {
      this.setData({
        num
      })
    }
  },
  add() {
    let num = this.data.num +1
    this.setData({
      num
    })
  },
  changeNum(e) {
    console.log(Number(e.detail.value))
    console.log(typeof Number(e.detail.value) == 'number')
    console.log(isNaN(typeof Number(e.detail.value)))
    if (e.detail.value < 1 || e.detail.value == '') {
      return this.setData({
        num:1
      })
    }
    this.setData({
      num: Number(e.detail.value)
    })
    
  },
  toDefault(e) {
    console.log(e)
    wx.navigateTo({
      url: '../addAddress/addAddress'
    })
  },
  editAddress() {
    wx.navigateTo({
      url: '../address/address?source='+this.filterSource(this.data.product.source),
    })
  },
  ensure(e) {
    console.log(this.data.shopType)
    console.log(e.currentTarget.dataset.item)
    let item = e.currentTarget.dataset.item;
    if(!this.data.address) {
      return wx.showToast({
        title: '请添加地址后再进行操作',
        icon:'none',
        duration:1500
      })
    }
    console.log(this.searchCar())
    console.log(this.data.shopType)
    console.log(!this.data.shopType)
    if (this.searchCar() && this.data.shopType == 0) {
      return wx.showToast({
        title: '购物车已存在该商品',
        icon: 'none',
        duration: 2000
      })
    }
    let query = {
      token: this.data.token,
      siteId: this.data.siteId,
      supplyId: this.data.product.supplyId,
      itemId: this.data.product.id,
      skuId: this.data.product.itemCode,
      num: this.data.num,
      source: this.data.product.source,
      provinceId: this.data.address.province || 0,
      cityId: this.data.address.city || 0,
      countyId: this.data.address.county || 0,
      townId: this.data.address.town || 0
    }
    network('/api/productStock', query, 'POST').then(({data}) => {
      console.log(data)
      if(data.code ==200) {
        console.log(data.obj[0].status == 1)
        if(data.obj[0].status == 1) {
          console.log(this.data.user.id)
          console.log(!this.data.shopType)
          if (this.data.shopType ==0) {
            let arr = wx.getStorageSync('js-shopCarProduct-' + this.data.user.id)
            let product = this.data.product
            product.num = this.data.num
            arr.push(product);
            wx.setStorageSync('js-shopCarProduct-' + this.data.user.id, arr)
            wx.showToast({
              title: '添加成功',
              icon:'success',
              duration:1500
            })
            this.setData({
              modelFlag: false,
            })
          } else {
            let order = []
            let product = this.data.product
            product.num = this.data.num
            order.push(product)
            console.log(order)
            wx.setStorageSync('product', order)
            wx.navigateTo({
              url: '../pay/pay',
            })
          }
        } else {
          wx.showToast({
            title: '库存不足',
            icon:'none',
            duration:1000
          })
        }
      } else {
        wx.showToast({
          title: data.msg,
          icon:'none',
          duration:1000
        })
      }
    })
  },
  filterSource(source) {
    if (source == 1 || source == 2 || source == 4) {
      return 1;
    }
    return source;
  },
  searchCar() {
    //用于校验购物车是否存在该商品
    let CartProduct = wx.getStorageSync('js-shopCarProduct-'+this.data.user.id);
    let product = this.data.product; //获取当前商品信息
    let flag = false;
    CartProduct.forEach(e => {
      if (e.id == product.id) {
        //遍历购物车 是否存在该商品
        flag = true;
      }
    });
    return flag;
  },
})