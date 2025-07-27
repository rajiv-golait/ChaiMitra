import React, { useState, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  LinkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useGroupOrders } from '../../hooks/useGroupOrders';

const InvitationManagement = ({ groupOrderId, open, onClose, isLeader }) => {
  const {
    sendInvitation,
    fetchInvitations,
    cancelInvitation
  } = useGroupOrders();

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  
  // Form state
  const [inviteMethod, setInviteMethod] = useState('email');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');

  // Fetch invitations when dialog opens
  useEffect(() => {
    if (open && groupOrderId) {
      loadInvitations();
    }
  }, [open, groupOrderId]);

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const data = await fetchInvitations(groupOrderId);
      setInvitations(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!contact.trim()) {
      setError('Please enter contact information');
      return;
    }

    // Validate contact based on method
    if (inviteMethod === 'email' && !isValidEmail(contact)) {
      setError('Please enter a valid email address');
      return;
    }

    if (inviteMethod === 'sms' && !isValidPhone(contact)) {
      setError('Please enter a valid phone number');
      return;
    }

    setSending(true);
    setError(null);

    try {
      await sendInvitation(groupOrderId, {
        method: inviteMethod,
        contact: contact.trim(),
        message: message.trim() || 'You have been invited to join a group order on HawkerHub!'
      });

      // Reset form
      setContact('');
      setMessage('');
      
      // Reload invitations
      await loadInvitations();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      await cancelInvitation(invitationId);
      await loadInvitations();
    } catch (err) {
      setError(err.message);
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    return /^\+?[\d\s()-]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'declined':
      case 'cancelled':
      case 'expired':
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <PaperAirplaneIcon className="h-5 w-5 text-gray-500 transform rotate-45" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
      case 'cancelled':
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'email':
        return <EnvelopeIcon className="h-5 w-5 text-gray-500" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="h-5 w-5 text-gray-500" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Invitations
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Send invitation form (leader only) */}
        {isLeader && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Send New Invitation
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <FormControl fullWidth>
                <InputLabel>Method</InputLabel>
                <Select
                  value={inviteMethod}
                  onChange={(e) => setInviteMethod(e.target.value)}
                  label="Method"
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                  <MenuItem value="link">Share Link</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label={
                  inviteMethod === 'email' ? 'Email Address' :
                  inviteMethod === 'sms' ? 'Phone Number' :
                  'Contact Info'
                }
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={
                  inviteMethod === 'email' ? 'vendor@example.com' :
                  inviteMethod === 'sms' ? '+91 98765 43210' :
                  'Enter contact information'
                }
                error={!!error && error.includes('contact')}
              />

              <TextField
                fullWidth
                label="Personal Message (Optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                multiline
                rows={2}
                placeholder="Add a personal message to your invitation..."
              />

              <Button
                variant="contained"
                onClick={handleSendInvitation}
                disabled={sending || !contact.trim()}
                startIcon={sending ? <CircularProgress size={20} /> : <Send />}
              >
                {sending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Invitations list */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Sent Invitations
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : invitations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
              No invitations sent yet
            </Typography>
          ) : (
            <List>
              {invitations.map((invitation) => {
                const createdDate = invitation.createdAt?.toDate ? 
                  invitation.createdAt.toDate() : 
                  new Date(invitation.createdAt);
                
                const expiryDate = invitation.expiresAt?.toDate ? 
                  invitation.expiresAt.toDate() : 
                  new Date(invitation.expiresAt);
                
                const isExpired = invitation.status === 'pending' && expiryDate < new Date();

                return (
                  <ListItem key={invitation.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getMethodIcon(invitation.method)}
                          <Typography>
                            {invitation.recipientContact}
                          </Typography>
                          <Chip
                            label={isExpired ? 'expired' : invitation.status}
                            size="small"
                            color={getStatusColor(isExpired ? 'expired' : invitation.status)}
                            icon={getStatusIcon(isExpired ? 'expired' : invitation.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" component="div">
                            Sent by {invitation.senderName} on {format(createdDate, 'MMM dd, yyyy HH:mm')}
                          </Typography>
                          {invitation.status === 'accepted' && invitation.acceptedAt && (
                            <Typography variant="caption" color="success.main">
                              Accepted on {format(
                                invitation.acceptedAt.toDate ? invitation.acceptedAt.toDate() : new Date(invitation.acceptedAt),
                                'MMM dd, yyyy HH:mm'
                              )}
                            </Typography>
                          )}
                          {invitation.status === 'declined' && invitation.declinedAt && (
                            <Typography variant="caption" color="error.main">
                              Declined on {format(
                                invitation.declinedAt.toDate ? invitation.declinedAt.toDate() : new Date(invitation.declinedAt),
                                'MMM dd, yyyy HH:mm'
                              )}
                            </Typography>
                          )}
                          {isExpired && (
                            <Typography variant="caption" color="error.main">
                              Expired on {format(expiryDate, 'MMM dd, yyyy HH:mm')}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    {isLeader && invitation.status === 'pending' && !isExpired && (
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleCancelInvitation(invitation.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvitationManagement;
