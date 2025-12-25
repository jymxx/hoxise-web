import api from '@/utils/request.js'
import { getToken } from '@/utils/auth'


// AI生成简介
export function getAISummary(catalogId) {
  const eventSourceUrl = window.baseUrl+"/movie/ai/aiSummary?catalogid="+catalogId+"&token="+getToken();
  return new EventSource(eventSourceUrl);
}