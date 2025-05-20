import { movePlayer, drawScene } from "./LightAndSmoke";

import "./style.css";

function animate() {
  movePlayer();
  drawScene();

  requestAnimationFrame(animate);
}

animate();
