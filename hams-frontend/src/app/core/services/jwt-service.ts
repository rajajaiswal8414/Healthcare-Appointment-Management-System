// services/jwt.service.ts - FIXED VERSION
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getTokenRole(token: string): string | null {
    const decoded = this.decodeToken(token);
    if (!decoded) return null;

    console.log('🔍 JWT Token Fields:', Object.keys(decoded));
    console.log('🔍 JWT roles field:', decoded.roles);
    console.log('🔍 JWT role field:', decoded.role);

    // Check ALL possible role field names with priority
    if (decoded.roles) {
      console.log('✅ Found role in "roles" field:', decoded.roles);
      return decoded.roles; // Your actual format: "ROLE_ADMIN"
    }
    if (decoded.role) {
      console.log('✅ Found role in "role" field:', decoded.role);
      return decoded.role;
    }
    if (decoded.authorities && Array.isArray(decoded.authorities)) {
      console.log('✅ Found role in "authorities" array:', decoded.authorities[0]);
      return decoded.authorities[0];
    }
    if (decoded.scope) {
      console.log('✅ Found role in "scope" field:', decoded.scope);
      return decoded.scope;
    }

    console.warn('❌ No role found in JWT token. Available fields:', Object.keys(decoded));
    return null;
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    // If there is no exp claim, assume non-expiring token
    if (!decoded || typeof decoded.exp === 'undefined' || decoded.exp === null) {
      return false;
    }

    const expiry = decoded.exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }
}
