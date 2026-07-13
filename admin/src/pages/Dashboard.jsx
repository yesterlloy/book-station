import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Progress, Spin } from 'antd'
import {
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  EyeOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNovels: 0,
    totalChapters: 0,
    totalViews: 0,
    userGrowth: 0,
    novelGrowth: 0,
    chapterGrowth: 0,
    viewGrowth: 0,
  })

  const [recentUsers, setRecentUsers] = useState([])
  const [recentNovels, setRecentNovels] = useState([])

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setStats({
        totalUsers: 1234,
        totalNovels: 567,
        totalChapters: 89012,
        totalViews: 1234567,
        userGrowth: 12.5,
        novelGrowth: 8.3,
        chapterGrowth: 15.2,
        viewGrowth: 20.1,
      })

      setRecentUsers([
        { id: 1, username: 'user1', email: 'user1@example.com', role: 'user', createdAt: dayjs().subtract(1, 'hour').format() },
        { id: 2, username: 'user2', email: 'user2@example.com', role: 'author', createdAt: dayjs().subtract(2, 'hour').format() },
        { id: 3, username: 'user3', email: 'user3@example.com', role: 'user', createdAt: dayjs().subtract(3, 'hour').format() },
        { id: 4, username: 'user4', email: 'user4@example.com', role: 'user', createdAt: dayjs().subtract(5, 'hour').format() },
        { id: 5, username: 'user5', email: 'user5@example.com', role: 'author', createdAt: dayjs().subtract(8, 'hour').format() },
      ])

      setRecentNovels([
        { id: 1, title: '斗破苍穹', author: '天蚕土豆', category: '玄幻', chapters: 1623, views: 123456 },
        { id: 2, title: '完美世界', author: '辰东', category: '玄幻', chapters: 1200, views: 98765 },
        { id: 3, title: '凡人修仙传', author: '忘语', category: '武侠', chapters: 1800, views: 87654 },
        { id: 4, title: '盗墓笔记', author: '南派三叔', category: '悬疑', chapters: 350, views: 76543 },
        { id: 5, title: '三体', author: '刘慈欣', category: '科幻', chapters: 80, views: 65432 },
      ])

      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const statCards = [
    {
      title: '用户总数',
      value: stats.totalUsers,
      icon: <UserOutlined />,
      growth: stats.userGrowth,
      color: '#722ed1',
    },
    {
      title: '小说总数',
      value: stats.totalNovels,
      icon: <BookOutlined />,
      growth: stats.novelGrowth,
      color: '#13c2c2',
    },
    {
      title: '章节总数',
      value: stats.totalChapters,
      icon: <FileTextOutlined />,
      growth: stats.chapterGrowth,
      color: '#fa8c16',
    },
    {
      title: '总阅读量',
      value: stats.totalViews,
      icon: <EyeOutlined />,
      growth: stats.viewGrowth,
      color: '#eb2f96',
    },
  ]

  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
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
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : role === 'author' ? 'blue' : 'green'}>
          {role === 'admin' ? '管理员' : role === 'author' ? '作者' : '用户'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
  ]

  const novelColumns = [
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
      render: (category) => <Tag>{category}</Tag>,
    },
    {
      title: '章节数',
      dataIndex: 'chapters',
      key: 'chapters',
    },
    {
      title: '阅读量',
      dataIndex: 'views',
      key: 'views',
      render: (views) => views.toLocaleString(),
    },
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>仪表盘</h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Statistic
                    title={card.title}
                    value={card.value}
                    valueStyle={{ color: card.color, fontSize: 28 }}
                    prefix={card.icon}
                  />
                  <div style={{ marginTop: 8, color: '#52c41a', fontSize: 12 }}>
                    <ArrowUpOutlined /> {card.growth}% 较上月
                  </div>
                </div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: `${card.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    color: card.color,
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最近注册用户" extra={<a href="#/users">查看全部</a>}>
            <Table
              columns={userColumns}
              dataSource={recentUsers}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="热门小说排行" extra={<a href="#/books">查看全部</a>}>
            <Table
              columns={novelColumns}
              dataSource={recentNovels}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="用户增长趋势">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Progress type="circle" percent={75} format={(percent) => `${percent}%`} />
              <p style={{ marginTop: 16, color: '#666' }}>本月用户完成度</p>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="爬虫状态">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Progress type="circle" percent={68} status="active" format={(percent) => `${percent}%`} />
              <p style={{ marginTop: 16, color: '#666' }}>当前抓取进度</p>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="系统健康度">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Progress type="circle" percent={98} strokeColor="#52c41a" format={(percent) => `${percent}%`} />
              <p style={{ marginTop: 16, color: '#666' }}>系统运行状态</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
