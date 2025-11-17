// import {useState, useEffect,} from 'react';

// import {
//   connectWebSocket,
// //   subscribeToGroup,
// //   unsubscribeFromGroup,
//   disconnectWebSocket,
// } from '../websocketManager';


// const useWS = () => {
//     // ====== STATE ======
//     // const [presenceByGroup, setPresenceByGroup] = useState({});

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         const client = connectWebSocket(
//             token,
//             () => console.log('WebSocket connected globally'),
//             (err) => setError(err)
//         );

//         return () => {
//             disconnectWebSocket();
//         };
//     }, []);


//     // return {
//     //     presenceByGroup,
//     // }

// };

// export default useWS;