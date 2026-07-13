/**
 * 测试数据插入脚本
 * 执行：node seed-data.js
 */

const mongoose = require('mongoose');
const config = require('./src/config');
const { User, Novel, Chapter, Bookshelf } = require('./src/models');

// 连接数据库
const mongoUri = `mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.database}`;

// 测试用户数据
const testUsers = [
  {
    username: 'admin',
    email: 'admin@bookstation.com',
    password: 'admin123',
    nickname: '超级管理员',
    role: 'admin',
    avatar: '',
  },
  {
    username: 'author1',
    email: 'author1@bookstation.com',
    password: 'author123',
    nickname: '天蚕土豆',
    role: 'author',
    authorProfile: {
      penName: '天蚕土豆',
      bio: '知名网络作家，代表作《斗破苍穹》、《武动乾坤》等',
      isVerified: true,
      joinDate: new Date('2020-01-15'),
      totalNovels: 3,
    },
  },
  {
    username: 'author2',
    email: 'author2@bookstation.com',
    password: 'author123',
    nickname: '刘慈欣',
    role: 'author',
    authorProfile: {
      penName: '刘慈欣',
      bio: '科幻作家，代表作《三体》三部曲',
      isVerified: true,
      joinDate: new Date('2019-06-20'),
      totalNovels: 2,
    },
  },
  {
    username: 'reader1',
    email: 'reader1@bookstation.com',
    password: 'reader123',
    nickname: '书迷小明',
    role: 'reader',
  },
  {
    username: 'reader2',
    email: 'reader2@bookstation.com',
    password: 'reader123',
    nickname: '爱读书的小红',
    role: 'reader',
  },
];

// 示例小说
const novels = [
  {
    title: '斗破苍穹',
    author: '天蚕土豆',
    cover: 'https://picsum.photos/seed/novel1/300/400',
    description: '这里是属于斗气的世界，没有花俏艳丽的魔法，有的，仅仅是繁衍到巅峰的斗气！ 少年萧炎，在他十五岁这年，人生却拐了个弯，直直的坠入了深渊。 曾经的天才，一夜之间，变成了废人。 就在他绝望之际，一枚神秘的戒指，突然出现在他手中……',
    category: '玄幻',
    status: '已完结',
    wordCount: 5320000,
    chapterCount: 20,
    isHot: true,
    isRecommend: true,
  },
  {
    title: '完美世界',
    author: '辰东',
    cover: 'https://picsum.photos/seed/novel2/300/400',
    description: '一粒尘可填海，一根草斩尽日月星辰，弹指间天翻地覆。 群雄并起，万族林立，诸圣争霸，乱天动地。问苍茫大地，谁主沉浮？ 一个少年从大荒中走出，一切从这里开始……',
    category: '玄幻',
    status: '已完结',
    wordCount: 4680000,
    chapterCount: 20,
    isHot: true,
  },
  {
    title: '凡人修仙传',
    author: '忘语',
    cover: 'https://picsum.photos/seed/novel3/300/400',
    description: '一个普通山村少年，偶然下进入到当地江湖小门派，成了一名记名弟子。他以这样的身份，开始了自己的修仙之路。他资质低劣，仙路飘渺，但是他却凭借着自己的努力和小算计，一步步地走向了修仙大道。',
    category: '武侠',
    status: '已完结',
    wordCount: 7730000,
    chapterCount: 20,
    isHot: true,
  },
  {
    title: '盗墓笔记',
    author: '南派三叔',
    cover: 'https://picsum.photos/seed/novel4/300/400',
    description: '五十年前，一群长沙土夫子（盗墓贼）挖到了一件战国古墓，却因为棺椁中的邪异之物而死亡殆尽。五十年后，其中一个土夫子的孙子发现了他爷爷笔记中的秘密，于是召集了一群经验丰富的盗墓贼，再次踏上了这条不归路。',
    category: '悬疑',
    status: '已完结',
    wordCount: 1460000,
    chapterCount: 20,
  },
  {
    title: '三体',
    author: '刘慈欣',
    cover: 'https://picsum.photos/seed/novel5/300/400',
    description: '文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划"红岸工程"取得了突破性进展。但在按下发射键的那一刻，历经劫难的叶文洁没有意识到，她彻底改变了人类的命运。 地球文明向宇宙发出的第一声啼鸣，以太阳为中心，以光速向宇宙深处飞驰……',
    category: '科幻',
    status: '已完结',
    wordCount: 302000,
    chapterCount: 20,
    isRecommend: true,
  },
  {
    title: '全职高手',
    author: '蝴蝶蓝',
    cover: 'https://picsum.photos/seed/novel6/300/400',
    description: '网游荣耀中被誉为教科书级别的顶尖高手叶修，因为种种原因遭到俱乐部的驱逐，离开职业圈的他寄身于一家网吧成了一个小小的网管。但是，拥有十年游戏经验的他，在荣耀新开的第十区重新投入了游戏，带着对往昔的回忆，和一把未完成的自制武器，开始了重返巅峰之路。',
    category: '其他',
    status: '已完结',
    wordCount: 5580000,
    chapterCount: 20,
    isHot: true,
  },
  {
    title: '庆余年',
    author: '猫腻',
    cover: 'https://picsum.photos/seed/novel7/300/400',
    description: '积善之家，必有余庆，留余庆，留余庆，忽遇恩人；幸娘亲，幸娘亲，积得阴功。劝人生，济困扶穷……而谁可知，人生于世，上承余庆，下启后恩，却是为后代计，为儿孙谋？ 范闲，是这个故事里的主人公。他是一个私生子，他的人生，从一开始就注定了不寻常。',
    category: '历史',
    status: '已完结',
    wordCount: 3780000,
    chapterCount: 20,
    isHot: true,
  },
  {
    title: '微微一笑很倾城',
    author: '顾漫',
    cover: 'https://picsum.photos/seed/novel8/300/400',
    description: '美女学霸贝微微，立志成为游戏工程师，化名"芦苇微微"跻身网游高手，因拒绝上传真实照片而惨遭侠侣"真水无香"无情抛弃，却意外得到江湖第一高手"一笑奈何"的垂青。为了赢得"侠侣挑战赛"，贝微微欣然答应与"一笑奈何"结盟并组队参赛。',
    category: '都市',
    status: '已完结',
    wordCount: 120000,
    chapterCount: 20,
  },
];

