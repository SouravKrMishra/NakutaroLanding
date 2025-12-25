import { User } from "../../../shared/models/User.js";
import { OTP } from "../../../shared/models/OTP.js";

/**
 * Service to handle automatic cleanup of unverified user accounts
 */
export class UserCleanupService {
  /**
   * Delete unverified user accounts that are older than 7 days
   * Also cleans up associated OTP records
   */
  static async deleteExpiredUnverifiedUsers(): Promise<{
    deletedCount: number;
    deletedUsers: any[];
  }> {
    try {
      // Check if database is connected
      const mongoose = await import("mongoose");
      if (mongoose.default.connection.readyState !== 1) {
        return { deletedCount: 0, deletedUsers: [] };
      }

      // Calculate the cutoff time (7 days ago)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Find unverified users created more than 7 days ago
      const expiredUsers = await User.find({
        $or: [{ isVerified: false }, { isActive: false }],
        createdAt: { $lt: sevenDaysAgo },
      });

      if (expiredUsers.length === 0) {
        return { deletedCount: 0, deletedUsers: [] };
      }

      // Get emails of users to be deleted for OTP cleanup
      const emailsToDelete = expiredUsers.map((user) => user.email);

      // Delete associated OTP records first
      if (emailsToDelete.length > 0) {
        await OTP.deleteMany({ email: { $in: emailsToDelete } });
      }

      // Delete the unverified users
      const deleteResult = await User.deleteMany({
        $or: [{ isVerified: false }, { isActive: false }],
        createdAt: { $lt: sevenDaysAgo },
      });

      return {
        deletedCount: deleteResult.deletedCount,
        deletedUsers: expiredUsers.map((user) => ({
          id: user._id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          createdAt: user.createdAt,
        })),
      };
    } catch (error) {
      console.error("Error in deleteExpiredUnverifiedUsers:", error);
      // Return default values instead of throwing error to prevent scheduler crashes
      return { deletedCount: 0, deletedUsers: [] };
    }
  }

  /**
   * Get statistics about unverified users
   */
  static async getUnverifiedUserStats(): Promise<{
    totalUnverified: number;
    expiredUnverified: number;
    recentUnverified: number;
  }> {
    try {
      // Check if database is connected
      const mongoose = await import("mongoose");
      if (mongoose.default.connection.readyState !== 1) {
        return {
          totalUnverified: 0,
          expiredUnverified: 0,
          recentUnverified: 0,
        };
      }

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [totalUnverified, expiredUnverified, recentUnverified] =
        await Promise.all([
          User.countDocuments({
            $or: [{ isVerified: false }, { isActive: false }],
          }),
          User.countDocuments({
            $or: [{ isVerified: false }, { isActive: false }],
            createdAt: { $lt: sevenDaysAgo },
          }),
          User.countDocuments({
            $or: [{ isVerified: false }, { isActive: false }],
            createdAt: { $gte: sevenDaysAgo },
          }),
        ]);

      return {
        totalUnverified,
        expiredUnverified,
        recentUnverified,
      };
    } catch (error) {
      console.error("Error in getUnverifiedUserStats:", error);
      // Return default values instead of throwing error to prevent scheduler crashes
      return {
        totalUnverified: 0,
        expiredUnverified: 0,
        recentUnverified: 0,
      };
    }
  }

  /**
   * Manual cleanup method for testing or admin use
   */
  static async manualCleanup(): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }> {
    try {
      const result = await this.deleteExpiredUnverifiedUsers();

      return {
        success: true,
        message: `Successfully deleted ${result.deletedCount} expired unverified user accounts`,
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      console.error("Error in manualCleanup:", error);
      return {
        success: false,
        message: "Failed to perform manual cleanup",
        deletedCount: 0,
      };
    }
  }
}
