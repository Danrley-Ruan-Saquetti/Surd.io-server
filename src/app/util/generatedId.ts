import crypto from "crypto"

export default function generatedId() {
    return crypto.randomBytes(20).toString("hex")
}