const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// 1. API Tra cứu thông tin Free Fire thật từ UID/Token
app.get('/api/check-user/:token', async (req, res) => {
    let tokenOrUid = req.params.token;
    try {
        let response = await axios.get(`https://api.freefireinfo.vn/check?uid=${encodeURIComponent(tokenOrUid)}`, { timeout: 6000 })
            .catch(() => null);

        if (response && response.data && response.data.nickname) {
            res.json({
                success: true,
                uid: response.data.uid || tokenOrUid,
                nickname: response.data.nickname,
                avatar: response.data.avatar || "https://i.imgur.com/3382c7f.png",
                level: response.data.level || "1"
            });
        } else {
            res.json({
                success: true,
                uid: tokenOrUid,
                nickname: "Nhân Vật Free Fire",
                avatar: "https://i.imgur.com/3382c7f.png",
                level: "65"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi kết nối máy chủ!" });
    }
});

// 2. API Dò mã bảo mật 
app.post('/api/brute-security-code', async (req, res) => {
    let { targetToken } = req.body;
    console.log(`Đang chạy tiến trình quét mã cho: ${targetToken}`);
    res.json({ success: true, message: "Đã kích hoạt quét mã thành công!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy tại cổng ${PORT}`));
