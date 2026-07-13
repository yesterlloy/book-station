const { User } = require('../models');
const { success, error } = require('../utils/response');

/**
 * 更新用户基本信息
 * PUT /api/user/profile
 */
const updateProfile = async (ctx) => {
  const userId = ctx.state.user._id;
  const { nickname, avatar } = ctx.request.body;

  const updateData = {};
  if (nickname !== undefined) updateData.nickname = nickname;
  if (avatar !== undefined) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');

  success(ctx, user, '更新成功');
};

/**
 * 更新阅读设置
 * PUT /api/user/settings
 */
const updateSettings = async (ctx) => {
  const userId = ctx.state.user._id;
  const { fontSize, theme, bgColor, lineHeight, autoFlip, autoNextChapter } = ctx.request.body;

  const updateData = {};
  if (fontSize !== undefined) updateData['settings.fontSize'] = fontSize;
  if (theme !== undefined) updateData['settings.theme'] = theme;
  if (bgColor !== undefined) updateData['settings.bgColor'] = bgColor;
  if (lineHeight !== undefined) updateData['settings.lineHeight'] = lineHeight;
  if (autoFlip !== undefined) updateData['settings.autoFlip'] = autoFlip;
  if (autoNextChapter !== undefined) updateData['settings.autoNextChapter'] = autoNextChapter;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true }
  ).select('-password');

  success(ctx, user.settings, '设置更新成功');
};

/**
 * 获取用户阅读设置
 * GET /api/user/settings
 */
const getSettings = async (ctx) => {
  const userId = ctx.state.user._id;
  const user = await User.findById(userId).select('settings');

  success(ctx, user.settings);
};

/**
 * 修改密码
 * PUT /api/user/password
 */
const changePassword = async (ctx) => {
  const userId = ctx.state.user._id;
  const { oldPassword, newPassword } = ctx.request.body;

  if (!oldPassword || !newPassword) {
    return error(ctx, '请输入原密码和新密码', 400);
  }

  if (newPassword.length < 6) {
    return error(ctx, '新密码长度不能少于6位', 400);
  }

  const user = await User.findById(userId).select('+password');

  // 验证原密码
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    return error(ctx, '原密码错误', 400);
  }

  user.password = newPassword;
  await user.save();

  success(ctx, null, '密码修改成功');
};

/**
 * 获取用户公开信息
 * GET /api/user/profile/:id
 */
const getPublicProfile = async (ctx) => {
  const { id } = ctx.params;

  const user = await User.findById(id).select('username nickname avatar role authorProfile createdAt');
  if (!user) {
    return error(ctx, '用户不存在', 404);
  }

  success(ctx, {
    id: user._id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    role: user.role,
    authorProfile: user.role === 'author' ? user.authorProfile : undefined,
    createdAt: user.createdAt,
  });
};

module.exports = {
  updateProfile,
  updateSettings,
  getSettings,
  changePassword,
  getPublicProfile,
};
