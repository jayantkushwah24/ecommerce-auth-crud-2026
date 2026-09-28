import UserModel from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/env.config.js";

export async function register(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "password and confirm password do not match",
      });
    }

    const user = await UserModel.findOne({ email });

    if (user) {
      return res.status(409).json({
        message: "user already exists",
      });
    }

    const newUser = await UserModel.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });

    return res.status(201).json({
      message: "user has been registered successfully",
      data: {
        user: {
          name: newUser.name,
          email: newUser.email,
        },
      },
    });
  } catch (error) {
    console.log("error in user registration", error);
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "user do not exists",
      });
    }

    if (user.isLoggedIn === true) {
      return res.status(400).json({
        message: "user already loggin in",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "incorrect email or password",
      });
    }

    let accessToken = jwt.sign({ userId: user._id }, config.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });

    let refreshToken = jwt.sign(
      { userId: user._id },
      config.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await UserModel.findOneAndUpdate(
      { _id: user._id },
      {
        refreshToken: await bcrypt.hash(refreshToken, 10),
        isLoggedIn: true,
      },
    );

    return res.status(200).json({
      message: "user logged in successfully",
      data: {
        user: {
          name: user.name,
          email: user.email,
        },
      },
      accessToken,
    });
  } catch (error) {
    console.log("error in login user", error);
  }
}

export async function refresh(req, res) {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const { userId } = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: "User does not exist",
      });
    }

    const verifyRefreshToken = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!verifyRefreshToken) {
      return res.status(401).json({
        message: "invalid refresh token",
      });
    }

    const accessToken = jwt.sign({ userId }, config.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });

    const newRefreshToken = jwt.sign({ userId }, config.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      // secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    return res.status(200).json({
      message: "token refresh successfully",
      accessToken,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Refresh token expired. Please login again." });
    }

    console.error("Refresh token error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function logout(req, res) {
  const userId = req.userId;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: "User does not exist",
      });
    }

    if (user.isLoggedIn === false) {
      return res.status(400).json({
        message: "user already logged out",
      });
    }

    user.refreshToken = null;
    user.isLoggedIn = false;
    await user.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      // secure: true,
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "user logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function me(req, res) {
  const userId = req.userId;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: "User does not exist",
      });
    }

    if (user.isLoggedIn === false) {
      return res.status(400).json({
        message: "user is logged out. please login",
      });
    }

    return res.status(200).json({
      message: "user details fetched successfully",
      data: {
        user: {
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {}
}
