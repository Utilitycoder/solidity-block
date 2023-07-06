import express from "express"
import {AIprompt} from "../controllers/openAI.js"

const router = express.Router()

router.post('/ai', AIprompt)

export default router