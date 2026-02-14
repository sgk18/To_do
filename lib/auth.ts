import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function getDataFromToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || '';
    
    if (!token) {
      return null;
    }
    
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decodedToken.userId;
  } catch (error: any) {
    return null;
  }
}
