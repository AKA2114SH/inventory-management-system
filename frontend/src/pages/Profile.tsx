import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, Edit2, UserCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import api from '../services/api';
import toast from 'react-hot-toast';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/users/me');
      setProfile(response.data);
      setFormData({
        username: response.data.username,
        email: response.data.email,
        full_name: response.data.full_name || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put('/users/me', {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
      });
      setProfile(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Update failed');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await api.post('/users/me/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      toast.success('Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Password change failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Please login to view profile</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-mono text-neon-cyan animate-glow">Profile Settings</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card className="space-y-4">
          <h2 className="text-xl font-bold text-neon-cyan flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            Account Information
          </h2>
          
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                icon={User}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                icon={Mail}
                required
              />
              <Input
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                icon={User}
              />
              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg">
                <User className="w-5 h-5 text-neon-cyan" />
                <div>
                  <p className="text-xs text-gray-400">Username</p>
                  <p className="font-mono">{profile.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg">
                <Mail className="w-5 h-5 text-neon-cyan" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="font-mono">{profile.email}</p>
                </div>
              </div>
              {profile.full_name && (
                <div className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg">
                  <User className="w-5 h-5 text-neon-cyan" />
                  <div>
                    <p className="text-xs text-gray-400">Full Name</p>
                    <p className="font-mono">{profile.full_name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg">
                <div>
                  <p className="text-xs text-gray-400">Role</p>
                  <p className="font-mono text-neon-green">
                    {profile.is_admin ? 'Administrator' : 'User'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-dark-100 rounded-lg">
                <div>
                  <p className="text-xs text-gray-400">Member since</p>
                  <p className="font-mono">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Change Password */}
        <Card className="space-y-4">
          <h2 className="text-xl font-bold text-neon-cyan flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              required
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password (min 6 characters)"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              required
            />
            <Button type="submit" className="w-full">
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
