import axios from "axios";

export const TestApiClient = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  validateStatus: () => {
    return true;
  },
});
