const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Thay API Key của bạn vào đây
const API_KEY = 'YOUR_API_KEY'; 

app.get('/api/check-user/:input', async (req, res) => {
    let userInput = req.params.input.trim();
    let targetUid = userInput;

    try {
        // Nếu chuỗi nhập vào dài (đặc trưng của Token), ta cần suy ra UID hoặc xử lý giải mã token
        // (Tuỳ thuộc vào định dạng token của bạn, ví dụ: nếu token chứa UID bên trong hoặc cần gọi api đổi token lấy uid)
        if (userInput.length > 30) {
            // Đoạn này giả lập logic trích xuất UID từ Token hoặc gọi API đổi token lấy UID
            // Ví dụ: targetUid = extractUidFromToken(userInput);
            // Nếu token dạng cơ bản, bạn có thể tích hợp hàm bóc tách JWT/Access token tại đây.
            
            // Tạm thời nếu là token, hệ thống sẽ dùng endpoint giải mã token Garena của bạn (nếu có)
            // Hoặc nếu API của bạn hỗ trợ truyền token trực tiếp trong header:
        }

        // Gọi trực tiếp đến API Free Fire bằng UID
        const url = `https://developers.freefirecommunity.com/api/v1/info?region=sg&uid=${encodeURIComponent(targetUid)}`;
        
        let response = await axios.get(url, {
            headers: {
                'x-api-key': API_KEY
            },
            timeout: 6000
        });

        if (response && response.data) {
            res.json({
                success: true,
                uid: response.data.uid || targetUid,
                nickname: response.data.nickname || response.data.name || "Không rõ tên",
                avatar: response.data.avatar || "https://i.imgur.com/3382c7f.png",
                level: response.data.level || "1"
            });
        } else {
            res.json({ success: false, message: "Không tìm thấy dữ liệu tài khoản!" });
        }
    } catch (error) {
        console.error('Lỗi gọi API:', error.message);
        res.status(500).json({ success: false, message: "Lỗi kết nối hoặc Token/UID không hợp lệ!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy tại cổng ${PORT}`));
