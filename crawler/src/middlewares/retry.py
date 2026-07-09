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
