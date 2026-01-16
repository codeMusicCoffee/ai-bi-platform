import request from "@/lib/request";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export const userService = {
  me: () => {
    return request.get<User>("/user/me");
  },

  updateProfile: (data: Partial<User>) => {
    return request.put<User>("/user/profile", data);
  },
};
