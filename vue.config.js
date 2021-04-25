const registerRouter = require('./backend/router')

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        // 全局引入变量和 mixin  需要引入 新版node-sass sass-loader 插件
        additionalData: `
          @import '@/assets/scss/variable.scss';
          @import '@/assets/scss/mixin.scss';
        `
      }
    }
  },
  // webpack配置 开发时服务器
  devServer: {
    before(app) {
      registerRouter(app)
    }
  }
}
