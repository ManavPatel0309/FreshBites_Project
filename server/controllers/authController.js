const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= USER RESPONSE HELPER =================
const getUserResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  dob: user.dob || "",
  altPhone: user.alt_phone || "",
  age: user.age || "",
  address: user.address || "",
  profilePhoto: user.profile_photo || "",
  walletBalance: Number(user.wallet_balance || 0),
  createdAt: user.created_at || "",
});

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, phone = "", dob = null, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users
       (name, email, password, phone, dob, wallet_balance)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone, dob || null, 0]
    );

    res.status(201).json({
      success: true,
      message: "Registration Successful",
    });
  } catch (error) {
    console.log("Register Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET || "mysecretkey",
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: getUserResponse(user),
    });
  } catch (error) {
    console.log("Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: getUserResponse(rows[0]),
    });
  } catch (error) {
    console.log("Get Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      phone,
      dob,
      altPhone,
      age,
      address,
      profilePhoto,
    } = req.body;

    await db.query(
      `UPDATE users
       SET
       name = ?,
       phone = ?,
       dob = ?,
       alt_phone = ?,
       age = ?,
       address = ?,
       profile_photo = ?
       WHERE id = ?`,
      [
        name || "",
        phone || "",
        dob || null,
        altPhone || "",
        age || null,
        address || "",
        profilePhoto || "",
        userId,
      ]
    );

    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    res.status(200).json({
      success: true,
      message: "Profile Updated",
      user: getUserResponse(rows[0]),
    });
  } catch (error) {
    console.log("Update Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ================= ADD WALLET MONEY =================
exports.addWalletMoney = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, paymentMethod = "wallet" } = req.body;

    const addAmount = Number(amount);

    if (!addAmount || addAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const [users] = await db.query(
      "SELECT id, wallet_balance FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldBalance = Number(users[0].wallet_balance || 0);
    const newBalance = oldBalance + addAmount;

    await db.query("UPDATE users SET wallet_balance = ? WHERE id = ?", [
      newBalance,
      userId,
    ]);

    await db.query(
      `INSERT INTO wallet_transactions
       (user_id, type, amount, old_balance, new_balance, payment_method, note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        "add",
        addAmount,
        oldBalance,
        newBalance,
        paymentMethod,
        "Customer added wallet money",
      ]
    );

    const [rows] =await db.query(
  `INSERT INTO users
   (name, email, password, phone, dob, wallet_balance)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [name, email, hashedPassword, phone, dob || null, 0]
);

    res.status(200).json({
      success: true,
      message: "Wallet Updated",
      walletBalance: Number(rows[0].wallet_balance || 0),
      user: getUserResponse(rows[0]),
    });
  } catch (error) {
    console.log("Wallet Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};