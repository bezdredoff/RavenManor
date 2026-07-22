import './style.css';
import { GameApp } from './ui/GameApp';

const root = document.querySelector<HTMLElement>('#app');

if (!root) {
  throw new Error('App root was not found');
}

new GameApp(root);
