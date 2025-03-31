import { Resend } from "resend";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { firstname, lastname, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.verified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 2); // OTP expires in 2 minutes

        existingUser.otp = otp;
        existingUser.otpExpiry = otpExpiry;
        await existingUser.save();

        if (!process.env.FROM_MAIL) {
          throw new Error("FROM_MAIL environment variable is not set");
        }
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.FROM_MAIL,
          to: [email],
          subject: "Verify Your Email",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .logo { max-width: 200px; height: auto; }
                .content { background-color: #f9f9f9; padding: 30px; border-radius: 8px; }
                .otp { font-size: 32px; font-weight: bold; text-align: center; color: #bb282a; 
                      letter-spacing: 5px; margin: 20px 0; padding: 15px; background-color: #f0f0f0; 
                      border-radius: 4px; }
                .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
                .button { background-color: #bb282a; color: white; padding: 12px 30px; 
                         text-decoration: none; border-radius: 4px; font-weight: bold; 
                         display: inline-block; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <img src="https://components101.com/sites/default/files/components101_logo_2.png" alt="Components101 Logo" class="logo">
                </div>
                <div class="content">
                  <h2>Verify Your Email</h2>
                  <p>Thank you for registering with Components101. Please use the verification code below to complete your registration:</p>
                  <div class="otp">${otp}</div>
                  <p>This code will expire in 2 minutes. If you didn't request this code, please ignore this email.</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Components101. All rights reserved.</p>
                  <p>If you have any questions, please contact our support team.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        res.status(200).json({
          message:
            "User already registered but not verified. A new OTP has been sent.",
        });
        return;
      }

      res.status(400).json({ message: "User already exists" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 2); // OTP expires in 2 minutes

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Save user with OTP
    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      phone,
      verified: false,
      otp,
      otpExpiry,
    });

    await newUser.save();
    if (!process.env.FROM_MAIL) {
      throw new Error("FROM_MAIL environment variable is not set");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.FROM_MAIL,
      to: [email],
      subject: "Verify Your Email",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { max-width: 200px; height: auto; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 8px; }
            .otp { font-size: 32px; font-weight: bold; text-align: center; color: #bb282a; 
                  letter-spacing: 5px; margin: 20px 0; padding: 15px; background-color: #f0f0f0; 
                  border-radius: 4px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
            .button { background-color: #bb282a; color: white; padding: 12px 30px; 
                     text-decoration: none; border-radius: 4px; font-weight: bold; 
                     display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://components101.com/sites/default/files/components101_logo_2.png" alt="Components101 Logo" class="logo">
            </div>
            <div class="content">
              <h2>Verify Your Email</h2>
              <p>Thank you for registering with Components101. Please use the verification code below to complete your registration:</p>
              <div class="otp">${otp}</div>
              <p>This code will expire in 2 minutes. If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Components101. All rights reserved.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET as string
    );
    res.status(201).json({
      message: "User registered successfully",
      token,
      userId: newUser._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.otp !== otp || new Date() > (user.otpExpiry ?? new Date(0))) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    user.verified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendOtpResend = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // Expires in 2 min

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_MAIL!,
      to: [email],
      subject: "Verify Your Email",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { max-width: 200px; height: auto; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 8px; }
            .otp { font-size: 32px; font-weight: bold; text-align: center; color: #bb282a; 
                  letter-spacing: 5px; margin: 20px 0; padding: 15px; background-color: #f0f0f0; 
                  border-radius: 4px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
            .button { background-color: #bb282a; color: white; padding: 12px 30px; 
                     text-decoration: none; border-radius: 4px; font-weight: bold; 
                     display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://components101.com/sites/default/files/components101_logo_2.png" alt="Components101 Logo" class="logo">
            </div>
            <div class="content">
              <h2>Verify Your Email</h2>
              <p>Thank you for registering with Components101. Please use the verification code below to complete your registration:</p>
              <div class="otp">${otp}</div>
              <p>This code will expire in 2 minutes. If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Components101. All rights reserved.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    if (error) {
      console.error({ error });
    }
    console.log(data);
    res.status(200).json({ message: "New OTP sent to your email." });
  } catch (error) {
    console.error("Error in sendOtp", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("first");
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    if (!user.verified) {
      res.status(403).json({
        message: "Email not verified. Please verify your email first.",
      });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // OTP expires in 2 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    if (!process.env.FROM_MAIL) {
      throw new Error("FROM_MAIL environment variable is not set");
    }

    // Send OTP email
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.FROM_MAIL,
      to: [email],
      subject: "Reset Your Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { max-width: 200px; height: auto; }
            .content { background-color: #f9f9f9; padding: 30px; border-radius: 8px; }
            .otp { font-size: 32px; font-weight: bold; text-align: center; color: #bb282a; 
                  letter-spacing: 5px; margin: 20px 0; padding: 15px; background-color: #f0f0f0; 
                  border-radius: 4px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
            .button { background-color: #bb282a; color: white; padding: 12px 30px; 
                     text-decoration: none; border-radius: 4px; font-weight: bold; 
                     display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://components101.com/sites/default/files/components101_logo_2.png" alt="Components101 Logo" class="logo">
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password. Please use the verification code below:</p>
              <div class="otp">${otp}</div>
              <p>This code will expire in 2 minutes. If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Components101. All rights reserved.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    res.status(200).json({ message: "Reset OTP sent to your email" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("-password"); // Exclude password

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Generate login token after password reset
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string
    );

    res
      .status(200)
      .json({ message: "Password reset and login successful", token, user });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
