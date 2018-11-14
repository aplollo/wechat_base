const app = getApp();
const network = require('../../utils/network.js')
Page({
  data: {
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
    showFlag: false,
    address:{
      receiverName:'',
      receiverPhone:'',
      receiverPhone1:'',
      addressDetail:'',
      vo:{},
      token:'',
      source:'',
      siteId:'',
    },
    source: 1,
    province: "",
    provinceName:"",
    city: "",
    cityName: "",
    county: "",
    countyName: "",
    town: "",
    townName: "",
    countyId:'',
    provinceList: [],
    cityList: [],
    countyList: [],
    townList: [],
    id: '',
    disType: "province",
    townReplace:{
      districtId: 0, 
      name: "全区"
    },
  },
  onLoad(options) {
    console.log(JSON.stringify(options) != '{}')
    // 是否为编辑地址
    if (JSON.stringify(options) != '{}') {
      console.log(app.globalData.editAddress)
      console.log(app.globalData.editAddress.id)
      if(options.source == 1) {
        this.setData({
          typeList: [
            {
              id: 1,
              name: '京东'
            }
          ]
        })
        this.setData({
          province: app.globalData.editAddress.vo.province,
          city: app.globalData.editAddress.vo.city,
          county: app.globalData.editAddress.vo.county,
          town: app.globalData.editAddress.vo.town,
        })
      } else {
        this.setData({
          typeList: [
            {
              id: 3,
              name: '苏宁'
            }
          ]
        })
        this.data.source = 3
        console.log(app.globalData.editAddress.vo)
        this.setData({
          province: app.globalData.editAddress.vo.province,
          city: app.globalData.editAddress.vo.city,
          county: app.globalData.editAddress.vo.city.toString() + app.globalData.editAddress.vo.county.toString(),
          town: app.globalData.editAddress.vo.county.toString() + app.globalData.editAddress.vo.town.toString(), 
        })
        console.log(this.data.county)
        console.log(this.data.town)
      }
      let name = 'address.receiverName'
      let phone = 'address.receiverPhone'
      let phone1 = 'address.receiverPhone1'
      let detail = 'address.addressDetail'
      this.setData({
        [name]: app.globalData.editAddress.receiverName,
        [phone]: app.globalData.editAddress.receiverPhone,
        [phone1]: app.globalData.editAddress.receiverPhone,
        [detail]: app.globalData.editAddress.addressDetail,
        id: app.globalData.editAddress.id,
        provinceName: app.globalData.editAddress.vo.provinceName,
        cityName: app.globalData.editAddress.vo.cityName,
        countyName: app.globalData.editAddress.vo.countyName,
        townName: app.globalData.editAddress.vo.townName,
      })
      console.log(this.data.address)
    } else {
      // if(options.so)
    }
    let token = wx.getStorageSync('token')
    let siteId = wx.getStorageSync('site').id
    let tokenstr = 'address.token'
    let sitestr = 'address.siteId'
    let sourcestr = 'address.source'
    this.setData({
      [tokenstr]:token,
      [sitestr]:siteId,
      [sourcestr]:this.data.source,
    })
    console.log(this.data.address)
  },
  chooseType(e) {
    if (this.data.source == e.currentTarget.dataset.id) return
    console.log(e.currentTarget.dataset.id)
    
    this.setData({
      source: e.currentTarget.dataset.id,
      province: "",
      provinceName: "",
      city: "",
      cityName: "",
      county: "",
      countyName: "",
      town: "",
      townName: "",
      countyId: '',
    })
    console.log(this.data.source)
  },
  receiverName(e){
    console.log(e)
    let name = 'address.receiverName'
    this.setData({
      [name]:e.detail.value
    })
    console.log(this.data.address)
  },
  receiverPhone(e){
    let phone = 'address.receiverPhone'
    let phone1 = 'address.receiverPhone1'
    this.setData({
      [phone]:e.detail.value,
      [phone1]:e.detail.value
    })
    console.log(this.data.address)
  },
  addressDetail(e){
    let detail = 'address.addressDetail'
    this.setData({
      [detail]:e.detail.value
    })
    console.log(this.data.address)
  },
  showList() {
    this.setData({
      showFlag:!this.data.showFlag
    })
    if (this.data.showFlag) {
      let that = this
      this.getDistrictList(0,function(data) {
        console.log(data.obj.page.rows)
        that.setData({
          provinceList: data.obj.page.rows
        })
      })
    }
    console.log(this.data.showFlag)
  },
  changeType(e) {
    console.log(e.currentTarget.dataset.type)
    this.setData({
      disType:e.currentTarget.dataset.type
    })
  },
  getDistrictList(parentId, success) {
    //查询对应等级列表
    let params = {
      source: this.data.source,
      parentId
    }
    network('/xxx', params, 'POST').then(({ data }) => {
      if (success) success(data);
    })
  },
  selectProvince(e) {
    let Province = e.currentTarget.dataset.item
    console.log(Province)
    let that = this
    if (this.data.province == Province.districtId) return
    this.data.province = Province.districtId.toString();
    this.setData({
      province: Province.districtId.toString(),
      provinceName: Province.name
    })
    this.getDistrictList(Province.districtId,function(data){
      that.setData({
        cityList:data.obj.page.rows
      })
      if (that.data.cityList.length) {
        that.setData({
          disType:'city'
        })
      }
      that.setData({
        city:'',
        cityName:'',
        county: '',
        countyName: '',
        town: '',
        townName: ''
      })
    })
    console.log(this.data.province)
    console.log(this.data.provinceName)
  },
  selectCity(e) {
    let that = this
    let City = e.currentTarget.dataset.item
    if (this.data.city == City.districtId) return
    this.setData({
      city: City.districtId.toString(),
      cityName: City.name
    })
    this.getDistrictList(City.districtId, function (data) {
      that.setData({
        countyList: data.obj.page.rows
      })
      if (that.data.countyList.length) {
        that.setData({
          disType: 'county'
        })
      }
      that.setData({
        county: '',
        countyName: '',
        town: '',
        townName: ''
      })
    })
    console.log(this.data.city)
    console.log(this.data.cityName)
  },
  selectCounty(e) {
    let that = this
    let County = e.currentTarget.dataset.item
    if (this.data.county == County.districtId) return
    // 拿到第三级地址id以备苏宁使用
    this.data.countyId = County.districtId.toString()
    console.log(this.data.countyId)
    console.log(this.data.source == 3 && this.data.typeList.length == 1)

    if (this.data.source == 3 && this.data.typeList.length == 1) {
      this.setData({
        county: this.data.city + County.districtId.toString(),
        countyName: County.name
      })
    } else {
      this.setData({
        county: County.districtId.toString(),
        countyName: County.name
      })
    }
    this.getDistrictList(County.districtId, function (data) {
      that.setData({
        townList: data.obj.page.rows
      })
      that.setData({
        disType: 'town'
      })
      that.setData({
        town: '',
        townName: '',
      })
    })
    console.log(this.data.town)
    console.log(this.data.townName)
  },
  selectTown(e) {
    let Town = e.currentTarget.dataset.item
    console.log(Town)
    console.log(this.data.town === Town.districtId)
    if (this.data.town === Town.districtId) return
    console.log(this.data.countyId)
    console.log(this.data.source == 3 && this.data.typeList.length == 1)
    if (this.data.source == 3 && this.data.typeList.length ==1) {
      this.setData({
        town: this.data.countyId + Town.districtId.toString(),
        townName: Town.name
      })
    } else {
      console.log(Town.districtId.toString())
      this.setData({
        town: Town.districtId.toString(),
        townName: Town.name
      })
    }
    console.log(this.data.province)
    console.log(this.data.provinceName)
    console.log(this.data.city)
    console.log(this.data.cityName)
    console.log(this.data.county)
    console.log(this.data.countyName)
    console.log(this.data.town)
    console.log(this.data.townName)
  },
  RegArea(area) {
    //渠道地址验证
    if (!area) return false;
    if (area.province == "" || area.city == "" || area.county == "" || area.town == "") {
      return false;
    }
    return true;
  },
  submit() {
    let that = this;
    let vo = {
      province: this.data.province,
      provinceName: this.data.provinceName,
      city: this.data.city,
      cityName: this.data.cityName,
      county: this.data.county,
      countyName: this.data.countyName,
      town: this.data.town,
      townName: this.data.townName,
      source: this.data.source
    }
    console.log(vo)
    console.log(!this.RegArea(vo))
    var phoneReg = /(^1[3|4|5|7|8]\d{9}$)|(^09\d{8}$)/;
    var nameReg = /^[\u2E80-\u9FFF]+$/;
    if(this.data.address.receiverName =='') {
      return wx.showToast({
        title: '请填写收件人姓名',
        icon:'none',
        duration:1500
      })
    } else if (!nameReg.test(this.data.address.receiverName)) {
      return wx.showToast({
        title: '收件人姓名格式必须为中文',
        icon:'none',
        duration:1500
      })
    }
    if(this.data.address.receiverPhone == '') {
      return wx.showToast({
        title: '请填写手机号',
        icon:'none',
        duration:1500
      })
    } else if (!phoneReg.test(this.data.address.receiverPhone)) {
      return wx.showToast({
        title: '手机号码格式不正确',
        icon:'none',
        duration:1500
      })
    }
    if(!this.RegArea(vo)) {
      return wx.showToast({
        title: '请选择完整地址',
        icon:'none',
        duration:1500
      })
    }
    if(this.data.address.addressDetail == '') {
      return wx.showToast({
        title: '请填写详细地址',
        icon:'none',
        duration:1500
      })
    }
    this.data.address.source = this.data.source
    this.data.address.vo = vo;
    console.log(this.data.id)
    if(this.data.id) {
      this.data.address.id = this.data.id
    }
    console.log(this.data.address)
    network('/xxx', this.data.address, 'POST', {"Content-Type": "application/json"}).then(res => {
      if(res.data.code == 200) {
        wx.switchTab({
          url: '../mine/mine',
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
})