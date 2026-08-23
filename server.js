const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Lưu trữ quyền người dùng
let userPermissions = {};

// 1. API kiểm tra quyền và tra cứu thông tin token/UID
app.post('/api/check-permission', async (req, res) => {
    const { identifier } = req.body;
    if (!identifier) {
        return res.json({ success: false, message: "Vui lòng nhập UID hoặc Token!" });
    }

    const pkg = userPermissions[identifier] || 'FREE';
    let hasPro = (pkg === 'PRO' || pkg === 'BOTH');
    let hasPlus = (pkg === 'PLUS' || pkg === 'BOTH');

    // Xử lý tra cứu thực tế dựa trên input người dùng (Token hoặc UID)
    let accountInfo = `Đã kết nối thành công với tài khoản: ${identifier}`;
    
    // Bạn có thể tích hợp đoạn gọi API kiểm tra token Garena/Hệ thống ở đây nếu có sẵn endpoint API bên thứ 3.
    // Hiện tại server sẽ trả về trạng thái hợp lệ để mở khóa tính năng.

    res.json({
        success: true,
        package: pkg,
        hasPro: hasPro,
        hasPlus: hasPlus,
        info: accountInfo,
        message: `✅ Tra cứu thành công tài khoản!`
    });
});

// 2. API Admin cấp quyền
app.post('/api/admin/set-permission', (req, res) => {
    const { adminPass, targetUser, packageType } = req.body;

    if (adminPass !== "Maiyeuvu12345") {
        return res.json({ success: false, message: "❌ Mật khẩu Admin không đúng!" });
    }

    if (!targetUser) {
        return res.json({ success: false, message: "Vui lòng nhập UID hoặc tên tài khoản cần cấp!" });
    }

    if (packageType === 'RESET') {
        delete userPermissions[targetUser];
        return res.json({ success: true, message: `🔒 Đã thu hồi quyền của ${targetUser} (Về FREE)` });
    }

    userPermissions[targetUser] = packageType;
    res.json({ success: true, message: `⚡ Đã cấp gói ${packageType} cho: ${targetUser}` });
});

// 3. API xử lý Dò mã bảo mật (Brute Force mô phỏng thực tế hoặc quét API)
app.post('/api/brute-code', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.json({ success: false, message: "Chưa có Token hoặc UID để dò mã!" });
    }

    // Giả lập quá trình dò tìm mã chính xác từ server (hoặc tích hợp thuật toán vét cạn của bạn)
    // Server có thể chạy vòng lặp hoặc gọi API xử lý ngầm ở đây
    setTimeout(() => {
        // Trả về mã ngẫu nhiên đã dò thành công sau khi xử lý xong
        const foundCode = Math.floor(100000 + Math.random() * 900000);
        // Hoặc bạn có thể return kết quả ngay tại đây
    }, 2000);

    res.json({ success: true, message: "Đang tiến hành quét mã trên hệ thống..." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
