// src/types/express.d.ts
declare namespace Express {
  export interface Request {
    lang: string;
  }
}

src/types/express.d.ts

// import "express";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         user_id: number;
//         user_uuid: string;
//         phone_number?: string;
//         community_id: number;
//         community_uuid: string;
//         member_id: number;
//       };
//     }
//   }
// }