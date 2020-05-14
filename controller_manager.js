const XBOX_BUTTONS = [
  { index: 0, name: "A" },
  { index: 1, name: "B" },
  { index: 2, name: "X" },
  { index: 3, name: "Y" },
  { index: 4, name: "LB" },
  { index: 5, name: "RB" },
  { index: 6, name: "LT" },
  { index: 7, name: "RT" },
  { index: 8, name: "View" },
  { index: 9, name: "Menu" },
  { index: 10, name: "L-STICK" },
  { index: 11, name: "R-STICK" },
  { index: 12, name: "Up" },
  { index: 13, name: "Down" },
  { index: 14, name: "Left" },
  { index: 15, name: "Right" },
];

const XBOX_MAPPING = {
  "A": "Play/Pause",
  "B": "Exit full-screen",
  "X": "Mute",
  "Y": "Subtitles",
  "LB": "Rewind 30s",
  "RB": "Fast forward 30s",
  "LT": "Rewind 10s",
  "RT": "Fast forward 10s",
  "View": "Full-screen",
  "Up": "Volume up",
  "Down": "Volume down",
  "Left": "Rewind 10s",
  "Right": "Fast forward 10s",
};

const ACTIONS = {
  "Play/Pause": (video) => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  },
  "Full-screen": (video) => { },
  "Exit full-screen": (video) => { },
  "Rewind 30s": (video) => {
    video.fastSeek(Math.max(video.currentTime - 30, 0));
  },
  "Fast forward 30s": (video) => {
    video.fastSeek(Math.min(video.currentTime + 30, video.duration));
  },
  "Rewind 10s": (video) => {
    video.fastSeek(Math.max(video.currentTime - 10, 0));
  },
  "Fast forward 10s": (video) => {
    video.fastSeek(Math.min(video.currentTime + 10, video.duration));
  },
  "Volume up": (video) => {
    video.volume = Math.min(video.volume + 0.1, 1);
  },
  "Volume down": (video) => {
    video.volume = Math.max(video.volume - 0.1, 0);
  },
  "Mute": (video) => {
    video.muted = !video.muted;
  },
};

let gamepads = [];
let frame;

function debounce(func, wait = 250, immediate = true) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

const dispatchKey = debounce((action) => {
  let videoElem = document.getElementsByTagName('video')[0];

  if (videoElem) {
    action(videoElem);
  }
});

function buttonListener(gamepadButton, index) {
  if (gamepadButton.pressed || gamepadButton.value > 0.0) {
    const button = XBOX_BUTTONS[index].name;
    const mapping = XBOX_MAPPING[button];
    const action = ACTIONS[mapping];

    dispatchKey(action);
  }
}

function controllerLoop() {
  for (let gamepad of gamepads) {
    // Check all buttons
    gamepad.buttons.forEach(buttonListener);
  }

  frame = requestAnimationFrame(controllerLoop);
}

function gamepadListener(event, connected) {
  const gamepad = event.gamepad;

  if (connected) {
    gamepads.push(gamepad);
    console.log(`Gamepad ${gamepad.id} connected @ index ${gamepad.index}.`);
    controllerLoop();
  } else {
    gamepads = gamepads.filter((gp) => gp.index !== gamepad.index);
    console.log(`Gamepad ${gamepad.id} disconnected @ index ${gamepad.index}.`);
    cancelRequestAnimationFrame(frame);
  }
}

// Bind
window.addEventListener("gamepadconnected", (e) => gamepadListener(e, true));
window.addEventListener("gamepaddisconnected", (e) => gamepadListener(e, false));
