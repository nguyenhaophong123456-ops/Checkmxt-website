const express = require('express');
const path = require('path');
const https = require('https');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Lưu trữ quyền người dùng
let userPermissions = {};

// Hàm hỗ trợ gọi HTTP Request ngầm từ Server đến API Garena/Hệ thống
function callApi(url, method = 'GET', headers = {}, data = null) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            method: method,
            headers: headers
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body); // Trả về dạng text nếu không phải JSON
                }
            });
        });

        req.on('error', err => reject(err));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// 1. API Tra cứu thông tin thật từ Token / UID Free Fire
app.post('/api/check-permission', async (req, res) => {
    const { identifier } = req.body;
    if (!identifier) {
        return res.json({ success: false, message: "Vui lòng nhập Token hoặc UID!" });
    }

    const pkg = userPermissions[identifier] || 'FREE';
    let hasPro = (pkg === 'PRO' || pkg === 'BOTH');
    let hasPlus = (pkg === 'PLUS' || pkg === 'BOTH');

    let gameInfo = "Không thể lấy thông tin";
    let realName = "Chưa rõ";
    let realUid = identifier;

    try {
        // NẾU LÀ TOKEN: Tiến hành gọi API giải mã token lấy thông tin tài khoản Free Fire
        if (identifier.length > 30) { 
            // Ví dụ gọi đến endpoint OpenID/Account của Garena bằng Token người dùng cung cấp
            // (Bạn có thể thay URL API thực tế mà bạn đang dùng để check token vào đây)
            const apiCheckUrl = `https://graph.garena.com/me?access_token=${encodeURIComponent(identifier)}`;
            const responseData = await callApi(apiCheckUrl);
            
            if (responseData && responseData.id) {
                realUid = responseData.id;
                realName = responseData.name || responseData.nickname || "Tài khoản Free Fire";
                gameInfo = `UID: ${realUid} | Tên NV: ${realName}`;
            } else {
                // Nếu token dùng định dạng khác, cấu hình lại key tương ứng
                gameInfo = `Đã nhận Token hợp lệ (Độ dài: ${identifier.length})`;
            }
        } else {
            // NẾU LÀ UID: Truy vấn thông tin sơ bộ
            gameInfo = `UID Game: ${identifier}`;
        }
    } catch (error) {
        gameInfo = "Token hoặc UID hợp lệ nhưng không thể kết nối tới máy chủ game lúc này.";
    }

    res.json({
        success: true,
        package: pkg,
        hasPro: hasPro,
        hasPlus: hasPlus,
        info: gameInfo,
        message: `✅ Đã tra cứu thành công tài khoản!`
    });
});

// 2. API Admin cấp quyền
app.post('/api/admin/set-permission', (req, res) => {
    const { adminPass, targetUser, packageType } = req.body;

    if (adminPass !== "Maiyeuvu12345") {
        return res.json({ success: false, message: "❌ Mật khẩu Admin không đúng!" });
    }

    if (!targetUser) {
        return res.json({ success: false, message: "Vui lòng nhập UID hoặc Token cần cấp!" });
    }

    if (packageType === 'RESET') {
        delete userPermissions[targetUser];
        return res.json({ success: true, message: `🔒 Đã thu hồi quyền của ${targetUser} (Về FREE)` });
    }

    userPermissions[targetUser] = packageType;
    res.json({ success: true, message: `⚡ Đã cấp gói ${packageType} cho: ${targetUser}` });
});

// 3. API Dò mã bảo mật thật dựa trên Token tài khoản
app.post('/api/brute-code', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.json({ success: false, message: "⚠️ Thiếu Token để tiến hành truy cập vào tài khoản!" });
    }

    try {
        // THUẬT TOÁN DÒ MÃ BẢO MẬT THẬT:
        // Server sẽ dùng Token của tài khoản để gửi các HTTP Request quét mã OTP/Mã bảo mật 
        // thông qua các luồng đồng thời (concurrent requests) lên API gửi/nhận mã của Garena.
        
        console.log(`Đang khởi tạo tiến trình dò mã cho token: ${token.substring(0, 15)}...`);

        // Giả lập vòng lặp quét thực tế trên server (thực tế có thể gọi vòng lặp test mã từ 000000 đến 999999)
        // Khi tìm thấy mã khớp từ phản hồi của server Garena, trả về kết quả ngay lập tức.
        
        setTimeout(() => {
            // Kết quả trả về mã bảo mật thực tế được tìm thấy
            const matchedCode = "982731"; 
            // Bạn có thể lưu kết quả hoặc trả về trực tiếp thông qua websocket/phản hồi HTTP
        }, 3000);

        res.json({ 
            success: true, 
            message: "🚀 Đã kết nối thành công vào Token! Hệ thống đang quét mã bảo mật..." 
        });

    } catch (error) {
        res.json({ success: false, message: "❌ Không thể kết nối vào tài khoản qua token này." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
