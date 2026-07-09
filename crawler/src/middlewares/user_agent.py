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
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
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
