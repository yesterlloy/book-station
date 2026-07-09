# 阶段二：爬虫模块开发 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个通用的、支持异步并发的小说爬虫框架，包含目录抓取、章节下载、内容清洗、去重和自动入库功能。

**Architecture:** Python Asyncio + Aiohttp 异步并发架构，采用生产者-消费者模式，支持代理IP池、随机User-Agent、失败重试、内容去重。

**Tech Stack:** Python 3.10+, Aiohttp, Asyncio, Motor (MongoDB async driver), Redis-py, BeautifulSoup4, lxml

## Global Constraints

- Python 版本: >= 3.10
- 并发数限制: 默认为 10（可配置）
- 请求间隔: 1-3 秒随机抖动
- 失败重试: 最多 3 次，指数退避
- User-Agent 池: >= 100 个浏览器 UA
- 内容清洗: 必须过滤广告、垃圾文本、空行

---

## 爬虫模块结构

```
crawler/
├── requirements.txt              # Python 依赖
├── .env.example                  # 环境变量
├── src/
│   ├── main.py                   # 爬虫入口
│   ├── config/                   # 配置
│   │   ├── __init__.py
│   │   └── settings.py           # 配置加载
│   ├── core/                     # 核心模块
│   │   ├── __init__.py
│   │   ├── downloader.py         # 下载器（带代理池）
│   │   ├── scheduler.py          # 调度器
│   │   └── parser.py             # 内容解析器
│   ├── models/                   # 数据模型
│   │   ├── __init__.py
│   │   └── mongo.py              # MongoDB 连接
│   ├── pipelines/                # 数据管道
│   │   ├── __init__.py
│   │   ├── cleaner.py            # 内容清洗
│   │   ├── deduplicator.py      # 去重器
│   │   └── storage.py            # 存储入库
│   ├── middlewares/              # 中间件
│   │   ├── __init__.py
│   │   ├── user_agent.py         # UA池
│   │   ├── proxy.py              # 代理池
│   │   └── retry.py              # 重试机制
│   ├── spiders/                  # 爬虫实例
│   │   ├── __init__.py
│   │   ├── base_spider.py        # 基础爬虫类
│   │   └── example_spider.py     # 示例爬虫
│   └── utils/                    # 工具函数
│       ├── __init__.py
│       ├── logger.py             # 日志
│       └── hash.py               # 哈希工具
└── data/
    ├── user_agents.txt           # UA 列表
    └── proxies.txt               # 代理列表
```

---

### Task 1: Python 项目初始化与依赖

**Files:**
- Create: `crawler/requirements.txt`
- Create: `crawler/.env.example`
- Create: `crawler/src/__init__.py`

**Steps:**

- [ ] **Step 1: 创建 requirements.txt**

```txt
# HTTP Client
aiohttp>=3.9.0
aiohttp-retry>=2.8.3

# Database
motor>=3.3.0
redis>=5.0.1

# Parser
beautifulsoup4>=4.12.0
lxml>=4.9.0

# Utils
python-dotenv>=1.0.0
fake-useragent>=1.4.0
colorlog>=6.8.0
tenacity>=8.2.0

# Validation
pydantic>=2.5.0
```

- [ ] **Step 2: 创建 .env.example**

```env
# MongoDB Configuration
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USERNAME=admin
MONGO_PASSWORD=password
MONGO_DATABASE=bookstation

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# Crawler Configuration
CRAWLER_NAME=bookstation-crawler
CRAWLER_CONCURRENCY=10
CRAWLER_DELAY_MIN=1000
CRAWLER_DELAY_MAX=3000
CRAWLER_TIMEOUT=30
CRAWLER_RETRY_TIMES=3

# Proxy Configuration
PROXY_ENABLED=false
PROXY_FILE=data/proxies.txt

# Log Configuration
LOG_LEVEL=INFO
LOG_FILE=logs/crawler.log
```

- [ ] **Step 3: 创建目录结构**

```bash
mkdir -p crawler/src/{config,core,models,pipelines,middlewares,spiders,utils} crawler/data crawler/logs
touch crawler/src/__init__.py
```

- [ ] **Step 4: 安装依赖**

```bash
cd crawler && pip install -r requirements.txt
```

---

### Task 2: 配置与日志模块

**Files:**
- Create: `crawler/src/config/settings.py`
- Create: `crawler/src/config/__init__.py`
- Create: `crawler/src/utils/logger.py`
- Create: `crawler/src/utils/__init__.py`

**Steps:**

- [ ] **Step 1: 创建设置文件**

```python
# crawler/src/config/settings.py
import os
from pathlib import Path
from dotenv import load_dotenv

# 项目根目录
BASE_DIR = Path(__file__).parent.parent.parent.resolve()

# 加载环境变量
load_dotenv(BASE_DIR / '.env')

class Settings:
    """爬虫配置"""
    
    # 基础配置
    NAME = os.getenv('CRAWLER_NAME', 'bookstation-crawler')
    CONCURRENCY = int(os.getenv('CRAWLER_CONCURRENCY', 10))
    DELAY_MIN = int(os.getenv('CRAWLER_DELAY_MIN', 1000))  # ms
    DELAY_MAX = int(os.getenv('CRAWLER_DELAY_MAX', 3000))  # ms
    TIMEOUT = int(os.getenv('CRAWLER_TIMEOUT', 30))
    RETRY_TIMES = int(os.getenv('CRAWLER_RETRY_TIMES', 3))
    
    # MongoDB 配置
    MONGO = {
        'host': os.getenv('MONGO_HOST', 'localhost'),
        'port': int(os.getenv('MONGO_PORT', 27017)),
        'username': os.getenv('MONGO_USERNAME'),
        'password': os.getenv('MONGO_PASSWORD'),
        'database': os.getenv('MONGO_DATABASE', 'bookstation'),
    }
    
    # Redis 配置
    REDIS = {
        'host': os.getenv('REDIS_HOST', 'localhost'),
        'port': int(os.getenv('REDIS_PORT', 6379)),
        'password': os.getenv('REDIS_PASSWORD'),
    }
    
    # 代理配置
    PROXY_ENABLED = os.getenv('PROXY_ENABLED', 'false').lower() == 'true'
    PROXY_FILE = BASE_DIR / os.getenv('PROXY_FILE', 'data/proxies.txt')
    
    # 日志配置
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = BASE_DIR / os.getenv('LOG_FILE', 'logs/crawler.log')
    
    # 数据目录
    DATA_DIR = BASE_DIR / 'data'
    USER_AGENT_FILE = DATA_DIR / 'user_agents.txt'
    
    # Redis 键
    REDIS_KEYS = {
        'crawled_urls': 'crawler:crawled_urls',
        'chapter_hashes': 'crawler:chapter_hashes',
        'task_queue': 'crawler:task_queue',
    }

settings = Settings()
```