// 生成章节内容
function generateChapterContent(novelTitle, chapterNum) {
  const contentTemplates = [
    `《${novelTitle}》第${chapterNum}章\n\n时间过得飞快，转眼间便是三月过去。这一日清晨，少年缓缓地睁开了双眸，眼中掠过一丝精芒，随即又恢复了平淡。\n\n"突破到第四段了。"感受着体内那比之前强横了数倍的力量，少年嘴角也是忍不住掀起一抹满足的笑意。\n\n这段时间的苦修，总算是没有白费。\n\n站起身来，少年走到窗边，望着远处的朝阳，心中也是有些感慨。来到这个世界，已经快一年的时间了。\n\n这个世界，名为斗气大陆。\n\n在这里，斗气，才是大陆的主旋律。\n\n斗气的修炼，几乎是无穷无尽。而伴随着斗气的修炼，便是实力的提升。斗者，斗师，大斗师，斗灵，斗王，斗皇，斗宗，斗尊，斗圣，斗帝。\n\n每一个等级的提升，都代表着实力的飞跃。\n\n而少年，如今便是一名四段斗者。\n\n"不知道什么时候，才能达到斗帝那个层次。"少年轻轻一笑，眼中闪过一抹期待。`,

    `《${novelTitle}》第${chapterNum}章\n\n夜色如墨，笼罩着整座城市。\n\n一间不起眼的小屋中，少年盘膝而坐，双目紧闭，周身萦绕着淡淡的光芒。\n\n随着呼吸的起伏，天地间的能量也是缓缓地涌动起来，顺着少年的呼吸，涌入其体内。\n\n"嗯？"突然，少年猛地睁开双眼，眼中闪过一抹诧异。\n\n"突破了？"感受着体内那比之前雄浑了不少的能量，少年的脸上也是露出了惊喜的神色。\n\n没想到，这次的修炼，居然如此顺利。\n\n"看来，这枚丹药的效果，比我想象的还要好。"少年摊开手掌，掌心躺着一枚散发着淡淡光芒的丹药。\n\n这是他花费了不少心思才弄到手的聚气散，没想到，效果居然这么好。\n\n"接下来，便是第五段了。"少年握了握拳头，眼中闪过一抹坚定。\n\n斗气大陆，强者为尊。只有实力，才是一切的根本。`,

    `《${novelTitle}》第${chapterNum}章\n\n修炼无岁月，寒尽不知年。\n\n不知不觉，又是半个月的时间悄然而过。\n\n这一日，少年终于停下了修炼，睁开双眼，两道精芒一闪而逝。\n\n"第五段，终于达到了。"感受着体内那澎湃的力量，少年满意地点了点头。\n\n距离四段，已经过去了三个月的时间。\n\n这个速度，说快不快，说慢不慢。不过对于少年来说，已经算是不错了。\n\n"接下来，应该尝试一下那门武技了。"少年沉吟了一下，想起了前不久偶然得到的一本武技秘籍。\n\n"八极拳，听起来似乎不错。"少年喃喃自语。\n\n在斗气大陆，斗气固然重要，但武技，也是不可或缺的一部分。一门好的武技，往往能让修炼者在战斗中，发挥出远超自身的实力。\n\n"希望这门八极拳，不要让我失望。"少年微微一笑，站起身来，准备开始修炼这门新的武技。`,
  ];

  return contentTemplates[chapterNum % contentTemplates.length];
}

