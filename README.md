---

## 🚀 Features

- ✅ Team registration with unique team names
- ✅ OTP-based email verification for all team members
- ✅ Razorpay payment integration for event fees
- ✅ Secure API endpoints with input validation
- ✅ Production-ready Docker support
- ✅ AWS ECS Fargate deployment setup

---


## ⚙️ Tech Stack

| Layer         | Tech                         |
|--------------|------------------------------|
| Runtime       | Node.js 20                   |
| Framework     | Express.js                   |
| Database      | MongoDB with Mongoose        |
| Email Service | Nodemailer (Gmail SMTP)      |
| Payment       | Razorpay                     |
| Deployment    | Docker + AWS ECS (Fargate)   |

---

## 🔐 Environment Variables (`.env`)

Rename `.env.example` to `.env` and fill in your credentials.

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/team-event
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=your-email-app-password
RAZORPAY_KEY_ID=rzp_test_****
RAZORPAY_SECRET=your_razorpay_secret