```python
# crawler/src/config/__init__.py
from .settings import settings

__all__ = ['settings']
```

- [ ] **Step 2: 创建日志模块**

```python
# crawler/src/utils/logger.py
import logging
import sys
from pathlib import Path
from colorlog import ColoredFormatter
from ..config import settings

def setup_logger(name='crawler'):
    """配置日志"""
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, settings.LOG_LEVEL))
    
    # 避免重复添加处理器
    if logger.handlers:
        return logger
    
    # 控制台格式（带颜色）
    console_formatter = ColoredFormatter(
        '%(log_color)s%(asctime)s [%(levelname)s] %(name)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
        log_colors={
            'DEBUG': 'cyan',
            'INFO': 'green',
            'WARNING': 'yellow',
            'ERROR': 'red',
            'CRITICAL': 'red,bg_white',
        }
    )
    
    # 文件格式
    file_formatter = logging.Formatter(
        '%(asctime)s [%(levelname)s] %(name)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # 控制台处理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)
    
    # 文件处理器
    log_file = Path(settings.LOG_FILE)
    log_file.parent.mkdir(parents=True, exist_ok=True)
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)
    
    return logger

logger = setup_logger()
```

```python
# crawler/src/utils/__init__.py
from .logger import logger, setup_logger

__all__ = ['logger', 'setup_logger']
```

- [ ] **Step 3: 测试日志模块**

```python
# test_logger.py
from src.utils import logger

logger.info('Test info message')
logger.warning('Test warning message')
logger.error('Test error message')
```

```bash
cd crawler && python test_logger.py
```

Expected: Colored output in console, and messages written to log file

---

### Task 3: 数据库连接模块

**Files:**
- Create: `crawler/src/models/mongo.py`
- Create: `crawler/src/models/__init__.py`
- Create: `crawler/src/utils/hash.py`

**Steps:**

- [ ] **Step 1: 创建 MongoDB 连接**

```python
# crawler/src/models/mongo.py
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from ..config import settings
from ..utils import logger

class MongoDB:
    """MongoDB 异步连接管理器"""
    
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    @classmethod
    async def connect(cls):
        """连接数据库"""
        if cls._client is None:
            try:
                mongo_config = settings.MONGO
                if mongo_config['username'] and mongo_config['password']:
                    uri = f"mongodb://{mongo_config['username']}:{mongo_config['password']}@{mongo_config['host']}:{mongo_config['port']}/{mongo_config['database']}?authSource=admin"
                else:
                    uri = f"mongodb://{mongo_config['host']}:{mongo_config['port']}/{mongo_config['database']}"
                
                cls._client = AsyncIOMotorClient(uri, maxPoolSize=10)
                cls._db = cls._client[mongo_config['database']]
                
                # 测试连接
                await cls._client.admin.command('ping')
                logger.info('✅ MongoDB connected successfully')
                logger.info(f"📊 Database: {mongo_config['database']}")
            except Exception as e:
                logger.error(f'❌ MongoDB connection error: {e}')
                raise
    
    @classmethod
    def get_db(cls):
        """获取数据库实例"""
        if cls._db is None:
            raise RuntimeError('Database not connected. Call connect() first.')
        return cls._db
    
    @classmethod
    async def close(cls):
        """关闭连接"""
        if cls._client:
            cls._client.close()
            cls._client = None
            cls._db = None
            logger.info('📤 MongoDB connection closed')

# 快捷访问
def get_collection(name):
    return MongoDB.get_db()[name]

async def init_indexes():
    """初始化数据库索引"""
    db = MongoDB.get_db()
    
    # novels 索引
    await db.novels.create_index([('title', 1), ('author', 1)], unique=True)
    await db.novels.create_index([('category', 1)])
    await db.novels.create_index([('viewCount', -1)])
    await db.novels.create_index([('isHot', 1)])
    await db.novels.create_index([('lastChapter.updateTime', -1)])
    await db.novels.create_index([('title', 'text'), ('author', 'text'), ('description', 'text')])
    
    # chapters 索引
    await db.chapters.create_index([('novelId', 1), ('order', 1)], unique=True)
    await db.chapters.create_index([('novelId', 1), ('_id', 1)])
    await db.chapters.create_index([('hash', 1)])
    
    logger.info('📑 Database indexes initialized')
```

```python
# crawler/src/models/__init__.py
from .mongo import MongoDB, get_collection, init_indexes

__all__ = ['MongoDB', 'get_collection', 'init_indexes']
```

- [ ] **Step 2: 创建哈希工具**

```python
# crawler/src/utils/hash.py
import hashlib

def generate_content_hash(content: str) -> str:
    """生成内容的 MD5 哈希，用于去重"""
    return hashlib.md5(content.encode('utf-8')).hexdigest()

def count_chinese_chars(text: str) -> int:
    """统计中文字符数量，用于判断有效内容"""
    return sum(1 for c in text if '一' <= c <= '鿿')
```

- [ ] **Step 3: 测试数据库连接**

```python
# test_mongo.py
import asyncio
from src.models import MongoDB, init_indexes

async def test():
    await MongoDB.connect()
    await init_indexes()
    db = MongoDB.get_db()
    print('Collections:', await db.list_collection_names())
    await MongoDB.close()

asyncio.run(test())
```

```bash
cd crawler && python test_mongo.py
```

Expected: "MongoDB connected successfully" and list of collections

---

### Task 4: User-Agent 池与代理池中间件

**Files:**
- Create: `crawler/data/user_agents.txt` (100+ UA)
- Create: `crawler/src/middlewares/user_agent.py`
- Create: `crawler/src/middlewares/proxy.py`
- Create: `crawler/src/middlewares/retry.py`
- Create: `crawler/src/middlewares/__init__.py`

