import { useEffect } from 'react'
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
  BookOutlined,
} from '@ant-design/icons'
import { useBookStore } from '@/store'

const { Option } = Select
const { TextArea } = Input

const BookManagement = () => {
  const {
    novels,
    selectedNovel,
    chapters,
    loading,
    submitting,
    pagination,
    searchParams,
    modalVisible,
    chapterModalVisible,
    fetchNovels,
    setSearchParams,
    resetSearch,
    setPagination,
    openModal,
    closeModal,
    openChapterModal,
    closeChapterModal,
    createNovel,
    updateNovel,
    deleteNovel,
  } = useBookStore()

  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()

  useEffect(() => {
    fetchNovels()
  }, [fetchNovels, searchParams, pagination.current, pagination.pageSize])

  const handleSearch = () => {
    const values = searchForm.getFieldsValue()
    setSearchParams(values)
  }

  const handleReset = () => {
    searchForm.resetFields()
    resetSearch()
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()

      if (selectedNovel) {
        await updateNovel(selectedNovel.id, values)
        message.success('更新小说成功')
      } else {
        await createNovel(values)
        message.success('创建小说成功')
      }

      closeModal()
      form.resetFields()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleDeleteConfirm = async (id) => {
    await deleteNovel(id)
    message.success('删除成功')
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
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<BookOutlined />}>
            预览
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Popconfirm title="确定删除？">
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
            onClick={() => openChapterModal(record)}
          >
            章节
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue(record)
              openModal(record)
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这本小说吗？"
            onConfirm={() => handleDeleteConfirm(record.id)}
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
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
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
          dataSource={novels}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
        />
      </Card>

      {/* 小说编辑/新增弹窗 */}
      <Modal
        title={selectedNovel ? '编辑小说' : '新增小说'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          closeModal()
          form.resetFields()
        }}
        width={700}
        destroyOnClose
        confirmLoading={submitting}
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
        title={`章节管理 - ${selectedNovel?.title}`}
        open={chapterModalVisible}
        onCancel={() => closeChapterModal()}
        footer={[
          <Button key="close" onClick={() => closeChapterModal()}>
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
          dataSource={chapters}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  )
}

export default BookManagement