// 插入数据
async function seedData() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功');

    // 清空旧数据
    await User.deleteMany({});
    await Novel.deleteMany({});
    await Chapter.deleteMany({});
    await Bookshelf.deleteMany({});
    console.log('🗑️  清空旧数据完成');

    // 插入用户
    const createdUsers = await User.create(testUsers);
    console.log(`✅ 插入 ${createdUsers.length} 个用户`);
    console.log('   👑 管理员: admin / admin123');
    console.log('   ✍️  作者: author1 / author123');
    console.log('   ✍️  作者: author2 / author123');
    console.log('   📖 读者: reader1 / reader123');
    console.log('   📖 读者: reader2 / reader123');

    // 获取作者用户ID
    const author1 = createdUsers.find(u => u.username === 'author1');
    const author2 = createdUsers.find(u => u.username === 'author2');

    // 为小说添加作者ID
    const novelsWithAuthor = novels.map((novel, index) => ({
      ...novel,
      authorId: index < 5 ? author1._id : author2._id,
    }));

    // 插入小说
    const result = await Novel.insertMany(novelsWithAuthor);
    const novelIds = result.map(n => n._id);
    console.log(`✅ 插入 ${result.length} 本小说`);

    // 为每本小说生成 20 个章节
    const allChapters = [];
    for (let i = 0; i < result.length; i++) {
      const novel = result[i];
      for (let j = 1; j <= 20; j++) {
        allChapters.push({
          novelId: novel._id,
          novelTitle: novel.title,
          order: j,
          title: `第${j}章 示例章节标题`,
          content: generateChapterContent(novel.title, j),
          wordCount: generateChapterContent(novel.title, j).replace(/\s/g, '').length,
          crawledAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await Chapter.insertMany(allChapters);
    console.log(`✅ 插入 ${allChapters.length} 个章节`);

    // 更新小说的最后章节信息
    for (let i = 0; i < result.length; i++) {
      await Novel.findByIdAndUpdate(novelIds[i], {
        $set: {
          'lastChapter.title': '第20章 示例章节标题',
          'lastChapter.updateTime': new Date(),
        },
      });
    }
    console.log('✅ 更新小说章节信息完成');

    // 为 reader1 添加书架数据
    const reader1 = createdUsers.find(u => u.username === 'reader1');
    const bookshelfData = novelIds.slice(0, 3).map((novelId, index) => ({
      userId: reader1._id,
      novelId,
      novelTitle: result[index].title,
      author: result[index].author,
      cover: result[index].cover,
    }));
    await Bookshelf.insertMany(bookshelfData);
    console.log('✅ 添加用户书架数据完成');

    console.log('\n🎉 所有测试数据插入成功！');
    console.log('\n📊 数据统计：');
    console.log(`   用户: ${createdUsers.length} 人`);
    console.log(`     - 管理员: 1 人`);
    console.log(`     - 作者: 2 人`);
    console.log(`     - 读者: 2 人`);
    console.log(`   小说: ${result.length} 本`);
    console.log(`   章节: ${allChapters.length} 章`);
    console.log(`   书架数据: ${bookshelfData.length} 条`);

  } catch (error) {
    console.error('❌ 插入失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 数据库连接已关闭');
  }
}

seedData();
