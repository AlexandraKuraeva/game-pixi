import * as PIXI from './pixi.mjs';
('use strict');

const app = new PIXI.Application({
  antialias: true, // default: false
  transparent: false, // default: false
  resolution: 1,
  backgroundColor: '#888',
  resizeTo: window,
});

//Pixi.js devtools
globalThis.__PIXI_APP__ = app;

// Добавление созданного приложения на страницу
document.body.appendChild(app.view);

// Добавление главного контейнера
const appContainer = new PIXI.Container();
const gameScene = new PIXI.Container();
const gameOverScene = new PIXI.Container();
app.stage.addChild(appContainer);
appContainer.addChild(gameScene);

//Скрываем суену проигрыша
gameOverScene.visible = false;

// Создаем кнопку на сцене после проигрыша
const buttonImg = PIXI.Texture.from('../img/button.png');
const button = new PIXI.Sprite(buttonImg);
button.anchor.set(0.5);
button.position.set(400, 550);
button.cursor = 'pointer';

const trafficImg = PIXI.Texture.from('../img/traffic.png');
const traffic = new PIXI.Sprite(trafficImg);
traffic.anchor.set(0.5);
traffic.position.set(400, 300);
gameOverScene.addChild(button, traffic);
function handleGameOver() {
  gameOverScene.visible = true;

  // Затемняем первую сцену
  const dimmer = new PIXI.Graphics();
  dimmer.beginFill(0x000000, 0.7); // Цвет и прозрачность затемнения
  dimmer.drawRect(0, 0, window.innerWidth, window.innerHeight); // Размеры затемнения
  dimmer.endFill();
  dimmer.alpha = 0;
  button.alpha = 0;

  // Добавляем кнопку и затемнение на сцену после проигрыша
  app.stage.addChild(dimmer);
  gameOverScene.addChild(button, traffic);

  // Добавляем сцену после проигрыша на stage
  appContainer.addChild(gameOverScene);

  function animateGameOverScene() {
    if (dimmer.alpha < 1) {
      const dimmer = gameOverScene.getChildAt(0);
      const button = gameOverScene.getChildAt(1);
      // Постепенно увеличиваем прозрачность затемнения
      dimmer.alpha += 0.03;
      button.alpha += 0.03;
    }
  }
  app.ticker.add(() => {
    animateGameOverScene();
  });
}

window.addEventListener('load', centerContainer);
window.addEventListener('resize', centerContainer);

function centerContainer() {
  let width;
  let height;
  if (app.view.width < 768) {
    width = app.screen.width;
    height = app.screen.height / 1.3;
  } else if (document.documentElement.clientWidth < 1100) {
    width = app.screen.width;
    height = app.screen.height / 1.1;
  } else {
    appContainer.x = app.screen.width / 1.2;

    width = app.screen.width / 2;
    height = app.screen.height / 1.1;
  }
  // Центрируем контейнер по горизонтали
  appContainer.x = (app.screen.width - width) / 2;

  // Устанавливаем позицию контейнера посередине экрана
  appContainer.width = width;
  appContainer.height = height;
}
const parkingContainer = new PIXI.Container();

gameScene.addChild(parkingContainer);

//Отрисовка парковки
const parkingLine = PIXI.Texture.from('../img/line.png');
let parking;
const distance = 200; // Расстояние между текстурами
const numTextures = 5; // Количество текстур
for (let i = 0; i < numTextures; i++) {
  parking = new PIXI.Sprite(parkingLine);
  parking.position.set(i * distance, 0);
  parking.height = 400;
  parkingContainer.addChild(parking);
}

// Создаем спрайты для машинок и гаражей
const carBlueImg = PIXI.Texture.from('../img/blue.png');
const carBlue = new PIXI.Sprite(carBlueImg);
carBlue.anchor.set(0.5);
carBlue.position.set(720, 320);
gameScene.addChild(carBlue);

