const app = getApp();
const network = require('../../utils/network.js')
Page({
  data:{
    typeList: [
      {
        id: 1,
        name: '京东'
      },
      {
        id: 3,
        name: '苏宁'
      }
    ],
    addressList:[],
    chooseItem: 1,
    siteId:'',
    deleteFlag:true
  },
  onLoad(options) {
    console.log(options.source)
    if (options.source) {
      this.setData({
        chooseItem:options.source
      })
    }
    this.getAddress(this.data.chooseItem)
  },
  getAddress(source) {
    this.setData({
      addressList:[]
    })
    console.log(this.data.addressList)
    let siteId = wx.getStorageSync('site').id
    let token = wx.getStorageSync('token')
    let params = {
      siteId: siteId,
      token: token,
      source: source
    }
    network('/api/getAddressList',params,'POST').then(res => {
      console.log(res)
      if(res.data.code = 200) {
        this.setData({
          addressList: res.data.obj.addressList
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon:'none',
          duration:1000
        })
      }
    })
  },
  chooseType(e) {
    let source = e.currentTarget.dataset.id
    console.log(source)
    if (this.data.chooseItem == source) return
    console.log(source)
    this.setData({
      chooseItem: source
    })
    this.getAddress(source)
  },
  setDefault(e) {
    console.log(e.currentTarget.dataset.id);
    let addrId = e.currentTarget.dataset.id;
    console.log(addrId)
    let that = this;
    wx.showModal({
      content: '您确定将此地址设为默认地址吗',
      success(res) {
        if(res.confirm) {
          console.log('确定')
          let siteId = wx.getStorageSync('site').id
          let token = wx.getStorageSync('token')
          let params = {
            siteId: siteId,
            token: token,
            source: that.data.chooseItem,
            addrId
          }
          network('/api/address/setDefault',params,'POST').then(res => {
            console.log(res)
            if(res.data.code ==200) {
              that.getAddress(that.data.chooseItem)
            }
          })
        } else {
          console.log('取消')
        }
      }
    })
  },
  deleteAddress(e) {
    let id = e.currentTarget.dataset.deleteid
    let token = wx.getStorageSync('token')
    let params = {
      addrId:id,
      token
    }
    console.log(id)
    console.log(token)
    let that = this;
    wx.showModal({
      content: '您确定删除此地址吗',
      success(res) {
        if (res.confirm) {
          console.log('确定')
          console.log(that)
          console.log(that.data.deleteFlag)
          if (!that.data.deleteFlag) return
          that.data.deleteFlag = false
          network('/api/addressDelete', params,'POST').then(res => {
            if(res.data.code == 200) {
              wx.showToast({
                title: '删除成功',
                icon:'success',
                duration:1500
              })
              console.log(that.data.chooseItem)
              that.getAddress(that.data.chooseItem)
              that.data.deleteFlag = true
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 1000
              })
              that.data.deleteFlag = true
            }
          }).catch(() => {
            that.data.deleteFlag = true
          })
        } else {
          console.log('取消')
        }
      }
    })
  },
  addAddress() {
    wx.navigateTo({
      url: '../addAddress/addAddress'
    })
  },
  editAddress(e) {
    console.log(e.currentTarget.dataset)
    app.globalData.editAddress = e.currentTarget.dataset.edititem
    console.log(app.globalData)
    wx.navigateTo({
      url: '../addAddress/addAddress?source=' + e.currentTarget.dataset.source,
    })
  },
})