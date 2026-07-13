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
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { useUserStore } from '@/store'

const { Option } = Select

const UserManagement = () => {
  const {
    users,
    loading,
    submitting,
    pagination,
    searchParams,
    modalVisible,
    modalType,
    selectedUser,
    fetchUsers,
    setSearchParams,
    resetSearch,
    setPagination,
    openModal,
    closeModal,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    resetPassword,
  } = useUserStore()

  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers, searchParams, pagination.current, pagination.pageSize])

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

      if (modalType === 'create') {
        await createUser(values)
        message.success('创建用户成功')
      } else if (modalType === 'edit') {
        await updateUser(selectedUser.id, values)
        message.success('更新用户成功')
      } else if (modalType === 'resetPassword') {
        await resetPassword(selectedUser.id, values.newPassword)
        message.success('密码重置成功')
      }

      closeModal()
      form.resetFields()
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleDeleteConfirm = async (id) => {
    await deleteUser(id)
    message.success('删除成功')
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
          onChange={(value) => updateUserStatus(record.id, value)}
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
            onClick={() => {
              form.setFieldsValue(record)
              openModal('edit', record)
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<LockOutlined />}
            onClick={() => openModal('resetPassword', record)}
          >
            重置密码
          </Button>
          {record.role !== 'admin' && (
            <Popconfirm
              title="确定要删除这个用户吗？"
              onConfirm={() => handleDeleteConfirm(record.id)}
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
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('create')}>
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
          dataSource={users}
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

      <Modal
        title={modalType === 'create' ? '新增用户' : modalType === 'edit' ? '编辑用户' : '重置密码'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          closeModal()
          form.resetFields()
        }}
        width={600}
        destroyOnClose
        confirmLoading={submitting}
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
                <Input value={selectedUser?.username} disabled />
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
