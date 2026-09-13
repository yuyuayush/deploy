export interface NotificationItem {
  id: string;
  recipientEmail: string;
  senderName: string;
  senderEmail?: string | null;
  type: string;
  postId?: string | null;
  postContent?: string | null;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationInput {
  recipientEmail: string;
  senderName: string;
  senderEmail?: string;
  type: string;
  postId?: string;
  postContent?: string;
  message: string;
}
