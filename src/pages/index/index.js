import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Canvas } from '@tarojs/components'
import './index.scss'

export default class Index extends Component {

  config = {
    navigationBarTitleText: '首页'
  }

  constructor () {
    // this.getUserInfo = this.getUserInfo.bind(this)
    this.state = {
      userInfo: {},
      isShowCanvas: false
    }
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { 
    // this.setState({
    //   isShowCanvas: true
    // }, () => {
    //   // 调用绘制图片方法
    //   this.drawImage()
    // })
  }

  componentDidHide () { }

  /**
   * getUserInfo() 获取用户信息
   */
  getUserInfo (e) {
    // console.log(e)
    // if (e) {
    //   this.setState({
    //     userInfo: e.detail.userInfo
    //   })
    // }
    if (!e.detail.userInfo) {
      Taro.showToast({
        title: '获取用户信息失败，请授权',
        icon: 'none'
      })
      return
    }
    this.setState({
      isShowCanvas: true,
      userInfo: e.detail.userInfo
    }, () => {
      // 调用绘制图片方法
      this.drawImage()
    })
  }

  /**
   * drawImage() 定义绘制图片的方法
   */
  async drawImage () {
    let ctx = Taro.createCanvasContext('cardCanvas')
    // 填充
    let grd = ctx.createLinearGradient(0, 0, 1, 500)
    grd.addColorStop(0, '#1452d0')
    grd.addColorStop(0.5, '#FFF')
    ctx.setFillStyle(grd)
    ctx.fillRect(0, 0, 400, 500)

    // // 绘制圆形用户头像
    let { userInfo } = this.state
    let res = await Taro.downloadFile({
      url: userInfo.avatarUrl
    })
    // console.log(res)
    ctx.save()
    ctx.beginPath()
    // ctx.arc(160, 86, 66, 0, Math.PI * 2, false)
    ctx.arc(160, 88, 66, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.stroke()
    ctx.translate(160, 88)
    ctx.drawImage(res.tempFilePath, -66, -66, 132, 132)
    ctx.restore()

    // 绘制文字
    ctx.save()
    ctx.setFontSize(20)
    ctx.setFillStyle('#FFF')
    ctx.fillText(userInfo.nickName, 100, 200)
    ctx.setFontSize(16)
    ctx.setFillStyle('black')
    ctx.fillText('已在胡哥有话说公众号打卡20天', 50, 240)
    ctx.restore()

    // 绘制二维码
    let qrcode = await Taro.downloadFile({
      url: 'https://upload-images.jianshu.io/upload_images/3091895-f0b4b900390aec73.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/258/format/webp.jpg'
    })
    ctx.drawImage(qrcode.tempFilePath, 70, 260, 180, 180)

    // 绘制
    ctx.draw()
  }

  /**
   * saveCard() 保存图片到本地
   */
  async saveCard () {
    // 将Canvas图片内容导出指定大小的图片
    let res = await Taro.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 400,
      height: 500,
      destWidth: 360,
      destHeight: 450,
      canvasId: 'cardCanvas',
      fileType: 'png'
    })
    let saveRes = await Taro.saveImageToPhotosAlbum({
      filePath: res.tempFilePath
    })
    if (saveRes.errMsg === 'saveImageToPhotosAlbum:ok') {
      Taro.showModal({
        title: '图片保存成功',
        content: '图片成功保存到相册了，快去发朋友圈吧~',
        showCancel: false,
        confirmText: '确认'
      })
    }
  }

  render () {
    let { isShowCanvas } = this.state
    return (
      <View className='index'>
        <Button onGetUserInfo={this.getUserInfo} openType="getUserInfo" type="primary" size="mini">打卡</Button>
        {/* 使用Canvas绘制分享图片 */}
        {
          isShowCanvas && 
            <View className="canvas-wrap">
              <Canvas 
                id="card-canvas"
                className="card-canvas"
                style="width: 320px; height: 450px"
                canvasId="cardCanvas" >
              </Canvas>
              <Button onClick={this.saveCard} className="btn-save" type="primary" size="mini">保存到相册</Button>
            </View> 
        }
      </View>
    )
  }
}
