const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Bộ nhớ tạm thời lưu gói cước của các UID
let userPermissions = {};

// API kiểm tra trạng thái
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', message: 'Server HIHI MXT đang hoạt động ổn định!' });
});

// API kiểm tra gói của người dùng khi họ nhập UID/Token vào ô Check
app.get('/api/check-user/:uid', (req, res) => {
    const uid = decodeURIComponent(req.params.uid);
    const pkg = userPermissions[uid] || 'FREE (Chưa nâng cấp)';
    res.json({ success: true, uid: uid, package: pkg });
});

// API cấp quyền cho UID từ bảng Admin Panel
app.post('/api/admin/set-permission', (req, res) => {
    try {
        const { adminPass, targetUser, packageType } = req.body;

        if (adminPass !== "Maiyeuvu12345") {
            return res.status(401).json({ success: false, message: "❌ Mật khẩu Admin không chính xác!" });
        }

        if (!targetUser) {
            return res.status(400).json({ success: false, message: "❌ Vui lòng nhập UID hoặc Token tài khoản cần cấp!" });
        }

        if (packageType === 'RESET') {
            delete userPermissions[targetUser];
            return res.json({ success: true, message: `🔄 Đã thu hồi quyền, đưa tài khoản ${targetUser} về FREE!` });
        }

        // Lưu quyền vào server
        userPermissions[targetUser] = packageType;
        return res.json({ success: true, message: `✅ Đã cấp gói [${packageType}] cho tài khoản: ${targetUser}` });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ success: false, message: "❌ Lỗi hệ thống server nội bộ!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server HIHI MXT đang chạy tại cổng: ${PORT}`);
});
