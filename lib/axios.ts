import axios from 'axios';
import { toast } from 'react-hot-toast';

// Создаем собственный экземпляр Axios
const axiosInstance = axios.create();

// Отслеживаем каналы, для которых уже обработаны ошибки 403
const handledChannels = new Set<string>();

// Добавляем перехватчик ответов
axiosInstance.interceptors.response.use(
  // Успешные ответы просто передаем дальше
  (response) => response,
  
  // Обрабатываем ошибки
  (error) => {
    // Получаем информацию о запросе
    const requestUrl = error.config?.url || 'неизвестный URL';
    
    // Проверяем статус ошибки
    if (error.response?.status === 403) {
      // Если ошибка связана с доступом к каналу, и пользователь на странице канала
      if (requestUrl.includes('/channels/') && window.location.pathname.includes('/channels/')) {
        console.log('Обнаружена ошибка доступа 403 для канала:', requestUrl);
        
        // Извлекаем ID канала из URL запроса
        const match = requestUrl.match(/\/channels\/([^\/]+)/);
        if (match && match[1]) {
          const channelId = match[1];
          
          // Проверяем, не обрабатывали ли мы уже этот канал
          if (handledChannels.has(channelId)) {
            console.log('Ошибка 403 для канала уже обработана:', channelId);
            return Promise.reject(error);
          }
          
          // Добавляем канал в список обработанных
          handledChannels.add(channelId);
          console.log('Добавлен в список обработанных каналов:', channelId);
          
          // Отправляем событие выхода из канала
          const event = new CustomEvent("channel-left", {
            detail: { channelId }
          });
          
          window.dispatchEvent(event);
          
          // Перенаправляем на главную страницу чатов, если мы на странице канала
          if (window.location.pathname.includes(`/channels/${channelId}`)) {
            window.location.href = '/chats';
          }
        }
      }
    }
    
    // Пропускаем ошибку дальше для дальнейшей обработки
    return Promise.reject(error);
  }
);

export default axiosInstance; 