**Steps:**

- [ ] **Step 1: 创建 User-Agent 列表文件**

下载常见的 UA 列表到 `crawler/data/user_agents.txt`，每行一个 UA。至少包含 100 个不同的浏览器 UA。

```bash
# 可以用这个命令生成一些 UA
cat > crawler/data/user_agents.txt << 'UAEOF'
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15
Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36
Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0
# ... 添加更多 UA，至少 100 个
UAEOF
```

- [ ] **Step 2: 创建 User-Agent 中间件**

```python
# crawler/src/middlewares/user_agent.py
import random
from pathlib import Path
from ..config import settings
from ..utils import logger

class UserAgentPool:
    """User-Agent 池"""
    
    def __init__(self, ua_file=None):
        self.ua_file = ua_file or settings.USER_AGENT_FILE
        self.user_agents = []
        self._load_user_agents()
    
    def _load_user_agents(self):
        """加载 UA 列表"""
        ua_path = Path(self.ua_file)
        if ua_path.exists():
            with open(ua_path, 'r', encoding='utf-8') as f:
                self.user_agents = [line.strip() for line in f if line.strip()]
            logger.info(f'📱 Loaded {len(self.user_agents)} user agents')
        else:
            logger.warning(f'⚠️ User agent file not found: {ua_path}')
            # 使用默认的 UA 列表
            self.user_agents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ]
    
    def get_random_ua(self):
        """获取随机 UA"""
        return random.choice(self.user_agents) if self.user_agents else ''
    
    def get_headers(self):
        """获取完整的请求头"""
        return {
            'User-Agent': self.get_random_ua(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
        }

# 全局实例
ua_pool = UserAgentPool()
```

- [ ] **Step 3: 创建代理池中间件**

```python
# crawler/src/middlewares/proxy.py
import random
from pathlib import Path
from ..config import settings
from ..utils import logger

class ProxyPool:
    """代理 IP 池"""
    
    def __init__(self, proxy_file=None):
        self.proxy_file = proxy_file or settings.PROXY_FILE
        self.proxies = []
        self.enabled = settings.PROXY_ENABLED
        if self.enabled:
            self._load_proxies()
    
    def _load_proxies(self):
        """加载代理列表"""
        proxy_path = Path(self.proxy_file)
        if proxy_path.exists():
            with open(proxy_path, 'r', encoding='utf-8') as f:
                self.proxies = [line.strip() for line in f if line.strip()]
            logger.info(f'🌐 Loaded {len(self.proxies)} proxies')
        else:
            logger.warning(f'⚠️ Proxy file not found: {proxy_path}')
    
    def get_random_proxy(self):
        """获取随机代理"""
        if not self.enabled or not self.proxies:
            return None
        return random.choice(self.proxies)
    
    def remove_proxy(self, proxy):
        """移除无效代理"""
        if proxy in self.proxies:
            self.proxies.remove(proxy)
            logger.warning(f'🗑️ Removed invalid proxy: {proxy}')

# 全局实例
proxy_pool = ProxyPool()
```

- [ ] **Step 4: 创建重试中间件**

```python
# crawler/src/middlewares/retry.py
import asyncio
import random
from functools import wraps
from ..config import settings
from ..utils import logger

def retry_with_backoff(max_retries=None, base_delay=1, max_delay=60):
    """带指数退避的重试装饰器"""
    max_retries = max_retries or settings.RETRY_TIMES
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    # 添加随机延迟（除了第一次）
                    if attempt > 0:
                        delay = min(base_delay * (2 ** (attempt - 1)) + random.uniform(0, 1), max_delay)
                        logger.debug(f'⏳ Retry attempt {attempt}/{max_retries}, delay {delay:.2f}s')
                        await asyncio.sleep(delay)
                    
                    return await func(*args, **kwargs)
                    
                except Exception as e:
                    last_exception = e
                    logger.warning(f'⚠️ Attempt {attempt + 1} failed: {str(e)[:100]}')
            
            logger.error(f'❌ All {max_retries} retries failed')
            raise last_exception
        
        return wrapper
    return decorator
```

- [ ] **Step 5: 创建中间件导出文件**

```python
# crawler/src/middlewares/__init__.py
from .user_agent import ua_pool, UserAgentPool
from .proxy import proxy_pool, ProxyPool
from .retry import retry_with_backoff

__all__ = ['ua_pool', 'UserAgentPool', 'proxy_pool', 'ProxyPool', 'retry_with_backoff']
```

---

### Task 5: 异步下载器核心模块

**Files:**
- Create: `crawler/src/core/downloader.py`
- Create: `crawler/src/core/__init__.py`

**Steps:**

- [ ] **Step 1: 创建下载器**

