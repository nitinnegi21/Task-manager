// utility/servicecall.js
import axios from "axios";

const urlPath = process.env.REACT_APP_API_BASE_URL;

export class ServiceCall {
  
  static getv2(url, headers = {}) {
    return axios.get(`${urlPath}${url}`, { headers });
  }

  static putv2(url, id, options, headers = {}) {
    return axios.put(`${urlPath}${url}${id}`, options, { headers });
  }

  static deletev2(url, id, headers = {}) {
    return axios.delete(`${urlPath}${url}${id}`, { headers });
  }

  static postv2(url, id, options, headers = {}) {
    return axios.post(`${urlPath}${url}${id}`, options, { headers });
  }

  static patchv2(url, id, options, headers = {}) {
    return axios.patch(`${urlPath}${url}${id}`, options, { headers });
  }
}