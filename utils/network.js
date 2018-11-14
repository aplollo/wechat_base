const app = getApp()
  console.log(app)
module.exports = (url, data, method, header) => {
  console.log(app)
  var baseapi = app.config.apiBase
  console.info(app.config.apiBase + url, data, method, header)
  console.info(baseapi + url, data, method, header)
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseapi + url,
      data,
      header: header || { "Content-Type": "application/x-www-form-urlencoded" },
      method,
      dataType: 'json',
      success: resolve,
      fail: reject
    })
  })
}