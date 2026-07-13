const { User, Novel, Chapter } = require('../models');
const { success, error } = require('../utils/response');
const { getPaginationParams } = require('../utils/pagination');

/**
 * 申请成为作者
 * POST /api/author/apply
 */
const applyAuthor = async (ctx) => {
  const { penName, bio } = ctx.request.body;
  const user = ctx.state.user;

  if (user.role === 'author') {
    return error(ctx, '您已经是作者了', 400);
  }

  if (!penName || penName.trim().length < 2) {
    return error(ctx, '笔名至少需要2个字符', 400);
  }

  // 检查笔名是否被占用
  const existingAuthor = await User.findOne({
    'authorProfile.penName': penName.trim(),
    role: 'author',
  });
  if (existingAuthor) {
    return error(ctx, '笔名已被使用，请更换', 409);
  }

  // 更新用户角色为作者
  user.role = 'author';
  user.authorProfile = {
    penName: penName.trim(),
    bio: bio || '',
    joinDate: new Date(),
    isVerified: false, // 默认为未认证，可由管理员审核
  };

  await user.save();

  success(ctx, {
    penName: user.authorProfile.penName,
    bio: user.authorProfile.bio,
  }, '恭喜您成功成为作者！');
};

/**
 * 获取作者信息
 * GET /api/author/profile
 */
const getAuthorProfile = async (ctx) => {
  const user = ctx.state.user;

  if (user.role !== 'author' && user.role !== 'admin') {
    return error(ctx, '您还不是作者', 400);
  }

  // 获取作者的小说数量
  const novelCount = await Novel.countDocuments({ authorId: user._id });

  success(ctx, {
    penName: user.authorProfile?.penName,
    bio: user.authorProfile?.bio,
    signature: user.authorProfile?.signature,
    joinDate: user.authorProfile?.joinDate,
    isVerified: user.authorProfile?.isVerified,
    totalNovels: novelCount,
    totalWords: user.authorProfile?.totalWords || 0,
  });
};

/**
 * 更新作者资料
 * PUT /api/author/profile
 */
const updateAuthorProfile = async (ctx) => {
  const user = ctx.state.user;

  if (user.role !== 'author' && user.role !== 'admin') {
    return error(ctx, '您还不是作者', 400);
  }

  const { penName, bio, signature } = ctx.request.body;

  // 如果修改笔名，检查是否被占用
  if (penName && penName !== user.authorProfile?.penName) {
    const existingAuthor = await User.findOne({
      'authorProfile.penName': penName.trim(),
      role: 'author',
      _id: { $ne: user._id },
    });
    if (existingAuthor) {
      return error(ctx, '笔名已被使用，请更换', 409);
    }
    user.authorProfile.penName = penName.trim();
  }

  if (bio !== undefined) {
    user.authorProfile.bio = bio;
  }

  if (signature !== undefined) {
    user.authorProfile.signature = signature;
  }

  await user.save();

  success(ctx, {
    penName: user.authorProfile.penName,
    bio: user.authorProfile.bio,
    signature: user.authorProfile.signature,
  }, '资料更新成功');
};

/**
 * 作者创建小说
 * POST /api/author/novels
 */
const createNovel = async (ctx) => {
  const user = ctx.state.user;

  const {
    title,
    description,
    category,
    cover,
    tags,
  } = ctx.request.body;

  if (!title || title.trim().length < 2) {
    return error(ctx, '小说标题至少需要2个字符', 400);
  }

  // 检查同一作者是否有同名小说
  const existingNovel = await Novel.findOne({
    title: title.trim(),
    author: user.authorProfile?.penName || user.username,
  });
  if (existingNovel) {
    return error(ctx, '您已创建过同名小说', 409);
  }

  const novel = new Novel({
    title: title.trim(),
    author: user.authorProfile?.penName || user.username,
    authorId: user._id,
    description: description || '',
    category: category || '其他',
    cover: cover || '',
    tags: tags || [],
    status: '连载中',
    source: {
      name: '原创',
      isOriginal: true,
    },
  });

  await novel.save();

  // 更新作者作品数
  await User.findByIdAndUpdate(user._id, {
    $inc: { 'authorProfile.totalNovels': 1 },
  });

  success(ctx, {
    id: novel._id,
    title: novel.title,
  }, '小说创建成功');
};

/**
 * 作者获取自己的小说列表
 * GET /api/author/novels
 */
