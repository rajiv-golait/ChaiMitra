// components/common/UserCard.jsx (or wherever you display user info)
import VerifiedBadge from './VerifiedBadge';

const UserCard = ({ user }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="font-medium">{user.displayName}</span>
      {user.isVerified && <VerifiedBadge />}
    </div>
  );
};

export default UserCard;
