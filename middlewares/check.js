
module.exports ={
  // 已经登录了
  checkLogin: (ctx) => {
    if (ctx.session && ctx.session.user) {
      ctx.redirect('/account');
      return false;
    }
    return true;
  },
  //没有登录
  checkNotLogin: (ctx) => {
    if (!ctx.session || !ctx.session.user) {
      ctx.redirect('/sign');
      return false;
    }
    return true;
  }
}
