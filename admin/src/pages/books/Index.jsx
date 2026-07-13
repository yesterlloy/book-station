import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Switch,
  Upload,
  InputNumber,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  UploadOutlined,
  EyeOutlined,
  BookOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

const BookManagement = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchForm] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [form] = Form.useForm()
  const [chapterModalVisible, setChapterModalVisible] = useState(false)
  const [currentNovel, setCurrentNovel] = useState(null)

  // 模拟小说数据
  const mockNovels = [
    { id: 1, title: '斗破苍穹', author: '天蚕土豆', category: '玄幻', status: 'serializing', isHot: true, chapterCount: 1623, wordCount: 5300000, cover: '', description: '这里是属于斗气的世界，没有花俏艳丽的魔法，有的，仅仅是繁衍到巅峰的斗气！', createdAt: '2024-01-01 10:00:00' },
    { id: 2, title: '完美世界', author: '辰东', category: '玄幻', status: 'completed', isHot: true, chapterCount: 1200, wordCount: 4200000, cover: '', description: '一粒尘可填海，一根草斩尽日月星辰，弹指间天翻地覆。', createdAt: '2024-01-02 10:00:00' },
    { id: 3, title: '凡人修仙传', author: '忘语', category: '武侠', status: 'completed', isHot: true, chapterCount: 1800, wordCount: 6100000, cover: '', description: '凡人流开山之作，讲述一个普通山村少年的修仙之路。', createdAt: '2024-01-03 10:00:00' },
    { id: 4, title: '盗墓笔记', author: '南派三叔', category: '悬疑', status: 'completed', isHot: false, chapterCount: 350, wordCount: 1500000, cover: '', description: '五十年前，一群长沙土夫子（盗墓贼）挖到了一件战国古墓。', createdAt: '2024-01-04 10:00:00' },
    { id: 5, title: '三体', author: '刘慈欣', category: '科幻', status: 'completed', isHot: true, chapterCount: 80, wordCount: 300000, cover: '', description: '文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划"红岸工程"取得了突破性进展。', createdAt: '2024-01-05 10:00:00' },
    { id: 6, title: '全职高手', author: '蝴蝶蓝', category: '其他', status: 'completed', isHot: false, chapterCount: 1728, wordCount: 5500000, cover: '', description: '网游荣耀中被誉为教科书级别的顶尖高手叶修，重新返回职业赛场的故事。', createdAt: '2024-01-06 10:00:00' },
  ]

  // 模拟章节数据
  const mockChapters = [
    { id: 1, order: 1, title: '第一章 陨落的天才', wordCount: 3500, isFree: true, createdAt: '2024-01-01 10:00:00' },
    { id: 2, order: 2, title: '第二章 斗之气', wordCount: 3200, isFree: true, createdAt: '2024-01-01 10:05:00' },
    { id: 3, order: 3, title: '第三章 客人', wordCount: 3800, isFree: true, createdAt: '2024-01-01 10:10:00' },
    { id: 4, order: 4, title: '第四章 纳兰嫣然', wordCount: 4000, isFree: false, createdAt: '2024-01-01 10:15:00' },
    { id: 5, order: 5, title: '第五章 聚气散', wordCount: 3600, isFree: false, createdAt: '2024-01-01 10:20:00' },
  ]

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    setTimeout(() => {
      setData(mockNovels)
      setPagination({ ...pagination, total: mockNovels.length })
      setLoading(false)
    }, 500)
  }

  const handleSearch = () => {
    loadData()
  }

  const handleReset = () => {
    searchForm.resetFields()
    loadData()
  }

  const handleCreate = () => {
    setEditingBook(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingBook(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    message.success('删除成功')
    loadData()
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      console.log('小说数据:', values)
      message.success(editingBook ? '更新成功' : '创建成功')
      setModalVisible(false)
      loadData()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleManageChapters = (record) => {
    setCurrentNovel(record)
    setChapterModalVisible(true)
  }

  const chapterColumns = [
    {
      title: '章节号',
      dataIndex: 'order',
      key: 'order',
      width: 80,
    },
    {
      title: '章节标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '字数',
      dataIndex: 'wordCount',
      key: 'wordCount',
      width: 100,
    },
    {
      title: '是否免费',
      dataIndex: 'isFree',
      key: 'isFree',
      width: 100,
      render: (isFree) => (
        <Tag color={isFree ? 'green' : 'orange'}>{isFree ? '免费' : '付费'}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>
            预览
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => console.log('删除章节', record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '封面',
      dataIndex: 'cover',
      key: 'cover',
      width: 80,
      render: () => (
        <div
          style={{
            width: 50,
            height: 70,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
          }}
        >
          <BookOutlined />
        </div>
      ),
    },
    {
      title: '小说名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '章节数',
      dataIndex: 'chapterCount',
      key: 'chapterCount',
      width: 80,
    },
    {
      title: '字数',
      dataIndex: 'wordCount',
      key: 'wordCount',
      width: 100,
      render: (count) => `${(count / 10000).toFixed(1)}万`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'serializing' ? 'processing' : 'success'}>
          {status === 'serializing' ? '连载中' : '已完结'}
        </Tag>
      ),
    },
    {
      title: '热门',
      dataIndex: 'isHot',
      key: 'isHot',
      width: 80,
      render: (isHot) => (
        <Tag color={isHot ? 'red' : 'default'}>{isHot ? '是' : '否'}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => dayjs(time).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small" className="table-actions">
          <Button
            type="link"
            size="small"
            icon={<BookOutlined />}
            onClick={() => handleManageChapters(record)}
          >
            章节
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这本小说吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>书籍管理</h2>

      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline">
          <Row gutter={16} align="middle">
            <Col>
              <Form.Item name="keyword" label="搜索">
                <Input placeholder="小说名/作者" allowClear />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="category" label="分类">
                <Select placeholder="全部" allowClear style={{ width: 120 }}>
                  <Option value="玄幻">玄幻</Option>
                  <Option value="武侠">武侠</Option>
                  <Option value="科幻">科幻</Option>
                  <Option value="悬疑">悬疑</Option>
                  <Option value="都市">都市</Option>
                  <Option value="历史">历史</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="status" label="状态">
                <Select placeholder="全部" allowClear style={{ width: 120 }}>
                  <Option value="serializing">连载中</Option>
                  <Option value="completed">已完结</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  搜索
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                  新增小说
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={(page, pageSize) => setPagination({ ...pagination, current: page, pageSize })}
        />
      </Card>

      {/* 小说编辑/新增弹窗 */}
      <Modal
        title={editingBook ? '编辑小说' : '新增小说'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="form-card">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="title"
                label="小说名称"
                rules={[{ required: true, message: '请输入小说名称' }]}
              >
                <Input placeholder="请输入小说名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="author"
                label="作者"
                rules={[{ required: true, message: '请输入作者' }]}
              >
                <Input placeholder="请输入作者" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="category"
                label="分类"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select placeholder="请选择分类">
                  <Option value="玄幻">玄幻</Option>
                  <Option value="武侠">武侠</Option>
                  <Option value="科幻">科幻</Option>
                  <Option value="悬疑">悬疑</Option>
                  <Option value="都市">都市</Option>
                  <Option value="历史">历史</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="serializing">连载中</Option>
                  <Option value="completed">已完结</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isHot"
                label="设为热门"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="cover"
            label="封面"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传封面</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="description"
            label="小说简介"
            rules={[{ required: true, message: '请输入小说简介' }]}
          >
            <TextArea rows={4} placeholder="请输入小说简介" maxLength={1000} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 章节管理弹窗 */}
      <Modal
        title={`章节管理 - ${currentNovel?.title}`}
        open={chapterModalVisible}
        onCancel={() => setChapterModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setChapterModalVisible(false)}>
            关闭
          </Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            新增章节
          </Button>,
        ]}
        width={900}
      >
        <Table
          columns={chapterColumns}
          dataSource={mockChapters}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  )
}

export default BookManagement