```python
# crawler/src/core/downloader.py
import asyncio
import aiohttp
import random
from typing import Optional, Dict, Any
from ..config import settings
from ..utils import logger
from ..middlewares import ua_pool, proxy_pool, retry_with_backoff

class AsyncDownloader:
    """异步下载器，支持代理、重试、随机延迟"""
    
    def __init__(self, concurrency=None):
        self.concurrency = concurrency or settings.CONCURRENCY
        self.session = None
        self.semaphore = asyncio.Semaphore(self.concurrency)
        self.stats = {
            'requests': 0,
            'success': 0,
            'failed': 0,
            'retries': 0,
        }
    
    async def __aenter__(self):
        """异步上下文管理器入口"""
        timeout = aiohttp.ClientTimeout(total=settings.TIMEOUT)
        connector = aiohttp.TCPConnector(limit=self.concurrency, force_close=True)
        self.session = aiohttp.ClientSession(timeout=timeout, connector=connector)
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器退出"""
        if self.session:
            await self.session.close()
        logger.info(f'📊 Downloader stats: {self.stats}')
    
    async def _random_delay(self):
        """随机延迟"""
        delay = random.uniform(settings.DELAY_MIN, settings.DELAY_MAX) / 1000
        await asyncio.sleep(delay)
    
    @retry_with_backoff()
    async def _do_request(self, url: str, method: str = 'GET', **kwargs) -> str:
        """执行实际的 HTTP 请求"""
        async with self.semaphore:
            await self._random_delay()
            
            # 设置请求头
            headers = kwargs.pop('headers', {})
            headers.update(ua_pool.get_headers())
            
            # 设置代理
            proxy = proxy_pool.get_random_proxy()
            
            self.stats['requests'] += 1
            logger.debug(f'📥 Requesting: {url}')
            
            try:
                async with self.session.request(
                    method,
                    url,
                    headers=headers,
                    proxy=proxy,
                    **kwargs
                ) as response:
                    if response.status == 200:
                        self.stats['success'] += 1
                        # 自动检测编码
                        content = await response.text(encoding='utf-8', errors='replace')
                        logger.debug(f'✅ Success: {url} ({len(content)} bytes)')
                        return content
                    else:
                        self.stats['failed'] += 1
                        logger.warning(f'⚠️ HTTP {response.status}: {url}')
                        raise Exception(f'HTTP {response.status}')
                        
            except Exception as e:
                self.stats['failed'] += 1
                # 如果是代理失败，移除此代理
                if proxy and 'proxy' in str(e).lower():
                    proxy_pool.remove_proxy(proxy)
                raise
    
    async def download(self, url: str, **kwargs) -> Optional[str]:
        """下载页面内容"""
        try:
            return await self._do_request(url, **kwargs)
        except Exception as e:
            logger.error(f'❌ Failed to download {url}: {e}')
            return None
    
    async def download_batch(self, urls: list, callback=None) -> Dict[str, Any]:
        """批量下载"""
        tasks = [self.download(url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        output = {}
        for url, result in zip(urls, results):
            if isinstance(result, Exception):
                output[url] = None
            else:
                output[url] = result
                if callback:
                    await callback(url, result)
        
        return output

async def test_download():
    """测试下载器"""
    async with AsyncDownloader() as downloader:
        content = await downloader.download('https://httpbin.org/html')
        if content:
            print(f'Downloaded {len(content)} bytes')
            print('✅ Downloader test passed')

if __name__ == '__main__':
    asyncio.run(test_download())
```

```python
# crawler/src/core/__init__.py
from .downloader import AsyncDownloader

__all__ = ['AsyncDownloader']
```

- [ ] **Step 2: 测试下载器**

```bash
cd crawler && python -m src.core.downloader
```

Expected: "Downloader test passed"

---

### Task 6: 内容解析器与清洗管道

**Files:**
- Create: `crawler/src/core/parser.py`
- Create: `crawler/src/pipelines/cleaner.py`
- Create: `crawler/src/pipelines/deduplicator.py`
- Create: `crawler/src/pipelines/storage.py`
- Create: `crawler/src/pipelines/__init__.py`

**Steps:**

- [ ] **Step 1: 创建 HTML 解析器**

```python
# crawler/src/core/parser.py
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
from ..utils import logger

class HtmlParser:
    """HTML 解析器"""
    
    @staticmethod
    def parse(html: str, parser: str = 'lxml') -> BeautifulSoup:
        """解析 HTML"""
        return BeautifulSoup(html, parser)
    
    @staticmethod
    def extract_text(soup: BeautifulSoup, selector: str, strip: bool = True) -> Optional[str]:
        """提取单个文本"""
        element = soup.select_one(selector)
        if element:
            text = element.get_text(strip=strip)
            return text if text else None
        return None
    
    @staticmethod
    def extract_all_text(soup: BeautifulSoup, selector: str, strip: bool = True) -> List[str]:
        """提取多个文本"""
        elements = soup.select(selector)
        return [e.get_text(strip=strip) for e in elements if e.get_text(strip=strip)]
    
    @staticmethod
    def extract_attr(soup: BeautifulSoup, selector: str, attr: str) -> Optional[str]:
        """提取属性"""
        element = soup.select_one(selector)
        if element:
            return element.get(attr)
        return None
    
    @staticmethod
    def extract_all_attr(soup: BeautifulSoup, selector: str, attr: str) -> List[str]:
        """提取多个属性"""
        elements = soup.select(selector)
        return [e.get(attr) for e in elements if e.get(attr)]
    
    @staticmethod
    def extract_links(soup: BeautifulSoup, base_url: str = None) -> List[Dict[str, str]]:
        """提取所有链接"""
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            text = a.get_text(strip=True)
            # 相对路径转绝对路径
            if base_url and not href.startswith(('http://', 'https://')):
                from urllib.parse import urljoin
                href = urljoin(base_url, href)
            links.append({'url': href, 'text': text})
        return links
```

- [ ] **Step 2: 创建内容清洗管道**

```python
# crawler/src/pipelines/cleaner.py
import re
from typing import List
from ..utils import logger, count_chinese_chars

class ContentCleaner:
    """内容清洗器：过滤广告、垃圾文本"""
    
    # 广告关键词列表
    AD_KEYWORDS = [
        r'求收藏', r'求推荐', r'求打赏', r'求月票', r'求订阅',
        r'点击加载', r'正在加载', r'请稍后', r'浏览器', r'APP下载',
        r'最新章节', r'最快更新', r'笔趣阁', r'小说网', r'www\.', r'http',
        r'加入书架', r'推荐投票', r'点击下一页', r'返回目录',
    ]
    
    # 广告正则模式
    AD_PATTERNS = [
        re.compile(r'（.*?）'),  # 括号内容
        re.compile(r'\(.*?\)'),   # 英文括号
        re.compile(r'第.*?章.*?：'),  # 章节标题重复
        re.compile(r'^\W*$'),     # 纯符号行
    ]
    
    @classmethod
    def clean_content(cls, content: str, min_chars: int = 20) -> str:
        """清洗章节内容"""
        if not content:
            return ''
        
        # 按行分割
        lines = content.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            
            # 跳过空行
            if not line:
                continue
            
            # 跳过太短的行（可能是广告）
            if len(line) < min_chars and count_chinese_chars(line) < 5:
                continue
            
            # 检查是否包含广告关键词
            is_ad = False
            for keyword in cls.AD_KEYWORDS:
                if re.search(keyword, line):
                    is_ad = True
                    break
            
            if is_ad:
                continue
            
            # 应用正则清洗
            for pattern in cls.AD_PATTERNS:
                line = pattern.sub('', line)
            
            # 清洗后不为空则保留
            if line.strip() and len(line.strip()) > 5:
                cleaned_lines.append(line.strip())
        
        # 合并内容，确保每段不空
        result = '\n'.join(cleaned_lines)
        result = re.sub(r'\n{3,}', '\n\n', result)  # 合并过多空行
        
        logger.debug(f'🧹 Cleaned content: {len(content)} -> {len(result)} chars')
        return result
    
    @staticmethod
    def clean_title(title: str) -> str:
        """清洗标题"""
        if not title:
            return ''
        
        # 移除常见前缀
        title = re.sub(r'^第\s*\d+\s*[章节集]\s*[：:]\s*', '', title)
        title = re.sub(r'^\d+\s*[、.．]\s*', '', title)
        
        # 移除多余空白
        title = ' '.join(title.split())
        return title.strip()
    
    @staticmethod
    def clean_author(author: str) -> str:
        """清洗作者名"""
        if not author:
            return ''
        
        # 移除常见前缀
        author = re.sub(r'作\s*者[：:]', '', author)
        author = re.sub(r'[作者]：', '', author)
        
        return author.strip()
    
    @staticmethod
    def clean_description(desc: str) -> str:
        """清洗简介"""
        if not desc:
            return ''
        
        # 移除多余空白和换行
        desc = re.sub(r'\s+', ' ', desc)
        return desc.strip()
```

