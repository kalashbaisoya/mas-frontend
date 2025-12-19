import React, { useState, useEffect } from 'react';

const MembersModal = ({
  groupId,
  membersList = [],
  groupName,
  presenceByGroup,
  onClose,
  onSuspend,
  onUnsuspend,
  onRemove,

  // 🔹 Quorum props
  quorumK,
  onUpdateQuorumKForTypeD,
  groupType,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  // 🔹 Quorum editor state (Type D only)
  const [showQuorumEditor, setShowQuorumEditor] = useState(false);
  const [quorumInput, setQuorumInput] = useState(quorumK ?? '');

  /* ---------------- DEBUG: PROPS ---------------- */
  useEffect(() => {
    console.log('[MembersModal] mounted with props:', {
      groupId,
      groupType,
      quorumK,
      membersCount: membersList.length,
      presenceCount: presenceByGroup?.[groupId]?.length ?? 0,
    });
  }, [groupId, groupType, quorumK, membersList, presenceByGroup]);

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
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Member Name</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Email</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Role</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Membership Status</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Presence</th>
                <th className="p-2 text-left text-gray-700 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {membersList.map((member) => {
                const isOnline = presenceByGroup[groupId]?.some(
                  (p) => p.emailId === member.emailId && p.isOnline === 'Y'
                );

                if (!presenceByGroup[groupId]) {
                  console.log('[Presence] No presence data for group:', groupId);
                }

                return (
                  <tr
                    key={member.membershipId}
                    className="hover:bg-gray-50 min-h-[60px]"
                  >
                    <td className="p-2 border-t text-sm truncate max-w-[150px]">
                      {member.memberName}
                    </td>
                    <td className="p-2 border-t text-sm truncate max-w-[200px]">
                      {member.emailId}
                    </td>
                    <td className="p-2 border-t text-sm">
                      {member.groupRoleName}
                    </td>
                    <td className="p-2 border-t text-sm">
                      {member.status}
                    </td>
                    <td className="p-2 border-t text-sm flex items-center gap-2">
                      <span
                        className={`h-3 w-3 rounded-full ${
                          isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      ></span>
                      <span>{isOnline ? 'Online' : 'Offline'}</span>
                    </td>
                    <td className="p-2 border-t text-sm relative">
                      <div className="relative">
                        <button
                          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200"
                          onClick={() => {
                            console.log('[Actions] Dropdown toggled for:', member.emailId);
                            setOpenDropdown((prev) =>
                              prev === member.membershipId
                                ? null
                                : member.membershipId
                            );
                          }}
                        >
                          <span className="text-xl font-bold">⋯</span>
                        </button>

                        {openDropdown === member.membershipId && (
                          <div className="absolute right-0 top-8 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <ul className="py-1 text-sm text-gray-700">
                              {member.status === 'ACTIVE' && (
                                <li>
                                  <button
                                    onClick={() => {
                                      console.log('[Suspend] Request:', {
                                        groupId,
                                        emailId: member.emailId,
                                      });
                                      onSuspend(groupId, member.emailId);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full px-4 py-2 hover:bg-yellow-100 text-left"
                                  >
                                    Suspend
                                  </button>
                                </li>
                              )}
                              {member.status === 'SUSPENDED' && (
                                <li>
                                  <button
                                    onClick={() => {
                                      console.log('[Unsuspend] Request:', {
                                        groupId,
                                        emailId: member.emailId,
                                      });
                                      onUnsuspend(groupId, member.emailId);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full px-4 py-2 hover:bg-green-100 text-left"
                                  >
                                    Unsuspend
                                  </button>
                                </li>
                              )}
                              <li>
                                <button
                                  onClick={() => {
                                    console.log('[Remove] Request:', {
                                      groupId,
                                      emailId: member.emailId,
                                    });
                                    onRemove(groupId, member.emailId);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-red-100 text-left"
                                >
                                  Remove
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {membersList.length === 0 && (
          <p className="mt-4 text-gray-600">
            No members in this group.
            {console.log('[MembersModal] membersList is empty')}
          </p>
        )}

        {/* 🔹 TYPE D — QUORUM SECTION */}
        {groupType === 'D' && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  Quorum (Type D Group)
                </h3>
                <p className="text-sm text-gray-600">
                  Current Quorum K:{' '}
                  <span className="font-medium">{quorumK}</span>
                </p>
              </div>

              <button
                onClick={() => {
                  console.log('[Quorum] Open editor', { quorumK });
                  setQuorumInput(quorumK ?? '');
                  setShowQuorumEditor(true);
                }}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Set Quorum
              </button>
            </div>

            {showQuorumEditor && (
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={quorumInput}
                  onChange={(e) => {
                    console.log('[Quorum] Input changed:', e.target.value);
                    setQuorumInput(e.target.value);
                  }}
                  className="w-32 px-2 py-1 border rounded text-sm"
                  placeholder="Enter K"
                />

                <button
                  onClick={() => {
                    console.log('[Quorum] Submit clicked with raw value:', quorumInput);

                    const newValue = parseInt(quorumInput, 10);

                    if (!Number.isInteger(newValue)) {
                      console.error('[Quorum] Invalid integer:', quorumInput);
                      alert('Please enter a valid integer');
                      return;
                    }

                    if (newValue <= 0) {
                      console.error('[Quorum] Non-positive value:', newValue);
                      alert('Quorum must be greater than 0');
                      return;
                    }

                    console.log('[Quorum] Calling update API with:', newValue);
                    onUpdateQuorumKForTypeD(newValue);
                    setShowQuorumEditor(false);
                  }}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Submit
                </button>

                <button
                  onClick={() => {
                    console.log('[Quorum] Editor cancelled');
                    setShowQuorumEditor(false);
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              console.log('[MembersModal] Close clicked');
              onClose();
            }}
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





// import React, { useState } from 'react';

// const MembersModal = ({
//   groupId,
//   membersList = [],
//   groupName,
//   presenceByGroup,
//   onClose,
//   onSuspend,
//   onUnsuspend,
//   onRemove,
//   quorumK,
//   onUpdateQuorumKForTypeD,
//   groupType,
// }) => {
//   const [openDropdown, setOpenDropdown] = useState(null);

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
//                 <th className="p-2 text-left text-gray-700 text-sm font-medium">Membership Status</th>
//                 <th className="p-2 text-left text-gray-700 text-sm font-medium">Presence</th>
//                 <th className="p-2 text-left text-gray-700 text-sm font-medium">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {membersList.map((member) => {
//                 const isOnline = presenceByGroup[groupId]?.some(
//                   (p) => p.emailId === member.emailId && p.isOnline === 'Y'
//                 );

//                 return (
//                   <tr key={member.membershipId} className="hover:bg-gray-50 min-h-[60px]">
//                     <td className="p-2 border-t text-sm truncate max-w-[150px]">{member.memberName}</td>
//                     <td className="p-2 border-t text-sm truncate max-w-[200px]">{member.emailId}</td>
//                     <td className="p-2 border-t text-sm">{member.groupRoleName}</td>
//                     <td className="p-2 border-t text-sm">{member.status}</td>
//                     <td className="p-2 border-t text-sm flex items-center gap-2">
//                       <span
//                         className={`h-3 w-3 rounded-full ${
//                           isOnline ? 'bg-green-500' : 'bg-gray-400'
//                         }`}
//                       ></span>
//                       <span>{isOnline ? 'Online' : 'Offline'}</span>
//                     </td>
//                     <td className="p-2 border-t text-sm relative">
//                       <div className="relative">
//                         <div className="inline-block">
//                           <button
//                             className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200"
//                             onClick={() =>
//                               setOpenDropdown((prev) =>
//                                 prev === member.membershipId ? null : member.membershipId
//                               )
//                             }
//                           >
//                             <span className="text-xl font-bold">⋯</span>
//                           </button>
//                         </div>

//                         <div className="h-0 relative">
//                           {openDropdown === member.membershipId && (
//                             <div className="absolute right-0 top-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-150 ease-in-out">
//                               <ul className="py-1 text-sm text-gray-700">
//                                 {member.status === 'ACTIVE' && (
//                                   <li>
//                                     <button
//                                       onClick={() => {
//                                         onSuspend(groupId, member.emailId);
//                                         setOpenDropdown(null);
//                                       }}
//                                       className="w-full px-4 py-2 hover:bg-yellow-100 text-left"
//                                     >
//                                       Suspend
//                                     </button>
//                                   </li>
//                                 )}
//                                 {member.status === 'SUSPENDED' && (
//                                   <li>
//                                     <button
//                                       onClick={() => {
//                                         onUnsuspend(groupId, member.emailId);
//                                         setOpenDropdown(null);
//                                       }}
//                                       className="w-full px-4 py-2 hover:bg-green-100 text-left"
//                                     >
//                                       Unsuspend
//                                     </button>
//                                   </li>
//                                 )}
//                                 <li>
//                                   <button
//                                     onClick={() => {
//                                       onRemove(groupId, member.emailId);
//                                       setOpenDropdown(null);
//                                     }}
//                                     className="w-full px-4 py-2 hover:bg-red-100 text-left"
//                                   >
//                                     Remove
//                                   </button>
//                                 </li>
//                               </ul>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {membersList.length === 0 && (
//           <p className="mt-4 text-gray-600">No members in this group.</p>
//         )}

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

// import React from 'react';

// const MembersModal = ({ groupId, membersList = [], groupName,presenceByGroup, onClose, onSuspend, onUnsuspend, onRemove }) => {
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
//                 <th className="p-2 text-left text-gray-700 text-sm font-medium">Membership Status</th>
//                 <th className="p-2 text-left text-gray-700 text-sm font-medium">Presence</th>
//                 <th className="p-2 text-left text-gray-700 text-sm font-medium">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
                
//         {membersList.map((member) => {
//                 const isOnline = presenceByGroup[groupId]?.some(
//                   (p) => p.emailId === member.emailId && p.isOnline === 'Y'
//                 );

//             return (
//                 <tr key={member.membershipId} className="hover:bg-gray-50">
//                   <td className="p-2 border-t text-sm truncate max-w-[150px]">{member.memberName}</td>
//                   <td className="p-2 border-t text-sm truncate max-w-[200px]">{member.emailId}</td>
//                   <td className="p-2 border-t text-sm">{member.groupRoleName}</td>
//                   <td className="p-2 border-t text-sm">{member.status}</td>
//                   <td className="p-2 border-t text-sm flex items-center gap-2">
//                       <span
//                         className={`h-3 w-3 rounded-full ${
//                           isOnline ? 'bg-green-500' : 'bg-gray-400'
//                         }`}
//                       ></span>
//                       <span>{isOnline ? 'Online' : 'Offline'}</span>
//                     </td>

//                   <td className="p-2 border-t flex flex-wrap gap-2">
//                     {member.status === 'ACTIVE' && (
//                       <button
//                         onClick={() => onSuspend(groupId, member.emailId)}
//                         className="px-2 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors"
//                       >
//                         Suspend
//                       </button>
//                     )}
//                     {member.status === 'SUSPENDED' && (
//                       <button
//                         onClick={() => onUnsuspend(groupId, member.emailId)}
//                         className="px-2 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
//                       >
//                         Unsuspend
//                       </button>
//                     )}
//                     <button
//                       onClick={() => onRemove(groupId, member.emailId)}
//                       className="px-2 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
//                     >
//                       Remove
//                     </button>
//                   </td>
//                 </tr>
//             );
//         })}
//             </tbody>
//           </table>
//         </div>

//         {membersList.length === 0 && <p className="mt-4 text-gray-600">No members in this group.</p>}

//         <div className="mt-4 flex justify-end">
//           <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors">
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MembersModal;
