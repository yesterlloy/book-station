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
