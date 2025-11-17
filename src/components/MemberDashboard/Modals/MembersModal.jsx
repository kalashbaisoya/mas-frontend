import React from 'react';

const MembersModal = ({ groupId, membersList = [], groupName, presenceByGroup = {}, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Members of {groupName}
        </h2>

        <div className="overflow-x-hidden">
          <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Name</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Role</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Membership Status</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Presence</th>
              </tr>
            </thead>
            <tbody>
              {membersList.map((member) => {
                const isOnline = presenceByGroup[groupId]?.some(
                  (p) => p.emailId === member.emailId && p.isOnline === 'Y'
                );

                return (
                  <tr key={member.membershipId} className="hover:bg-gray-50">
                    <td className="p-2 border-t text-sm truncate max-w-[150px]">{member.memberName}</td>
                    <td className="p-2 border-t text-sm truncate max-w-[200px]">{member.emailId}</td>
                    <td className="p-2 border-t text-sm">{member.groupRoleName}</td>
                    <td className="p-2 border-t text-sm">{member.status}</td>
                    <td className="p-2 border-t text-sm flex items-center gap-2">
                      <span
                        className={`h-3 w-3 rounded-full ${
                          isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      ></span>
                      <span>{isOnline ? 'Online' : 'Offline'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {membersList.length === 0 && (
          <p className="mt-4 text-gray-600">No members in this group.</p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembersModal;



// import React from 'react';

// const MembersModal = ({ groupId, membersList = [], groupName, onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//       <div className="bg-white rounded-lg p-6 max-w-3xl min-w-[300px] w-[95vw] max-h-[80vh] overflow-y-auto">
//         <h2 className="text-xl font-semibold mb-4 text-gray-800">
//           Members of {groupName}
//         </h2>

//         <div className="overflow-x-hidden">
//           <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="p-2 text-left text-gray-700 text-sm font-medium">Member Name</th>
//                 <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
//                 <th className="p-2 text-left text-gray-700 text-sm font-medium">Role</th>
//                 <th className="p-2 text-left text-gray-700 text-sm font-medium">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {membersList.map((member) => (
//                 <tr key={member.membershipId} className="hover:bg-gray-50">
//                   <td className="p-2 border-t text-sm truncate max-w-[150px]">{member.memberName}</td>
//                   <td className="p-2 border-t text-sm truncate max-w-[200px]">{member.emailId}</td>
//                   <td className="p-2 border-t text-sm">{member.groupRoleName}</td>
//                   <td className="p-2 border-t text-sm">{member.status}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {membersList.length === 0 && <p className="mt-4 text-gray-600">No members in this group.</p>}

//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MembersModal;