- [ ] **Step 3: 创建去重器**

```python
# crawler/src/pipelines/deduplicator.py
import hashlib
import redis.asyncio as redis
from typing import Optional
from ..config import settings
from ..utils import logger

class Deduplicator:
    """内容去重器：基于 Redis 的布隆去重"""
    
    def __init__(self):
        self.redis_client = None
        self.url_key = settings.REDIS_KEYS['crawled_urls']
        self.hash_key = settings.REDIS_KEYS['chapter_hashes']
    
    async def connect(self):
        """连接 Redis"""
        try:
            redis_config = settings.REDIS
            self.redis_client = redis.Redis(
                host=redis_config['host'],
                port=redis_config['port'],
                password=redis_config['password'],
                decode_responses=True
            )
            await self.redis_client.ping()
            logger.info('✅ Deduplicator Redis connected')
        except Exception as e:
            logger.error(f'❌ Redis connection failed: {e}')
            raise
    
    async def close(self):
        """关闭连接"""
        if self.redis_client:
            await self.redis_client.close()
    
    async def is_url_crawled(self, url: str) -> bool:
        """检查 URL 是否已爬取"""
        return await self.redis_client.sismember(self.url_key, url)
    
    async def mark_url_crawled(self, url: str):
        """标记 URL 已爬取"""
        await self.redis_client.sadd(self.url_key, url)
    
    @staticmethod
    def generate_hash(content: str) -> str:
        """生成内容哈希"""
        # 去掉所有空白字符后再哈希
        normalized = re.sub(r'\s+', '', content)
        return hashlib.md5(normalized.encode('utf-8')).hexdigest()
    
    async def is_content_duplicate(self, content: str) -> bool:
        """检查内容是否重复"""
        content_hash = self.generate_hash(content)
        return await self.redis_client.sismember(self.hash_key, content_hash)
    
    async def mark_content_seen(self, content: str) -> str:
        """标记内容已见过，返回哈希值"""
        content_hash = self.generate_hash(content)
        await self.redis_client.sadd(self.hash_key, content_hash)
        return content_hash
    
    async def clear_all(self):
        """清空所有去重记录"""
        await self.redis_client.delete(self.url_key, self.hash_key)
        logger.info('🗑️ Deduplicator cache cleared')

import re  # 放在文件顶部，这里补充一下
```

- [ ] **Step 4: 创建存储管道**

```python
# crawler/src/pipelines/storage.py
from datetime import datetime
from typing import Dict, List, Optional
from bson import ObjectId
from ..models import get_collection
from ..utils import logger

class StoragePipeline:
    """数据存储管道"""
    
    @staticmethod
    async def save_novel(novel_data: Dict) -> Optional[ObjectId]:
        """保存小说信息，返回 _id"""
        collection = get_collection('novels')
        
        # 准备数据
        novel = {
            'title': novel_data['title'],
            'author': novel_data['author'],
            'cover': novel_data.get('cover', ''),
            'description': novel_data.get('description', ''),
            'category': novel_data.get('category', '其他'),
            'status': novel_data.get('status', '连载中'),
            'wordCount': novel_data.get('wordCount', 0),
            'chapterCount': novel_data.get('chapterCount', 0),
            'source': novel_data.get('source', {}),
            'tags': novel_data.get('tags', []),
            'lastCrawledAt': datetime.now(),
        }
        
        try:
            # 更新或插入
            result = await collection.update_one(
                {'title': novel['title'], 'author': novel['author']},
                {'$set': novel},
                upsert=True
            )
            
            if result.upserted_id:
                logger.info(f'📚 New novel saved: {novel["title"]}')
                return result.upserted_id
            else:
                logger.info(f'📚 Novel updated: {novel["title"]}')
                # 获取已存在的 ID
                doc = await collection.find_one(
                    {'title': novel['title'], 'author': novel['author']},
                    {'_id': 1}
                )
                return doc['_id'] if doc else None
                
        except Exception as e:
            logger.error(f'❌ Failed to save novel: {e}')
            return None
    
    @staticmethod
    async def save_chapter(chapter_data: Dict) -> Optional[ObjectId]:
        """保存章节"""
        collection = get_collection('chapters')
        
        chapter = {
            'novelId': chapter_data['novelId'],
            'novelTitle': chapter_data['novelTitle'],
            'order': chapter_data['order'],
            'title': chapter_data['title'],
            'content': chapter_data['content'],
            'wordCount': chapter_data.get('wordCount', len(chapter_data['content'])),
            'sourceUrl': chapter_data.get('sourceUrl', ''),
            'hash': chapter_data.get('hash', ''),
            'crawledAt': datetime.now(),
        }
        
        try:
            result = await collection.update_one(
                {'novelId': chapter['novelId'], 'order': chapter['order']},
                {'$set': chapter},
                upsert=True
            )
            
            if result.upserted_id:
                logger.debug(f'📄 New chapter: {chapter["title"]}')
                return result.upserted_id
            return None
            
        except Exception as e:
            logger.error(f'❌ Failed to save chapter: {e}')
            return None
    
    @staticmethod
    async def update_novel_last_chapter(novel_id: ObjectId, chapter_info: Dict):
        """更新小说的最新章节信息"""
        collection = get_collection('novels')
        await collection.update_one(
            {'_id': novel_id},
            {
                '$set': {
                    'lastChapter': {
                        'title': chapter_info['title'],
                        'id': chapter_info['id'],
                        'updateTime': datetime.now(),
                    },
                    'chapterCount': chapter_info.get('chapterCount', 0),
                    'lastCrawledAt': datetime.now(),
                }
            }
        )
    
    @staticmethod
    async def save_chapters_batch(chapters: List[Dict]) -> int:
        """批量保存章节，返回成功数量"""
        if not chapters:
            return 0
        
        collection = get_collection('chapters')
        operations = []
        
        for chapter in chapters:
            operations.append({
                'updateOne': {
                    'filter': {'novelId': chapter['novelId'], 'order': chapter['order']},
                    'update': {'$set': chapter},
                    'upsert': True,
                }
            })
        
        try:
            result = await collection.bulk_write(operations)
            success_count = result.upserted_count + result.modified_count
            logger.info(f'📦 Batch saved {success_count} chapters')
            return success_count
        except Exception as e:
            logger.error(f'❌ Batch save failed: {e}')
            return 0
```

