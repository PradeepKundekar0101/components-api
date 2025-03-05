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

        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "riderghost10791@gmail.com",
          to: [email],
          subject: "Verify Your Email",
          html: `<p>Your OTP for email verification is: <strong>${otp}</strong></p>`,
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

    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // const otpExpiry = new Date();
    // otpExpiry.setMinutes(otpExpiry.getMinutes() + 2); // OTP expires in 2 minutes

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Save user with OTP
    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      phone,
      verified: true,
      // otp,
      // otpExpiry,
    });

    await newUser.save();

    // const resend = new Resend(process.env.RESEND_API_KEY);

    // await resend.emails.send({
    //   from: "riderghost10791@gmail.com",
    //   to: [email],
    //   subject: "Verify Your Email",
    //   html: `<p>Your OTP for email verification is: <strong>${otp}</strong></p>`,
    // });

    res.status(201).json({ message: "User registered successfully" });
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
    // const { email } = req.body;
    // const user = await User.findOne({ email });

    // if (!user) {
    //   res.status(404).json({ message: "User not found" });
    //   return;
    // }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // Expires in 2 min

    // user.otp = otp;
    // user.otpExpiry = otpExpiry;
    // await user.save();

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
    to: ['delivered@resend.dev'],
      subject: "Verify Your Email",
      html: `<p>Your OTP for email verification is: <strong>${otp}</strong></p>`,
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
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
