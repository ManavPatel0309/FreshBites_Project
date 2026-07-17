import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AddWallet = () => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const [upiId, setUpiId] = useState("");
  const [showQr, setShowQr] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const balance =
      Number(user.walletBalance || localStorage.getItem("walletBalance")) || 0;

    setCurrentBalance(balance);
  }, [navigate]);

  const resetPaymentSteps = () => {
    setShowQr(false);
    setOtpSent(false);
    setOtp("");
  };

  const addMoneyToWallet = async () => {
    try {
      if (loading) return;

      const money = Number(amount);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!money || money <= 0) {
        alert("Enter valid amount");
        return;
      }

      setLoading(true);

      const response = await fetch(
        `${process.env.REACT_APP_API || "http://localhost:5000"}/api/auth/wallet/add`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: money,
            paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const newBalance = Number(data.walletBalance || 0);

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          const oldUser = JSON.parse(localStorage.getItem("user")) || {};
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...oldUser,
              walletBalance: newBalance,
            })
          );
        }

        localStorage.setItem("walletBalance", String(newBalance));
        setCurrentBalance(newBalance);

        window.dispatchEvent(new Event("profileUpdated"));
        window.dispatchEvent(new Event("walletUpdated"));

        alert("Money added to wallet successfully ✅");
        navigate("/profile");
      } else {
        alert(data.message || "Wallet update failed");
      }
    } catch (error) {
      console.log("Add Wallet Error:", error);
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();

    const money = Number(amount);

    if (!money || money <= 0) {
      alert("Enter valid amount");
      return;
    }

    if (paymentMethod === "upi") {
      if (!upiId.trim()) {
        alert("Enter UPI ID");
        return;
      }

      setShowQr(true);
      setOtpSent(false);
      return;
    }

    if (paymentMethod === "card") {
      if (!cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
        alert("Enter card details");
        return;
      }

      if (cardNumber.length !== 16) {
        alert("Card number must be 16 digits");
        return;
      }

      if (cvv.length !== 3) {
        alert("CVV must be 3 digits");
        return;
      }

      setOtpSent(true);
      setShowQr(false);
      alert("Demo OTP sent: 123456");
    }
  };

  const verifyOtpAndPay = async () => {
    if (otp !== "123456") {
      alert("Invalid OTP ❌");
      return;
    }

    await addMoneyToWallet();
  };

  const confirmUpiPayment = async () => {
    await addMoneyToWallet();
  };

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h2>💰 Add Money To Wallet</h2>

        <div className="wallet-balance-box">
          <h4>Current Wallet Balance</h4>
          <h2>₹{currentBalance.toFixed(2)}</h2>
        </div>

        <form onSubmit={handleAddMoney}>
          <input
            type="number"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              resetPaymentSteps();
            }}
            required
          />

          <h3>Payment Method</h3>

          <div className="payment-options">
            <label>
              <input
                type="radio"
                value="upi"
                checked={paymentMethod === "upi"}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  resetPaymentSteps();
                }}
              />
              UPI / Google Pay / PhonePe / Paytm
            </label>

            <label>
              <input
                type="radio"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  resetPaymentSteps();
                }}
              />
              Credit / Debit Card
            </label>
          </div>

          {paymentMethod === "upi" && (
            <>
              <input
                type="text"
                placeholder="Enter UPI ID"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  setShowQr(false);
                }}
                required
              />

              {showQr && (
                <div className="upi-box">
                  <h3>Scan QR Code</h3>

                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=${upiId}&pn=FreshBites&am=${amount}`}
                    alt="UPI QR"
                  />

                  <p>Pay ₹{Number(amount || 0).toFixed(2)}</p>

                  <button
                    type="button"
                    className="pay-now-btn"
                    onClick={confirmUpiPayment}
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "✅ I Have Paid"}
                  </button>
                </div>
              )}
            </>
          )}

          {paymentMethod === "card" && (
            <>
              <input
                type="text"
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(e.target.value.replace(/\D/g, ""))
                }
                maxLength="16"
                required
              />

              <input
                type="text"
                placeholder="Expiry MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                maxLength="5"
                required
              />

              <input
                type="password"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                maxLength="3"
                required
              />

              {otpSent && (
                <>
                  <input
                    type="text"
                    placeholder="Enter OTP 123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                  />

                  <button
                    type="button"
                    className="pay-now-btn"
                    onClick={verifyOtpAndPay}
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "✅ Verify OTP & Add Money"}
                  </button>
                </>
              )}
            </>
          )}

          {!showQr && !otpSent && (
            <button className="pay-now-btn" type="submit" disabled={loading}>
              {paymentMethod === "upi"
                ? `Generate QR ₹${Number(amount || 0).toFixed(2)}`
                : `Send OTP ₹${Number(amount || 0).toFixed(2)}`}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddWallet;