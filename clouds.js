'use strict'

let showFPS = false // override in console or js file

const ASSET_WEIGHTS = {
  1: 1,
  2: 3,
  3: 1,
  4: 1
}

const SIZE_MODE = 'cinematic'
const CLOUD_DELAY_TIME = 6000
const SPEED = 1.00
const OPACITY = 0.70
const INITIAL_CLOUDS = 30
// const CLOUD_IMAGE = 'assets/cloud.png'
const CLOUD_IMAGE_FN = asset => `assets/cloud${asset}.png`

const randomAssetWeighted = () => {
  const sum = Object.values(ASSET_WEIGHTS)
    .reduce((acc, weight) => acc + weight, 0)

  const num = sum * Math.random()

  return Object.entries(ASSET_WEIGHTS)
    .reduce(
      (acc, [asset, weight]) => (
        typeof acc === 'string' ? acc :
        acc <= weight ? asset :
        acc - weight),
      num)
}

const clouds = []

let width, height
const updateWH = function() {
  switch (SIZE_MODE) {
    case 'fill-window':
      width = window.innerWidth
      height = window.innerHeight
      break
    case 'cinematic':
      width = window.innerWidth
      height = 350
      break
    case 'scratch':
    default:
      width = 480
      height = 360
      break
  }
}
updateWH()

const initialHeight = height
const initialWidth = width

const loadNormalAndFlipped = asset => {
  return new Promise(resolve => {
    const cloudImage = document.createElement('img')
    cloudImage.src = CLOUD_IMAGE_FN(asset)
    cloudImage.style.display = 'none'
    document.body.appendChild(cloudImage)

    const flippedCloudCanvas = document.createElement('canvas')
    cloudImage.addEventListener('load', () => {
      flippedCloudCanvas.width = cloudImage.width
      flippedCloudCanvas.height = cloudImage.height
      const flipCtx = flippedCloudCanvas.getContext('2d')
      flipCtx.translate(cloudImage.width, 0)
      flipCtx.scale(-1, 1)
      flipCtx.drawImage(cloudImage, 0, 0)
      resolve({
        normal: cloudImage,
        flipped: flippedCloudCanvas
      })
    })
  })
}

const cloudImages = {}
const loaderPromises = []
for (const asset of Object.keys(ASSET_WEIGHTS)) {
  loaderPromises.push(loadNormalAndFlipped(asset).then(obj => {
    cloudImages[asset] = obj
  }))
}

const canvas = document.getElementById('target')
canvas.width = width
canvas.height = height

const addCloud = function() {
  const cloud = {
    asset: randomAssetWeighted(),
    x: width,
    y: (Math.random() - 0.5) * height,
    speed: 0.1 + SPEED * Math.random() * 0.5,
    opacity: Math.random() * OPACITY,
    flipped: Math.random() > 0.5
  }
  clouds.push(cloud)
  return cloud
}

for (let i = 0; i < INITIAL_CLOUDS; i++) {
  const cloud = addCloud()
  cloud.x = (Math.random() - 0.5) * width
}

const tickFPS = (() => {
  let ts = []
  let first
  return () => {
    if (!first) first = Date.now()
    const wait = (Date.now() - first < 1000)
    ts = ts.slice(ts.findIndex(d => d >= Date.now() - 1000))
    ts.push(Date.now())
    return wait ? 0 : ts.length
  }
})()

let updateInterval
const update = function() {
  try {
    updateWH()
    for (let cloud of clouds) {
      cloud.x -= cloud.speed
      const { width } = cloudImages[cloud.asset].normal
      if (cloud.x < -width) {
        clouds.splice(clouds.indexOf(cloud), 1)
      }
    }
  } catch (error) {
    clearInterval(updateInterval)
    throw error
  }
}

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
  skyGradient.addColorStop(0.2, '#0BF')
  skyGradient.addColorStop(0.9, '#016')
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, width, height)

  // Clouds
  for (let cloud of clouds) {
    let image
    ctx.globalAlpha = cloud.opacity
    const images = cloudImages[cloud.asset]
    if (cloud.flipped) {
      image = images.flipped
    } else {
      image = images.normal
    }
    ctx.drawImage(image, cloud.x, cloud.y)
  }
  ctx.globalAlpha = 1

  const fps = tickFPS()
  if (showFPS) {
    ctx.fillStyle = 'white'
    ctx.font = '12px monospace'
    ctx.fillText(`FPS: ${fps}`, 30 - 12, 30)
  }

  requestAnimationFrame(render)
}

const laterCloud = function() {
  addCloud()
  setTimeout(laterCloud, Math.random() * CLOUD_DELAY_TIME)
}

const main = function() {
  console.log('go!')
  updateInterval = setInterval(update, 5)
  render()
  laterCloud()
}

Promise.all(loaderPromises).then(main)
