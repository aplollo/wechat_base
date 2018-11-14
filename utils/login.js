// 登录用户授权 获取openID&sessionKey
function getSession(basePath, e) {
  var user = wx.getStorageSync('openIdSessionKey');
  var openId = wx.getStorageSync('openId');
  var sessionKey = wx.getStorageSync('sessionKey');
  var userInfo = wx.getStorageSync('user')
  var options = JSON.parse(e)
  if (userInfo) {       // 保证用户信息能够获取
    return {
      user: user,
      openId: openId,
      sessionKey: sessionKey
    }
  } else {
    wx.login({
      success: res => {
        console.log('success')
        console.log(res)
        var code = res.code
        var user = options
        var userInfo = options
        var nickName = userInfo.nickName
        var avatarUrl = userInfo.avatarUrl.split('/132')[0] + '/0'
        var gender = userInfo.gender
        var country = userInfo.country
        var province = userInfo.province
        var city = userInfo.city
        wx.setStorageSync('user', userInfo)
        wx.request({
          url: basePath,
          data: {
            code: code,
            nickName: nickName,
            gender: gender,
            avatarUrl: avatarUrl,
            country: country,
            province: province,
            city: city
          },
          success: res => {
            console.log(res)
            var openId = res.data.data.openId
            wx.setStorageSync('openId', openId)
            wx.setStorageSync('sessionKey', res.data.data.sessionKey)
            var openIdSessionKey = res.data.data.openId + "," + res.data.data.sessionKey
            wx.setStorageSync('openIdSessionKey', openIdSessionKey)
            return {
              user: user,
              openId: openId,
              sessionKey: res.data.data.sessionKey
            }
          }
        })
      },
      fail: function (res) { console.log(res) }
    })
  }
}

// 获取openID&sessionKey
function getOpenId(basePath, e) {
  var openId = wx.getStorageSync('openId');
  var sessionKey = wx.getStorageSync('sessionKey');
  if (openId) {
    return {
      openId: openId,
      sessionKey: sessionKey
    }
  } else {
    console.log('no openId')
    wx.login({
      success: res => {
        var code = res.code
        console.log('res.code')
        console.log(res.code)
        console.log(basePath)
        wx.request({
          url: basePath,
          data: {
            code: code
          },
          success: res => {
            console.log('success')
            console.log(res)
            var openId = res.data.obj.openid
            var sessionKey = res.data.obj.sessionKey
            var openIdSessionKey = res.data.obj.openid + "," + res.data.obj.sessionKey
            wx.setStorageSync('openId', openId)
            wx.setStorageSync('sessionKey', sessionKey)
            wx.setStorageSync('openIdSessionKey', openIdSessionKey)
            console.log(123321)
            let resObj = {
              openId: openId,
              sessionKey: sessionKey
            }
            return resObj
          },
          fail: res => {
            console.log('fail')
            console.log(res)
          }
        })
      },
      fail: function (res) {
        console.log('fail')
        console.log(res)
        wx.showToast({
          title: res.data.msg,
          icon:'none',
          duration:1500
        })
      }
    })
  }
}

// 手机号授权 获取手机号
function getPhone(basePath, encryptedData, iv, sessionKey) {
  var phoneNumber = wx.getStorageSync('phoneNumber');
  if (phoneNumber) {
    return {
      phoneNumber: phoneNumber
    }
  } else {
    wx.request({
      url: basePath,
      data: {
        encryptedData: encryptedData,
        iv: iv,
        sessionKey: sessionKey
      },
      success: res => {
        var phoneNumber = JSON.parse(res.data.data.decryptedData).phoneNumber
        wx.setStorageSync('phoneNumber', phoneNumber)
        return {
          phoneNumber: res.data.phoneNumber
        }
      }
    })
  }
}

module.exports = {
  getSession, getOpenId, getPhone
}