const { User } = require('../models');
const { success } = require('../utils/response');

/**
 * @desc 更新用户信息
 * @route PUT /api/user/profile
 * @access Private
 */
const updateProfile = async (ctx) => {
  const { nickname, avatar } = ctx.request.body;
  const userId = ctx.state.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { nickname, avatar },
    { new: true, runValidators: true }
  ).select('-password');

  success(ctx, user, '更新成功');
};

/**
 * @desc 更新阅读设置
 * @route PUT /api/user/settings
 * @access Private
 */
const updateSettings = async (ctx) => {
  const { fontSize, theme, bgColor, lineHeight } = ctx.request.body;
  const userId = ctx.state.user._id;

  const updateData = {};
  if (fontSize !== undefined) updateData['settings.fontSize'] = fontSize;
  if (theme !== undefined) updateData['settings.theme'] = theme;
  if (bgColor !== undefined) updateData['settings.bgColor'] = bgColor;
  if (lineHeight !== undefined) updateData['settings.lineHeight'] = lineHeight;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true }
  ).select('-password');

  success(ctx, user.settings, '设置更新成功');
};

module.exports = {
  updateProfile,
  updateSettings,
};
