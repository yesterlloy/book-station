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
                        'id': chapter_info.get('id'),
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
