import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const token = jwt.sign(
  {
    user_id: 1,
    member_id: 1,
    community_id: 1,
    is_community_admin: 1
  },
  process.env.JWT_SECRET as string,
  { expiresIn: '1h' }
);

console.log(token);
