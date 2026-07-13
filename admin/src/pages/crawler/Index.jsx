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
  Progress,
  Statistic,
  Badge,
  Switch,
  Collapse,
  Alert,
  Empty,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  StopOutlined,
  SafetyOutlined,
  BugOutlined,
} from '@ant-design/icons'
import { useCrawlerStore } from '@/store'

const { Option } = Select
const { Panel } = Collapse
const { TextArea } = Input

const CrawlerManagement = () => {
  const {
    crawlers,
    tasks,
    selectedCrawler,
    currentTask,
    logs,
    loading,
    searchParams,
    modalVisible,
    logModalVisible,
    stats,
    fetchCrawlers,
    setSearchParams,
    refresh,
    openModal,
    closeModal,
    openLogModal,
    closeLogModal,
    startCrawler,
    stopCrawler,
    testCrawler,
    createCrawler,
    updateCrawler,
    deleteCrawler,
  } = useCrawlerStore()

  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()

  useEffect(() => {
    fetchCrawlers()
  }, [fetchCrawlers, searchParams])

  const handleStart = async (record) => {
    await startCrawler(record.id)
    message.success(`爬虫 ${record.name} 已启动`)
  }

  const handleStop = async (record) => {
    await stopCrawler(record.id)
    message.success(`爬虫 ${record.name} 已停止`)
  }

  const handleTest = async (record) => {
    try {
      await testCrawler(record.id)
      message.success(`数据源 ${record.name} 连接成功`)
    } catch (error) {
      message.error(`数据源 ${record.name} 连接失败`)
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()

      if (selectedCrawler) {
        await updateCrawler(selectedCrawler.id, values)
        message.success('更新爬虫成功')
      } else {
        await createCrawler(values)
        message.success('创建爬虫成功')
      }

      closeModal()
      form.resetFields()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleDeleteConfirm = async (id) => {
    await deleteCrawler(id)
    message.success('删除成功')
  }

  const getStatusColor = (status) => {
    const colorMap = {
      running: 'processing',
      stopped: 'default',
      error: 'error',
      completed: 'success',
      failed: 'error',
      pending: 'warning',
    }
    return colorMap[status] || 'default'
  }

  const getStatusText = (status) => {
    const textMap = {
      running: '运行中',
      stopped: '已停止',
      error: '出错',
      completed: '已完成',
      failed: '失败',
      pending: '等待中',
    }
    return textMap[status] || status
  }

  const logLevelIcon = {
    info: <span style={{ color: '#1890ff' }}>ℹ</span>,
    success: <span style={{ color: '#52c41a' }}>✓</span>,
    warning: <span style={{ color: '#faad14' }}>⚠</span>,
    error: <span style={{ color: '#ff4d4f' }}>✗</span>,
  }

  const crawlerColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '爬虫名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '数据源',
      dataIndex: 'source',
      key: 'source',
      render: (source) => <Tag color="blue">{source}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={getStatusColor(status)} text={getStatusText(status)} />
      ),
    },
    {
      title: '并发数',
      dataIndex: 'concurrency',
      key: 'concurrency',
      width: 80,
    },
    {
      title: '抓取小说',
      dataIndex: 'totalBooks',
      key: 'totalBooks',
      width: 100,
    },
    {
      title: '抓取章节',
      dataIndex: 'totalChapters',
      key: 'totalChapters',
      width: 100,
      render: (count) => count.toLocaleString(),
    },
    {
      title: '最后运行',
      dataIndex: 'lastRun',
      key: 'lastRun',
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small" className="table-actions">
          {record.status !== 'running' ? (
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStart(record)}
            >
              启动
            </Button>
          ) : (
            <Button
              type="link"
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => handleStop(record)}
            >
              停止
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<SafetyOutlined />}
            onClick={() => handleTest(record)}
          >
            测试
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
            title="确定要删除这个爬虫吗？"
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

  const taskColumns = [
    {
      title: '任务ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '爬虫名称',
      dataIndex: 'crawlerName',
      key: 'crawlerName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={getStatusColor(status)} text={getStatusText(status)} />
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 200,
      render: (progress, record) => (
        <Progress
          percent={progress}
          size="small"
          status={record.status === 'failed' ? 'exception' : record.status === 'running' ? 'active' : 'success'}
        />
      ),
    },
    {
      title: '成功/失败',
      key: 'stats',
      width: 120,
      render: (_, record) => (
        <span>
          <span style={{ color: '#52c41a' }}>{record.success}</span>
          {' / '}
          <span style={{ color: '#ff4d4f' }}>{record.failed}</span>
        </span>
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
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<BugOutlined />}
          onClick={() => openLogModal(record)}
        >
          查看日志
        </Button>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>爬虫管理</h2>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="运行中"
              value={stats.runningCount}
              valueStyle={{ color: '#1890ff' }}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="抓取小说总数"
              value={stats.totalBooks}
              valueStyle={{ color: '#52c41a' }}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="抓取章节总数"
              value={stats.totalChapters}
              valueStyle={{ color: '#722ed1' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日任务数"
              value={stats.todayTasks}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Collapse defaultActiveKey={['1', '2']} style={{ marginBottom: 16 }}>
        <Panel header="爬虫列表" key="1">
          <Card>
            <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
              <Row gutter={16} align="middle">
                <Col>
                  <Form.Item name="keyword">
                    <Input placeholder="爬虫名称" allowClear style={{ width: 200 }} />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item name="status">
                    <Select placeholder="全部状态" allowClear style={{ width: 120 }}>
                      <Option value="running">运行中</Option>
                      <Option value="stopped">已停止</Option>
                      <Option value="error">出错</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col>
                  <Space>
                    <Button type="primary" icon={<SearchOutlined />} onClick={fetchCrawlers}>
                      搜索
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={refresh}>
                      刷新
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                      新增爬虫
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>

            <Table
              columns={crawlerColumns}
              dataSource={crawlers}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </Card>
        </Panel>

        <Panel header="任务历史" key="2">
          <Card>
            <Table
              columns={taskColumns}
              dataSource={tasks}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
            />
          </Card>
        </Panel>
      </Collapse>

      {/* 爬虫编辑/新增弹窗 */}
      <Modal
        title={selectedCrawler ? '编辑爬虫' : '新增爬虫'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          closeModal()
          form.resetFields()
        }}
        width={700}
        destroyOnClose
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" className="form-card">
          <Form.Item
            name="name"
            label="爬虫名称"
            rules={[{ required: true, message: '请输入爬虫名称' }]}
          >
            <Input placeholder="请输入爬虫名称" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="source"
                label="数据源"
                rules={[{ required: true, message: '请选择数据源' }]}
              >
                <Select placeholder="请选择数据源">
                  <Option value="qidian">起点中文网</Option>
                  <Option value="biquge">笔趣阁</Option>
                  <Option value="fanqie">番茄小说</Option>
                  <Option value="zongheng">纵横中文网</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="enabled"
                label="启用状态"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="concurrency"
                label="并发数"
                rules={[{ required: true, message: '请输入并发数' }]}
              >
                <InputNumber min={1} max={20} style={{ width: '100%' }} placeholder="请输入并发数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="delay"
                label="请求延迟(毫秒)"
                rules={[{ required: true, message: '请输入请求延迟' }]}
              >
                <InputNumber min={0} max={10000} style={{ width: '100%' }} placeholder="请输入延迟时间" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="baseUrl"
            label="基础URL"
            rules={[{ required: true, message: '请输入基础URL' }]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述说明"
          >
            <TextArea rows={3} placeholder="请输入爬虫描述说明" maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 日志查看弹窗 */}
      <Modal
        title={`任务日志 - ${currentTask?.crawlerName}`}
        open={logModalVisible}
        onCancel={() => closeLogModal()}
        footer={[
          <Button key="close" onClick={() => closeLogModal()}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <Alert
          message={`任务状态: ${getStatusText(currentTask?.status)}，进度: ${currentTask?.progress || 0}%`}
          type={currentTask?.status === 'failed' ? 'error' : 'info'}
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Card
          title="运行日志"
          size="small"
          style={{ maxHeight: 400, overflow: 'auto' }}
        >
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: 12,
                  fontFamily: 'monospace',
                }}
              >
                <span style={{ color: '#999', marginRight: 8 }}>[{log.time}]</span>
                <span style={{ marginRight: 8 }}>{logLevelIcon[log.level]}</span>
                <span>{log.message}</span>
              </div>
            ))
          ) : (
            <Empty description="暂无日志" />
          )}
        </Card>
      </Modal>
    </div>
  )
}

export default CrawlerManagement