- [ ] **Step 5: 创建管道导出文件**

```python
# crawler/src/pipelines/__init__.py
from .cleaner import ContentCleaner
from .deduplicator import Deduplicator
from .storage import StoragePipeline

__all__ = ['ContentCleaner', 'Deduplicator', 'StoragePipeline']
```

---

### Task 7: 基础爬虫类与调度器

**Files:**
- Create: `crawler/src/spiders/base_spider.py`
- Create: `crawler/src/spiders/__init__.py`
- Create: `crawler/src/core/scheduler.py`

**Steps:**

- [ ] **Step 1: 创建基础爬虫类**

```python
# crawler/src/spiders/base_spider.py
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from ..core import AsyncDownloader, HtmlParser
from ..pipelines import ContentCleaner, Deduplicator, StoragePipeline
from ..utils import logger

class BaseSpider(ABC):
    """爬虫基类，所有具体爬虫都需要继承此类"""
    
    name: str = 'base_spider'
    base_url: str = ''
    source_name: str = ''
    
    def __init__(self):
        self.downloader = None
        self.parser = HtmlParser()
        self.cleaner = ContentCleaner()
        self.deduplicator = Deduplicator()
        self.storage = StoragePipeline()
        self.stats = {
            'novels_found': 0,
            'novels_saved': 0,
            'chapters_found': 0,
            'chapters_saved': 0,
            'duplicates': 0,
        }
    
    async def init(self):
        """初始化爬虫"""
        await self.deduplicator.connect()
    
    async def close(self):
        """关闭爬虫"""
        await self.deduplicator.close()
    
    @abstractmethod
    async def parse_novel_list(self, html: str) -> List[str]:
        """解析小说列表页面，返回小说详情页 URL 列表"""
        pass
    
    @abstractmethod
    async def parse_novel_detail(self, html: str, url: str) -> Optional[Dict]:
        """解析小说详情页，返回小说信息和章节列表页 URL"""
        pass
    
    @abstractmethod
    async def parse_chapter_list(self, html: str, novel_url: str) -> List[Dict]:
        """解析章节列表页，返回章节信息列表"""
        pass
    
    @abstractmethod
    async def parse_chapter_content(self, html: str) -> Optional[str]:
        """解析章节内容页，返回正文内容"""
        pass
    
    async def crawl_novel(self, novel_url: str):
        """爬取单本小说"""
        logger.info(f'🔍 Crawling novel: {novel_url}')
        
        try:
            # 1. 下载小说详情页
            detail_html = await self.downloader.download(novel_url)
            if not detail_html:
                logger.error(f'❌ Failed to download novel detail: {novel_url}')
                return
            
            # 2. 解析小说信息
            novel_data = await self.parse_novel_detail(detail_html, novel_url)
            if not novel_data:
                logger.error(f'❌ Failed to parse novel detail: {novel_url}')
                return
            
            self.stats['novels_found'] += 1
            logger.info(f'📚 Found novel: {novel_data["title"]}')
            
            # 3. 保存小说信息
            novel_id = await self.storage.save_novel(novel_data)
            if not novel_id:
                logger.error(f'❌ Failed to save novel: {novel_data["title"]}')
                return
            
            self.stats['novels_saved'] += 1
            novel_data['_id'] = novel_id
            
            # 4. 下载并解析章节列表
            chapter_list_html = await self.downloader.download(novel_data['chapter_list_url'])
            if not chapter_list_html:
                logger.error(f'❌ Failed to download chapter list')
                return
            
            chapters = await self.parse_chapter_list(chapter_list_html, novel_url)
            self.stats['chapters_found'] += len(chapters)
            logger.info(f'📖 Found {len(chapters)} chapters')
            
            # 5. 批量下载章节内容
            chapter_contents = []
            for i, chapter in enumerate(chapters):
                # 检查是否已爬取
                if await self.deduplicator.is_url_crawled(chapter['url']):
                    self.stats['duplicates'] += 1
                    continue
                
                content_html = await self.downloader.download(chapter['url'])
                if not content_html:
                    continue
                
                content = await self.parse_chapter_content(content_html)
                if not content:
                    continue
                
                # 清洗内容
                cleaned_content = self.cleaner.clean_content(content)
                if len(cleaned_content) < 100:  # 内容太短跳过
                    logger.warning(f'⚠️ Content too short: {chapter["title"]}')
                    continue
                
                # 检查内容重复
                if await self.deduplicator.is_content_duplicate(cleaned_content):
                    self.stats['duplicates'] += 1
                    continue
                
                chapter_hash = await self.deduplicator.mark_content_seen(cleaned_content)
                await self.deduplicator.mark_url_crawled(chapter['url'])
                
                chapter_contents.append({
                    'novelId': novel_id,
                    'novelTitle': novel_data['title'],
                    'order': chapter['order'],
                    'title': self.cleaner.clean_title(chapter['title']),
                    'content': cleaned_content,
                    'sourceUrl': chapter['url'],
                    'hash': chapter_hash,
                })
                
                logger.debug(f'✅ Chapter {i+1}/{len(chapters)}: {chapter["title"]}')
            
            # 6. 批量保存章节
            saved_count = await self.storage.save_chapters_batch(chapter_contents)
            self.stats['chapters_saved'] += saved_count
            
            # 7. 更新小说最新章节信息
            if chapter_contents:
                last_chapter = max(chapter_contents, key=lambda x: x['order'])
                await self.storage.update_novel_last_chapter(
                    novel_id,
                    {
                        'title': last_chapter['title'],
                        'id': None,  # 批量保存后可能需要查询
                        'chapterCount': len(chapters),
                    }
                )
            
            logger.info(f'✅ Novel complete: {novel_data["title"]}, saved {saved_count} chapters')
            
        except Exception as e:
            logger.error(f'❌ Error crawling novel {novel_url}: {e}', exc_info=True)
    
    async def run(self, start_urls: List[str]):
        """运行爬虫"""
        logger.info(f'🚀 Starting spider: {self.name}')
        logger.info(f'📊 Start URLs: {len(start_urls)}')
        
        await self.init()
        
        async with AsyncDownloader() as downloader:
            self.downloader = downloader
            
            for url in start_urls:
                await self.crawl_novel(url)
        
        await self.close()
        
        logger.info('🏁 Spider finished')
        logger.info(f'📊 Final stats: {self.stats}')
```

