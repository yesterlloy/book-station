import os
from pathlib import Path
from dotenv import load_dotenv

# 项目根目录
BASE_DIR = Path(__file__).parent.parent.parent.resolve()

# 加载环境变量
env_path = BASE_DIR.parent / '.env'
if env_path.exists():
    load_dotenv(env_path)

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
        'port': int(os.getenv('REDIS_PORT', 6380)),
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
