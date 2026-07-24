import './style.css';
import { ErrorLog, installGlobalErrorHandlers } from './platform/ErrorLog';
import { GameApp } from './ui/GameApp';

const root = document.querySelector<HTMLElement>('#app');
const errorLog = new ErrorLog();
installGlobalErrorHandlers(errorLog);

if (!root) {
  throw new Error('App root was not found');
}

try {
  new GameApp(root, errorLog);
} catch (error) {
  errorLog.record('application', error);
  root.innerHTML = `
    <main class="fatal-error" role="alert">
      <h1>Raven Manor не удалось запустить</h1>
      <p>Обновите страницу. Если ошибка повторится, экспортируйте диагностику после следующего успешного запуска.</p>
      <button type="button" onclick="location.reload()">Обновить</button>
    </main>
  `;
}