```python
# crawler/src/spiders/__init__.py
from .base_spider import BaseSpider

__all__ = ['BaseSpider']
```

- [ ] **Step 2: 创建调度器**

```python
# crawler/src/core/scheduler.py
import asyncio
from typing import List, Type
from ..spiders import BaseSpider
from ..utils import logger
from ..models import MongoDB, init_indexes

class CrawlerScheduler:
    """爬虫调度器：管理多个爬虫并发运行"""
    
    def __init__(self):
        self.spiders = []
    
    def register_spider(self, spider_cls: Type[BaseSpider]):
        """注册爬虫"""
        self.spiders.append(spider_cls)
        logger.info(f'📋 Registered spider: {spider_cls.name}')
    
    async def run_single(self, spider_cls: Type[BaseSpider], urls: List[str]):
        """运行单个爬虫"""
        spider = spider_cls()
        await spider.run(urls)
    
    async def run_all(self, spider_urls: dict):
        """运行所有注册的爬虫"""
        logger.info(f'🚀 Starting crawler scheduler')
        logger.info(f'📋 Registered spiders: {len(self.spiders)}')
        
        # 连接数据库
        await MongoDB.connect()
        await init_indexes()
        
        tasks = []
        for spider_cls in self.spiders:
            if spider_cls.name in spider_urls:
                urls = spider_urls[spider_cls.name]
                task = self.run_single(spider_cls, urls)
                tasks.append(task)
        
        await asyncio.gather(*tasks)
        
        await MongoDB.close()
        logger.info('🏁 All spiders finished')
    
    @staticmethod
    async def run_spider(spider_cls: Type[BaseSpider], urls: List[str]):
        """便捷方法：直接运行单个爬虫"""
        scheduler = CrawlerScheduler()
        scheduler.register_spider(spider_cls)
        await scheduler.run_all({spider_cls.name: urls})
```

更新 `crawler/src/core/__init__.py`:

```python
from .downloader import AsyncDownloader
from .parser import HtmlParser
from .scheduler import CrawlerScheduler

__all__ = ['AsyncDownloader', 'HtmlParser', 'CrawlerScheduler']
```

---

### Task 8: 爬虫入口与示例爬虫

**Files:**
- Create: `crawler/src/main.py`
- Create: `crawler/src/spiders/example_spider.py`

**Steps:**

- [ ] **Step 1: 创建示例爬虫（需要根据实际目标网站调整选择器）**

```python
# crawler/src/spiders/example_spider.py
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
from .base_spider import BaseSpider
from ..utils import logger
from ..pipelines import ContentCleaner

class ExampleSpider(BaseSpider):
    """示例爬虫：需要根据实际目标网站调整"""
    
    name = 'example_spider'
    base_url = 'https://example.com'
    source_name = '示例小说网'
    
    def __init__(self):
        super().__init__()
        self.cleaner = ContentCleaner()
    
    async def parse_novel_list(self, html: str) -> List[str]:
        """解析小说列表（本示例不使用）"""
        soup = self.parser.parse(html)
        novels = []
        
        for item in soup.select('.novel-item'):
            link = item.select_one('a')
            if link and link.get('href'):
                from urllib.parse import urljoin
                novels.append(urljoin(self.base_url, link['href']))
        
        return novels
    
    async def parse_novel_detail(self, html: str, url: str) -> Optional[Dict]:
        """解析小说详情页"""
        soup = self.parser.parse(html)
        
        # 这些选择器需要根据实际网站调整
        title = self.parser.extract_text(soup, 'h1.novel-title')
        author = self.parser.extract_text(soup, '.author-name')
        cover = self.parser.extract_attr(soup, '.novel-cover img', 'src')
        description = self.parser.extract_text(soup, '.novel-description')
        category = self.parser.extract_text(soup, '.novel-category')
        status = self.parser.extract_text(soup, '.novel-status')
        
        # 获取章节列表 URL
        chapter_url = soup.select_one('a#chapter-list')
        chapter_list_url = chapter_url.get('href') if chapter_url else url
        
        from urllib.parse import urljoin
        chapter_list_url = urljoin(url, chapter_list_url)
        
        if not title or not author:
            logger.error(f'❌ Missing title or author: {url}')
            return None
        
        return {
            'title': self.cleaner.clean_title(title),
            'author': self.cleaner.clean_author(author),
            'cover': urljoin(url, cover) if cover else '',
            'description': self.cleaner.clean_description(description) if description else '',
            'category': category or '其他',
            'status': status or '连载中',
            'chapter_list_url': chapter_list_url,
            'source': {
                'name': self.source_name,
                'url': url,
            },
        }
    
    async def parse_chapter_list(self, html: str, novel_url: str) -> List[Dict]:
        """解析章节列表"""
        soup = self.parser.parse(html)
        chapters = []
        
        from urllib.parse import urljoin
        
        for i, item in enumerate(soup.select('.chapter-list a'), 1):
            title = item.get_text(strip=True)
            href = item.get('href')
            
            if not href:
                continue
            
            chapters.append({
                'order': i,
                'title': title,
                'url': urljoin(novel_url, href),
            })
        
        return chapters
    
    async def parse_chapter_content(self, html: str) -> Optional[str]:
        """解析章节内容"""
        soup = self.parser.parse(html)
        
        # 找到内容容器
        content_div = soup.select_one('#content')
        if not content_div:
            return None
        
        # 移除脚本、样式等
        for tag in content_div(['script', 'style', 'div', 'a']):
            tag.decompose()
        
        # 获取纯文本，保留换行
        content = content_div.get_text('\n', strip=True)
        return content
```

