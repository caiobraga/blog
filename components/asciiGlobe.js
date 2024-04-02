/* eslint-disable prettier/prettier */
'use client'
import React, { useState, useEffect } from 'react'

const distanceFromCam = 100
let A = 0
let B = 0
let C = 0
const incrementSpeed = 0.6

const calculateX = (i, j, k) => {
  return (
    j * Math.sin(A) * Math.sin(B) * Math.cos(C) -
    k * Math.cos(A) * Math.sin(B) * Math.cos(C) +
    j * Math.cos(A) * Math.sin(C) +
    k * Math.sin(A) * Math.sin(C) +
    i * Math.cos(B) * Math.cos(C)
  )
}

const calculateY = (i, j, k) => {
  return (
    j * Math.cos(A) * Math.cos(C) +
    k * Math.sin(A) * Math.cos(C) -
    j * Math.sin(A) * Math.sin(B) * Math.sin(C) +
    k * Math.cos(A) * Math.sin(B) * Math.sin(C) -
    i * Math.cos(B) * Math.sin(C)
  )
}

const calculateZ = (i, j, k) => {
  return k * Math.cos(A) * Math.cos(B) - j * Math.sin(A) * Math.cos(B) + i * Math.sin(B)
}

const calculateForSurface = (cubeX, cubeY, cubeZ, ch, width, height, K1, zBuffer, buffer) => {
  let x = calculateX(cubeX, cubeY, cubeZ)
  let y = calculateY(cubeX, cubeY, cubeZ)
  let z = calculateZ(cubeX, cubeY, cubeZ) + distanceFromCam

  let ooz = 1 / z
  let xp = parseInt(width / 2 + K1 * ooz * x * 2)
  let yp = parseInt(height / 2 + K1 * ooz * y)
  let bufferIdx = xp + yp * width // Rename 'idx' to 'bufferIdx'

  if (bufferIdx >= 0 && bufferIdx < width * height) {
    if (ooz > zBuffer[bufferIdx]) {
      zBuffer[bufferIdx] = ooz
      buffer[bufferIdx] = ch
    }
  }
}

function AsciiCube(props) {
  const [width, setWidth] = useState(140)
  const [height, setheight] = useState(40)
  const [K1, setK1] = useState(40)

  useEffect(() => {
    // Define a function to update the size based on the current window width
    function updateSize() {
      setWidth(window.innerWidth >= 768 ? 50 : 30)
      setheight(window.innerHeight >= 768 ? 25 : 12)
      setK1(window.innerWidth >= 768 ? 40 : 20)
    }

    // Call the function to set the initial size based on the current window width
    updateSize()

    // Add an event listener to update the size on window resize
    window.addEventListener('resize', updateSize)

    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const backgroundASCIICode = ' '
  let zBuffer = new Array(width * height)
  let buffer = new Array(width * height)

  const cubeWidth = width / 10

  const [frame, setFrame] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      buffer.fill(backgroundASCIICode)
      zBuffer.fill(0)

      // Cube rendering logic
      const chars = ['@', '$', '~', '#', ';', '+']
      for (let cubeX = -cubeWidth; cubeX < cubeWidth; cubeX += incrementSpeed) {
        for (let cubeY = -cubeWidth; cubeY < cubeWidth; cubeY += incrementSpeed) {
          chars.forEach((ch, charIdx) => {
            // Change 'idx' to 'charIdx' here
            let cubeZ = cubeWidth
            if (charIdx % 2 === 0) cubeZ = -cubeWidth
            if (charIdx === 2 || charIdx === 3) cubeX = -cubeX

            calculateForSurface(cubeX, cubeY, -cubeWidth, '@', width, height, K1, zBuffer, buffer)
            calculateForSurface(cubeWidth, cubeY, cubeX, '$', width, height, K1, zBuffer, buffer)
            calculateForSurface(-cubeWidth, cubeY, -cubeX, '~', width, height, K1, zBuffer, buffer)
            calculateForSurface(-cubeX, cubeY, cubeWidth, '#', width, height, K1, zBuffer, buffer)
            calculateForSurface(cubeX, -cubeWidth, -cubeY, ';', width, height, K1, zBuffer, buffer)
            calculateForSurface(cubeX, cubeWidth, cubeY, '+', width, height, K1, zBuffer, buffer)
          })
        }
      }

      // Update angles
      A += 0.05
      B += 0.05
      C += 0.01

      // Convert buffer to string and set as frame
      let frameString = ''
      for (let k = 0; k < width * height; k++) {
        frameString += k % width ? buffer[k] : '\n'
      }
      setFrame(frameString)
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ overflowX: 'hidden', textAlign: 'center' }}>
      <pre style={{ fontFamily: 'monospace', display: 'inline-block', textAlign: 'left' }}>
        {frame}
      </pre>
    </div>
  )
}

export default AsciiCube