const carGreenImg = PIXI.Texture.from('../img/green.png');
const carGreen = new PIXI.Sprite(carGreenImg);
carGreen.anchor.set(0.5);
carGreen.position.set(120, 320);
gameScene.addChild(carGreen);

const carRedImg = PIXI.Texture.from('../img/red.png');
const carRed = new PIXI.Sprite(carRedImg);
carRed.anchor.set(0.5);
carRed.position.set(210, 700);
gameScene.addChild(carRed);

const carYellowImg = PIXI.Texture.from('../img/yellow.png');
const carYellow = new PIXI.Sprite(carYellowImg);
carYellow.anchor.set(0.5);
carYellow.position.set(620, 700);
gameScene.addChild(carYellow);

carRed.cursor = 'pointer';
carYellow.cursor = 'pointer';

const garageRedImg = PIXI.Texture.from('../img/p2.png');
const garageRed = new PIXI.Sprite(garageRedImg);
garageRed.anchor.set(0);
garageRed.position.set(500, 300);

gameScene.addChild(garageRed);

const garageYellowImg = PIXI.Texture.from('../img/p.png');
const garageYellow = new PIXI.Sprite(garageYellowImg);
garageYellow.anchor.set(0);
garageYellow.position.set(300, 300);

gameScene.addChild(garageYellow);

//Делаем машинки и гаражи интерактивными
parking.interactive = true;
carRed.interactive = true;
carYellow.interactive = true;
garageRed.interactive = true;
garageYellow.interactive = true;

// Переменные для отслеживания соединений машинок и гаражей
let carRedConnected = false;
let carYellowConnected = false;

// Создаем графические объекты для линий
let lineRed = new PIXI.Graphics();
let lineYellow = new PIXI.Graphics();
gameScene.addChild(lineRed);
gameScene.addChild(lineYellow);

let isDrawing = false;

let activeLine = null;

//Флаги позиции курсора
let posX;
let posY;
let start = { x: 0, y: 0 };

// Массив для хранени координат точек линии
let redLinePoints = [];
let yellowLinePoints = [];
// Обработчики событий для рисования линий
carRed.on('pointerdown', (event) => {
  redLinePoints = [];
  activeLine = lineRed;
  carRedConnected = false;
  lineRed.clear();

  const localPos = appContainer.toLocal(event.global); // Получаем координаты клика относительно приложения PIXI
  const { x, y } = localPos;
  connectCarAndGarage(carRed, garageRed, localPos);
  redLinePoints.push({ x, y });
  drawLine(localPos, lineRed, redLinePoints);
});

carYellow.on('pointerdown', (event) => {
  yellowLinePoints = [];
  activeLine = lineYellow;
  lineYellow.clear();
  carYellowConnected = false;

  const localPos = appContainer.toLocal(event.global); // Получаем координаты клика относительно приложения PIXI
  const { x, y } = localPos;
  connectCarAndGarage(carYellow, garageYellow, localPos);
  yellowLinePoints.push({ x, y });
  drawLine(localPos, lineYellow, yellowLinePoints);
});

//Проверка на активную линию

app.view.addEventListener('pointermove', (event) => {
  const { x, y } = event;

  const globalPos = { x, y };
  const localPos = appContainer.toLocal(globalPos);

  activeLine === lineRed
    ? drawLine(localPos, lineRed, redLinePoints)
    : drawLine(localPos, lineYellow, yellowLinePoints);
});

function connectCarAndGarage(car, garage, localPos) {
  isDrawing = true;
  start.x = localPos.x;
  start.y = localPos.y;

  garage.on('pointerup', (event) => {
    garage === garageRed ? (carRedConnected = true) : '';
    garage === garageYellow ? (carYellowConnected = true) : '';

    stopDrawing();
  });
}

app.view.addEventListener('pointerup', (event) => {
  isDrawing = false;
  !carYellowConnected ? lineYellow.clear() : '';
  !carRedConnected ? lineRed.clear() : '';
});

