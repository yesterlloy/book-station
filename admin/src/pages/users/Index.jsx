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
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  LockOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select

const UserManagement = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchForm] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState('create') // create | edit | resetPassword
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  // 模拟用户数据
  const mockUsers = [
    { id: 1, username: 'admin', email: 'admin@bookstation.com', role: 'admin', status: 'active', nickname: '超级管理员', createdAt: '2024-01-01 10:00:00' },
    { id: 2, username: 'author1', email: 'author1@bookstation.com', role: 'author', status: 'active', nickname: '天蚕土豆', createdAt: '2024-01-02 10:00:00' },
    { id: 3, username: 'author2', email: 'author2@bookstation.com', role: 'author', status: 'active', nickname: '刘慈欣', createdAt: '2024-01-03 10:00:00' },
    { id: 4, username: 'user1', email: 'user1@example.com', role: 'user', status: 'active', nickname: '读者1号', createdAt: '2024-01-04 10:00:00' },
    { id: 5, username: 'user2', email: 'user2@example.com', role: 'user', status: 'active', nickname: '读者2号', createdAt: '2024-01-05 10:00:00' },
    { id: 6, username: 'user3', email: 'user3@example.com', role: 'user', status: 'banned', nickname: '违规用户', createdAt: '2024-01-06 10:00:00' },
    { id: 7, username: 'user4', email: 'user4@example.com', role: 'user', status: 'active', nickname: '用户4', createdAt: '2024-01-07 10:00:00' },
    { id: 8, username: 'user5', email: 'user5@example.com', role: 'user', status: 'active', nickname: '用户5', createdAt: '2024-01-08 10:00:00' },
  ]

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize])

  const loadData = async () => {
    setLoading(true)
    // 模拟 API 调用
    setTimeout(() => {
      setData(mockUsers)
      setPagination({ ...pagination, total: mockUsers.length })
      setLoading(false)
    }, 500)
  }

  const handleSearch = () => {
    const values = searchForm.getFieldsValue()
    console.log('搜索条件:', values)
    loadData()
  }

  const handleReset = () => {
    searchForm.resetFields()
    loadData()
  }

  const handleCreate = () => {
    setModalType('create')
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setModalType('edit')
    setEditingUser(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleResetPassword = (record) => {
    setModalType('resetPassword')
    setEditingUser(record)
    form.resetFields()
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    message.success('删除成功')
    loadData()
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      console.log('表单数据:', values)

      if (modalType === 'create') {
        message.success('创建用户成功')
      } else if (modalType === 'edit') {
        message.success('更新用户成功')
      } else if (modalType === 'resetPassword') {
        message.success('密码重置成功')
      }

      setModalVisible(false)
      loadData()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleStatusChange = async (record, status) => {
    console.log('更新状态:', record.id, status)
    message.success('状态更新成功')
    loadData()
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleMap = {
          admin: { color: 'red', text: '管理员' },
          author: { color: 'blue', text: '作者' },
          user: { color: 'green', text: '用户' },
        }
        const { color, text } = roleMap[role] || { color: 'default', text: role }
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 100 }}
          size="small"
          onChange={(value) => handleStatusChange(record, value)}
        >
          <Option value="active">正常</Option>
          <Option value="banned">封禁</Option>
          <Option value="inactive">未激活</Option>
        </Select>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small" className="table-actions">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<LockOutlined />}
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>
          {record.role !== 'admin' && (
            <Popconfirm
              title="确定要删除这个用户吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>用户管理</h2>

      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline">
          <Row gutter={16} align="middle">
            <Col>
              <Form.Item name="keyword" label="搜索">
                <Input placeholder="用户名/邮箱" allowClear />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="role" label="角色">
                <Select placeholder="全部" allowClear style={{ width: 120 }}>
                  <Option value="admin">管理员</Option>
                  <Option value="author">作者</Option>
                  <Option value="user">用户</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="status" label="状态">
                <Select placeholder="全部" allowClear style={{ width: 120 }}>
                  <Option value="active">正常</Option>
                  <Option value="banned">封禁</Option>
                  <Option value="inactive">未激活</Option>
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
                  新增用户
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

      <Modal
        title={modalType === 'create' ? '新增用户' : modalType === 'edit' ? '编辑用户' : '重置密码'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="form-card">
          {modalType !== 'resetPassword' && (
            <>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" disabled={modalType === 'edit'} />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>

              <Form.Item
                name="nickname"
                label="昵称"
                rules={[{ required: true, message: '请输入昵称' }]}
              >
                <Input placeholder="请输入昵称" />
              </Form.Item>

              {modalType === 'create' && (
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6位' },
                  ]}
                >
                  <Input.Password placeholder="请输入密码" />
                </Form.Item>
              )}

              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Option value="admin">管理员</Option>
                  <Option value="author">作者</Option>
                  <Option value="user">用户</Option>
                </Select>
              </Form.Item>
            </>
          )}

          {modalType === 'resetPassword' && (
            <>
              <Form.Item label="当前用户">
                <Input value={editingUser?.username} disabled />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6位' },
                ]}
              >
                <Input.Password placeholder="请输入新密码" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="请再次输入密码" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
