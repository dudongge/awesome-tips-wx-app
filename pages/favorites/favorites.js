// pages/favorites/favorites.js

const app = getApp()
const mta = require('../../utils/mta_analysis.js')
const feedFavorListUrl = require('../../config.js').feedFavorListUrl

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    canLoadMore: true,
    showBottomLoading: false,
    feedPage: 1,
    feedList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 重新加载第一页数据
    wx.showNavigationBarLoading()
    this.data.canLoadMore = true
    this.data.feedPage = 1
    this.getFeedFavorList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var self = this
    if (self.data.loading) {
      // 正在加载中，直接返回
      return
    }
    setTimeout(function () {
      self.data.canLoadMore = true
      self.data.feedPage = 1
      self.getFeedFavorList()
    }, 1000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var self = this
    if (self.data.loading) {
      // 正在加载中，直接返回
      return
    }
    if (!self.data.canLoadMore) {
      // 不能加载更多，直接返回
      return
    }
    self.setData({
      showBottomLoading: true
    })
    setTimeout(function () {
      self.getFeedFavorList()
    }, 1000)
  },

  getFeedFavorList: function () {
    var self = this

    if (self.data.loading) {
      // 正在加载中，直接返回
      return
    }

    if (!self.data.canLoadMore) {
      // 不能加载更多，直接返回
      self.closeLoadingView()
      return
    }

    // 标记正在加载中
    self.data.loading = true

    // 发起请求
    wx.request({
      url: feedFavorListUrl,
      method: 'GET',
      dataType: 'json',
      data: {
        page: self.data.feedPage,
        token: app.globalData.token,
        filter: 'tips',
      },
      header: {
        'from': app.globalData.appFrom,
        'version': app.globalData.appVersion,
      },
      success: function (result) {
        console.log('Feed favor list request success', result)
        if (result.data.code == 0) { // 接口请求成功
          var feeds = result.data.data.feeds
          if (feeds && feeds.length > 0) { // 如果有返回数据
            var newFeedPage = self.data.feedPage + 1
            var newFeedList = []
            if (self.data.feedPage > 1) {
              newFeedList = newFeedList.concat(self.data.feedList)
            }
            newFeedList = newFeedList.concat(feeds)
            self.setData({
              feedPage: newFeedPage,
              feedList: newFeedList
            })
          } else {
            // 标记不能加载更多了
            if (self.data.feedPage == 1) {
              self.setData({
                feedList: []
              })
            }
            self.data.canLoadMore = false
            wx.showToast({
              icon: 'none',
              title: '总共收藏了 ' + self.data.feedList.length + ' 条小集'
            })
          }
        } else if (result.data.code == -1) {
          // 登录失效，重新登录
          app.reLoginThenCallback(function () {
            self.getFeedFavorList()
          })
        }
      },
      fail: function (errMsg) {
        console.log('Feed favor list request fail', errMsg)
      },
      complete: function () {
        // 标记加载结束
        self.data.loading = false
        self.closeLoadingView()
      }
    })
  },

  // 关闭相关 Loading 视图
  closeLoadingView: function () {
    wx.hideNavigationBarLoading()
    wx.stopPullDownRefresh()
    var self = this
    if (self.data.showBottomLoading) {
      self.setData({
        showBottomLoading: false
      })
    }
  },

  // 列表项点击
  feedItemClick: function (event) {
    var feed = event.currentTarget.dataset.feed
    if (feed && feed.fid) {
      wx.navigateTo({
        url: '../detail/detail?fid=' + feed.fid
      })
    }
  },
  
})