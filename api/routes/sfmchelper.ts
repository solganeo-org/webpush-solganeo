import Router from 'express'
import Controller from '../controllers/sfmchelper.controller'

const router = Router()

router.post('/fieldNames', Controller.getFieldNames)

export default router
