const express = require('express');
const path = require('path');
const app = express();

// Middleware xử lý JSON và Static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Biến lưu trữ phân quyền user tạm thời trong bộ nhớ server
let userPermissions = {};

// API kiểm tra trạng thái server
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', message: 'Server HIHI MXT đang hoạt động ổn định!' });
});

// API xử lý cấp quyền tài khoản từ Admin Panel
app.post('/api/admin/set-permission', (req, res) => {
    try {
        const { adminPass, targetUser, packageType } = req.body;

        // Kiểm tra mật khẩu Admin
        if (adminPass !== "Maiyeuvu12345") {
            return res.status(401).json({ success: false, message: "❌ Mật khẩu Admin không chính xác!" });
        }

        if (!targetUser) {
            return res.status(400).json({ success: false, message: "❌ Vui lòng nhập UID hoặc Token tài khoản!" });
        }

        // Lưu phân quyền vào bộ nhớ
        userPermissions[targetUser] = packageType;

        let msg = `✅ Đã cấp gói [${packageType}] cho tài khoản: ${targetUser}`;
        if (packageType === 'RESET') {
            delete userPermissions[targetUser];
            msg = `🔄 Đã thu hồi quyền, đưa tài khoản ${targetUser} về mức FREE!`;
        }

        return res.json({ success: true, message: msg });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ success: false, message: "❌ Lỗi hệ thống server nội bộ!" });
    }
});

// API kiểm tra quyền của user khi check token
app.get('/api/check-user/:uid', (req, res) => {
    const uid = req.params.uid;
    const pkg = userPermissions[uid] || 'FREE';
    res.json({ success: true, uid: uid, package: pkg });
});

// Khởi động Server trên cổng Render/Glitch/Local cung cấp
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server HIHI MXT đang chạy tại cổng: ${PORT}`);
});
