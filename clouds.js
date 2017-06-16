const clouds = []

let width, height
const updateWH = function() {
  width = window.innerWidth
  height = window.innerHeight
}
updateWH()

const initialHeight = height
const initialWidth = width

const cloudImage = document.createElement('img')
cloudImage.src = 'assets/cloud.png'
cloudImage.style.display = 'none'
document.body.appendChild(cloudImage)

const canvas = document.getElementById('target')
canvas.width = width
canvas.height = height

const addCloud = function() {
  const cloud = {
    x: width,
    y: (Math.random() - 0.5) * height,
    speed: Math.random() * 0.5,
    opacity: Math.random() * 0.7,
    flipped: Math.random() > 0.5
  }
  clouds.push(cloud)
  return cloud
}

for (let i = 0; i < 4; i++) {
  const cloud = addCloud()
  cloud.x = (Math.random() - 0.5) * width
}

setInterval(function() {
  updateWH()
  for (let cloud of clouds) {
    cloud.x -= cloud.speed
    if (cloud.x < -2000) {
      clouds.splice(clouds.indexOf(cloud), 1)
    }
  }
}, 5)

const render = function() {
  const ctx = canvas.getContext('2d')

  canvas.width = width
  canvas.height = height

  // Clear
  ctx.fillStyle = 'red'
  ctx.fillRect(0, 0, width, height)

  // Sky

  const skyGradient = ctx.createRadialGradient(
    initialWidth, initialHeight * 1.8, initialWidth * 1.3,
    initialWidth, initialHeight * 1.8, 0)
  skyGradient.addColorStop(0, '#046')
  skyGradient.addColorStop(0.7, '#DFD')
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, width, height)

  // Clouds
  for (let cloud of clouds) {
    let image = cloudImage
    ctx.globalAlpha = cloud.opacity
    if (cloud.flipped) {
      const tempCanv = document.createElement('canvas')
      const tempCtx = tempCanv.getContext('2d')
      tempCtx.scale(-1, 1)
      tempCtx.drawImage(cloudImage, 0, 0)
      image = tempCanv
    }
    ctx.drawImage(cloudImage, cloud.x, cloud.y)
  }
  ctx.globalAlpha = 1

  requestAnimationFrame(render)
}

const laterCloud = function() {
  addCloud()
  setTimeout(laterCloud, Math.random() * 12000)
}

canvas.onkeypress = function(evt) {
  if (evt.charCode === 32) {
    bars = !bars
  }
}

render()
laterCloud()
