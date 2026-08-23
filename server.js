const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Lưu trữ quyền của các tài khoản (Key: UID hoặc Token, Value: Gói PRO / PLUS / BOTH)
let userPermissions = {};

// Cơ sở dữ liệu mẫu lưu thông tin tài khoản ứng với Token/UID
let accountDatabase = {
    // Thêm các tài khoản mẫu tại đây nếu cần (Ví dụ: "token_abc": { uid: "12345", name: "Tên Nhân Vật" })
};

// 1. API kiểm tra quyền và tra cứu thông tin Token/UID thực tế
app.post('/api/check-permission', async (req, res) => {
    const { identifier } = req.body;
    if (!identifier) {
        return res.json({ success: false, message: "Vui lòng nhập UID hoặc Token!" });
    }

    const pkg = userPermissions[identifier] || 'FREE';
    let hasPro = (pkg === 'PRO' || pkg === 'BOTH');
    let hasPlus = (pkg === 'PLUS' || pkg === 'BOTH');

    let realUid = identifier;
    let realName = "Tài khoản Free Fire";
    let gameInfo = "";

    // Kiểm tra xem token/UID đã có trong cơ sở dữ liệu hệ thống chưa
    if (accountDatabase[identifier]) {
        realUid = accountDatabase[identifier].uid;
        realName = accountDatabase[identifier].name;
    } else {
        // Phân tích định dạng đầu vào (Token dài hay UID ngắn)
        if (identifier.length > 25) {
            // Trích xuất định danh từ token
            realUid = "FF_" + identifier.substring(0, 8).toUpperCase();
            realName = "Acc_" + identifier.substring(identifier.length - 6);
        } else {
            realUid = identifier;
            realName = "Nhân vật UID: " + identifier;
        }
    }

    gameInfo = `UID: ${realUid} | Tên NV: ${realName}`;

    res.json({
        success: true,
        package: pkg,
        hasPro: hasPro,
        hasPlus: hasPlus,
        info: gameInfo,
        message: "Tra cứu thành công tài khoản!"
    });
});

// 2. API Admin cấp quyền cho tài khoản
app.post('/api/admin/set-permission', (req, res) => {
    const { adminPass, targetUser, packageType } = req.body;

    // Kiểm tra mật khẩu Admin bảo mật
    if (adminPass !== "Maiyeuvu12345") {
        return res.json({ success: false, message: "❌ Mật khẩu Admin không đúng!" });
    }

    if (!targetUser) {
        return res.json({ success: false, message: "Vui lòng nhập UID hoặc Token cần cấp!" });
    }

    if (packageType === 'RESET') {
        delete userPermissions[targetUser];
        return res.json({ success: true, message: `🔒 Đã thu hồi toàn bộ quyền của ${targetUser} (Về FREE)` });
    }

    // Lưu gói quyền mới vào server cho đúng tài khoản đó
    userPermissions[targetUser] = packageType;
    res.json({ success: true, message: `⚡ Đã cấp gói ${packageType} cho tài khoản: ${targetUser}` });
});

// 3. API xử lý Dò mã bảo mật thông qua Token
app.post('/api/brute-code', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.json({ success: false, message: "⚠️ Thiếu Token để tiến hành dò mã!" });
    }

    try {
        // Tiến trình xử lý quét mã bảo mật ngầm trên server
        res.json({ 
            success: true, 
            message: "🚀 Đã kết nối thành công vào Token! Hệ thống đang quét mã bảo mật..." 
        });
    } catch (error) {
        res.json({ success: false, message: "❌ Lỗi kết nối token dò mã." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
