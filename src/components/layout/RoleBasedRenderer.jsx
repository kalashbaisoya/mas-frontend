import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import AdminCard from '../ui/AdminCard';
import UserCard from '../ui/UserCard';
import GroupManagerCard from '../ui/GroupManagerCard';
import MemberCard from '../ui/MemberCard';

const roleSets = [
  // ADMIN combinations
  ['ADMIN'],                                      // 0
  ['ADMIN', 'GROUP_MANAGER'],                      // 1
  ['ADMIN', 'PANELIST'],                          // 2
  ['ADMIN', 'MEMBER'],                            // 3
  ['ADMIN', 'GROUP_MANAGER', 'PANELIST'],          // 4
  ['ADMIN', 'GROUP_MANAGER', 'MEMBER'],            // 5
  ['ADMIN', 'PANELIST', 'MEMBER'],                // 6
  ['ADMIN', 'GROUP_MANAGER', 'PANELIST', 'MEMBER'],// 7

  // USER combinations
  ['USER'],                                       // 8
  ['USER', 'GROUP_MANAGER'],                       // 9
  ['USER', 'PANELIST'],                           //10
  ['USER', 'MEMBER'],                             //11
  ['USER', 'GROUP_MANAGER', 'PANELIST'],           //12
  ['USER', 'GROUP_MANAGER', 'MEMBER'],             //13
  ['USER', 'PANELIST', 'MEMBER'],                 //14
  ['USER', 'GROUP_MANAGER', 'PANELIST', 'MEMBER']  //15
];
const roleSetToPageSet = [
  0, // roleSet[0]  → pageSet[0] : ADMIN → AC + UC
  1, // roleSet[1]  → pageSet[1] : ADMIN + GROUP_MANAGER → AC + GC + UC
  2, // roleSet[2]  → pageSet[2] : ADMIN + PANELIST → AC + MC + UC
  2, // roleSet[3]  → pageSet[2] : ADMIN + MEMBER → AC + MC + UC
  3, // roleSet[4]  → pageSet[3] : ADMIN + GROUP_MANAGER + PANELIST → AC + GC + MC + UC
  3, // roleSet[5]  → pageSet[3] : ADMIN + GROUP_MANAGER + MEMBER → AC + GC + MC + UC
  2, // roleSet[6]  → pageSet[2] : ADMIN + PANELIST + MEMBER → AC + MC + UC
  3, // roleSet[7]  → pageSet[3] : ADMIN + GROUP_MANAGER + PANELIST + MEMBER → AC + GC + MC + UC
  4, // roleSet[8]  → pageSet[4] : USER → UC
  5, // roleSet[9]  → pageSet[5] : USER + GROUP_MANAGER → GC + UC
  6, // roleSet[10] → pageSet[6] : USER + PANELIST → MC + UC
  6, // roleSet[11] → pageSet[6] : USER + MEMBER → MC + UC
  7, // roleSet[12] → pageSet[7] : USER + GROUP_MANAGER + PANELIST → GC + MC + UC
  7, // roleSet[13] → pageSet[7] : USER + GROUP_MANAGER + MEMBER → GC + MC + UC
  6, // roleSet[14] → pageSet[6] : USER + PANELIST + MEMBER → MC + UC
  7  // roleSet[15] → pageSet[7] : USER + GROUP_MANAGER + PANELIST + MEMBER → GC + MC + UC
];

const RoleBasedRenderer = () => {
    
  const { authData } = useContext(AuthContext);
  if (!authData)  return <div className="text-center text-gray-500">Loading user data...</div>;

    
  const { user, membershipInfo } = authData;
  const roleSet = new Set([user.systemRole.roleName, ...membershipInfo.map(g => g.groupRoleName)]);

  console.log("roleSet:", Array.from(roleSet));
  const matchedIndex = roleSets.findIndex(set =>
    set.length === roleSet.size && set.every(role => roleSet.has(role))
  );

  const pageSetIndex = roleSetToPageSet[matchedIndex];

  switch (pageSetIndex) {
    case 0: return (
        <div className="flex flex-wrap gap-6 justify-center p-4">
            <AdminCard />
            <UserCard />
        </div>
    );
    case 1: return (
        <div className="flex flex-wrap gap-6 justify-center p-4">
            <AdminCard />
            <GroupManagerCard />
            <UserCard />
        </div>
    );
    case 2: return (
        <div className="flex flex-wrap gap-6 justify-center p-4">
            <AdminCard />
            <MemberCard />
            <UserCard />
        </div>
    );
    case 3: return (
        <div className="flex flex-wrap gap-6 justify-center p-4">
            <AdminCard />
            <GroupManagerCard />
            <MemberCard />
            <UserCard />
        </div>
    );
    case 4: return (
        <div className="flex flex-wrap gap-6 justify-center p-4">
            <UserCard />
        </div>
    );
    case 5: return (
        <div className="flex flex-wrap gap-6 justify-center p-4">
            <GroupManagerCard />
            <UserCard />
        </div>
    );
    case 6: return (
        <div className="flex flex-wrap gap-6 justify-center p-4">
            <MemberCard />
            <UserCard />
        </div>
    );
    case 7: return (
        <div className="flex flex-wrap gap-6 justify-center p-4">
            <GroupManagerCard />
            <MemberCard />
            <UserCard />
        </div>
    );
    default: return <UserCard />;
  }
};

export default RoleBasedRenderer;