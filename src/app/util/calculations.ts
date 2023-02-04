export const calculateAngle = ({ x: x1, y: y1 }: { x: number, y: number }, { x: x2, y: y2 }: { x: number, y: number }) => {
    const angle = Math.atan2(y2 - y1, x2 - x1)

    return { angle }
}

export const calculateDistanceBetweenRectangleCircle = ({ position: { x: x1, y: y1 } }: { position: { x: number, y: number } }, { position: { x: x2, y: y2 } }: { position: { x: number, y: number } }) => {
    const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))

    return distance
}

export const calculateDistance = ({ position: { x: x1, y: y1 }, dimension: { width: w1, height: h1 } }: { position: { x: number, y: number }, dimension: { width: number, height: number } }, { position: { x: x2, y: y2 }, dimension: { width: w2, height: h2 } }: { position: { x: number, y: number }, dimension: { width: number, height: number } }) => {
    const point1 = { x: x1 + (w1 / 2), y: y1 + (h1 / 2) }
    const point2 = { x: x2 + (w2 / 2), y: y2 + (h2 / 2) }

    const bounds = { width: Math.abs(point1.x - point2.x), height: Math.abs(point1.y - point2.y) }

    const distance = Math.sqrt((bounds.width) ^ 2 + (bounds.height) ^ 2)

    return distance
}