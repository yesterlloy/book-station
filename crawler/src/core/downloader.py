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
