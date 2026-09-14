export interface Subscriber {
  id: string;
  email: string;
  name: string;
  frequency: 'daily' | 'weekly';
  status: 'active' | 'unsubscribed';
  subscribedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribeAudienceInput {
  email: string;
  name?: string;
  frequency?: 'daily' | 'weekly';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
}

export interface CreateContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}
