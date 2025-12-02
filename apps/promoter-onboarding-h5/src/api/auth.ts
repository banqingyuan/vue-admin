import { request } from './http';

export function sendCodeApi(data: { phone_number: string; allow_register_role?: 'promoter' }) {
  return request<{ message: string }>({
    method: 'POST',
    url: '/admin/auth/send-code',
    data,
  });
}

export function loginApi(data: { phone_number: string; code: string; allow_register_role?: 'promoter' }) {
  return request<{ token: string; user: any }>({
    method: 'POST',
    url: '/admin/auth/login',
    data,
  });
}