const getAuthorNovels = async (ctx) => {
  const user = ctx.state.user;
  const { page, limit, skip } = getPaginationParams(ctx.query);
  const { status, category } = ctx.query;

  const query = { authorId: user._id };
  if (status) query.status = status;
  if (category) query.category = category;

  const [list, total] = await Promise.all([
    Novel.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Novel.countDocuments(query),
  ]);

  success(ctx, {
    list,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

/**
 * 作者更新小说信息
 * PUT /api/author/novels/:id
 */
const updateNovel = async (ctx) => {
  const user = ctx.state.user;
  const { id } = ctx.params;
  const { title, description, category, cover, tags, status } = ctx.request.body;

  const novel = await Novel.findById(id);
  if (!novel) {
    return error(ctx, '小说不存在', 404);
  }

  // 检查是否是小说的作者或管理员
  if (novel.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
    return error(ctx, '无权限编辑此小说', 403);
  }

  // 如果修改标题，检查是否重复
  if (title && title.trim() !== novel.title) {
    const existingNovel = await Novel.findOne({
      title: title.trim(),
      author: novel.author,
      _id: { $ne: id },
    });
    if (existingNovel) {
      return error(ctx, '您已有同名小说', 409);
    }
    novel.title = title.trim();
  }

  if (description !== undefined) novel.description = description;
  if (category) novel.category = category;
  if (cover !== undefined) novel.cover = cover;
  if (tags !== undefined) novel.tags = tags;
  if (status !== undefined) novel.status = status;

  novel.updatedAt = new Date();
  await novel.save();

  success(ctx, novel, '小说信息更新成功');
};

/**
 * 作者添加章节
 * POST /api/author/novels/:novelId/chapters
 */
const addChapter = async (ctx) => {
  const user = ctx.state.user;
  const { novelId } = ctx.params;
  const { title, content, order, isFree = true, isVip = false } = ctx.request.body;

  const novel = await Novel.findById(novelId);
  if (!novel) {
    return error(ctx, '小说不存在', 404);
  }

  // 检查是否是小说的作者或管理员
  if (novel.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
    return error(ctx, '无权限编辑此小说', 403);
  }

  // 确定章节序号
  let chapterOrder = order;
  if (!chapterOrder) {
    const lastChapter = await Chapter.findOne({ novelId })
      .sort({ order: -1 })
      .select('order');
    chapterOrder = lastChapter ? lastChapter.order + 1 : 1;
  }

  // 检查章节序号是否已存在
  const existingChapter = await Chapter.findOne({ novelId, order: chapterOrder });
  if (existingChapter) {
    return error(ctx, `第 ${chapterOrder} 章已存在`, 409);
  }

  const chapter = new Chapter({
    novelId,
    novelTitle: novel.title,
    order: chapterOrder,
    title: title || `第 ${chapterOrder} 章`,
    content: content || '',
    wordCount: content ? content.replace(/\s/g, '').length : 0,
    isFree,
    isVip,
  });

  await chapter.save();

  // 更新小说章节数和最后更新时间
  await Novel.findByIdAndUpdate(novelId, {
    $inc: { chapterCount: 1 },
    $set: {
      'lastChapter.title': chapter.title,
      'lastChapter.id': chapter._id,
      'lastChapter.updateTime': new Date(),
      updatedAt: new Date(),
    },
  });

  // 更新作者总字数
  await User.findByIdAndUpdate(user._id, {
    $inc: { 'authorProfile.totalWords': chapter.wordCount },
  });

  success(ctx, {
    id: chapter._id,
    order: chapter.order,
    title: chapter.title,
    wordCount: chapter.wordCount,
  }, '章节添加成功');
};

/**
 * 作者更新章节
 * PUT /api/author/chapters/:id
 */
const updateChapter = async (ctx) => {
  const user = ctx.state.user;
  const { id } = ctx.params;
  const { title, content, isFree, isVip } = ctx.request.body;

  const chapter = await Chapter.findById(id);
  if (!chapter) {
    return error(ctx, '章节不存在', 404);
  }

  // 检查是否是小说的作者或管理员
  const novel = await Novel.findById(chapter.novelId);
  if (!novel) {
    return error(ctx, '小说不存在', 404);
  }

  if (novel.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
    return error(ctx, '无权限编辑此章节', 403);
  }

  const oldWordCount = chapter.wordCount;

  if (title !== undefined) chapter.title = title;
  if (content !== undefined) {
    chapter.content = content;
    chapter.wordCount = content.replace(/\s/g, '').length;
  }
  if (isFree !== undefined) chapter.isFree = isFree;
  if (isVip !== undefined) chapter.isVip = isVip;

  chapter.updatedAt = new Date();
  await chapter.save();

  // 更新作者总字数变化
  const wordDiff = chapter.wordCount - oldWordCount;
  if (wordDiff !== 0) {
    await User.findByIdAndUpdate(user._id, {
      $inc: { 'authorProfile.totalWords': wordDiff },
    });
  }

  success(ctx, chapter, '章节更新成功');
};

/**
 * 作者获取小说章节列表
 * GET /api/author/novels/:novelId/chapters
 */
const getNovelChapters = async (ctx) => {
  const user = ctx.state.user;
  const { novelId } = ctx.params;
  const { page, limit, skip } = getPaginationParams(ctx.query);

  const novel = await Novel.findById(novelId);
  if (!novel) {
    return error(ctx, '小说不存在', 404);
  }

  // 检查是否是小说的作者或管理员
  if (novel.authorId.toString() !== user._id.toString() && user.role !== 'admin') {
    return error(ctx, '无权限查看此小说章节', 403);
  }

  const [list, total] = await Promise.all([
    Chapter.find({ novelId })
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Chapter.countDocuments({ novelId }),
  ]);

  success(ctx, {
    list,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

module.exports = {
  applyAuthor,
  getAuthorProfile,
  updateAuthorProfile,
  createNovel,
  getAuthorNovels,
  updateNovel,
  addChapter,
  updateChapter,
  getNovelChapters,
};
