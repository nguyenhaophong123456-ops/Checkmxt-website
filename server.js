const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let userPermissions = {};

app.post('/api/check-permission', (req, res) => {
    const { identifier } = req.body;
    if (!identifier) {
        return res.json({ success: false, message: "Vui lòng nhập UID hoặc Token!" });
    }

    const pkg = userPermissions[identifier] || 'FREE';
    let hasPro = (pkg === 'PRO' || pkg === 'BOTH');
    let hasPlus = (pkg === 'PLUS' || pkg === 'BOTH');

    let realUid = identifier;
    let realName = "Tài khoản Free Fire";

    if (identifier.length > 25) {
        realUid = "FF_" + identifier.substring(0, 8).toUpperCase();
        realName = "Acc_" + identifier.substring(identifier.length - 6);
    } else {
        realUid = identifier;
        realName = "UID: " + identifier;
    }

    res.json({
        success: true,
        package: pkg,
        hasPro: hasPro,
        hasPlus: hasPlus,
        info: `UID: ${realUid} | Tên NV: ${realName}`,
        message: "Tra cứu thành công tài khoản!"
    });
});

app.post('/api/admin/set-permission', (req, res) => {
    const { adminPass, targetUser, packageType } = req.body;

    if (adminPass !== "Maiyeuvu12345") {
        return res.json({ success: false, message: "❌ Mật khẩu Admin không đúng!" });
    }

    if (!targetUser) {
        return res.json({ success: false, message: "Vui lòng nhập tài khoản cần cấp!" });
    }

    if (packageType === 'RESET') {
        delete userPermissions[targetUser];
        return res.json({ success: true, message: `🔒 Đã thu hồi toàn bộ quyền của ${targetUser}` });
    }

    userPermissions[targetUser] = packageType;
    res.json({ success: true, message: `⚡ Đã cấp gói ${packageType} cho tài khoản: ${targetUser}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
