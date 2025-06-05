export default async function handler(req, res) {
  try {
    const { code } = req.body || {};

    if (!code) {
      return res.status(400).json({ code: 4001, msg: "缺少 code 参数" });
    }

    const appId = process.env.FEISHU_APP_ID;
    const appSecret = process.env.FEISHU_APP_SECRET;

    if (!appId || !appSecret) {
      return res.status(500).json({ code: 5001, msg: "未配置飞书环境变量" });
    }

    const tokenResp = await fetch('https://open.feishu.cn/open-apis/authen/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${appId}:${appSecret}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ grant_type: 'authorization_code', code })
    });

    const tokenData = await tokenResp.json();

    if (!tokenData.data?.access_token) {
      return res.status(500).json({ msg: "获取 access_token 失败", raw: tokenData });
    }

    const accessToken = tokenData.data.access_token;

    const userResp = await fetch('https://open.feishu.cn/open-apis/authen/v1/user_info', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const userInfo = await userResp.json();
    res.status(200).json(userInfo.data || userInfo);
  } catch (err) {
    res.status(500).json({ msg: "服务异常", error: err.message || err.toString() });
  }
}
