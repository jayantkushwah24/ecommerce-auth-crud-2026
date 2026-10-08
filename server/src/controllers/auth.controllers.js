import UserModel from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/env.config.js";

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearRefreshCookie = (res) =>
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

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
    if (error.code === 11000) {
      return res.status(409).json({
        message: "user already exists",
      });
    }

    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        message: "incorrect email or password",
      });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      config.JWT_ACCESS_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      config.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      },
    );

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    user.isLoggedIn = true;
    await user.save();

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

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
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function refresh(req, res) {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const { userId } = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);

    const user = await UserModel.findById(userId);

    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({
        message: "User does not exist",
      });
    }

    if (!user.isLoggedIn || !user.refreshToken) {
      clearRefreshCookie(res);
      return res.status(401).json({
        message: "Refresh token is no longer valid. Please login again.",
      });
    }

    const verifyRefreshToken = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!verifyRefreshToken) {
      clearRefreshCookie(res);
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

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

    return res.status(200).json({
      message: "token refresh successfully",
      accessToken,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      try {
        const decodedToken = jwt.decode(refreshToken);
        if (
          decodedToken &&
          typeof decodedToken === "object" &&
          decodedToken.userId
        ) {
          const user = await UserModel.findById(decodedToken.userId);
          if (
            user?.refreshToken &&
            (await bcrypt.compare(refreshToken, user.refreshToken))
          ) {
            user.refreshToken = null;
            user.isLoggedIn = false;
            await user.save();
          }
        }
      } catch (cleanupError) {
        console.error("Error cleaning up expired refresh token:", cleanupError);
        return res.status(500).json({ message: "Internal server error" });
      }

      clearRefreshCookie(res);
      return res
        .status(401)
        .json({ message: "Refresh token expired. Please login again." });
    }

    if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Invalid refresh token" });
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

    clearRefreshCookie(res);

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
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
