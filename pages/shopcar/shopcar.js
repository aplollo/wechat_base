Page({
  data: {
    actProduct:[],
    shopCarProduct:[],
    filterList:{},
    infoFlag:false,
    total:0,
    unit:''
  },
  onLoad: function (options) {
    // let user = wx.getStorageSync('user')
    // this.data.shopCarProduct = wx.getStorageSync('js-shopCarProduct-'+user.id);
    // console.log(this.data.shopCarProduct);

    // var supply = this.filterData();
    // console.log(supply)

    // this.setData({
    //   filterList: supply
    // })
    // console.log(supply)
  },
  onShow(e) {
    let user = wx.getStorageSync('user')
    this.setData({
      shopCarProduct: wx.getStorageSync('js-shopCarProduct-' + user.id)
    })
    console.log(this.data.shopCarProduct);

    let unit = wx.getStorageSync('site').cashUnit
    this.setData({
      unit
    })
    var supply = this.filterShopCar();
    console.log(supply)

    this.setData({
      filterList: supply
    })
    console.log(supply)
  },
  filterShopCar() {
    let store = {};
    this.data.shopCarProduct.forEach(item => {
      const id = item.supplyId; //获取当前商品供应商Id
      if(!store[id]) {
        store[id] = {
          name: item.supplyName,
          products: []
        };
      }
      store[id].products.push(item);
    })
    console.log(store);
    return store;
  },
  checked(e){
    let item = e.currentTarget.dataset.item
    // 如果没有选中商品 直接添加
    if (!this.data.actProduct.length) {
      let arr = []
      arr.push(item)
      this.setData({
        actProduct:arr
      })
      this.changeStauts(item, true)
      this.total()
      console.log(this.data.actProduct)
      return
    }
    // 只保留 相同供应商商品
    let supply = this.data.actProduct.filter(e => {
      return e.supplyId == item.supplyId;
    });
    console.log(supply)
    if (!supply.length) {
      //如果没有相同供应商商品 直接清空选中商品 添加商品
      let arr = []
      arr.push(item)
      this.setData({
        actProduct:arr
      })
      this.changeOtherStauts(item)
      this.total()
      console.log(this.data.actProduct)
      return;
    }
    //如果有相同类型的商品  是否已添加
    let arr = supply.filter(e => {
      return e.id == item.id;
    });
    console.log(arr)
    if (arr.length > 0) {
      //如果选中商品存在
      for (let i = 0; i < this.data.actProduct.length; i++) {
        if (this.data.actProduct[i].id == item.id) {
          this.data.actProduct.splice(i, 1);
          console.log(this.data.actProduct)
          this.changeStauts(item, false)
          this.total()
          break;
        }
      }
    } else {
      //如果选中商品 不存在
      let arr = this.data.actProduct
      arr.push(item)
      this.setData({
        actProduct: arr
      })
      this.changeStauts(item, true)
      this.total()
      console.log(this.data.actProduct)
    }
  },
  changeStauts(item,flag){
    // 单个更改status
    console.log(item)
    for(let i in this.data.filterList) {
      if (item.supplyId == i) {
        this.data.filterList[i].products.forEach((v,j) => {
          if(v.id ==item.id) {
            this.data.filterList[i].products[j].chooseStatus = flag
            let arr = this.data.filterList
            console.log(this.data.filterList[i].products.length)
            console.log(this.data.actProduct.length)
            console.log(this.data.filterList[i].products.length == this.data.actProduct.length)
            if (this.data.filterList[i].products.length == this.data.actProduct.length) {
              this.data.filterList[i].chooseStatus = true
            } else {
              this.data.filterList[i].chooseStatus = false
            }
            console.log(this.data.filterList)
            return this.setData({
              filterList:arr
            })
          }
        })
      }
    }
  },
  changeOtherStauts(item){
    // 单个商品切换供应商更改选中状态
    console.log(item)
    for(let i in this.data.filterList) {
      if (item && item.supplyId == i) {
        this.data.filterList[i].products.forEach((v,j) => {
          if(v.id ==item.id) {
            this.data.filterList[i].products[j].chooseStatus = true
          }
        })
      } else {
        this.data.filterList[i].chooseStatus = false
        this.data.filterList[i].products.forEach((v, j) => {
          this.data.filterList[i].products[j].chooseStatus = false
        })
      }
    }
    let arr = this.data.filterList
    this.setData({
      filterList: arr
    })
    console.log(this.data.filterList)
  },
  allCheck(e) {
    let key = e.currentTarget.dataset.supplyid
    console.log(key)
    console.log(this.data.actProduct)
    let arr = this.data.actProduct.filter(e => {
      //遍历选中数组  是否存在不同供应商
      return e.supplyId != key;
    });
    console.log(arr)
    if (arr.length > 0) {
      //如果存在不同供应商 清空选中数组
      this.data.actProduct = [];
      this.changeOtherStauts()
      this.total()
    }
    let filterCheckData = this.filterCheckData()[key]
    let filterData = this.data.filterList[key]
    console.log(filterCheckData)
    console.log(filterData)
    if (filterCheckData) {
      //判断此供应商 是否有已选中商品
      //如果存在 此供应商的商品
      if (filterCheckData == filterData.products.length) {
        //如果 所有商品已选中则反选
        console.log(filterCheckData);
        this.data.actProduct = [];
        this.changeAllStauts(key, false)
        this.total()
        return;
      }
    }
    filterData.products.forEach(e => {
      for (let i = 0; i < this.data.actProduct.length; i++) {
        if (this.data.actProduct.length && this.data.actProduct[i].id == e.id) {
          //如果当前商品已选中 则直接跳过
          return;
        }
      }
      //在选中商品 添加商品
      this.data.actProduct.push(e);
      console.log(this.data.actProduct)
      this.changeAllStauts(key, true)
      this.total()
    });
    console.log(this.data.actProduct)
  },
  filterCheckData() {
    //统计各个供应商 商品数量
    let store = {};
    this.data.actProduct.forEach(item => {
      const id = item.supplyId; //获取当前商品供应商Id
      if (!store[id]) {
        //判断store 是否存在当前供应商
        //如果不存在
        store[id] = 0;
      }
      store[id]++;
    });
    console.log(store)
    return store;
  },
  changeAllStauts(key,flag) {
    // 一组商品切换供应商更改status
    console.log(key)
    for (let i in this.data.filterList) {
      if (key == i) {
        this.data.filterList[i].chooseStatus = flag
        this.data.filterList[i].products.forEach((v, j) => {
          this.data.filterList[i].products[j].chooseStatus = flag
        })
      } else {
        this.data.filterList[i].chooseStatus = false
        this.data.filterList[i].products.forEach((v, j) => {
          this.data.filterList[i].products[j].chooseStatus = false
        })
      }
    }
    let arr = this.data.filterList
    this.setData({
      filterList: arr
    })
    console.log(this.data.filterList)
  },
  total() {
    let tol = 0;
    this.data.actProduct.forEach(e => {
      tol += e.num * e.supplyPrice;
    });
    console.log(tol)
    return this.setData({
      total: tol.toFixed(2)
    })
  },
  add(e) {
    let item = e.currentTarget.dataset.item
    console.log(item)
    this.data.actProduct.forEach((v,i) => {
      if(v.id == item.id) {
        this.data.actProduct[i].num +=1
        let arr = this.data.actProduct
        this.setData({
          actProduct:arr
        })
        this.total()
      }
    })
    for (let i in this.data.filterList) {
      if (item.supplyId == i) {
        this.data.filterList[i].products.forEach((v, j) => {
          if (v.id == item.id) {
            this.data.filterList[i].products[j].num +=1
            console.log(this.data.filterList[i].products[j].num)
            let arr = this.data.filterList
            console.log(this.data.filterList)
            return this.setData({
              filterList: arr
            })
          }
        })
      }
    }
  },
  reduce(e) {
    let item = e.currentTarget.dataset.item
    console.log(item)
    this.data.actProduct.forEach((v, i) => {
      if (v.id == item.id) {
        console.log(this.data.actProduct[i].num)
        if (this.data.actProduct[i].num == 1) {
          return wx.showToast({
            title: '商品数已达到最小',
            icon: 'none',
            duration: 1500
          })
        }
        this.data.actProduct[i].num -= 1
        let arr = this.data.actProduct
        this.setData({
          actProduct: arr
        })
        this.total()
      }
    })
    for (let i in this.data.filterList) {
      if (item.supplyId == i) {
        this.data.filterList[i].products.forEach((v, j) => {
          if (v.id == item.id) {
            console.log(this.data.filterList[i].products[j].num)
            if (this.data.filterList[i].products[j].num == 1) {
              return wx.showToast({
                title: '商品数已达到最小',
                icon: 'none',
                duration: 1500
              })
            }
            this.data.filterList[i].products[j].num -= 1
            console.log(this.data.filterList[i].products[j].num)
            let arr = this.data.filterList
            console.log(this.data.filterList)
            return this.setData({
              filterList: arr
            })
          }
        })
      }
    }
  },
  inputNum(e) {
    console.log(e.detail.value)
    let item = e.currentTarget.dataset.item
    console.log(item)
    this.data.actProduct.forEach((v, i) => {
      if (v.id == item.id) {
        console.log(isNaN(typeof Number(e.detail.value)))
        if (e.detail.value < 1 || e.detail.value == '') {
          let arr = this.data.actProduct
          this.setData({
            actProduct: arr
          })
          return this.total()
        }
        this.data.actProduct[i].num = parseInt(e.detail.value)
        let arr = this.data.actProduct
        this.setData({
          actProduct: arr
        })
        this.total()
      }
    })
    for (let i in this.data.filterList) {
      if (item.supplyId == i) {
        this.data.filterList[i].products.forEach((v, j) => {
          if (v.id == item.id) {
            console.log(isNaN(typeof Number(e.detail.value)))
            if (e.detail.value < 1 || e.detail.value == '') {
              let arr = this.data.filterList
              console.log(this.data.filterList)
              return this.setData({
                filterList: arr
              })
            }
            this.data.filterList[i].products[j].num = parseInt(e.detail.value)
            console.log(this.data.filterList[i].products[j].num)
            let arr = this.data.filterList
            console.log(this.data.filterList)
            return this.setData({
              filterList: arr
            })
          }
        })
      }
    }
  },
  settlement() {
    if(!this.data.actProduct.length) {
      return wx.showToast({
        title: '请选择购买商品',
        icon:'none',
        duration:1500
      })
    }
    console.log(this.data.actProduct)
    wx.setStorageSync('product', this.data.actProduct)

    let user = wx.getStorageSync('user')
    this.data.shopCarProduct = wx.getStorageSync('js-shopCarProduct-' + user.id);
    console.log(this.data.shopCarProduct);
    var supply = this.filterShopCar();
    console.log(supply)
    this.setData({
      filterList: supply,
      actProduct:[],
      total:0
    })
    wx.navigateTo({
      url: '../pay/pay',
    })
  },
  toHome() {
    wx.switchTab({
      url: '../home/home',
    })
  }
})