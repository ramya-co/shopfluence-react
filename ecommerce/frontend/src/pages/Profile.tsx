import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { User, Edit, Save, X } from 'lucide-react';
import { api } from '@/lib/api';

const Profile: React.FC = () => {
  const { state: authState } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: authState.user?.first_name || '',
    last_name: authState.user?.last_name || '',
    username: authState.user?.username || '',
    phone_number: authState.user?.phone_number || '',
  });

  // 🚨 BUG: Clickjacking detection when bb_iframe=1 is present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const bbIframe = urlParams.get('bb_iframe');
    
    if (bbIframe === '1') {
      // Inject clickjacking detection script
      const script = document.createElement('script');
      script.innerHTML = `
        // Check if page is loaded in an iframe
        if (window.top !== window.self) {
          // Page is in an iframe - this is the vulnerability!
          fetch('/api/bugs/record/?bug=clickjack&mark=1', { 
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bug: 'clickjack',
              mark: '1'
            })
          })
          .then(response => response.json())
          .then(data => {
            if (data.bug_found === 'CLICKJACKING') {
              console.log('🎉 Clickjacking vulnerability detected!', data);
              
              // Show notification
              if (window.showNotification) {
                window.showNotification({
                  type: 'bug_found',
                  message: data.message,
                  description: data.description,
                  points: data.points,
                  bugType: 'CLICKJACKING'
                });
              }
              
              // Also show with the existing notification system
              if (window.showBugNotification) {
                window.showBugNotification({
                  bug_found: data.bug_found,
                  message: data.message,
                  description: data.description,
                  points: data.points
                });
              }
            }
          })
          .catch(error => {
            console.log('Failed to record clickjacking bug:', error);
          });
        }
      `;
      document.head.appendChild(script);
      
      // Clean up the script on component unmount
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, []);

  if (!authState.isAuthenticated || !authState.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await api.auth.updateProfile(formData);

      if (response.ok) {
        // Update the auth context with new user data
        setIsEditing(false);
        // You might want to refresh the user data here
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: authState.user?.first_name || '',
      last_name: authState.user?.last_name || '',
      username: authState.user?.username || '',
      phone_number: authState.user?.phone_number || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">{authState.user.first_name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">{authState.user.last_name}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <p className="text-sm text-muted-foreground mt-1">{authState.user.email}</p>
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                {isEditing ? (
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{authState.user.username}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {authState.user.phone_number || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <Label>Account Status</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {authState.user.is_verified ? 'Verified' : 'Not verified'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;