const garagBoundsRed = garageRed.getBounds();
const garagBoundsYellow = garageYellow.getBounds();

// Функция для рисования линии от машинки до гаража
function drawLine(localPos, line, arrPoints) {
  if (!isDrawing) return;

  const end = { x: localPos.x, y: localPos.y };

  // рисование линии между начальной и конечной точками
  line.lineStyle(20, line === lineRed ? 0xff0000 : 0xffff00); // ширина линии и цвет
  line.moveTo(start.x, start.y); // начало линии
  line.lineTo(end.x, end.y); // конец линии

  start.x = end.x;

  start.y = end.y;
  posX = line.currentPath.points[2];
  posY = line.currentPath.points[3];
  arrPoints.push({ x: posX, y: posY });
}

// Обработчик окончания рисования
function stopDrawing() {
  isDrawing = false;

  if (
    posX >= garagBoundsRed.x &&
    posX <= garagBoundsRed.x + garagBoundsRed.width &&
    posY >= garagBoundsRed.y &&
    posY <= garagBoundsRed.y + garagBoundsRed.height
  ) {
    carRedConnected = true;
    carRed.interactive = false;

    printLineData();
  }

  if (
    posX >= garagBoundsYellow.x &&
    posX <= garagBoundsYellow.x + garagBoundsYellow.width &&
    posY >= garagBoundsYellow.y &&
    posY <= garagBoundsYellow.y + garagBoundsYellow.height
  ) {
    carYellowConnected = true;
    carYellow.interactive = false;
  }
  if (carYellowConnected && carRedConnected) {
    tickerUpdate();
  }
}

let playAnimate = true;

function tickerUpdate() {
  if (!playAnimate) {
    app.ticker.remove(tickerUpdate);
  } else {
    app.ticker.add((delta) => {
      gameLoop(carRed, carYellow, redLinePoints, yellowLinePoints, playAnimate);
    });
  }
}

//Находим точку пересечения траекторий
function findMatchingElements(array1, array2) {
  const tolerance = 10;
  return array1.filter(function (element) {
    return array2.some(function (item) {
      // Проверяем разницу между координатами элементов с погрешностью
      return Math.abs(item.x - element.x) <= tolerance && Math.abs(item.y - element.y) <= tolerance;
    });
  });
}

let currentIndex = 2;

function gameLoop(carR, carY, redLinePoints, yellowLinePoints, playAnimate) {
  //Найти точку пересечения
  const intersectionPoint = findMatchingElements(redLinePoints, yellowLinePoints)[0];
  //Рачситать дистанции от машинок до места столкновения
  let distanceR = calculateDistance(carR, intersectionPoint);
  let distanceY = calculateDistance(carY, intersectionPoint);

  let speed = 1;
  let speedY = distanceR / distanceY;

  if (!playAnimate) return;
  animateCar(carR, speed, redLinePoints);
  animateCar(carY, speedY, yellowLinePoints);

  if (checkCollisions(carR, carY)) {
    handleGameOver();

    return;
  }
  function calculateDistance(car, intersectionPoint) {
    if (!intersectionPoint) {
      //Как-то обработать если траектории не пересекаются
    }
    const distance = Math.sqrt(
      Math.pow(car.x - intersectionPoint.x, 2) + Math.pow(car.y - intersectionPoint.y, 2),
    );

    return distance;
  }

  function animateCar(car, speed, arr) {
    const targetPoint = arr[currentIndex];
    car.velos = speed;

    if (car.x !== targetPoint.x || car.y !== targetPoint.y) {
      // Вычисление скорости

      car.x += targetPoint.x - car.x;
      car.y += targetPoint.y - car.y;
    }
    currentIndex++;
  }
}

// Функция для проверки столкновений
function checkCollisions(car1, car2) {
  if (
    car1.x >= car2.x &&
    car1.x <= car2.x + car2.width &&
    car1.y >= car2.y &&
    car1.y <= car2.y + car2.height
  ) {
    playAnimate = false;
    return true;
  }
}
