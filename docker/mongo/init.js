// MongoDB 初始化脚本
// 创建应用用户和索引

db = db.getSiblingDB('bookstation');

// 创建应用用户（只读+读写权限）
db.createUser({
  user: 'bookstation_app',
  pwd: 'bookstation_password_change_in_production',
  roles: [
    { role: 'readWrite', db: 'bookstation' }
  ]
});

// 创建小说集合索引
db.novels.createIndex({ title: 1, author: 1 }, { unique: true });
db.novels.createIndex({ category: 1 });
db.novels.createIndex({ viewCount: -1 });
db.novels.createIndex({ isHot: 1 });
db.novels.createIndex({ authorId: 1 });
db.novels.createIndex({ 'lastChapter.updateTime': -1 });
db.novels.createIndex({ title: 'text', author: 'text', description: 'text' }, {
  weights: { title: 10, author: 5, description: 1 }
});

// 创建章节集合索引
db.chapters.createIndex({ novelId: 1, order: 1 }, { unique: true });
db.chapters.createIndex({ novelId: 1, _id: 1 });
db.chapters.createIndex({ hash: 1 });

// 创建用户集合索引
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ status: 1 });

// 创建书架集合索引
db.bookshelves.createIndex({ userId: 1, novelId: 1 }, { unique: true });
db.bookshelves.createIndex({ userId: 1, lastReadAt: -1 });

// 创建阅读历史索引
db.read_history.createIndex({ userId: 1, novelId: 1 }, { unique: true, sparse: true });
db.read_history.createIndex({ deviceId: 1, novelId: 1 }, { unique: true, sparse: true });

// 创建爬虫源索引
db.crawl_sources.createIndex({ baseUrl: 1 }, { unique: true });
db.crawl_sources.createIndex({ enabled: 1, priority: 1 });

print('✅ MongoDB 初始化完成！');
print('✅ 用户创建完成！');
print('✅ 所有索引创建完成！');
