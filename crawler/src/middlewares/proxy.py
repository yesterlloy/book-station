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
