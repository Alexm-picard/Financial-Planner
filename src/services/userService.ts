import api from './api';

export interface CustomUserIdResponse {
  customUserId: string | null;
  systemUserId: string;
}

export interface CheckAvailabilityResponse {
  available: boolean;
}

export const userService = {
  /**
   * Get current user's custom ID
   */
  async getCustomUserId(userId: string): Promise<CustomUserIdResponse> {
    const response = await api.get(`/users/me/custom-id?userId=${userId}`) as any;
    return {
      customUserId: response.customUserId,
      systemUserId: response.systemUserId
    };
  },

  /**
   * Check if a custom user ID is available
   */
  async checkCustomUserIdAvailability(userId: string, customUserId: string): Promise<boolean> {
    const response = await api.post(`/users/me/custom-id/check?userId=${userId}`, {
      customUserId
    }) as any;
    return response.available;
  },

  /**
   * Update current user's custom ID
   */
  async updateCustomUserId(userId: string, customUserId: string): Promise<string> {
    const response = await api.put(`/users/me/custom-id?userId=${userId}`, {
      customUserId
    }) as any;
    return response.customUserId;
  },

  /**
   * Update current user's display name
   */
  async updateDisplayName(userId: string, displayName: string): Promise<string> {
    const response = await api.put(`/users/me/display-name?userId=${userId}`, {
      displayName
    }) as any;
    return response.displayName;
  }
};
