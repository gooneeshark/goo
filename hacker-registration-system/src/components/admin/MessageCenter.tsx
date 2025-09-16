import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ModernButton from '../ui/ModernButton';
import { SendIcon, CheckIcon, XIcon } from '../ui/Icons';

interface User {
  id: string;
  email: string;
  profiles?: {
    display_name: string;
    hacker_level: number;
  };
}

interface MessageTemplate {
  id: string;
  name: string;
  title_template: string;
  content_template: string;
  message_type: string;
  priority: string;
  category: string;
  variables: string[];
}

const MessageCenter: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [messageForm, setMessageForm] = useState({
    title: '',
    content: '',
    message_type: 'info' as 'info' | 'warning' | 'error' | 'success' | 'announcement',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    category: 'general',
    scheduled_for: '',
    expires_at: '',
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
    loadTemplates();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          `
          id,
          display_name,
          hacker_level,
          users!inner(email)
        `
        )
        .order('display_name');

      if (error) throw error;

      const formattedUsers =
        data?.map((profile: any) => ({
          id: profile.id,
          email: profile.users?.email || '',
          profiles: {
            display_name: profile.display_name,
            hacker_level: profile.hacker_level,
          },
        })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMessageForm({
        ...messageForm,
        title: template.title_template,
        content: template.content_template,
        message_type: template.message_type as
          | 'info'
          | 'warning'
          | 'error'
          | 'success'
          | 'announcement',
        priority: template.priority as 'low' | 'normal' | 'high' | 'urgent',
        category: template.category,
      });
      setSelectedTemplate(templateId);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(u => u.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const sendMessages = async () => {
    if (!messageForm.title.trim() || !messageForm.content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please select at least one recipient');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check rate limit first
      const { error: rateLimitError } = await supabase.rpc('check_message_rate_limit');

      if (rateLimitError) {
        throw new Error(rateLimitError.message);
      }

      const senderName = user?.email || 'Admin';

      // Send message to each selected user
      const promises = selectedUsers.map(userId =>
        supabase.rpc('send_message_to_user', {
          p_recipient_id: userId,
          p_title: messageForm.title,
          p_content: messageForm.content,
          p_message_type: messageForm.message_type,
          p_priority: messageForm.priority,
          p_category: messageForm.category,
          p_sender_name: senderName,
          p_scheduled_for: messageForm.scheduled_for || null,
          p_expires_at: messageForm.expires_at || null,
        })
      );

      await Promise.all(promises);

      setSuccess(`Successfully sent message to ${selectedUsers.length} users`);

      // Reset form
      setMessageForm({
        title: '',
        content: '',
        message_type: 'info' as 'info' | 'warning' | 'error' | 'success' | 'announcement',
        priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
        category: 'general',
        scheduled_for: '',
        expires_at: '',
      });
      setSelectedUsers([]);
      setSelectedTemplate('');
    } catch (error) {
      console.error('Error sending messages:', error);
      setError('Failed to send messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="message-center">
      <div className="terminal-header">
        <h2 className="text-green-400 text-xl font-bold mb-4">
          [MESSAGE CENTER] - ADMIN COMMUNICATIONS
        </h2>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-400 text-red-100 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900 border border-green-400 text-green-100 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Composition */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-green-400 rounded p-4">
            <h3 className="text-green-400 font-bold mb-4">COMPOSE MESSAGE</h3>

            {/* Template Selection */}
            <div className="mb-4">
              <label className="block text-green-400 text-sm font-bold mb-2">
                MESSAGE TEMPLATE:
              </label>
              <select
                value={selectedTemplate}
                onChange={e => handleTemplateSelect(e.target.value)}
                className="w-full bg-black border border-green-400 text-green-400 p-2 rounded font-mono"
                title="Select message template"
              >
                <option value="">-- Select Template --</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-green-400 text-sm font-bold mb-2">TITLE:</label>
                <input
                  type="text"
                  value={messageForm.title}
                  onChange={e => setMessageForm({ ...messageForm, title: e.target.value })}
                  className="w-full bg-black border border-green-400 text-white p-2 rounded font-mono"
                  placeholder="Message title..."
                />
              </div>

              <div>
                <label className="block text-green-400 text-sm font-bold mb-2">CONTENT:</label>
                <textarea
                  value={messageForm.content}
                  onChange={e => setMessageForm({ ...messageForm, content: e.target.value })}
                  rows={8}
                  className="w-full bg-black border border-green-400 text-white p-2 rounded font-mono"
                  placeholder="Message content..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-green-400 text-sm font-bold mb-2">TYPE:</label>
                  <select
                    value={messageForm.message_type}
                    onChange={e =>
                      setMessageForm({
                        ...messageForm,
                        message_type: e.target.value as
                          | 'info'
                          | 'warning'
                          | 'error'
                          | 'success'
                          | 'announcement',
                      })
                    }
                    className="w-full bg-black border border-green-400 text-green-400 p-2 rounded font-mono"
                    title="Select message type"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="success">Success</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-green-400 text-sm font-bold mb-2">PRIORITY:</label>
                  <select
                    value={messageForm.priority}
                    onChange={e =>
                      setMessageForm({
                        ...messageForm,
                        priority: e.target.value as 'low' | 'normal' | 'high' | 'urgent',
                      })
                    }
                    className="w-full bg-black border border-green-400 text-green-400 p-2 rounded font-mono"
                    title="Select message priority"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-green-400 text-sm font-bold mb-2">CATEGORY:</label>
                <select
                  value={messageForm.category}
                  onChange={e => setMessageForm({ ...messageForm, category: e.target.value })}
                  className="w-full bg-black border border-green-400 text-green-400 p-2 rounded font-mono"
                  title="Select message category"
                >
                  <option value="general">General</option>
                  <option value="system">System</option>
                  <option value="promotion">Promotion</option>
                  <option value="security">Security</option>
                  <option value="update">Update</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-green-400 text-sm font-bold mb-2">
                    SCHEDULE FOR (Optional):
                  </label>
                  <input
                    type="datetime-local"
                    value={messageForm.scheduled_for}
                    onChange={e =>
                      setMessageForm({ ...messageForm, scheduled_for: e.target.value })
                    }
                    className="w-full bg-black border border-green-400 text-white p-2 rounded font-mono"
                    title="Schedule message for later"
                    placeholder="Select date and time"
                  />
                </div>

                <div>
                  <label className="block text-green-400 text-sm font-bold mb-2">
                    EXPIRES AT (Optional):
                  </label>
                  <input
                    type="datetime-local"
                    value={messageForm.expires_at}
                    onChange={e => setMessageForm({ ...messageForm, expires_at: e.target.value })}
                    className="w-full bg-black border border-green-400 text-white p-2 rounded font-mono"
                    title="Message expiration date"
                    placeholder="Select expiration date"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Selection */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-green-400 rounded p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-green-400 font-bold">RECIPIENTS</h3>
              <div className="flex gap-2">
                <ModernButton
                  onClick={selectAllUsers}
                  variant="success"
                  size="sm"
                  icon={<CheckIcon size={14} />}
                >
                  SELECT ALL
                </ModernButton>
                <ModernButton
                  onClick={clearSelection}
                  variant="danger"
                  size="sm"
                  icon={<XIcon size={14} />}
                >
                  CLEAR
                </ModernButton>
              </div>
            </div>

            <div className="text-green-400 text-sm mb-2">
              Selected: {selectedUsers.length} / {users.length} users
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {users.map(user => (
                <div
                  key={user.id}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? 'border-green-400 bg-green-900 bg-opacity-30'
                      : 'border-gray-600 hover:border-green-400'
                  }`}
                  onClick={() => handleUserToggle(user.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-mono">
                        {user.profiles?.display_name || 'Unknown'}
                      </div>
                      <div className="text-green-400 text-sm">{user.email}</div>
                      <div className="text-gray-400 text-xs">
                        Level: {user.profiles?.hacker_level || 0}
                      </div>
                    </div>
                    <div className="text-green-400">
                      {selectedUsers.includes(user.id) ? '✓' : '○'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Send Button */}
      <div className="mt-6 text-center">
        <ModernButton
          onClick={sendMessages}
          disabled={
            loading ||
            selectedUsers.length === 0 ||
            !messageForm.title.trim() ||
            !messageForm.content.trim()
          }
          loading={loading}
          variant="primary"
          size="xl"
          icon={<SendIcon size={20} />}
          glitch={selectedUsers.length > 0 && messageForm.title.trim() && messageForm.content.trim()}
          className="pulse-glow"
        >
          {loading ? 'SENDING...' : `SEND MESSAGE TO ${selectedUsers.length} USERS`}
        </ModernButton>
      </div>
    </div>
  );
};

export default MessageCenter;
