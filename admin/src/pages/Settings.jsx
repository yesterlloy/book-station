import { useState } from 'react'
import {
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Select,
  Tabs,
  Row,
  Col,
  message,
  Divider,
  Alert,
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input

const Settings = () => {
  const [loading, setLoading] = useState(false)
  const [generalForm] = Form.useForm()
  const [contentForm] = Form.useForm()
  const [securityForm] = Form.useForm()

  const handleGeneralSave = async () => {
    try {
      const values = await generalForm.validateFields()
      setLoading(true)
      console.log('保存通用设置:', values)
      setTimeout(() => {
        message.success('设置保存成功')
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleContentSave = async () => {
    try {
      const values = await contentForm.validateFields()
      setLoading(true)
      console.log('保存内容设置:', values)
      setTimeout(() => {
        message.success('设置保存成功')
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const handleSecuritySave = async () => {
    try {
      const values = await securityForm.validateFields()
      setLoading(true)
      console.log('保存安全设置:', values)
      setTimeout(() => {
        message.success('设置保存成功')
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const tabItems = [
    {
      key: '1',
      label: '通用设置',
      children: (
        <Form
          form={generalForm}
          layout="vertical"
          initialValues={{
            siteName: 'BookStation',
            siteDescription: '纯净、极速、无广告的小说阅读平台',
            siteUrl: 'https://bookstation.com',
            enableRegistration: true,
            enableComment: true,
            defaultAvatar: '',
          }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="siteName"
                label="网站名称"
                rules={[{ required: true, message: '请输入网站名称' }]}
              >
                <Input placeholder="请输入网站名称" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="siteUrl"
                label="网站地址"
                rules={[{ required: true, message: '请输入网站地址' }]}
              >
                <Input placeholder="https://example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="siteDescription"
            label="网站描述"
          >
            <TextArea rows={3} placeholder="请输入网站描述" maxLength={500} showCount />
          </Form.Item>

          <Divider />

          <Row gutter={24}>
            <Col xs={24} lg={8}>
              <Form.Item
                name="enableRegistration"
                label="开放注册"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="enableComment"
                label="开放评论"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="enableRecommend"
                label="推荐功能"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleGeneralSave} loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: '2',
      label: '内容设置',
      children: (
        <Form
          form={contentForm}
          layout="vertical"
          initialValues={{
            hotNovelCount: 10,
            newNovelCount: 20,
            recommendNovelCount: 15,
            freeChapterCount: 10,
            chapterPerPage: 50,
            enableCrawler: true,
            autoCrawl: false,
          }}
        >
          <Alert
            message="以下设置将影响前端展示的数据量和爬虫行为"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Row gutter={24}>
            <Col xs={24} lg={8}>
              <Form.Item
                name="hotNovelCount"
                label="热门小说数量"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="newNovelCount"
                label="最新小说数量"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="recommendNovelCount"
                label="推荐小说数量"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="freeChapterCount"
                label="免费章节数"
                rules={[{ required: true, message: '请输入数量' }]}
                extra="每本小说前N章免费阅读"
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                name="chapterPerPage"
                label="每页章节数"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={10} max={200} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row gutter={24}>
            <Col xs={24} lg={8}>
              <Form.Item
                name="enableCrawler"
                label="启用爬虫"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="autoCrawl"
                label="自动抓取"
                valuePropName="checked"
                extra="启用后将自动定期抓取新章节"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="crawlInterval"
                label="抓取间隔(小时)"
              >
                <InputNumber min={1} max={168} style={{ width: '100%' }} placeholder="24" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleContentSave} loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: '3',
      label: '安全设置',
      children: (
        <Form
          form={securityForm}
          layout="vertical"
          initialValues={{
            enableCaptcha: true,
            maxLoginAttempts: 5,
            lockoutDuration: 30,
            sessionTimeout: 24,
            passwordMinLength: 6,
            enableTwoFactor: false,
          }}
        >
          <Alert
            message="安全设置将影响用户登录和系统安全性，修改后请谨慎确认"
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Row gutter={24}>
            <Col xs={24} lg={8}>
              <Form.Item
                name="enableCaptcha"
                label="登录验证码"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="maxLoginAttempts"
                label="最大登录尝试次数"
                rules={[{ required: true, message: '请输入次数' }]}
              >
                <InputNumber min={1} max={20} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="lockoutDuration"
                label="账号锁定时长(分钟)"
                rules={[{ required: true, message: '请输入时长' }]}
              >
                <InputNumber min={5} max={1440} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} lg={8}>
              <Form.Item
                name="sessionTimeout"
                label="会话超时时间(小时)"
                rules={[{ required: true, message: '请输入时间' }]}
              >
                <InputNumber min={1} max={168} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="passwordMinLength"
                label="密码最小长度"
                rules={[{ required: true, message: '请输入长度' }]}
              >
                <InputNumber min={4} max={32} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="passwordPolicy"
                label="密码强度策略"
              >
                <Select>
                  <Option value="low">低 - 仅限制长度</Option>
                  <Option value="medium">中 - 需要字母和数字</Option>
                  <Option value="high">高 - 需要大小写字母、数字、特殊字符</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row gutter={24}>
            <Col xs={24} lg={8}>
              <Form.Item
                name="enableTwoFactor"
                label="双因素认证"
                valuePropName="checked"
                extra="管理员登录时需要二次验证"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="ipWhitelist"
                label="IP白名单"
                extra="管理员登录IP白名单，多个IP用逗号分隔"
              >
                <Input placeholder="127.0.0.1, 192.168.1.0/24" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSecuritySave} loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>系统设置</h2>
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  )
}

export default Settings
