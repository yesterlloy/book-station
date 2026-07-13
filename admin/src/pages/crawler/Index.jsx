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
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { Panel } = Collapse
const { TextArea } = Input

const CrawlerManagement = () => {
  const [loading, setLoading] = useState(false)
  const [crawlerList, setCrawlerList] = useState([])
  const [taskList, setTaskList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchForm] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCrawler, setEditingCrawler] = useState(null)
  const [form] = Form.useForm()
  const [logModalVisible, setLogModalVisible] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [logs, setLogs] = useState([])

  // 模拟爬虫数据
  const mockCrawlers = [
    { id: 1, name: '起点中文网爬虫', source: 'qidian', status: 'running', concurrency: 5, delay: 1000, totalBooks: 156, totalChapters: 45632, lastRun: '2024-01-10 15:30:00', createdAt: '2024-01-01 10:00:00' },
    { id: 2, name: '笔趣阁爬虫', source: 'biquge', status: 'stopped', concurrency: 3, delay: 1500, totalBooks: 89, totalChapters: 23456, lastRun: '2024-01-09 18:20:00', createdAt: '2024-01-02 10:00:00' },
    { id: 3, name: '番茄小说爬虫', source: 'fanqie', status: 'running', concurrency: 8, delay: 800, totalBooks: 234, totalChapters: 67890, lastRun: '2024-01-10 16:00:00', createdAt: '2024-01-03 10:00:00' },
    { id: 4, name: '纵横中文网爬虫', source: 'zongheng', status: 'error', concurrency: 4, delay: 1200, totalBooks: 45, totalChapters: 12345, lastRun: '2024-01-08 12:00:00', createdAt: '2024-01-04 10:00:00' },
  ]

  // 模拟任务数据
  const mockTasks = [
    { id: 1, crawlerId: 1, crawlerName: '起点中文网爬虫', status: 'completed', progress: 100, total: 500, success: 495, failed: 5, createdAt: '2024-01-10 15:30:00', completedAt: '2024-01-10 16:45:00' },
    { id: 2, crawlerId: 3, crawlerName: '番茄小说爬虫', status: 'running', progress: 68, total: 1000, success: 680, failed: 0, createdAt: '2024-01-10 16:00:00', completedAt: null },
    { id: 3, crawlerId: 2, crawlerName: '笔趣阁爬虫', status: 'failed', progress: 35, total: 800, success: 280, failed: 120, createdAt: '2024-01-09 18:20:00', completedAt: null },
    { id: 4, crawlerId: 1, crawlerName: '起点中文网爬虫', status: 'completed', progress: 100, total: 300, success: 298, failed: 2, createdAt: '2024-01-09 10:00:00', completedAt: '2024-01-09 11:30:00' },
  ]

  // 模拟日志数据
  const mockLogs = [
    { time: '2024-01-10 16:00:00', level: 'info', message: '爬虫任务开始执行' },
    { time: '2024-01-10 16:00:05', level: 'info', message: '正在抓取小说列表...' },
    { time: '2024-01-10 16:00:10', level: 'info', message: '已获取 100 本小说信息' },
    { time: '2024-01-10 16:00:15', level: 'success', message: '成功抓取: 斗破苍穹' },
    { time: '2024-01-10 16:00:20', level: 'success', message: '成功抓取: 完美世界' },
    { time: '2024-01-10 16:00:25', level: 'warning', message: '小说《测试小说》内容为空，跳过' },
    { time: '2024-01-10 16:00:30', level: 'success', message: '成功抓取: 凡人修仙传' },
    { time: '2024-01-10 16:00:35', level: 'info', message: '正在抓取章节内容...' },
    { time: '2024-01-10 16:00:40', level: 'success', message: '成功抓取章节: 第1章 陨落的天才' },
    { time: '2024-01-10 16:00:45', level: 'success', message: '成功抓取章节: 第2章 斗之气' },
  ]

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    setTimeout(() => {
      setCrawlerList(mockCrawlers)
      setTaskList(mockTasks)
      setLogs(mockLogs)
      setPagination({ ...pagination, total: mockCrawlers.length })
      setLoading(false)
    }, 500)
  }

  const handleStart = async (record) => {
    message.success(`爬虫 ${record.name} 已启动`)
    loadData()
  }

  const handleStop = async (record) => {
    message.success(`爬虫 ${record.name} 已停止`)
    loadData()
  }

  const handleTest = async (record) => {
    message.success(`数据源 ${record.name} 连接成功`)
  }

  const handleCreate = () => {
    setEditingCrawler(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingCrawler(record)
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
      console.log('爬虫配置:', values)
      message.success(editingCrawler ? '更新成功' : '创建成功')
      setModalVisible(false)
      loadData()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleViewLogs = (task) => {
    setCurrentTask(task)
    setLogModalVisible(true)
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
      render: (time) => dayjs(time).format('MM-DD HH:mm'),
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
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个爬虫吗？"
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
      render: (time) => dayjs(time).format('MM-DD HH:mm'),
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
          onClick={() => handleViewLogs(record)}
        >
          查看日志
        </Button>
      ),
    },
  ]

  const logLevelIcon = {
    info: <ExclamationCircleOutlined style={{ color: '#1890ff' }} />,
    success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    warning: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
    error: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>爬虫管理</h2>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="运行中"
              value={crawlerList.filter(c => c.status === 'running').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="抓取小说总数"
              value={crawlerList.reduce((sum, c) => sum + c.totalBooks, 0)}
              valueStyle={{ color: '#52c41a' }}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="抓取章节总数"
              value={crawlerList.reduce((sum, c) => sum + c.totalChapters, 0)}
              valueStyle={{ color: '#722ed1' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日任务数"
              value={taskList.filter(t => dayjs(t.createdAt).isSame(dayjs(), 'day')).length}
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
                    <Button type="primary" icon={<SearchOutlined />} onClick={loadData}>
                      搜索
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={loadData}>
                      刷新
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                      新增爬虫
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>

            <Table
              columns={crawlerColumns}
              dataSource={crawlerList}
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
              dataSource={taskList}
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
        title={editingCrawler ? '编辑爬虫' : '新增爬虫'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={700}
        destroyOnClose
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
        onCancel={() => setLogModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setLogModalVisible(false)}>
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
