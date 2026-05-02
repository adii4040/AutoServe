import axiosInstance from '../axiosInstance';

const FORGOT_PASSWORD_BASE = '/user';

/**
 * Request a forgot password reset link
 * @param {string} email - User email
 * @returns {Promise} Success response
 */
export async function requestForgotPassword(email) {
  try {
    const res = await axiosInstance.post(`${FORGOT_PASSWORD_BASE}/request-forgot-password`, { email });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send reset link');
  }
}

/**
 * Reset password with forgot password token
 * @param {string} forgotPasswordToken - Token from reset link
 * @param {string} password - New password
 * @returns {Promise} Success response
 */
export async function resetForgotPassword(forgotPasswordToken, password) {
  try {
    const res = await axiosInstance.put(
      `${FORGOT_PASSWORD_BASE}/${forgotPasswordToken}/reset-forgot-password`,
      { password }
    );
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reset password');
  }
}