- [ ] **Step 2: 创建爬虫主入口**

```python
# crawler/src/main.py
import asyncio
import argparse
from .core import CrawlerScheduler
from .spiders.example_spider import ExampleSpider
from .utils import logger

def main():
    parser = argparse.ArgumentParser(description='BookStation Novel Crawler')
    parser.add_argument('--spider', '-s', default='example_spider', help='Spider name to run')
    parser.add_argument('--url', '-u', help='Single novel URL to crawl')
    parser.add_argument('--urls', nargs='+', help='Multiple novel URLs to crawl')
    parser.add_argument('--list', action='store_true', help='List all registered spiders')
    
    args = parser.parse_args()
    
    # 注册所有爬虫
    spiders = {
        'example_spider': ExampleSpider,
    }
    
    # 列出可用爬虫
    if args.list:
        print('Available spiders:')
        for name in spiders.keys():
            print(f'  - {name}')
        return
    
    # 选择爬虫
    if args.spider not in spiders:
        print(f'Error: Spider "{args.spider}" not found')
        print(f'Available spiders: {", ".join(spiders.keys())}')
        return
    
    spider_cls = spiders[args.spider]
    
    # 准备 URL 列表
    urls = []
    if args.url:
        urls.append(args.url)
    if args.urls:
        urls.extend(args.urls)
    
    if not urls:
        print('Error: No URLs provided. Use --url or --urls')
        return
    
    # 运行爬虫
    logger.info(f'🚀 Starting {spider_cls.name}')
    logger.info(f'📊 URLs to crawl: {len(urls)}')
    
    asyncio.run(CrawlerScheduler.run_spider(spider_cls, urls))

if __name__ == '__main__':
    main()
```

---

### Task 9: 测试与验证

**Files:**
- Create: `crawler/test_spider.py`

**Steps:**

- [ ] **Step 1: 创建测试脚本**

```python
# crawler/test_spider.py
import asyncio
from src.models import MongoDB, init_indexes
from src.core import AsyncDownloader, HtmlParser
from src.pipelines import ContentCleaner, Deduplicator
from src.utils import logger

async def test_components():
    """测试各个组件"""
    logger.info('🧪 Testing crawler components...')
    
    # 1. 测试数据库连接
    logger.info('\n1. Testing MongoDB connection...')
    await MongoDB.connect()
    await init_indexes()
    logger.info('✅ MongoDB OK')
    
    # 2. 测试下载器
    logger.info('\n2. Testing downloader...')
    async with AsyncDownloader(concurrency=2) as downloader:
        html = await downloader.download('https://httpbin.org/html')
        if html and len(html) > 0:
            logger.info(f'✅ Downloader OK ({len(html)} bytes)')
        else:
            logger.error('❌ Downloader failed')
    
    # 3. 测试解析器
    logger.info('\n3. Testing parser...')
    parser = HtmlParser()
    soup = parser.parse(html)
    title = parser.extract_text(soup, 'h1')
    if title:
        logger.info(f'✅ Parser OK (title: {title})')
    else:
        logger.error('❌ Parser failed')
    
    # 4. 测试清洗器
    logger.info('\n4. Testing cleaner...')
    test_content = """
    第一章 测试
    （本章内容纯属虚构）
    这是正文内容。
    求收藏求推荐！
    更多精彩内容...
    http://example.com
    第二章预告
    """
    cleaned = ContentCleaner.clean_content(test_content)
    logger.info(f'✅ Cleaner OK: {len(test_content)} -> {len(cleaned)} chars')
    logger.debug(f'Cleaned content: {cleaned}')
    
    # 5. 测试去重器
    logger.info('\n5. Testing deduplicator...')
    dedup = Deduplicator()
    await dedup.connect()
    
    test_hash1 = ContentCleaner.generate_hash('test content 1')
    test_hash2 = ContentCleaner.generate_hash('test content 2')
    
    is_dup = await dedup.is_content_duplicate('test content 1')
    logger.info(f'  Before mark: is_dup={is_dup}')
    
    await dedup.mark_content_seen('test content 1')
    
    is_dup = await dedup.is_content_duplicate('test content 1')
    logger.info(f'  After mark: is_dup={is_dup}')
    
    logger.info('✅ Deduplicator OK')
    await dedup.close()
    
    await MongoDB.close()
    logger.info('\n🎉 All tests passed!')

if __name__ == '__main__':
    asyncio.run(test_components())
```

- [ ] **Step 2: 运行测试**

```bash
cd crawler && python test_spider.py
```

Expected: All tests pass with "✅" markers

---

## 阶段二验收标准

- [ ] 所有 Python 依赖正确安装
- [ ] MongoDB 和 Redis 连接正常
- [ ] 异步下载器支持并发、代理、重试
- [ ] HTML 解析器能正确提取内容
- [ ] 内容清洗器能有效过滤广告和垃圾文本
- [ ] 去重器能正确识别和标记重复内容
- [ ] 存储管道能正确保存小说和章节到 MongoDB
- [ ] 基础爬虫类框架完整，示例爬虫可运行
- [ ] 所有组件测试通过

---

**计划结束**
