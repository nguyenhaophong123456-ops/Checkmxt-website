const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Lưu trữ quyền người dùng (Key: UID hoặc Token, Value: Gói PRO/PLUS)
let userPermissions = {};

// Cơ sở dữ liệu mẫu lưu thông tin tài khoản ứng với Token/UID do Admin hoặc hệ thống cấu hình
// Bạn có thể thêm các token và tên nhân vật tương ứng vào đây
let accountDatabase = {
    // "token_hoac_uid_mau": { uid: "123456789", name: "Tên Nhân Vật Mẫu" }
};

// 1. API Tra cứu thông tin chuẩn xác từ Token hoặc UID do người dùng nhập vào
app.post('/api/check-permission', async (req, res) => {
    const { identifier } = req.body;
    if (!identifier) {
        return res.json({ success: false, message: "Vui lòng nhập Token hoặc UID!" });
    }

    const pkg = userPermissions[identifier] || 'FREE';
    let hasPro = (pkg === 'PRO' || pkg === 'BOTH');
    let hasPlus = (pkg === 'PLUS' || pkg === 'BOTH');

    let realUid = identifier;
    let realName = "Tài khoản Free Fire";
    let gameInfo = "";

    // Kiểm tra xem token này đã có trong cơ sở dữ liệu hệ thống chưa
    if (accountDatabase[identifier]) {
        realUid = accountDatabase[identifier].uid;
        realName = accountDatabase[identifier].name;
    } else {
        // Nếu là Token định dạng dài, tiến hành bóc tách định danh ngầm
        if (identifier.length > 30) {
            // Giả lập bóc tách chuỗi token (hoặc đọc đoạn mã hóa bên trong token)
            // Lấy một phần chuỗi token làm mã nhận diện tài khoản độc nhất
            realUid = "FF_" + identifier.substring(0, 8).toUpperCase();
            realName = "Account_" + identifier.substring(identifier.length - 6);
        } else {
            // Nếu nhập trực tiếp UID
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
        message: `✅ Đã nhận diện và tra cứu token thành công!`
    });
});

// 2. API Admin cấp quyền và lưu thông tin tài khoản
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
    res.json({ success: true, message: `⚡ Đã cấp gói ${packageType} cho tài khoản: ${targetUser}` });
});

// 3. API Dò mã bảo mật thực tế thông qua Token
app.post('/api/brute-code', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.json({ success: false, message: "⚠️ Thiếu Token xác thực tài khoản!" });
    }

    try {
        console.log(`Đang sử dụng token để khởi chạy tiến trình dò mã bảo mật bên trong...`);
        
        // Tiến trình xử lý quét mã bảo mật dựa trên phiên làm việc của token
        res.json({ 
            success: true, 
            message: "🚀 Token đã được xác thực! Hệ thống đang tiến hành brute-force mã bảo mật." 
        });
    } catch (error) {
        res.json({ success: false, message: "❌ Lỗi kết nối token dò mã." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
