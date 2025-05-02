// import {useState,useEffect} from "react"
// import Echo from 'laravel-echo';
// import axiosInstance from '@/lib/axios'
 
// import Pusher from 'pusher-js';
// (window as any).Pusher = Pusher;

// const useEcho = () =>{
//     const [echoInstance,setEchoInstance] = useState<any>(null);
//     useEffect(()=>{
//         const echo = new Echo({
//             broadcaster: 'reverb',
//             key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
//             authorizer: (channel:any) => {
//                 return {
//                     authorize: (socketId:any, callback:any) => {
//                         axiosInstance.post('/api/broadcasting/auth', {
//                             socket_id: socketId,
//                             channel_name: channel.name
//                         })
//                         .then(response => {
//                             callback(false, response.data);
//                         })
//                         .catch(error => {
//                             callback(true, error);
//                         });
//                     }
//                 };
//             },
//             wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
//             wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
//             wssPort: process.env.NEXT_PUBLIC_REVERB_PORT,
//             forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
//             enabledTransports: ['ws', 'wss'],
//         });
//         setEchoInstance(echo);
//     },[])
//     return echoInstance;
// }

// export default useEcho;

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

const useEcho = () => {
  const [echoInstance, setEchoInstance] = useState<any>(null);

  useEffect(() => {
    // This ensures code only runs in the browser
    if (typeof window === "undefined") return;

    const initEcho = async () => {
      const { default: Echo } = await import("laravel-echo");
      const Pusher = (await import("pusher-js")).default;

      (window as any).Pusher = Pusher;

      const echo = new Echo({
        broadcaster: "reverb",
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        authorizer: (channel: any) => {
          return {
            authorize: (socketId: any, callback: any) => {
              axiosInstance
                .post("/api/broadcasting/auth", {
                  socket_id: socketId,
                  channel_name: channel.name,
                })
                .then((response) => {
                  callback(false, response.data);
                })
                .catch((error) => {
                  callback(true, error);
                });
            },
          };
        },
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
        wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT),
        wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT),
        forceTLS:
          (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "https") === "https",
        enabledTransports: ["ws", "wss"],
      });

      setEchoInstance(echo);
    };

    initEcho();
  }, []);

  return echoInstance;
};

export default useEcho;
